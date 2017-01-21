ig.module(
	'game.entities.player'
)
.requires(
	'impact.entity',
	'game.entities.fireball'
)
.defines(function(){

EntityPlayer = ig.Entity.extend({
	
	// The players (collision) size is a bit smaller than the animation
	// frames, so we have to move the collision box a bit (offset)
	size: {x: 52, y: 120},
	offset: {x: 0, y: 0},
	
	maxVel: {x: 400, y: 800},
	friction: {x: 800, y: 0},
	
	type: ig.Entity.TYPE.A, // Player friendly group
	checkAgainst: ig.Entity.TYPE.NONE,
	collides: ig.Entity.COLLIDES.PASSIVE,
	
	animSheetCorgi: new ig.AnimationSheet( 'media/Royal_wave_elisabeth_animation1.png', 52, 120  ),	
	animSheetHover: new ig.AnimationSheet( 'media/Royal_wave_elisabeth_animation1-hover.png', 52, 120  ),	
	sfxHurt: new ig.Sound( 'media/sounds/hurt.*' ),
	sfxJump: new ig.Sound( 'media/sounds/jump.*' ),
	
	
	health: 3,

	// These are our own properties. They are not defined in the base
	// ig.Entity class. We just use them internally for the Player
	flip: false,
	accelGround: 1200,
	accelAir: 600,
	jump: 500,	
	maxHealth: 3,

	coins: 0,
    waveMode: -1,
    tower: 0,
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		this.animSheet =  this.animSheetCorgi;
		// Add the animations
        this.setAnimations();
        
		// Set a reference to the player on the game instance
		ig.game.player = this;
        
        this.wave1Time = 0;
        this.wave2Time = 0;
        
        
        // setup events
        if( !ig.global.wm )    {
            var self = this;
            ig.game.events.on("wave", function(){
                console.log("wave");
                if(self.waveMode == -1){
                    ig.game.spawnEntity( EntityFireball,self.pos.x, self.pos.y+22, {flip:self.flip} );
                    self.tower = 25;
                }else{
                    // we're in hover-mode
                   self.vel.y = -300;
                }
            });
            
            ig.game.events.on("stick-left", function(){
                console.log("left");
                self.wave1();
            });
            
            ig.game.events.on("stick-right", function(){
                console.log("right");
                self.wave2();
            });
        }

	},
    
    setAnimations: function(sheet){
        this.addAnim( 'idle', 1, [0] );
		this.addAnim( 'run', 0.07, [0,1,2,3,4] );
		this.addAnim( 'jump', 1, [1] );
        this.addAnim( 'wave1', 1, [5] );
        this.addAnim( 'wave2', 1, [6] );
		this.addAnim( 'fall', 0.4, [0], true ); // stop at the last frame
		this.addAnim( 'pain', 0.3, [0], true );
    },
    
    wave1: function() {
        var d = new Date();
        var n = d.getTime();
        this.currentAnim = this.anims.wave1;
        this.wave1Time = n;
    },
    
    wave2: function() {
            var d = new Date();
            var n = d.getTime();
            this.currentAnim = this.anims.wave2;
            
            this.wave2Time = n;
            
            var waveTime = this.wave2Time-this.wave1Time;
            
            
            if(waveTime < 250 && waveTime > 20){
                console.log("wavetime",waveTime);
                this.wave1Time = 0;
                this.wave2Time = 0;
                ig.game.events.emit("wave");
            }
    },
	
	
	update: function() {
        this.tower = this.tower -1;

		// switch mode
		if(ig.input.pressed('jump') ) {
            this.waveMode = -this.waveMode;
            if(this.animSheet == this.animSheetCorgi){
                this.animSheet = this.animSheetHover;
            }else{
                this.animSheet = this.animSheetCorgi;
            }
            this.setAnimations();
		}
		
		// wave 1
		if(ig.input.pressed('wave1') ) {
            this.wave1();

		}
        
        // wave 2
		if(ig.input.pressed('wave2') ) {
            this.wave2();

		}
		

		// Stay in the pain animation, until it has looped through.
		// If not in pain, set the current animation, based on the 
		// player's speed
		if( 
			this.currentAnim == this.anims.pain &&
			this.currentAnim.loopCount < 1
		) {
			// If we're dead, fade out
			if( this.health <= 0 ) {
				// The pain animation is 0.3 seconds long, so in order to 
				// completely fade out in this time, we have to reduce alpha
				// by 3.3 per second === 1 in 0.3 seconds
				var dec = (1/this.currentAnim.frameTime) * ig.system.tick;
				this.currentAnim.alpha = (this.currentAnim.alpha - dec).limit(0,1);
			}
		}
		else if( this.health <= 0 ) {
			// We're actually dead and the death (pain) animation is 
			// finished. Remove ourself from the game world.
			this.kill();
		}
		else if( this.vel.y < 0 ) {
			//this.currentAnim = this.anims.jump;
		}
		else if( this.vel.y > 0 ) {
			if( this.currentAnim != this.anims.fall ) {
				//this.currentAnim = this.anims.fall.rewind();
			}
		}
		else if( this.vel.x != 0 ) {
			this.currentAnim = this.anims.run;
		}
		else if(this.currentAnim != this.anims.wave1 && this.currentAnim != this.anims.wave2){
			this.currentAnim = this.anims.idle;
		}
		
		this.currentAnim.flip.x = this.flip;
        
		// Handle user input; move left or right

		if( ig.input.state('left') && this.tower < 0 ) {
			this.vel.x = -300;
			this.flip = true;
		}
		else if( ig.input.state('right') && this.tower < 0) {
			this.vel.x = 300;
			this.flip = false;
		}
		else {
			this.vel.x = 0;
		}
		
		// Move!
		this.parent();
	},

	kill: function() {
		this.parent();

		// Reload this level
		ig.game.reloadLevel();
	},

	giveCoins: function( amount ) {
		// Custom function, called from the EntityCoin
		this.coins += amount;
	},

	receiveDamage: function( amount, from ) {
		if( this.currentAnim == this.anims.pain ) {
			// Already in pain? Do nothing.
			return;
		}

		// We don't call the parent implementation here, because it 
		// would call this.kill() as soon as the health is zero. 
		// We want to play our death (pain) animation first.
		this.health -= amount;
		this.currentAnim = this.anims.pain.rewind();

		// Knockback
		this.vel.x = (from.pos.x > this.pos.x) ? -400 : 400;
		this.vel.y = -300;
		
		// Sound
		this.sfxHurt.play();
	}
});


});