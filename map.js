game.Map = function(tiles, player){
	this.tiles = tiles;
	this.width = tiles.length;
	this.height = tiles[0].length;
	this.entities = [];
	this.scheduler = new ROT.Scheduler.Simple();
	this.engine = new ROT.Engine(this.scheduler);
	this.addEntityAtRandomPosition(player);
	// adding fungi
	for(var i = 0; i < 20; i++){
		this.addEntityAtRandomPosition(new game.Entity(game.fungusTemplate));
	}
}
game.Map.prototype.getTile = function(x, y){
	if(x < 0 || x >= this.width || y < 0 || y >= this.height){
		return game.Tile.nullTile;
	}
	else{
		return this.tiles[x][y] || game.Tile.nullTile;
	}
}
game.Map.prototype.isEmptyFloor = function(x, y){
	return this.getTile(x,y) == game.Tile.floorTile &&
		!this.getEntityAt(x, y);
}
game.Map.prototype.dig = function(x, y) {
    // If the tile is diggable, update it to a floor
    if (this.getTile(x, y).diggable) {
        this.tiles[x][y] = game.Tile.floorTile;
    }
}
game.Map.prototype.getRandomFloorPosition = function() {
    // Randomly generate a tile which is a floor
    //console.log('getting floor position');
    var x, y;
    do {
        x = Math.floor(Math.random() * this.width);
        y = Math.floor(Math.random() * this.height);
    } while(!this.isEmptyFloor(x, y));
    return {x: x, y: y};
}
game.Map.prototype.getEntityAt = function(x, y){
    // Iterate through all entities searching for one with
    // matching position
    for (var i = 0; i < this.entities.length; i++) {
        if (this.entities[i].x == x && this.entities[i].y == y) {
            return this.entities[i];
        }
    }
    return false;
}
game.Map.prototype.addEntity = function(entity){
    // Make sure the entity's position is within bounds
    if (entity.x < 0 || entity.x >= this._width ||
        entity.y < 0 || entity.y >= this._height) {
        throw new Error('Adding entity out of bounds.');
    }
    entity.map = this;
    this.entities.push(entity);
    if(entity.hasMixin('actor')){
    	this.scheduler.add(entity, true);
    }
}
game.Map.prototype.addEntityAtRandomPosition = function(entity) {
    var position = this.getRandomFloorPosition();
    entity.x = position.x;
    entity.y = position.y;
    this.addEntity(entity);
}
game.Map.prototype.removeEntity = function(entity){
	for(i = 0; i < this.entities.length; i++){
		if(this.entities[i] === entity){
			this.entities.splice(i, 1);
			break;
		}
		if(entity.hasMixin("actor")){
			this.scheduler.remove(entity);
		}
	}	
}
game.Map.prototype.getEntitiesWithinRadius = function(centerX, centerY, radius){
	var results = [];
	var leftX = centerX - radius;
    var rightX = centerX + radius;
    var topY = centerY - radius;
    var bottomY = centerY + radius;
    // Iterate through our entities, adding any which are within the bounds
    for (var i = 0; i < this.entities.length; i++) {
        if (this.entities[i].x >= leftX &&
            this.entities[i].x <= rightX && 
            this.entities[i].y >= topY &&
            this.entities[i].y <= bottomY) {
            results.push(this.entities[i]);
        }
    }
    return results;
}