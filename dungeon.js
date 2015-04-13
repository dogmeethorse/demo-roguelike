// so we should do it like this: current level is created. and when you go down stairs it gets pushed to
// stack. when you go up a level set current level to a pop of the stack of levels.
// 
game.dungeon = {
	levels		 : [],
	currentLevel : null,
	player		 : null,
	scheduler	 : null,
	engine		 : null,
	width		 : 100,
	height		 : 100,
	depth 		 : 6
}

game.dungeon.init = function(){
	this.scheduler	= new ROT.Scheduler.Simple();
	this.engine		= new ROT.Engine(this.scheduler);
	this.player		= new game.Entity(game.playerTemplate);
	
	this.currentLevel = game.dungeon.createLevel({},'town');
	this.currentLevel.name = "test level";
	this.currentLevel.addEntityAtRandomPosition(this.player);
	this.engine.start();
}
game.dungeon.createLevel = function(stairs, type){
	// this will check which depth we are at and pick type of level to create 
	// if 0 will create base camp
	// if < whatever create natural caves
	// if deeper than that create artificial dungeon etc.
	var tiles = new game.Builder(this.width, this.height, stairs, type).tiles;
	var map = new game.Map(tiles, this.player);
	return map;
}

game.dungeon.handleMove = function(dX, dY, dZ){
    var newX = this.player.x + dX;
    var newY = this.player.y + dY;

    if (dZ ===1){ //try down stairs
    	this.player.tryMove(newX, newY, 1);
    } else if (dZ == -1){ //try up stairs
    	this.player.tryMove(newX, newY, -1);
    } else{
    	this.player.tryMove(newX, newY);
    }
}

game.dungeon.goDownStairs = function(){
	var nextLevel =  game.dungeon.createLevel(this.currentLevel.stairLocations, 'cave');
	this.currentLevel.removeEntity(this.player);
	this.levels.push(this.currentLevel);
	this.currentLevel = nextLevel;
	this.currentLevel.addEntity(this.player);
}

game.dungeon.goUpStairs = function(){
	var nextLevel = this.levels.pop();
	this.currentLevel = nextLevel;
	this.currentLevel.addEntity(this.player);
}

game.dungeon.renderLevel = function(display){
			var screenWidth = game.screenWidth;
			var screenHeight = game.screenHeight;
			var visibleCells = {};
			var items = this.currentLevel.items;
			var entities = this.currentLevel.entities; 
			// topLeftX is kind of a shitty var name. it is the map coordinate of the left side of the screen
			// Stop from scrolling off the map to the left
			var topLeftX = Math.max(0, this.player.x - (screenWidth/2));
			// Make sure we are not going of the right hand side of the screen
			topLeftX = Math.min(topLeftX, this.width - screenWidth);
			
			// this is the y coordinate of the top of the screen on the map
			var topLeftY = Math.max(0, this.player.y - (screenHeight/2));
			// no make sure not off bottom of map
			topLeftY = Math.min(topLeftY, this.height - screenHeight);
			this.currentLevel.getFov().compute(
            	this.player.x, this.player.y, 
            	this.player.sightRadius, 
            	function(x, y, radius, visibility) {
            		//console.log("adding key");
                	visibleCells[x + "," + y] = true;
            	});
		    for(var x = topLeftX; x < topLeftX + screenWidth; x++){
		    	for(var y = topLeftY; y < topLeftY + screenHeight; y++){
		    		var key = x + "," + y;
		    		var glyph = game.Tile.nullFloorTile;
		    		if (visibleCells[key]){
		    			var tile = this.currentLevel.getTile(x, y);
		    			this.currentLevel.exploredTiles[key] = true;
		    			if (entities[key]){
		    				glyph = entities[key];
		    			} else if(items[key]){
		    				glyph = items[key][items[key].length - 1];
		    			} else{
		    				glyph = tile;
		    			}
		    			display.draw(x - topLeftX, y - topLeftY, glyph.chr, glyph.foreground, glyph.background);
		    		} else if(this.currentLevel.exploredTiles[key]){
		    			var tile = this.currentLevel.getTile(x, y);
		    			display.draw(x - topLeftX, y - topLeftY,
		    						tile.chr,
		    						tile.outOfSightForeground,
		    						tile.background);	
		    		}
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
}