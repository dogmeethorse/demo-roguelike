game.Map = function(tiles, player){
	this.tiles = tiles;
	this.exploredTiles = {};
	//this.depth = tiles.length
	this.width = tiles.length;
	this.height = tiles[0].length;
	this.entities = {};
	this.numEntities = 0;
	this.fov = [];
	this.stairLocations = {};
	this.addStairsDown();
	//this.setupFov();
	//this.addEntityAtRandomPosition(player, 0);
	// adding fungi
	var templates = [game.fungusTemplate, game.catTemplate, game.newtTemplate]
	//for(var z = 0; z < this.depth; z++){
	//	for(var i = 0; i < 25; i++){
	//		var template = templates[Math.floor(Math.random() * templates.length)];
	//		this.addEntityAtRandomPosition(new game.Entity(template), z);
	//	}
	//}
}
game.Map.prototype.getTile = function(x, y){
	if (x < 0 || x >= this.width || 
		y < 0 || y >= this.height){
		return game.Tile.nullTile;
	}
	else{
		return this.tiles[x][y] || game.Tile.nullTile;
	}
}
game.Map.prototype.isEmptyFloor = function(x, y){
	return this.getTile(x, y) == game.Tile.floorTile &&
		!this.getEntityAt(x, y);
}
game.Map.prototype.dig = function(x, y, z) {
    // If the tile is diggable, update it to a floor
    if (this.getTile(x, y).diggable) {
        this.tiles  [x][y] = game.Tile.floorTile;
    }
}
game.Map.prototype.getRandomFloorPosition = function() {
    // Randomly generate a tile which is a floor
    var x, y;
    do {
        x = Math.floor(Math.random() * this.width);
        y = Math.floor(Math.random() * this.height);
    } while(!this.isEmptyFloor(x, y));
    return {x: x, y: y};
}

game.Map.prototype.addStairsDown = function(){
	var numStairs = 30;
	for(var s = 0; s < numStairs; s++){
		 var position = this.getRandomFloorPosition();
		 this.tiles[position.x][position.y] = game.Tile.stairsDownTile;
		 this.stairLocations[position.x + "," + position.y] = true;
	} 
}

game.Map.prototype.getEntityAt = function(x, y){
    // Iterate through all entities searching for one with
    // matching position
	var key = x + "," + y;
	return this.entities[key];
}

game.Map.prototype.getEntitiesWithinRadius = function(centerX, centerY, centerZ, radius){
	var results = [];
	var leftX = centerX - radius;
    var rightX = centerX + radius;
    var topY = centerY - radius;
    var bottomY = centerY + radius;
    // Iterate through our entities, adding any which are within the bounds
    for (var key in this.entities) {
    	var entity = this.entities[key];
        if (entity.x >= leftX &&
            entity.x <= rightX && 
            entity.y >= topY &&
            entity.y <= bottomY &&
            entity.z === centerZ) {
            results.push(entity);
        }
    }
    return results;
}

game.Map.prototype.addEntity = function(entity){
    // Make sure the entity's position is within bounds
    entity.map = this;
	this.updateEntityPosition(entity);
	this.numEntities++;
	//console.log( "added " + entity.name + " total entities " + this.numEntities);
    if(entity.hasMixin('actor')){
    	game.dungeon.scheduler.add(entity, true);
    }
}

game.Map.prototype.removeEntity = function(entity){
	var key = entity.x + "," + entity.y;
	this.numEntities--;
	//console.log("removed " + entity.name + " total entities " + this.numEntities);
	delete this.entities[key];
		if(entity.hasMixin('actor')){
			//this.scheduler.remove(entity);
		}
}

game.Map.prototype.addEntityAtRandomPosition = function(entity) {
    var position = this.getRandomFloorPosition();
    entity.x = position.x;
    entity.y = position.y;
    this.addEntity(entity);
}

game.Map.prototype.updateEntityPosition = function(entity, oldX, oldY){
		//delete old entity key value pair if entity has new key value in map
		//cause that's how position is stored
	if (oldX || oldX === 0) { // hacky way to handle moving on the 0 column of the map problem 0 is falsey
		var oldKey = oldX + "," + oldY;
		if (this.entities[oldKey] === entity){
			delete this.entities[oldKey];
		}
	}
	    // Make sure the entity's position is within bounds
    if (entity.x < 0 || entity.x >= this.width  ||
        entity.y < 0 || entity.y >= this.height ) {
        throw new Error("Entity's position is out of bounds.");
    }
    // 
    var key = entity.x + ',' + entity.y;
    if (this.entities[key]) {
        throw new Error('Tried to add an entity at an occupied position.');
    }
    // Add the entity to the table of entities
    this.entities[key] = entity;
}

game.Map.prototype.setupFov = function() {
    // Keep this in 'map' variable so that we don't lose it.
    var map = this;
    // Iterate through each depth level, setting up the field of vision
    for (var z = 0; z < this.depth; z++) {
        // We have to put the following code in it's own scope to prevent the
        // depth variable from being hoisted out of the loop.
        (function() {
            // For each depth, we need to create a callback which figures out
            // if light can pass through a given tile.
            map.fov.push(
                new ROT.FOV.PreciseShadowcasting(function(x, y) {
                    return !(map.getTile(x, y).blocksLight);
                }, {topology: 4}));
        })();
    }
}

game.Map.prototype.getFov = function(depth) {
    return this.fov[depth];
}
