game.Glyph = function(properties){
	properties = properties || {};
	this.chr = properties['chr'] || " ";
	this.foreground = properties['foreground'] || "white";
	this.background = properties['background'] || "black";
}
