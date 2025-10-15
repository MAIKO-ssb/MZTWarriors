import Phaser from 'phaser';
import { useEffect } from 'react';

const PhaserGame = () => {
  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 300 },  // Enable gravity for jumping
          debug: false,
        },
      },
      scene: {
        preload: function () {
          // Load the background and character sprite sheet
          this.load.image('sky', '/images/backgrounds/sky.png');
          this.load.image('ground', '/images/platform.png');  // Load ground image for platforms
          
          // Load the sprite sheet for the character
          this.load.spritesheet('character', '/images/characters/warrior-spritesheet.png', {
            frameWidth: 200,  // Adjust based on your sprite sheet frame size
            frameHeight: 216, // Adjust based on your sprite sheet frame size
          });
        },
        create: function () {
          // Add the background
          this.add.image(400, 300, 'sky');

          // Create a group of platforms
          this.platforms = this.physics.add.staticGroup();
          this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();  // Ground platform
          
          // Create the player and add physics
          this.player = this.physics.add.sprite(100, 450, 'character');
          this.player.setCollideWorldBounds(true);
          this.physics.add.collider(this.player, this.platforms); // Collide player with platforms

          // Create the walk animation
          this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('character', { start: 17, end: 21 }), // Walk frames
            frameRate: 10,
            repeat: -1,  // Loop the walk animation
          });

          // Create an idle animation (assuming frames 0 to 4 are idle)
          this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('character', { start: 0, end: 4 }), // Idle frames
            frameRate: 5,  // Slower frame rate for idle
            repeat: -1,  // Loop the idle animation
          });

          // Create an attack animation (assuming frames 24 to 28 are attack frames)
          this.anims.create({
            key: 'attack',
            frames: this.anims.generateFrameNumbers('character', { start: 24, end: 28 }), // Attack frames
            frameRate: 10,  // Faster frame rate for attacking
            repeat: 0,  // Do not loop the attack animation
          });

          // Start with the idle animation
          this.player.anims.play('idle');

          // Set up keyboard input for movement and attack
          this.cursors = this.input.keyboard.createCursorKeys();
          this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);  // Spacebar for attack

          // Add a flag to check if the player is attacking
          this.isAttacking = false;
          this.isJumping = false; // New flag for jumping
        },
        update: function () {
          let moving = false;
          let speed = 250;

          // Handle character movement if not attacking
          if (!this.isAttacking) {
            if (this.cursors.left.isDown) {
              this.player.setVelocityX(-speed);
              this.player.flipX = true;  // Flip character when moving left
              moving = true;
            } else if (this.cursors.right.isDown) {
              this.player.setVelocityX(speed);
              this.player.flipX = false;  // Ensure character faces right
              moving = true;
            } else {
              this.player.setVelocityX(0);
            }

            // Handle jumping
            if (this.cursors.up.isDown && !this.isJumping) {
              this.player.setVelocityY(-400); // Adjust jump height as necessary
              this.isJumping = true; // Set jumping flag
            }

            // Reset jump flag when player lands
            if (this.player.body.touching.down) {
              this.isJumping = false;
            }

            // Play walk animation if moving, otherwise idle
            if (moving) {
              if (this.player.anims.currentAnim.key !== 'walk') {
                this.player.anims.play('walk', true);
              }
            } else {
              if (this.player.anims.currentAnim.key !== 'idle') {
                this.player.anims.play('idle', true);
              }
            }
          }

          // Handle attack
          if (!this.isAttacking && Phaser.Input.Keyboard.JustDown(this.attackKey)) {
            // Start attack animation
            this.isAttacking = true;  // Set attacking flag to true
            this.player.setVelocity(0);  // Stop movement during attack

            // Play the attack animation and listen for completion
            this.player.anims.play('attack', true);

            // After the attack animation finishes, reset to idle or walk
            this.player.once('animationcomplete', () => {
              this.isAttacking = false;  // Reset attacking flag
              if (moving) {
                this.player.anims.play('walk', true);
              } else {
                this.player.anims.play('idle', true);
              }
            });
          }
        },
      },
    };

    const game = new Phaser.Game(config);

    return () => {
      game.destroy(true);
    };
  }, []);

  return <div id="phaser-game" />;
};

export default PhaserGame;
