var Screen = (function(){
	var that = {};
	var black_screen = $("#black_screen");
	that.transition = function(callback){
		function slideOut() {
			callback();//to start what's behind the scenes
			black_screen.animate({
				left: 320
			}, 250, "linear", function(){
				black_screen.css({
					left: -320
				})
			});
		}
		black_screen.animate({
			left: 0
		}, 250, "linear", slideOut);
	};

	that.endGame = function(){
		//show credits
		$("#credits").fadeIn();
	};

	return that;
}());