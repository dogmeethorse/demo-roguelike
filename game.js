// \uF8FF = apple

var game = {
	screenWidth: 80,
	screenHeight: 24,
	display: null,
	currentScreen : null,
	container : null,
	getDisplay: function(){ return this.display},
	refresh: function(){
		this.display.clear();
		this.currentScreen.render(this.display);
	},
	init : function(){
		this.display = new ROT.Display({width:this.screenWidth, height: this.screenHeight + 1});
		this.container = this.display.getContainer();
		document.body.appendChild(this.container);
		this.switchScreen(game.screen.start);
		var bindEventToScreen = function(event){
			window.addEventListener(event, function(e){
				if(game.currentScreen !== null){
					game.currentScreen.handleInput(event, e);
				}
			});
		}
		bindEventToScreen('keydown');
    	//bindEventToScreen('keyup');
    	bindEventToScreen('keypress');
	},
	switchScreen : function(screen){
		if(this.currentScreen !== null){
			this.currentScreen.exit();
		}
		this.display.clear();
		this.currentScreen = screen;
		if(this.currentScreen !== null){
			this.currentScreen.enter();
			this.refresh();
		}
	}
}
window.onload = function() {
    // Check if rot.js can work on this browser
    if (!ROT.isSupported()) {
        alert("The rot.js library isn't supported by your browser.");
    } else {
        // Initialize the game
        game.init();
        // Add the container to our HTML page
        //document.body.appendChild(Game.getDisplay().getContainer());
    }
}