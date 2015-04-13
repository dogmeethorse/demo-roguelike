game.Tile= function(properties){
	properties = properties || properties;
	game.Glyph.call(this, properties);
	this.walkable = properties['walkable'] || false;
	this.diggable = properties['diggable'] || false;
	this.blocksLight = properties['blocksLight'] || false;
	this.outOfSightForeground ="darkslategrey";
}
game.Tile.extend(game.Glyph);

game.Tile.nullTile			= new game.Tile({});
game.Tile.floorTile			= new game.Tile({chr : ".", 
											foreground : "white",
											walkable : true, 
											blocksLight : false});
game.Tile.wallTile			= new game.Tile({chr : '#',
											foreground : 'slategrey',
											walkable : false,
											blocksLight : true, 
											diggable: true});
game.Tile.solidWall			= new game.Tile({chr : game.SOLIDBLOCK,
											background : "silver",
											walkable : false,
											blocksLight : true,
											diggable : false});
game.Tile.buildingWall		= new game.Tile({chr : game.SOLIDBLOCK,
											background : "silver",
											walkable : false,
											blocksLight : false,
											diggable : false});
game.Tile.shipWindow		= new game.Tile({chr : game.SOLIDBLOCK,
											background : "yellow",
											walkable : false,
											blocksLight : false,
											diggable : false});
game.Tile.leftTriangle		= new game.Tile({chr : game.LEFTTRI,
											foreground : "silver",
											walkable : false,
											blocksLight : true,
											diggable : false});
game.Tile.rightTriangle		= new game.Tile({chr : game.RIGHTTRI,
											foreground : "silver",
											walkable : false,
											blocksLight : true,
											diggable : false});
game.Tile.stairsUpTile		= new game.Tile({chr : "<",
											foreground : 'white',
											walkable : true,
											blocksLight : false,
											diggable : false});
game.Tile.stairsDownTile	= new game.Tile({chr : ">",
											foreground : 'white',
											walkable : true,
											blocksLight : false,
											diggable : false});

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