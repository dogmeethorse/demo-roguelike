game.Entity = function(properties){
	properties = properties || {};
	game.Glyph.call(this, properties);
	this.name = properties['name'] || "";
	this.x = properties['x'] || 0;
	this.y = properties['y'] || 0;
	this.z = properties['z'] || 0;
	this.map = null;
	this.attachedMixins = {};
	this.attachedMixinGroups = {};
	var mixins = properties['mixins'] || [];
	for(var i = 0; i < mixins.length; i++){
	    // Copy over all properties from each mixin as long
        // as it's not the name or the init property. We
        // also make sure not to override a property that
        // already exists on the entity.
		for(var key in mixins[i]){
		    if (key != 'init' && key != 'name' && !this.hasOwnProperty(key)) {
                this[key] = mixins[i][key];
            }
            // Add the name of this mixin to our attached mixins
       		this.attachedMixins[mixins[i].name] = true;
       		// if a group name is present add it
       		if(mixins[i].groupName){
       			this.attachedMixinGroups[mixins[i].groupName] = true;
       		}
        	// Finally call the init function if there is one
        	if (mixins[i].init) {
            	mixins[i].init.call(this, properties);
			}
		}
	}
}

game.Entity.extend(game.Glyph);
game.Entity.prototype.hasMixin = function(obj){
	if(typeof obj === "object"){
		return this.attachedMixins[obj.name];
	} else{
		return this.attachedMixins[obj] || this.attachedMixinGroups[obj];
	}
}

game.Entity.prototype.setPosition = function(x, y) {
	var oldX = this.x;
	var oldY = this.y;
    this.x = x;
    this.y = y;
    if (this.map){
    	this.map.updateEntityPosition(this, oldX, oldY);
    }
}

game.Entity.prototype.tryMove = function(x, y, z){
	var map = game.dungeon.currentLevel;
	var tile = map.getTile(x, y);
	var target = map.getEntityAt(x, y);
	// if z is different then look for stairs
	if (z === -1){
		if (tile !== game.Tile.stairsUpTile){
			game.sendMessage(this, "You can't go up here!");
		} else {
			game.sendMessage(this, "You ascend up level!");
        	game.dungeon.goUpStairs();
		}	
	}else if (z === 1){
		if (tile !== game.Tile.stairsDownTile){
			game.sendMessage(this, "You can't get down here!", [z - 1]);
		} else {
			game.sendMessage(this, "You go down a level!");
			game.dungeon.goDownStairs();
		}
	}
	//} else if (target){
	//	if (this.hasMixin('attacker') &&
	//		(this.hasMixin(game.mixins.playerActor) ||
	//		 target.hasMixin(game.mixins.playerActor))
	//		){
	//		this.attack(target);
	//		return true;
	//	} else{
	//		return false;
	//	}
	/*} else*/ if(tile.walkable){
		this.setPosition(x, y);
		return true;
	} else if(tile.diggable){
		if (this.hasMixin(game.mixins.playerActor)){
			map.dig(x, y);
			return true;
		} else{
			return false;
		}
	}
}
