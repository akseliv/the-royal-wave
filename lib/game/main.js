ig.module( 
	'game.main' 
)
.requires(
	'impact.game',
	'impact.font',
    'impact.debug.debug',

	'plugins.camera',
	'plugins.touch-button',
	'plugins.impact-splash-loader',
	'plugins.gamepad',
	
	'game.entities.player',
	'game.entities.blob',
    'game.entities.phone-box',
    'game.entities.pigeon',
    
    'game.entities.enemy-trigger',
    
    'game.entities.explosion',

	'game.levels.title',
	'game.levels.grasslands',
	'game.levels.snowhills'
)
.defines(function(){
	

// Our Main Game class. This will load levels, host all entities and
// run the game.

MyGame = ig.Game.extend({
	
	clearColor: null,
	gravity: 850, // All entities are affected by this
	
	// Load a font
	font: new ig.Font( 'media/fredoka-one.font.png' ),

	// HUD icons
	heartFull: new ig.Image( 'media/UI_heart_full.png' ),
	heartEmpty: new ig.Image( 'media/UI_heart_empty.png' ),
	coinIcon: new ig.Image( 'media/Royal_wave_blue_hat_52px.png' ),
    skyBackground: new ig.Image('media/bg_parallax_sky_v02.png'),
    heartFull: new ig.Image( 'media/UI_heart_full.png' ),
    flyIcon: new ig.Image( 'media/Royal_wave_flying_icon_44x52.png' ),
    corgiIcon: new ig.Image( 'media/Royal_wave_corgi_icon_52x52.png' ),
	
	init: function() {
        ig.music.add( 'media/sounds/the-royal-wave.ogg' );
        ig.music.volume = 0.2;
        ig.music.play();
        this.events = new Events();
        // Bind keys
		ig.input.bind( ig.KEY.LEFT_ARROW, 'left' );
		ig.input.bind( ig.KEY.RIGHT_ARROW, 'right' );
		ig.input.bind( ig.KEY.X, 'jump' );
		ig.input.bind( ig.KEY.C, 'wave1' );
        ig.input.bind( ig.KEY.V, 'wave2' );

		ig.input.bind( ig.GAMEPAD.PAD_LEFT, 'left' );
		ig.input.bind( ig.GAMEPAD.PAD_RIGHT, 'right' );
		ig.input.bind( ig.GAMEPAD.LEFT_SHOULDER, 'jump' );
        
		// We want the font's chars to slightly touch each other,
		// so set the letter spacing to -2px.
		this.font.letterSpacing = -2;		
		
		// Load the LevelGrasslands as required above ('game.level.grassland')
		this.loadLevel( LevelGrasslands );
	},

	loadLevel: function( data ) {
		// Remember the currently loaded level, so we can reload when
		// the player dies.
		this.currentLevel = data;

		// Call the parent implemenation; this creates the background
		// maps and entities.
		this.parent( data );
		
		this.setupCamera();
	},
	
	setupCamera: function() {
		// Set up the camera. The camera's center is at a third of the screen
		// size, i.e. somewhat shift left and up. Damping is set to 3px.		
		this.camera = new ig.Camera( ig.system.width/3, ig.system.height/3, 3 );
		
		// The camera's trap (the deadzone in which the player can move with the
		// camera staying fixed) is set to according to the screen size as well.
    	this.camera.trap.size.x = ig.system.width/10;
    	this.camera.trap.size.y = ig.system.height/3;
		
		// The lookahead always shifts the camera in walking position; you can 
		// set it to 0 to disable.
    	this.camera.lookAhead.x = 0;
		
		// Set camera's screen bounds and reposition the trap on the player
    	this.camera.max.x = this.collisionMap.pxWidth - ig.system.width;
    	this.camera.max.y = this.collisionMap.pxHeight - ig.system.height;
    	this.camera.set( this.player );
	},

	reloadLevel: function() {
        this.events = new Events();
		this.loadLevelDeferred( this.currentLevel );
	},
    
    randomExplosions: function(x,y) {
        for(var i=0;i < 6; i++){
            delayed.delay(function () { 
                ig.game.spawnEntity( EntityExplosion,x+Math.random()*100,y+Math.random()*100);
                ig.game.spawnEntity( EntityExplosion,x-Math.random()*100,y-Math.random()*100);
            }, Math.random()*500);
        }

    },
	
	update: function() {		
		// Update all entities and BackgroundMaps
		this.parent();
		
		// Camera follows the player
		this.camera.follow( this.player );
		
		// Instead of using the camera plugin, we could also just center
		// the screen on the player directly, like this:
		// this.screen.x = this.player.pos.x - ig.system.width/2;
		// this.screen.y = this.player.pos.y - ig.system.height/2;
	},
	
	draw: function() {
        this.skyBackground.draw(0,0);
		// Call the parent implementation to draw all Entities and BackgroundMaps
		this.parent();


		// Draw the heart and number of coins in the upper left corner.
		// 'this.player' is set by the player's init method
		if( this.player ) {
			var x = 16, 
				y = 16;

			for( var i = 0; i < this.player.maxHealth; i++ ) {
				// Full or empty heart?
				if( this.player.health > i ) {
					this.heartFull.draw( x, y );
				}
				else {
					this.heartEmpty.draw( x, y );	
				}

				x += this.heartEmpty.width + 8;
			}
            

			// We only want to draw the 0th tile of coin sprite-sheet
			x += 48;
			this.coinIcon.drawTile( x, 6, 0, 52 );

			x += 54;
			this.font.draw( 'x ' + this.player.coins, x, y+10 )
            
            x = 20;
            y = 80;
            if(this.player.waveMode == 1){
                for( var i = 0; i < this.player.flightStamina; i++ ) {

                        this.flyIcon.draw( x, y );

                    x += this.heartEmpty.width + 8;
                }
            }else{
                this.corgiIcon.draw(x,y);
            }
		}
		
		// Draw touch buttons, if we have any
		if( window.myTouchButtons ) {
			window.myTouchButtons.draw(); 
		}
	}
});



// The title screen is simply a Game Class itself; it loads the LevelTitle
// runs it and draws the title image on top.

MyTitle = ig.Game.extend({
	clearColor: "#d0f4f7",
	gravity: 800,

	// The title image
	title: new ig.Image( 'media/title.png' ),

	// Load a font
	font: new ig.Font( 'media/fredoka-one.font.png' ),

	init: function() {
		// Bind keys
		ig.input.bind( ig.KEY.LEFT_ARROW, 'left' );
		ig.input.bind( ig.KEY.RIGHT_ARROW, 'right' );
		ig.input.bind( ig.KEY.X, 'jump' );
		ig.input.bind( ig.KEY.C, 'shoot' );

		ig.input.bind( ig.GAMEPAD.PAD_LEFT, 'left' );
		ig.input.bind( ig.GAMEPAD.PAD_RIGHT, 'right' );
		ig.input.bind( ig.GAMEPAD.FACE_1, 'jump' );
		ig.input.bind( ig.GAMEPAD.FACE_2, 'shoot' );	
		ig.input.bind( ig.GAMEPAD.FACE_3, 'shoot' );	


		
		// Align touch buttons to the screen size, if we have any
		if( window.myTouchButtons ) {
			window.myTouchButtons.align(); 
		}

		// We want the font's chars to slightly touch each other,
		// so set the letter spacing to -2px.
		this.font.letterSpacing = -2;

		this.loadLevel( LevelTitle );
		this.maxY = this.backgroundMaps[0].pxHeight - ig.system.height;
	},

	update: function() {
		// Check for buttons; start the game if pressed
		if( ig.input.pressed('jump') || ig.input.pressed('shoot') ) {
			ig.system.setGame( MyGame );
			return;
		}
		
		
		this.parent();

		// Scroll the screen down; apply some damping.
		var move = this.maxY - this.screen.y;
		if( move > 5 ) {
			this.screen.y += move * ig.system.tick;
			this.titleAlpha = this.screen.y / this.maxY;
		}
		this.screen.x = (this.backgroundMaps[0].pxWidth - ig.system.width)/2;
	},

	draw: function() {
		this.parent();

		var cx = ig.system.width/2;
		this.title.draw( cx - this.title.width/2, 60 );
		
		var startText = ig.ua.mobile
			? 'Press Button to Play!'
			: 'Press X or C to Play!';
		
		this.font.draw( startText, cx, 420, ig.Font.ALIGN.CENTER);

		// Draw touch buttons, if we have any
		if( window.myTouchButtons ) {
			window.myTouchButtons.draw(); 
		}
	}
});


if( ig.ua.mobile ) {
	// Use the TouchButton Plugin to create a TouchButtonCollection that we
	// can draw in our game classes.
	
	// Touch buttons are anchored to either the left or right and top or bottom
	// screen edge.
	var buttonImage = new ig.Image( 'media/touch-buttons.png' );
	myTouchButtons = new ig.TouchButtonCollection([
		new ig.TouchButton( 'left', {left: 0, bottom: 0}, 128, 128, buttonImage, 0 ),
		new ig.TouchButton( 'right', {left: 128, bottom: 0}, 128, 128, buttonImage, 1 ),
		new ig.TouchButton( 'shoot', {right: 128, bottom: 0}, 128, 128, buttonImage, 2 ),
		new ig.TouchButton( 'jump', {right: 0, bottom: 96}, 128, 128, buttonImage, 3 )
	]);
}

// If our screen is smaller than 640px in width (that's CSS pixels), we scale the 
// internal resolution of the canvas by 2. This gives us a larger viewport and
// also essentially enables retina resolution on the iPhone and other devices 
// with small screens.
var scale = (window.innerWidth < 640) ? 2 : 1;


// We want to run the game in "fullscreen", so let's use the window's size
// directly as the canvas' style size.
var canvas = document.getElementById('canvas');
//canvas.style.width = window.innerWidth + 'px';
//canvas.style.height = window.innerHeight + 'px';


// Finally, start the game into MyTitle and use the ImpactSplashLoader plugin 
// as our loading screen
var width = 960,
	height = 540;
ig.main( '#canvas', MyGame, 60, width, height, 1, ig.ImpactSplashLoader );

});
