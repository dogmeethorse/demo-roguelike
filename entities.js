game.Entity = function(properties){
	properties = properties || {};
	game.Glyph.call(this, properties);
	this.name = properties['name'] || "";
	this.x = properties['x'] || 0;
	this.y = properties['y'] || 0;
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
game.mixins = {};
game.mixins.playerActor = {
	name : "playerActor",
	groupName: "actor",
	act : function(){
		game.refresh();
		this.map.engine.lock();
		this.clearMessages();
	}
}
game.mixins.destructible = {
	name : "destructible",
	init : function(template){
		this.maxHp = template['maxHp'] ||10;
		this.hp = template['hp'] || this.maxHp; //special weird cases might want starting hp different
		this.defenseValue = template['defenseValue'] || 0;
	},
	takeDamage : function(attacker, damage){
		this.hp -= damage;
		if(this.hp <= 0){
			game.sendMessage(attacker, "The %s is dead", [this.name]);
			game.sendMessage(this, "You are dead.");
			this.map.removeEntity(this);
		}
	}
}
game.mixins.attacker = {
	name : "attacker",
	groupName : "attacker",
	init : function(template){
		this.attackValue = template['attackValue'] || 1;
	},
	attack : function(target){
		if(target.hasMixin('destructible')){
			var attack = this.attackValue;
			var defense = target.defenseValue;
			var max = Math.max(0, attack - defense);
			var damage = Math.floor(1 + Math.random() * max);
			
			game.sendMessage(this, "You strike the  %s for %d damage.", [target.name, damage]);
			game.sendMessage(target,"The &s strikes you for %d damage.", [this.name, damage]);
			target.takeDamage(this, damage);
		}
	}
}
game.mixins.fungusActor = {
	name : "fungus Actor",
	groupName : "actor",
	init : function(){
		this.growthsRemaining = 5;
	},
	act : function(){
		if(this.growthsRemaining > 0){
			if(Math.random() <= 0.02){
				var xOffset = Math.floor(Math.random() * 3) -1;
				var yOffset = Math.floor(Math.random() * 3) -1;
				if((xOffset !== 0 || yOffset !== 0) && 
				this.map.isEmptyFloor( this.x + xOffset, this.y + yOffset)){
					var entity = new game.Entity(game.fungusTemplate);
					entity.x = this.x + xOffset;
					entity.y = this.y + yOffset;
					this.map.addEntity(entity);
					this.growthsRemaining--;
					game.sendMessageNearby(this.map,
										   entity.x,
										   entity.y,
										   'The fungus is spreading!');
				}
			} 
		}
	}  
}
game.mixins.moveable = {
	name: "moveable",
	tryMove : function(x, y, map){
		var tile = map.getTile(x, y);
		var target = map.getEntityAt(x, y);
		if(target){
			if(this.hasMixin('attacker')){
				this.attack(target);
				return true;
			} else{
				return false;
			}
		}
		if(tile.walkable){
			this.x = x;
			this.y = y;
			return true;
		} else if(tile.diggable){
			map.dig(x, y);
			return true;
		} else{
			return false;
		}
	}
};

game.mixins.messageRecipient = {
	name : "messageRecipient",
	init : function(template){
		this.messages = [];
	},
	receiveMessage : function(message){
		this.messages.push(message);
	},
	getMessages : function(){
		return this.messages;
	},
	clearMessages : function(){
		this.messages = [];
	}
}

game.playerTemplate = {
    chr: '\u00D0' ||'@',
    foreground: 'gold',
    background: 'black',
    maxHp : 40,
    attackValue : 10,
    mixins : [game.mixins.moveable, game.mixins.playerActor,
    		  game.mixins.attacker,
    		  game.mixins.destructible,
    		  game.mixins.messageRecipient]
}
game.fungusTemplate = {
	chr: 'F',
	foreground : "green",
	background : "black",
	name : "Green Fungus",
	maxHp : 10,
	mixins : [game.mixins.fungusActor, 
			  game.mixins.destructible]
}

game.sendMessage = function(recipient, message, args){
	if(recipient.hasMixin("messageRecipient")){
		if(args){
			message = vsprintf(message, args);
			console.log(message);
		}
		recipient.receiveMessage(message);
	}
}
game.sendMessageNearby = function(map, centerX, centerY, message, args) {
    // If args were passed, then we format the message, else
    // no formatting is necessary
    if (args) {
        message = vsprintf(message, args);
    }
    // Get the nearby entities
    entities = map.getEntitiesWithinRadius(centerX, centerY, 5);
    // Iterate through nearby entities, sending the message if
    // they can receive it.
    for (var i = 0; i < entities.length; i++) {
        if (entities[i].hasMixin(game.mixins.messageRecipient)) {
            entities[i].receiveMessage(message);
        }
    }
}