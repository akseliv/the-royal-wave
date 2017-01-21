ig.module(
	'game.entities.fireball'
)
.requires(
	'impact.entity',
	'impact.entity-pool'
)
.defines(function(){

EntityFireball = ig.Entity.extend({

	_wmIgnore: true, // This entity will no be available in Weltmeister

	size: {x: 52, y: 31},
	offset: {x: 0, y: 0},
	maxVel: {x: 200, y: 0},
	
	// The fraction of force with which this entity bounces back in collisions
	bounciness: 0.8, 
	
	type: ig.Entity.TYPE.NONE,
	checkAgainst: ig.Entity.TYPE.B, // Check Against B - our evil enemy group
	collides: ig.Entity.COLLIDES.PASSIVE,
		
	animSheet: new ig.AnimationSheet( 'media/Royal_wave_corgi_animation.png', 52, 31 ),
	sfxSpawn: new ig.Sound( 'media/sounds/fireball.*' ),
	
	bounceCounter: 0,
	
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		
		this.vel.x = (settings.flip ? -this.maxVel.x : this.maxVel.x);
		this.vel.y = 0;
		this.addAnim( 'idle', 0.08, [0,1,2,3],true );
        
		this.currentAnim.flip.x = settings.flip;
        
		this.sfxSpawn.play();
        this.age = 50;
	},
	
	reset: function( x, y, settings ) {
		// This function is called when an instance of this class is resurrected
		// from the entity pool. (Pooling is enabled at the bottom of this file).
        
		this.parent( x, y, settings );
        this.anims.idle.rewind();
        this.currentAnim.flip.x = settings.flip;
		this.age = 50;
		this.vel.x = (settings.flip ? -this.maxVel.x : this.maxVel.x);
		this.vel.y = 0;
		this.sfxSpawn.play();
		
		// Remember, this a used entity, so we have to reset our bounceCounter
		// as well
		this.bounceCounter = 0;
	},

	update: function() {
		this.parent();
        this.age = this.age - 1;
        if(this.age < 0){
            this.kill();
        }

	},
		
	handleMovementTrace: function( res ) {
		this.parent( res );
		
		// Kill this fireball if it bounced more than 3 times
		if( res.collision.x || res.collision.y || res.collision.slope ) {
				this.kill();
                ig.game.spawnEntity( EntityExplosion,this.pos.x, this.pos.y );
		}
	},
	
	// This function is called when this entity overlaps anonther entity of the
	// checkAgainst group. I.e. for this entity, all entities in the B group.
	check: function( other ) {
		other.receiveDamage( 1, this );
        ig.game.spawnEntity( EntityExplosion,this.pos.x, this.pos.y );
		this.kill();
	}	
});


// If you have an Entity Class that instanced and removed rapidly, such as this 
// Fireball class, it makes sense to enable pooling for it. This will reduce
// strain on the GarbageCollector and make your game a bit more fluid.

// With pooling enabled, instances that are removed from the game world are not 
// completely erased, but rather put in a pool and resurrected when needed.

ig.EntityPool.enableFor( EntityFireball );


});
