'use strict';

require('es6-promise').polyfill();

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    pug = require('gulp-pug'), //pug
    sass = require('gulp-sass'),
    prefixer = require('gulp-autoprefixer'),
    spritesmith  = require('gulp.spritesmith'),
    uglify = require('gulp-uglify'),
    // sourcemaps = require('gulp-sourcemaps'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    browserSync = require("browser-sync").create(),
    // reload = browserSync.reload;
    cssnano = require('gulp-cssnano'), // `gulp-minify-css` depreciated. Use `gulp-cssnano`
    jshint = require('gulp-jshint'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'), //конкатенация файлов
    notify = require('gulp-notify'),
    plumber = require('gulp-plumber'),
    cached = require('gulp-cached'),
    changed = require('gulp-changed'),
    newer = require('gulp-newer'),
    del = require('del');

gulp.task('webserver', ['sass:build', 'js:build', 'pug:build'], function() {
    browserSync.init({
        // proxy: 'site.dev',
        server: {
            baseDir: "app/"
        },
        notify: true,
        port: 3090
    }); 
});

// pug
gulp.task('pug:build', function () {
    gulp.src('src/pug/*.pug')
    .pipe(plumber({errorHandler: notify.onError("pug error: <%= error.message %>")}))
    .pipe(pug({
      pretty: true
    }))
    .pipe(gulp.dest('app/'));
    // .pipe(reload({stream: true}));
});

// Styles
gulp.task('sass:build', function () {
    gulp.src('src/sass/*.sass')
    .pipe(plumber({errorHandler: notify.onError("Sass error: <%= error.message %>")}))
    // .pipe(sourcemaps.init())
    .pipe(sass({
        includePaths: ['src/sass/'],
        outputStyle: 'expanded',
        sourceMap: false,
        errLogToConsole: true
    }).on('error', sass.logError))
    .pipe(prefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
    // .pipe(sourcemaps.write())
    .pipe(gulp.dest('app/css/'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(cssnano())
    .pipe(gulp.dest('app/css/'))
    .pipe(notify({ message: 'Styles task complete' }))
    .pipe(browserSync.stream());
});

// Scripts
gulp.task('js:build', function () {
    return gulp.src('src/js/**/*.js')
    .pipe(plumber({errorHandler: notify.onError("Script error: <%= error.message %>")}))
    // .pipe(jshint('.jshintrc'))
    // .pipe(jshint.reporter('default'))
    .pipe(concat('main.js'))
    // .pipe(sourcemaps.init())
    // .pipe(sourcemaps.write())  
    .pipe(gulp.dest('app/js'))
    // .on('error', gutil.log)
    // .pipe(rigger()) 
    .pipe(rename({ suffix: '.min' }))
    // .pipe(sourcemaps.init()) 
    .pipe(uglify()) 
    // .pipe(sourcemaps.write()) 
    .pipe(gulp.dest('app/js'))
    // .on('error', gutil.log)
    .pipe(notify({ message: 'Scripts task complete' }));
    // .pipe(reload({stream: true}));
});

// Sprite
gulp.task('sprite:build', function() {
    var spriteData = gulp.src('src/sprite/*.*') // путь, откуда берем картинки для спрайта
        .pipe(plumber({errorHandler: notify.onError("Sprite error: <%= error.message %>")}))
        .pipe(spritesmith({
            imgName: 'sprite.png',
            cssName: '_sprite.sass',
            imgPath : '../sprite/sprite.png',
            cssFormat: 'sass',
            algorithm:  'top-down',
            padding: 10,
            cssVarMap: function(sprite) {
                sprite.name = 's-' + sprite.name
            }
        }));

    spriteData.img.pipe(gulp.dest('./app/sprite/')); // путь, куда сохраняем картинку
    spriteData.css.pipe(gulp.dest('./src/sass/partials/')); // путь, куда сохраняем стили
});

// Images
gulp.task('image:build', function () {
    gulp.src('src/img/**/*.*') 
    .pipe(newer('app/img/'))
    .pipe(imagemin({
        optimizationLevel: 3,
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        use: [pngquant()],
        interlaced: true
    }))
    .pipe(gulp.dest('app/img/'))
    .pipe(notify({ message: 'Images task complete' }));
    // .pipe(reload({stream: true}));
});

// Fonts
gulp.task('fonts:build', function() {
    gulp.src('src/fonts/**/*.*')
    .pipe(gulp.dest('app/fonts/'))
});

// Libs
// gulp.task('libs:build', function() {
//     gulp.src('src/libs/**/*.*')
//     .pipe(gulp.dest('app/libs/'))
// });


// gulp.task('scripts', function() {
//  return gulp.src([
//      './app/libs/modernizr/modernizr.js',
//      './app/libs/jquery/jquery-1.11.2.min.js',
//      './app/libs/waypoints/waypoints.min.js',
//      './app/libs/animate/animate-css.js',
//      './app/libs/plugins-scroll/plugins-scroll.js',
//      ])
//      .pipe(concat('libs.js'))
//      // .pipe(uglify()) //Minify libs.js
//      .pipe(gulp.dest('./app/js/'));
// });
// !!! LIBS сделать

// Clean
gulp.task('clean', function() {
  // return del(['dist/styles', 'dist/scripts', 'dist/images']);
  return del(['app/**']);
});

gulp.task('build', [
    'pug:build',
    'js:build',
    'sass:build',
    'fonts:build',
    'image:build'
    ]);

gulp.task('watch', function(){
    watch(['src/pug/**/*.pug'], function(event, cb){
        gulp.start('pug:build');
    });
    watch(['src/sass/**/*.sass'], function(event, cb) {
        gulp.start('sass:build');
    });
    watch(['src/js/**/*.js'], function(event, cb) {
        gulp.start('js:build');
    });
    watch(['src/img/**/*.*'], function(event, cb) {
        gulp.start('image:build');
    });
    watch(['src/fonts/**/*.*'], function(event, cb) {
        gulp.start('fonts:build');
    });
    // watch(['src/libs/**/*.*'], function(event, cb) {
    //     gulp.start('libs:build');
    // });

    watch(['src/sprite/*.*'], function(event, cb){
        gulp.start('sprite:build')
    });
    watch('app/js/*.js').on('change', browserSync.reload);
    watch('app/*.html').on('change', browserSync.reload);
    watch('app/css/*.css').on('change', browserSync.reload);
// Watch any files in dist/, reload on change
// gulp.watch(['dist/**']).on('change', livereload.changed);

});


gulp.task('default', ['build', 'webserver', 'watch']);


// Копирование файлов галпом
// gulp.task('copyHtml', function() {
//   // скопировать все html файлы из source/ в public/
//   gulp.src('source/*.html').pipe(gulp.dest('public'));
// });
// gulp.watch('source/**/*.html', ['copyHtml']);

// gulp.task('scripts', function() {
//  return gulp.src([
//      './app/libs/modernizr/modernizr.js',
//      './app/libs/jquery/jquery-1.11.2.min.js',
//      './app/libs/waypoints/waypoints.min.js',
//      './app/libs/animate/animate-css.js',
//      './app/libs/plugins-scroll/plugins-scroll.js',
//      ])
//      .pipe(concat('libs.js'))
//      // .pipe(uglify()) //Minify libs.js
//      .pipe(gulp.dest('./app/js/'));
// });


/*!
 * gulp
 * $ npm install es6-promise gulp-pug gulp-sass gulp-watch browser-sync imagemin-pngquant gulp.spritesmith gulp-autoprefixer gulp-cssnano gulp-jshint gulp-concat gulp-uglify gulp-imagemin gulp-notify gulp-rename gulp-cache del --save-dev
 */