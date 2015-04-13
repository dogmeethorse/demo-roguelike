game.Item = function(properties){
	properties = properties || {};
	game.Glyph.call(this, properties);
	this.name = properties["name"] || " ";
}
game.Item.extend(game.Glyph);

game.Item.templates = {
	pineapple :	{
		name	: "Pineapple",
		chr		: game.PINEAPPLE
	}
};