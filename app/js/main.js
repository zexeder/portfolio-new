/*
 Third party
 */
//= ../../bower_components/jquery/dist/jquery.min.js

/*
    Custom
 */
//= partials/helper.js

$(function() {
	$("img, a").on("dragstart", function(event) { event.preventDefault(); });
});
//Так приятней :)
window.log = function(param){
    console.log(param);
};