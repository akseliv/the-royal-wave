ig.module(
	'game.entities.enemy-trigger'
)
.requires(
	'impact.entity'
)
.defines(function(){
	
EntityEnemyTrigger = ig.Entity.extend({
	size: {x: 64, y: 64},
	_wmScalable: true,
	type: ig.Entity.TYPE.NONE,
	checkAgainst: ig.Entity.TYPE.A, // Check against friendly
	collides: ig.Entity.COLLIDES.NEVER,
	
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
	},
	
	
	update: function() {		

	},
	
	
	check: function( other ) {
		if( other instanceof EntityPlayer ) {
            ig.game.spawnEntity( EntityBlob,ig.game.screen.x+950, ig.game.screen.y,{flip: true});
            ig.game.spawnEntity( EntityBlob,ig.game.screen.x-100, ig.game.screen.y,{flip: false});

			this.kill();

		}
	}
});

});