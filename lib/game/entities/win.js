ig.module(
	'game.entities.win'
)
.requires(
	'impact.entity'
)
.defines(function(){
	
EntityWin = ig.Entity.extend({
	size: {x: 52, y: 52},
	
	type: ig.Entity.TYPE.NONE,
	checkAgainst: ig.Entity.TYPE.A, // Check against friendly
	collides: ig.Entity.COLLIDES.NEVER,
	
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );

	},
	
	
	update: function() {		
        this.parent();
	},
	
	
	check: function( other ) {
		// The instanceof should always be true, since the player is
		// the only entity with TYPE.A - and we only check against A.
		if( other instanceof EntityPlayer ) {
            ig.system.setGame( MyCongrats );
			this.kill();

		}
	}
});

});