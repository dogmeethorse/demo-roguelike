game.mixins = {};
game.mixins.playerActor = {
	name : "playerActor",
	groupName: "actor",
	act : function(){
		//check if dead
		if (this.hp <= 0){
			game.screen.play.setGameEnded(true);
			game.sendMessage(this, "WOW, you're dead Press [Enter] to continue!");
		}
		game.refresh();
		this.map.engine.lock();
		this.clearMessages();
	}
}

game.mixins.wanderActor = {
	name : "wanderActor",
	groupName : "actor",
	act : function(){
	    var moveOffset = (Math.round(Math.random()) === 1) ? 1 : -1;
        // Flip coin to determine if moving in x direction or y direction
        if (Math.round(Math.random()) === 1) {
            this.tryMove(this.x + moveOffset, this.y, this.z);
        } else {
            this.tryMove(this.x, this.y + moveOffset, this.z);
        }
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
			if (this.hasMixin(game.mixins.playerActor)){
				console.log("dead acting");
				this.act();
			} else {
				this.map.removeEntity(this);
			}
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
			game.sendMessage(target,"The %s strikes you for %d damage.", [this.name, damage]);
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
			if(Math.random() <= 0.02 && this.map.numEntities < 200){
				var xOffset = Math.floor(Math.random() * 3) -1;
				var yOffset = Math.floor(Math.random() * 3) -1;
				if ((xOffset !== 0 || yOffset !== 0) && 
					this.map.isEmptyFloor(this.x + xOffset,
										  this.y + yOffset,
										  this.z)){
					var entity = new game.Entity(game.fungusTemplate);
					entity.setPosition(this.x + xOffset, this.y + yOffset, this.z);
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

game.mixins.sight = {
    name: 'sight',
    groupName: 'sight',
    init: function(template) {
        this.sightRadius = template['sightRadius'] || 5;
    },
    getSightRadius: function() {
        return this.sightRadius;
    }
}

game.playerTemplate = {
    chr: '\u00D0' || '@',
    foreground: 'gold',
    background: 'black',
    maxHp : 40,
    attackValue : 10,
    sightRadius : 6,
    mixins : [game.mixins.playerActor,
    		  game.mixins.attacker,
    		  game.mixins.destructible,
    		  game.mixins.messageRecipient,
    		  game.mixins.sight]
}

game.fungusTemplate = {
	chr: String.fromCodePoint(0x2603) ||'F',
	foreground : "green",
	background : "black",
	name : "Green Fungus",
	maxHp : 10,
	mixins : [game.mixins.fungusActor, 
			  game.mixins.destructible]
}

game.catTemplate = {
    name: 'Annoying Cat',
    chr: 'c',
    foreground: 'white',
    maxHp: 5,
    attackValue: 4,
    mixins: [game.mixins.wanderActor, 
             game.mixins.attacker,
             game.mixins.destructible]
};

game.newtTemplate = {
    name: 'Drunk Newt',
    chr: 'n',
    foreground: 'yellow',
    maxHp: 3,
    attackValue: 2,
    mixins: [game.mixins.wanderActor, 
             game.mixins.attacker,
             game.mixins.destructible]
};

game.sendMessage = function(recipient, message, args){
	if(recipient.hasMixin("messageRecipient")){
		if(args){
			message = vsprintf(message, args);
		}
		recipient.receiveMessage(message);
	}
}
game.sendMessageNearby = function(map, centerX, centerY, centerZ, message, args) {
    // If args were passed, then we format the message, else
    // no formatting is necessary
    if (args) {
        message = vsprintf(message, args);
    }
    // Get the nearby entities
    entities = map.getEntitiesWithinRadius(centerX, centerY, centerZ, 5);
    // Iterate through nearby entities, sending the message if
    // they can receive it.
    for (var i = 0; i < entities.length; i++) {
        if (entities[i].hasMixin(game.mixins.messageRecipient)) {
            entities[i].receiveMessage(message);
        }
    }
}