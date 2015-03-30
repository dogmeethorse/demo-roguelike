game.Builder = function(width, height, stairs, type){
	this.width = width;
	this.height = height;
	this.type = type;
	this.stairs = stairs || [];
	//Generate levels
    this.tiles = this.generateLevel(this.stairs, this.type);
}

game.Builder.prototype.generateLevel = function(stairs, type){
	//Empty map
	var map = [];
	for(var w = 0; w < this.width; w++){
		map.push([]);
		for( var y = 0; y < this.height; y++){
			map[w].push(game.Tile.nullTile);
		}
	}
	if(type === "town"){
		console.log("building town");
		var shipWidth = game.Building.ship.getWidth();
		var shipHeight = game.Building.ship.getHeight();
		var shipX = Math.max(Math.floor(Math.random() * (this.width - shipWidth)), 2);
		var shipY = Math.max(Math.floor(Math.random() * (this.height - shipHeight)), 2);
		console.log('ship x =' + shipX);
		console.log('ship y = ' + shipY);
		for (var x = 0; x < map.length; x++){
			for(var y = 0; y < map[0].length; y++){
				if(y === 0 || y === map[0].length -1){
					map[x][y] = game.Tile.solidWall;
					//console.log("placing block");
				} else if (x === 0 || x === map.width -1){
					map[x][y] = game.Tile.solidWall;
				} else if (x >= shipX && x < shipX + shipWidth &&
					 	y >= shipY && y < shipY + shipHeight){
						map[x][y] = game.Building.ship.getTile(x - shipX, y - shipY);
						
				} else{
					map[x][y] = game.Tile.floorTile;
				}
			}
		}
	} else{
		var generator = new ROT.Map.Cellular(this.width, this.height);
		generator.randomize(0.5);
		var totalIterations = 3;
		for(var i = 0; i< totalIterations - 1; i++){
			generator.create();
		}
		generator.create(function(x, y, v){
			if (stairs[x + "," + y]){
				map[x][y] = game.Tile.stairsUpTile;
			} else if (v === 1){
				map[x][y]= game.Tile.floorTile;
			} else {
				map[x][y] = game.Tile.wallTile;
			}
		});
	}
	return map;
}
