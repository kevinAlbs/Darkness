(function(global){
	"use strict";
	var data = null;
	
	if(global.mt && global.mt.data){
		data = global.mt.data;
	}
	
	global.mt = {
		
		SPRITE: 0,
		GROUP: 1,
		TEXT: 2,
		TILE_LAYER: 3,
		
		knownFonts: [
			"Arial",
			"Comic Sans MS",
			"Courier New",
			"Georgia",
			"Impact",
			"Times New Roman",
			"Trebuchet MS",
			"Verdana"
		],
 
		assets: {},
		objects: {},
	
		assetsPath: "assets",
		game: null,
	
		data: data,
		
		autoLoadFonts: true,
		
		init: function(game){
			this.game = game;
			this.game.load.crossOrigin = "anonymous";
			this.game.load.script("hacks", "phaserHacks.js");
		},
 
		setBackgroundColor: function(appendToBody){
			
			if(this.data.map.backgroundColor){
				var tmp = this.data.map.backgroundColor.substring(1);
				var bg = parseInt(tmp, 16);
				
				if(this.game.stage.backgroundColor != bg){
					this.game.stage.setBackgroundColor(bg);
				}
			}
			
			if(appendToBody){
				document.body.style.backgroundColor = this.data.map.backgroundColor;
			}
		},
 
		// preload all assets
		preload: function(){
			this._loadAssets(this.data.assets.contents, this.assets, "");
		},
		
		// load assets for seperate object group
		loadGroup: function(name){
			var toLoad = {};
			var group = this.getObjectGroupByName(name);
			if(!group){
				console.error("failed to load group: ", name);
				return;
			}
			this._collectAssets(group, toLoad);
			this._loadAssetBuffer(toLoad);
		},
		
		// create full map
		create: function(){
			this._loadObjects(this.data.objects.contents, this.objects, "");
		},
		
		// create seperate group
		createGroup: function(name, parent){
			parent = parent || this.game.world;
			var group = this.getObjectGroupByName(name);
			if(!group){
				console.error("failed to find the group: ", name);
				return;
			}
			
			var objects = {};
			this._add(group, objects, "", parent);
			
			return objects[name];
		},
		
		getAssetPath: function(asset){
			return this.assetsPath + asset.fullPath;
		},
		
		getObjectGroupByName: function(name, container){
			container = container || this.data.objects.contents;
			var ret;
			for(var i = 0; i < container.length; i++){
				if(container[i].name == name){
					return container[i];
				}
				if(container[i].contents){
					ret = this.getObjectGroupByName(name, container[i].contents);
					if(ret){
						return ret;
					}
				}
			}
		},
		
		getAssetByName: function(name, container){
			container = container || this.data.assets.contents;
			for(var i in container){
				if(container[i].name == name){
					return container[i];
				}
				if(container[i].contents){
					ret = this.getAssetById(id, container[i].contents);
					if(ret){
						return ret;
					}
				}
			}
			
			return ret;
		},
		
		getAssetById: function(id, container){
			container = container || this.data.assets.contents;
			var ret = null;
			
			for(var i in container){
				if(container[i].id == id){
					return container[i];
				}
				if(container[i].contents){
					ret = this.getAssetById(id, container[i].contents);
					if(ret){
						return ret;
					}
				}
			}
			
			return ret;
		},
		
		getObjectByName: function(name, container){
			container = container || this.data.objects.contents;
			for(var i in container){
				if(container[i].name == name){
					return container[i];
				}
				if(container[i].contents){
					ret = this.getObjectById(id, container[i].contents);
					if(ret){
						return ret;
					}
				}
			}
			
			return ret;
		},
 
		isKnownFontFamily: function(font){
			for(var i=0; i<this.knownFonts.length; i++){
				if(this.knownFonts[i] == font){
					return true
				}
			}
			return false;
		},
		
		loadFont: function(font, cb){
			
			var fontUrl = font.replace(/ /gi, "+");
			var link = document.createElement("link");
			link.setAttribute("rel", "stylesheet");
			link.setAttribute("type", "text/css");
			
			var span = document.createElement("span");
			span.style.position = "absolute";
			span.style.top = span.style.left = 0;
			span.style.zIndex = -1;
			
			span.style.fontFamily = font;
			span.innerHTML = "ignore moi";
			span.style.visibility = "hidden";
			document.body.appendChild(span);
			
			link.onload = function(e){
				
				window.setTimeout(function(){
					document.body.removeChild(span);
				}, 1000);
				window.setTimeout(function(){
					cb(font);
				}, 300);
			};
			
			link.href="//fonts.googleapis.com/css?family="+fontUrl;
			
			document.head.appendChild(link);
		},
		
		
		
		getFontFamily: function(font){
			if(!this.autoLoadFonts){
				return;
			}
			var span = document.createElement("span");
			span.style.font = font;
			
			var fontFamily = span.style.fontFamily.replace(/'/gi, '');
			
			if(this.isKnownFontFamily(fontFamily)){
				return;
			}
			var that = this;
			this._fontsToLoad++;
			this.loadFont(fontFamily, function(){
				that._fontsToLoad--;
				
				if(that._fontsToLoad == 0){
					//clean up height cache
					PIXI.Text.heightCache = {};
					that._markDirty();
				}
			});
			return;
		},
		
		/* private stuff */
		_fontsToLoad: 0,
		_loadAssetBuffer: function(buffer){
			var container;
			var asset = null;
			for(var i in buffer){
				asset = buffer[i];
				
				container = this._getAssetContainer(asset);
				this._addAsset(asset, container);
			}
		},
 
		_getAssetContainer: function(asset){
			var cont = this.assets;
			var path = asset.fullPath.split("/");
			path.shift();
			for(var i=0; i<path.length-1; i++){
				cont[path[i]] = cont[path[i]] || {};
				cont = cont[path[i]];
			}
			return cont;
		},
 
		_getObjectContainer: function(object){
			var cont = this.assets;
			var path = asset.fullPath.split("/");
			path.shift();
			for(var i=0; i<path.length-1; i++){
				cont[path[i]] = cont[path[i]] || {};
				cont = cont[path[i]];
			}
			return cont;
		},
 
		_collectAssets: function(group, buffer){
			var id, object, asset;
			for(var i=0; i<group.contents.length; i++){
				object = group.contents[i];
				if(object.contents){
					this.collectAssets(object);
				}
				else{
					id = object.assetId;
					asset = this.getAssetById(id);
					if(asset){
						buffer[id] = asset;
					}
				}
			}
		},
 
		_loadAssets: function(data, container){
			var asset = null;
			
			for(var i = 0, l = data.length; i<l; i++){
				asset = data[i];
				if(asset.contents && asset.contents.length){
					if(container[asset.name] === void(0)){
						container[asset.name] = {};
					}
					this._loadAssets(asset.contents, container[asset.name]);
				}
				else{
					this._addAsset(asset, container);
				}
			}
		},
	
		_addAsset: function(asset, container){
			var path = this.assetsPath + asset.fullPath;
			var that = this;
			if(!asset.key){
				return;
			}
			// is already loaded ?
			if(container[asset.name]){
				return;
			}
			
			if(asset.atlas){
				this.game.load.atlas(asset.key, this.assetsPath + asset.fullPath, this.assetsPath + "/" + asset.atlas);
			}
			else if(asset.width != asset.frameWidth || asset.height != asset.frameHeight){
				this.game.load.spritesheet(asset.key, this.assetsPath + asset.fullPath, asset.frameWidth, asset.frameHeight, asset.frameMax, asset.margin, asset.spacing);
			}
			else{
				this.game.load.image(asset.key, this.assetsPath + asset.fullPath);
			}
			
			
			Object.defineProperty(container, asset.name, {
				get : function(){ 
					return asset;
				},
				enumerable: true
			});
			
		},
		
		_loadObjects: function(data, container, path, group){
			group = group || this.game.world;
			path = path !== "" ? "." + path : path;
			
			for(var i = data.length - 1; i > -1; i--){
				this._add(data[i], container, path, group);
			}
			return container;
		},
		
		_add: function(object, container, path, group){
			var createdObject = null;
			
			if(object.contents){
				createdObject = this._addGroup(object, container);
				group.add(createdObject);
				
				if(!container[object.name]){
					container[object.name] = {
						get self(){
							return createdObject
						}
					};
				}
				
				this._updateCommonProperties(object, createdObject);
				
				this._loadObjects(object.contents, container[object.name], path + object.name, createdObject);
			}
			else{
				
				if(object.type == this.TEXT){
					createdObject = this._addText(object, container, group);
				}
				else if(object.type == this.TILE_LAYER){
					createdObject = this._addTileLayer(object, container, group);
				}
				else{
					createdObject = this._addObject(object, container, group);
				}
				
				this._updateCommonProperties(object, createdObject);
			}
			
			
		},
		
		_addGroup: function(object){
			var group = this.game.add.group();

			group.x = object.x;
			group.y = object.y;
			group.fixedToCamera = !!object.fixedToCamera;
			
			group.name = object.name;
			
			if(object.angle){
				group.angle = object.angle;
			}
			group.alpha = object.alpha || 1;
			
			return group;
		},
		
		_addText: function(object, container, group){
			this.getFontFamily(object.style.font);
			
			group = group || this.game.world;
			var t = this.game.add.text(object.x, object.y, object.text || object.name, object.style);
			group.add(t);
			
			if(container.hasOwnProperty(object.name)){
				console.warn("dublicate object name - ", object.name);
			}
			else{
			
				Object.defineProperty(container, object.name, {
					get : function(){ 
						return t;
					},
					enumerable: true
				});
			}
			
			return t;
		},
		
		_addTileLayer: function(object, container, group){
			group = group || this.game.world;
			var map = this.game.add.tilemap(null, object.tileWidth, object.tileHeight, object.widthInTiles, object.heightInTiles);
			
			var tl = map.createBlankLayer(object.name, object.widthInTiles, object.heightInTiles, object.tileWidth, object.tileHeight);
			
			var nextId = 0;
			var im = null;
			var asset = "";
			for(var i=0; i<object.images.length; i++){
				asset = this.getAssetById(object.images[i]);
				
				if(asset){
					im = map.addTilesetImage(asset.key, asset.key, asset.frameWidth, asset.frameHeight, asset.margin, asset.spacing, nextId);
					nextId += im.total;
				}
				else{
					console.warn("cannot find image", object.images[i]);
				}
			}
			
			var tiles = object.tiles;
			for(var y in tiles){
				for(var x in tiles[y]){
					map.putTile(tiles[y][x], x, y, tl);
				}
			}
			
			
			if(container.hasOwnProperty(object.name)){
				console.warn("dublicate object name - ", object.name);
			}
			else{
			
				Object.defineProperty(container, object.name, {
					get : function(){ 
						return tl;
					},
					enumerable: true
				});
			}
			
			return tl;
		},
		
		_addObject: function(object, container, group){
			
			var sp = null;
			group = group || this.game.world;
			
			sp = group.create(object.x, object.y, object.assetKey);
			
			var frameData = this.game.cache.getFrameData(object.assetKey);
			
			if(frameData){
				var arr = [];
				for(var i=0; i<frameData.total; i++){
					arr.push(i);
				}
				sp.animations.add("default", arr, (object.fps !== void(0) ? object.fps : 10) , false);
				sp.frame = object.frame;
			}
			
			if(container.hasOwnProperty(object.name)){
				console.warn("dublicate object name - ", object.name);
			}
			else{
				Object.defineProperty(container, object.name, {
					get : function(){ 
						return sp;
					},
					enumerable: true
				});
			}
			
			return sp;
		},
 
		_updateCommonProperties: function(template, object){
			
			
			if(template.angle){
				object.angle = template.angle;
			}
			
			if(template.type !== mt.GROUP && template.contents === void(0) ){
				object.anchor.x = template.anchorX;
				object.anchor.y = template.anchorY;
				object.scale.x = template.scaleX;
				object.scale.y = template.scaleY;
			}
			
			object.x = template.x;
			object.y = template.y;
			object.alpha = template.alpha || 1;
			
			object.fixedToCamera = template.isFixedToCamera;
		},
		
		//mark all texts dirty to force redraw
		_markDirty: function(group){
			group = group || game.world.children;
			
			var child = null;
			for(var i=0; i<group.length; i++){
				child = group[i];
				
				if(child.type == Phaser.TEXT){
					child.dirty = true;
					continue;
				}
				
				if(child.type == Phaser.GROUP){
					this.markDirty(child.children);
				}
			}
		}
 
	};

})(typeof window == "undefined" ? global : window);
