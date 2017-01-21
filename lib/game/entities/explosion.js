ig.module(
	'game.entities.explosion'
)
.requires(
	'impact.entity'
)
.defines(function(){
	
EntityExplosion= ig.Entity.extend({
	size: {x: 52, y: 52},
	
	type: ig.Entity.TYPE.NONE,
	checkAgainst: ig.Entity.TYPE.NONE, // Check against friendly
	collides: ig.Entity.COLLIDES.NEVER,
	
	animSheet: new ig.AnimationSheet( 'media/Royal_wave_explosion2_animation_52px.png', 52, 52 ),
	
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		this.addAnim( 'idle', 0.1, [0,1,2,3,4,5,6,7] );
	},
	
	
	update: function() {		
        if(this.currentAnim.frame == 7){
            this.kill();
        }
		// Do nothing in this update function; don't even call this.parent().
		// The coin just sits there, isn't affected by gravity and doesn't move.

		// We still have to update the animation, though. This is normally done
		// in the .parent() update:
		this.currentAnim.update();
	},
	
});

});