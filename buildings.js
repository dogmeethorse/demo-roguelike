game.Building = function(template){
	this.template = template;
}
game.Building.prototype.getTile = function(x, y){
	var tileCode = this.template[y][x];
	//console.log(tileCode);
	//return game.Tile.wallTile;
	if(tileCode === 1){
		return game.Tile.buildingWall;
	} else if (tileCode === 2){
		return game.Tile.shipWindow;
	} else {
		return game.Tile.floorTile;
	}
},
game.Building.prototype.getWidth = function(){
	return this.template[0].length;
}

game.Building.prototype.getHeight = function(building){
	return this.template.length;
}

game.Building.ship = new game.Building([
	[0,0,0,0,0,0,1,1,1,0,0,0,0,0,0],
	[0,0,0,1,1,1,1,1,1,1,1,1,0,0,0],
	[0,0,1,1,1,1,1,1,1,1,1,1,1,0,0],
	[0,1,1,2,1,1,1,2,1,1,1,2,1,1,0],
	[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
	[0,1,1,1,1,1,1,0,1,1,1,1,1,1,0],
	[0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]
]);