game.screen = {
	start : {
		enter : function(){
		
		},
		exit : function(){
			console.log("leave start");
		},
		render : function(display){
		    display.drawText(1,1, "%c{yellow}Javascript Roguelike");
        	display.drawText(1,2, "Press [Enter] to start!");
		},
		handleInput : function(inputType, inputData){
			if(inputType === "keydown"){
				game.switchScreen(game.screen.play);
			}
		}
	},
	play : {
		map : null,
		player : null, 
		move : function(dX, dY){
        	var newX = this.player.x + dX;
        	var newY = this.player.y + dY;
        	// Try to move to the new cell
        	this.player.tryMove(newX, newY, this.map);
    	},
		enter : function(){
			console.log('entered play screen');
			map = [];
			var mapWidth = 500;
			var mapHeight = 500;
			for (var x = 0; x < mapWidth; x++) {
        	// Create the nested array for the y values
        		map.push([]);
        		// Add all the tiles
        		for (var y = 0; y < mapHeight; y++) {
            		map[x].push(game.Tile.nullTile);
        		}
    		}
    		var generator = new ROT.Map.Cellular(mapWidth, mapHeight);
    		generator.randomize(0.5);
    		var totalIterations = 3;
    		for(var i = 0; i < totalIterations - 1; i++){
    			//console.log("iteration " + i);
    			generator.create();
    		}
    		generator.create(function(x, y, v){
    			if(v ===1){
    				map[x][y] = game.Tile.floorTile;
    				} else{
    					map[x][y] = game.Tile.wallTile;
    			}
    		});
    		//console.log();
    		
    		// make player and set position
    		this.player = new game.Entity(game.playerTemplate);
    		this.map = new game.Map(map, this.player);
			this.map.engine.start();
		},
		exit : function(){
		
		},
		render : function(display){
			var screenWidth = game.screenWidth;
			var screenHeight = game.screenHeight;
			// topLeftX is kind of a shitty var name. it is the map coordinate of the left side of the screen
			// Stop from scrolling off the map to the left
			var topLeftX = Math.max(0, this.player.x - (screenWidth/2));
			// Make sure we are not going of the right hand side of the screen
			topLeftX = Math.min(topLeftX, this.map.width - screenWidth);
			// this is the y coordinate of the top of the screen on the map
			var topLeftY = Math.max(0, this.player.y - (screenHeight/2));
			// no make sure not off bottom of map
			topLeftY = Math.min(topLeftY, this.map.height - screenHeight);
		    for(var x = topLeftX; x < topLeftX + screenWidth; x++){
		    	for(var y = topLeftY; y < topLeftY + screenHeight; y++){
		    		var tile = this.map.getTile(x, y);
		    		display.draw(x - topLeftX, y - topLeftY, tile.chr, tile.foreground, tile.background);
		    	}
		    }
		    var entities = this.map.entities;
		    for(var i = 0; i < entities.length; i++){
		    	var entity = entities[i];
		    	if (entity.x >= topLeftX && entity.y >= topLeftY &&
		    		entity.x < topLeftX + screenWidth &&
		    		entity.y < topLeftY + screenHeight){
		    			display.draw(
		    				entity.x - topLeftX,
		    				entity.y - topLeftY, 
		    				entity.chr, 
		    				entity.foreground, 
		    				entity.background);
		    	}
		    }
		    // Get the messages in the player's queue and render them
        	var messages = this.player.getMessages();
       		var messageY = 0;
        	for (var i = 0; i < messages.length; i++) {
            	// Draw each message, adding the number of lines
            	messageY += display.drawText(
            	    0, 
            	    messageY,
            	    '%c{white}%b{black}' + messages[i]);
        	}
        	// rendering stats info
        	var stats = '%c{white}%b{black}';
        	stats += vsprintf('HP: %d/%d ', [this.player.hp, this.player.maxHp]);
        	display.drawText(0, screenHeight, stats);
		},
		handleInput : function(inputType, inputData){
		    if (inputType === 'keydown') { 
            	if(inputData.keyCode === ROT.VK_RETURN){
                	game.switchScreen(game.screen.win);
            	} else if(inputData.keyCode === ROT.VK_ESCAPE){
                	game.switchScreen(game.screen.lose);
            	} else{
            		//movement
            		if(inputData.keyCode === ROT.VK_LEFT) {
                		this.move(-1, 0);
            		} else if(inputData.keyCode === ROT.VK_RIGHT) {
                		this.move(1, 0);
            		} else if(inputData.keyCode === ROT.VK_UP) {
                		this.move(0, -1);
            		} else if(inputData.keyCode === ROT.VK_DOWN) {
                		this.move(0, 1);
            		}
            		this.map.engine.unlock();
            	}
			}
		}
	},
	win :{
		enter : function(){
		
		},
		exit : function(){
		
		},
		render : function(display){
		 	var foreground, background, colors;
 			for(var i = 0; i < 15; i ++){
 				foreground = ROT.Color.toRGB([255 - (i*20),140 - (i*20), 150 + (i*20)]);
 				background = ROT.Color.toRGB([i*20, i*20, i*20]);
 				colors = "%c{" + foreground + "} %b{" + background +"}";
 				display.drawText(35, i + 2, colors + "YOU WIN");
 			}
		},
		handleInput : function(inputType, inputData){
		
		}
	},
	lose :{
		enter : function(){
			console.log("entering lose")
		},
		exit : function(){
		
		},
		render : function(display){
			var foreground, background, colors;
 			for(var i = 0; i < 15; i ++){
 				foreground = ROT.Color.toRGB([255 - (i*20),140 - (i*20), 150 + (i*20)]);
 				background = ROT.Color.toRGB([i*20, i*20, i*20]);
 				colors = "%c{" + foreground + "} %b{" + background +"}";
 				display.drawText(35, i + 2, colors + "YOU LOSE");
 			}
		},
		handleInput : function(inputType, inputData){
		
		}
	}
}
