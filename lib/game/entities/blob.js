ig.module(
	'game.entities.blob'
)
.requires(
	'impact.entity'
)
.defines(function(){
	
EntityBlob = ig.Entity.extend({
	size: {x: 106, y: 120},
	offset: {x: 0, y: 0},
	maxVel: {x: 500, y: 1000},
	friction: {x: 150, y: 0},
	
	type: ig.Entity.TYPE.B, // Evil enemy group
	checkAgainst: ig.Entity.TYPE.A, // Check against friendly
	collides: ig.Entity.COLLIDES.PASSIVE,
	
	health: 4,
	
	
	speed: 136,
	flip: false,
	
	animSheetNormal: new ig.AnimationSheet( 'media/Royal_wave_enemy_animation_106px.png', 106, 120),
    animSheetHurt: new ig.AnimationSheet( 'media/Royal_wave_enemy_animation_106px-hurt.png', 106, 120),
	sfxDie: new ig.Sound( 'media/sounds/blob-die.*' ),
	
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
        this.animSheet =  this.animSheetNormal;
        this.setAnimations();


	},
    
    setAnimations: function(sheet){         
        this.addAnim( 'idle', 0.08, [0,1,2,3,4,5,6,7] );
        this.addAnim( 'hurt', 0.08, [8] );

    },
	
	
	update: function() {

        this.hurtFlash = this.hurtFlash -1;
        if(this.hurtFlash < 0){
            this.currentAnim = this.anims.idle;
        }
        
        if(ig.game.player.pos.x < this.pos.x){
            this.flip = true;
        }else{
            this.flip = false;
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
		this.vel.x = this.speed * xdir;
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
	},
    
    receiveDamage: function( amount, from ) {
        this.currentAnim = this.anims.hurt;
        this.hurtFlash = 25;
        this.parent(amount,from);

    }
});

});