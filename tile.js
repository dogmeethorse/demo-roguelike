game.Tile= function(properties){
	properties = properties || properties;
	game.Glyph.call(this, properties);
	this.walkable = properties['walkable'] || false;
	this.diggable = properties['diggable'] || false;
}
game.Tile.extend(game.Glyph);

game.Tile.nullTile			= new game.Tile({});
game.Tile.floorTile			= new game.Tile({chr : ".",walkable : true});
game.Tile.wallTile			= new game.Tile({chr : '#', foreground : 'slategrey', walkable : false, diggable: true});
game.Tile.stairsUpTile		= new game.Tile({chr : "<", foreground : 'white', walkable : true, diggable : false});
game.Tile.stairsDownTIle	= new game.TIle({chr : ">", foreground : 'white', walkable : true, diggable : false});

game.getNeighborPositions = function(x, y) {
	//returns array of tile coordinates
    var tiles = [];
    // Generate all possible offsets
    for (var dX = -1; dX < 2; dX ++) {
        for (var dY = -1; dY < 2; dY++) {
            // Make sure it isn't the same tile
            if (dX == 0 && dY == 0) {
                continue;
            }
            tiles.push({x: x + dX, y: y + dY});
        }
    }
    return tiles.randomize();
}