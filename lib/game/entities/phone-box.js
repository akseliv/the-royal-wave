ig.module(
	'game.entities.phone-box'
)
.requires(
	'impact.entity'
)
.defines(function(){
	
EntityPhoneBox = ig.Entity.extend({
	size: {x: 85, y: 180},
	
	type: ig.Entity.TYPE.NONE,
	checkAgainst: ig.Entity.TYPE.B, 
	collides: ig.Entity.COLLIDES.FIXED,
	health: 3,
	animSheet: new ig.AnimationSheet( 'media/phone_booth_85x180.png', 85, 180 ),
	
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		
		this.addAnim( 'idle', 1, [0] );
	},
	
	
	update: function() {		
        if(this.health == 0){
            ig.game.randomExplosions(this.pos.x,this.pos.y);
            this.kill();
        }
	},
	
	collideWith: function( other, axis ){
		if( other instanceof EntityFireball) {
            this.health = this.health -1;
            other.kill();
		}
    },
    
	check: function( other ) {
		// The instanceof should always be true, since the player is
		// the only entity with TYPE.A - and we only check against A.

	}
});

});