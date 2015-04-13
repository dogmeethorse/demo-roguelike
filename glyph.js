game.Glyph = function(properties){
	properties = properties || {};
	this.chr = properties['chr'] || " ";
	this.foreground = properties['foreground'] || "white";
	this.background = properties['background'] || "black";
}
game.DOGE = '\u00D0';
game.FULLBLOCK = '\u2588';
game.LEFTTRI = '\u25E2';
game.RIGHTTRI = '\u25E3';
game.PINEAPPLE  = '\u2604';