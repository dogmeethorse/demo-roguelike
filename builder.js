game.Builder = function(width, height, depth){
	this.width = width;
	this.height = height;
	this.depth = depth;
	this.tiles = [];
	this.regions = [];
	//Generate levels
    for (var z = 0; z < this.depth; z++) {
        this.tiles.push(this.generateLevel());
        this.regions.push([]);
        // Setup the regions array for each depth
        for (var x = 0; x < this.width; x++) {
            this.regions[z].push([]);
            for (var y = 0; y < this.height; y++) {
                this.regions[z][x].push(0);
            }
        }
    }
    for (var z = 0; z < this.depth; z++) {
        this.setupRegions(z);
    }
    this.connectAllRegions();
}

game.Builder.prototype.generateLevel = function(){
	//Empty map
	var map = [];
	for(var w = 0; w < this.width; w++){
		map.push([]);
	}
	var generator  = new ROT.Map.Cellular(this.width, this.height);
	generator.randomize(0.5);
	var totalIterations = 3;
	for(var i = 0; i< totalIterations - 1; i++){
		generator.create();
	}
	generator.create(function(x, y, v){
		if (v === 1){
			map[x].push(game.Tile.floorTile);
		} else {
			map[x].push(game.Tile.wallTile);
		}
	});
	return map;
}

game.Builder.prototype.canFillRegion = function(x, y, z) {
    // Make sure the tile is within bounds
    //console.log("canFillRegion");
    if (x < 0 || y < 0 || z < 0 || x >= this._width ||
        y >= this.height || z >= this.depth) {
        return false;
    }
    // Make sure the tile does not already have a region
    if (this.regions[z][x] === undefined ||
    	this.regions[z][x][y] !== 0) {
        return false;
    }
    // Make sure the tile is walkable
    return this.tiles[z][x][y].walkable;
}

game.Builder.prototype.fillRegion = function(region, x, y, z) {
	//console.log("fillRegion");
    var tilesFilled = 1;
    var tiles = [{x:x, y:y}];
    var tile;
    var neighbors;
    // Update the region of the original tile
    this.regions[z][x][y] = region;
    // Keep looping while we still have tiles to process
    while (tiles.length > 0) {
        tile = tiles.pop();
        // Get the neighbors of the tile
        neighbors = game.getNeighborPositions(tile.x, tile.y);
        // Iterate through each neighbor, checking if we can use it to fill
        // and if so updating the region and adding it to our processing
        // list.
        while (neighbors.length > 0) {
            tile = neighbors.pop();
            if (this.canFillRegion(tile.x, tile.y, z)) {
                this.regions[z][tile.x][tile.y] = region;
                tiles.push(tile);
                tilesFilled++;
            }
        }
    }
    return tilesFilled;
}

// This removes all tiles at a given depth level with a region number.
// It fills the tiles with a wall tile.
game.Builder.prototype.removeRegion = function(region, z) {
	//console.log("remove region");
    for (var x = 0; x < this.width; x++) {
        for (var y = 0; y < this.height; y++) {
            if (this.regions[z][x][y] === region) {
                // Clear the region and set the tile to a wall tile
                this.regions[z][x][y] = 0;
                this.tiles[z][x][y] = game.Tile.wallTile;
            }
        }
    }
}

// This sets up the regions for a given depth level.
game.Builder.prototype.setupRegions = function(z) {
	//console.log("setupRegions");
    var region = 1;
    var tilesFilled;
    // Iterate through all tiles searching for a tile that
    // can be used as the starting point for a flood fill
    for (var x = 0; x < this.width; x++) {
        for (var y = 0; y < this.height; y++) {
            if (this.canFillRegion(x, y, z)) {
                // Try to fill
                tilesFilled = this.fillRegion(region, x, y, z);
                // If it was too small, simply remove it
                if (tilesFilled <= 20) {
                    this.removeRegion(region, z);
                } else {
                    region++;
                }
            }
        }
    }
}
// This fetches a list of points that overlap between one
// region at a given depth level and a region at a level beneath it.
game.Builder.prototype.findRegionOverlaps = function(z, r1, r2) {
    var matches = [];
    // Iterate through all tiles, checking if they respect
    // the region constraints and are floor tiles. We check
    // that they are floor to make sure we don't try to
    // put two stairs on the same tile.
    for (var x = 0; x < this.width; x++) {
        for (var y = 0; y < this.height; y++) {
            if (this.tiles[z][x][y]  == game.Tile.floorTile &&
                this.tiles[z+1][x][y] == game.Tile.floorTile &&
                this.regions[z][x][y] == r1 &&
                this.regions[z+1][x][y] == r2) {
                matches.push({x: x, y: y});
            }
        }
    }
    // We shuffle the list of matches to prevent bias
    return matches.randomize();
}

// This tries to connect two regions by calculating 
// where they overlap and adding stairs
game.Builder.prototype.connectRegions = function(z, r1, r2) {
    var overlap = this.findRegionOverlaps(z, r1, r2);
    // Make sure there was overlap
    if (overlap.length === 0) {
        return false;
    }
    // Select the first tile from the overlap and change it to stairs
    var point = overlap[0];
    this.tiles[z][point.x][point.y] = game.Tile.stairsDownTile;
    this.tiles[z+1][point.x][point.y] = game.Tile.stairsUpTile;
    return true;
}
// This tries to connect all regions for each depth level,
// starting from the top most depth level.
game.Builder.prototype.connectAllRegions = function() {
    for (var z = 0; z < this.depth - 1; z++) {
        // Iterate through each tile, and if we haven't tried
        // to connect the region of that tile on both depth levels
        // then we try. We store connected properties as strings
        // for quick lookups.
        var connected = {};
        var key;
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                key = this.regions[z][x][y] + ',' + this.regions[z+1][x][y];
                if (this.tiles[z][x][y] === game.Tile.floorTile &&
                    this.tiles[z+1][x][y] === game.Tile.floorTile &&
                    !connected[key]) {
                    // Since both tiles are floors and we haven't 
                    // already connected the two regions, try now.
                    this.connectRegions(z, this.regions[z][x][y], this.regions[z+1][x][y]);
                    connected[key] = true;
                }
            }
        }
    }
}
