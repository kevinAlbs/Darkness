/* Shows text overlay */
var TextOverlay = (function(){
	var that = {};
	var dom = {
		ft_to_go : $("#ft_to_go"),
		ft_to_go_val : $("#ft_to_go .value"),
		text_overlay : $("#text_overlay")
	};

	that.updateFt = function(val) {
		dom.ft_to_go_val.html(val);
	}
	that.showFt = function(val){
		if(val){
			dom.ft_to_go.show();
		} else {
			dom.ft_to_go.hide();
		}
	}

	function waitForLetter(callback){
		$(document).one("keypress", callback);
	}


	function sayLetter(l, dom_node, callback){
		var prev = dom_node.html();
		dom_node.html(prev + l);
		window.setTimeout(callback, 20);
	}

	function sayMessage(name, message, callback){
		name += "> ";
		var index = 0, name_complete = false;
		var dom_message = $("<p><span></span></p>");
		var dom_name = dom_message.find("span");
		dom.text_overlay.append(dom_message);
		
		function iterator_callback(){
			index++;
			if(!name_complete){
				if(index >= name.length){
					name_complete = true;
					index = 0;
				} else {
					sayLetter(name.charAt(index), dom_name, iterator_callback);
				}
			}

			if(name_complete) {
				if(index >= message.length){
					callback.call();
					return;
				} else {
					sayLetter(message.charAt(index), dom_message, iterator_callback);
				}
			}
		}
		console.log(name);
		sayLetter(name.charAt(index), dom_name, iterator_callback);

	}
	function sayPage(page, callback){
		var index = 0;

		function iterator_callback(){
			waitForLetter(function(){
				index++;
				console.log("callback" + index);
				if(index >= page.length){
					callback.call();
					return;
				} else {
					sayMessage(page[index].name, page[index].message, iterator_callback);
				}
			});
		}
		sayMessage(page[index].name, page[index].message, iterator_callback);
	}
	/* a page is an array of messages
	 * a message is an object { name: "", message: ""}
	 */
	that.say = function(pages, params, callback){
		if(CONFIG.FLAGS["noconvos"]){
			if(callback){
				callback.call();
			}
			return;
		}
		dom.text_overlay.show();
		dom.text_overlay.empty();
		var defaults = {
			fullscreen: false
		};
		var settings = Utilities.extend(defaults, params);
		
		var index = 0;
		function iterator_callback(){
			waitForLetter(function(){
				dom.text_overlay.empty();
				index++;
				if(index >= pages.length){
					dom.text_overlay.hide();
					game.paused = false;
					if(callback){
						callback.call();
					}
					return;
				} else {
					sayPage(pages[index], iterator_callback);
				}
			});
		}
		sayPage(pages[index], iterator_callback);
		game.paused = true;
	}

	that.init = function(game){

	}
	return that;
}());