game.screen = {
	start : {
		enter : function(){

		},
		exit : function(){
			console.log("leave start");
		},
		render : function(display){
		    display.drawText(1,1, "%c{yellow}WOW such Dogelike!");
        	display.drawText(1,2, "Press [Enter] to start!");
		},
		handleInput : function(inputType, inputData){
			if(inputType === "keydown"){
				game.switchScreen(game.screen.play);
			}
		}
	},
	play : {
		map : null,
		gameEnded : false,
		setGameEnded : function(gameEnded){
			this.gameEnded = gameEnded;
		},
		enter : function(){
			console.log('entered play screen');
			game.dungeon.init();
		},
		exit : function(){
		
		},
		render : function(display){
			game.dungeon.renderLevel(display);
			//console.log('rendering');
		},
		handleInput : function(inputType, inputData){
		    if (inputType === 'keydown') {
		    	//If the game is over, enter will bring the user to the losing screen.
        		if (this.gameEnded) {
            		if (inputType === 'keydown' && inputData.keyCode === ROT.VK_RETURN) {
                		game.switchScreen(game.screen.lose);
            		}
            	// Return to make sure the user can't still play
            		return;
        		} else{
            		//movement
            		if(inputData.keyCode === ROT.VK_LEFT) {
                		game.dungeon.handleMove(-1, 0, 0);
            		} else if(inputData.keyCode === ROT.VK_RIGHT) {
                		game.dungeon.handleMove(1, 0, 0);
            		} else if(inputData.keyCode === ROT.VK_UP) {
                		game.dungeon.handleMove(0, -1, 0);
            		} else if(inputData.keyCode === ROT.VK_DOWN) {
                		game.dungeon.handleMove(0, 1, 0);
            		}
            		game.dungeon.engine.unlock();
            	}
			} else if (inputType === 'keypress') {
            var keyChar = String.fromCharCode(inputData.charCode);
            if (keyChar === '>') {
                game.dungeon.handleMove(0, 0, 1);
            } else if (keyChar === '<') {
                game.dungeon.handleMove(0, 0, -1);
            } else {
                // Not a valid key
                return;
            }
            // Unlock the engine
            game.dungeon.engine.unlock();
        } 
		}
	},
	win :{
		enter : function(){
		
		},
		exit : function(){
		
		},
		render : function(display){
		 	var foreground, background, colors;
 			for(var i = 0; i < 15; i ++){
 				foreground = ROT.Color.toRGB([255 - (i*20),140 - (i*20), 150 + (i*20)]);
 				background = ROT.Color.toRGB([i*20, i*20, i*20]);
 				colors = "%c{" + foreground + "} %b{" + background +"}";
 				display.drawText(35, i + 2, colors + "YOU WIN");
 			}
		},
		handleInput : function(inputType, inputData){
		
		}
	},
	lose :{
		enter : function(){
			console.log("entering lose")
		},
		exit : function(){
		
		},
		render : function(display){
			var foreground, background, colors;
 			for(var i = 0; i < 15; i ++){
 				foreground = ROT.Color.toRGB([255 - (i*20),140 - (i*20), 150 + (i*20)]);
 				background = ROT.Color.toRGB([i*20, i*20, i*20]);
 				colors = "%c{" + foreground + "} %b{" + background +"}";
 				display.drawText(35, i + 2, colors + "YOU LOSE");
 			}
		},
		handleInput : function(inputType, inputData){
		
		}
	}
}
