ig.module(
	'game.entities.pigeon'
)
.requires(
	'impact.entity'
)
.defines(function(){
	
EntityPigeon = ig.Entity.extend({
	size: {x: 104, y: 104},
	offset: {x: 0, y: 0},
	maxVel: {x: 800, y: 600},
	friction: {x: 0, y: 0},
	gravityFactor:0,
	type: ig.Entity.TYPE.B, // Evil enemy group
	checkAgainst: ig.Entity.TYPE.A, // Check against friendly
	collides: ig.Entity.COLLIDES.PASSIVE,
	
	health: 3,
	
	
	speed: 250,
	flip: true,
	active: false,
	animSheetNormal: new ig.AnimationSheet( 'media/Royal_wave_pigeon_animation_104.png', 104, 104),
	sfxDie: new ig.Sound( 'media/sounds/blob-die.*' ),
	
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
        this.animSheet =  this.animSheetNormal;
        this.setAnimations();


	},
    
    setAnimations: function(sheet){         
        this.addAnim( 'idle', 0.2, [0,1] );

    },
	
	
	update: function() {
    
        if(ig.game.screen.x+960 > this.pos.x){
            this.active = true;
        }
		// Near an edge? return!
		// if( !ig.game.collisionMap.getTile(
				// this.pos.x + (this.flip ? +4 : this.size.x -4),
				// this.pos.y + this.size.y+1
			// )
		// ) {
			// this.flip = !this.flip;
			
			// // We have to move the offset.x around a bit when going
			// // in reverse direction, otherwise the blob's hitbox will
			// // be at the tail end.
			// this.offset.x = this.flip ? 0 : 24;
		// }
		
		var xdir = this.flip ? -1 : 1;
        if(this.active){
            this.vel.x = this.speed * xdir;
        }
		this.currentAnim.flip.x = !this.flip;
		
		this.parent();
	},
	
	kill: function() {
        ig.game.randomExplosions(this.pos.x,this.pos.y);
		this.sfxDie.play();
		this.parent();
		
	},
	
	handleMovementTrace: function( res ) {
		this.parent( res );
		
		// Collision with a wall? return!
		if( res.collision.x ) {
			this.flip = !this.flip;
			this.offset.x = this.flip ? 0 : 24;
		}
	},
	
	check: function( other ) {

		other.receiveDamage( 1, this );
	}
});

});