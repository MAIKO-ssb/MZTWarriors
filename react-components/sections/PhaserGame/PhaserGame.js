import Phaser from 'phaser';
import { useEffect, useRef } from 'react';
import io from 'socket.io-client';

const PhaserGame = () => {
    const players = useRef({}); // Store player instances
    const myId = useRef(null); // Store the player's unique ID
    const socket = useRef(null); // Store the Socket.IO connection
    const [message, setMessage] = useState(''); // Store chat message input

    useEffect(() => {
        // Initialize Socket.IO connection
        socket.current = io('http://localhost:4000');

        const config = {
            type: Phaser.AUTO,
            width: 800,
            height: 600,
            physics: {
                default: 'arcade',
                arcade: {
                gravity: { y: 1200 }, // Adjust gravity to a reasonable value
                debug: true,
                },
            },
            scene: {
                preload: function () {
                    this.load.image('sky', '/images/backgrounds/forest-bg.png');
                    this.load.image('ground', '/images/platforms/platform.png');
                    this.load.spritesheet('character', '/images/characters/warrior-spritesheet.png', {
                        frameWidth: 200,
                        frameHeight: 216,
                    });
                },
                create: function () {
                    this.add.image(400, 300, 'sky');

                    // Create platforms
                    this.platforms = this.physics.add.staticGroup();
                    this.platforms.create(100, 568, 'ground').setScale(1).refreshBody();
                    this.platforms.create(300, 568, 'ground').setScale(1).refreshBody();
                    this.platforms.create(500, 568, 'ground').setScale(1).refreshBody();
                    this.platforms.create(700, 568, 'ground').setScale(1).refreshBody();

                    // Create local player
                    this.player = this.physics.add.sprite(100, 50, 'character'); // Start position
                    this.player.setCollideWorldBounds(true);
                    this.physics.add.collider(this.player, this.platforms);
                    this.player.setScale(0.5);
                    this.player.setBounce(0.2); // Optional: add bounce effect when landing

                    // Input setup
                    this.cursors = this.input.keyboard.createCursorKeys();
                    this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
                    this.isAttacking = false;
                    this.jumpVelocity = -500; // Adjusted jump velocity
                    this.jumpCount = 0;
                    this.maxJumps = 1;
                    this.facingDirection = 'right'; // Store the direction player is facing

                    // Notify the server of a new player
                    myId.current = socket.current.id; // Store this player's unique ID
                    socket.current.emit('newPlayer', { id: myId.current, x: this.player.x, y: this.player.y });

                    // Store a reference to the scene
                    const scene = this;

                    // Create animations
                    this.anims.create({
                        key: 'walk',
                        frames: this.anims.generateFrameNumbers('character', { start: 17, end: 21 }),
                        frameRate: 12,
                        repeat: -1,
                    });
                    this.anims.create({
                        key: 'idle',
                        frames: this.anims.generateFrameNumbers('character', { start: 0, end: 4 }),
                        frameRate: 12,
                        repeat: -1,
                    });
                    this.anims.create({
                        key: 'attack',
                        frames: this.anims.generateFrameNumbers('character', { start: 25, end: 28 }),
                        frameRate: 12,
                        repeat: 0,
                    });
                    this.anims.create({
                        key: 'jump',
                        frames: this.anims.generateFrameNumbers('character', { start: 0, end: 4 }), // Update with your jump frames
                        frameRate: 12,
                        repeat: 0,
                    });

                    // Start with idle animation
                    this.player.anims.play('idle');

                    // Socket event for player movement
                    socket.current.on('playerMoved', (data) => {
                        if (!players.current[data.id]) {
                            const newPlayer = scene.physics.add.sprite(data.position.x, data.position.y, 'character');
                            newPlayer.setScale(0.5);
                            newPlayer.setCollideWorldBounds(true);
                            scene.physics.add.collider(newPlayer, scene.platforms);
                            players.current[data.id] = newPlayer;
                        } else {
                            const existingPlayer = players.current[data.id];
                            existingPlayer.setPosition(data.position.x, data.position.y);
                            existingPlayer.flipX = (data.direction === 'left');
                            // Prevent walk/idle animation during attack
                            if (!existingPlayer.isAttacking) {
                                if (data.isMoving) {
                                    existingPlayer.anims.play('walk', true);
                                } else {
                                    existingPlayer.anims.play('idle', true);
                                }
                            }
                        }
                    });

                    // Listen for jump events from the server
                    socket.current.on('playerJumped', (data) => {
                        if (players.current[data.id]) {
                            const existingPlayer = players.current[data.id];
                            existingPlayer.setPosition(data.position.x, data.position.y);
                            existingPlayer.flipX = (data.direction === 'left');
                            existingPlayer.setVelocityY(data.velocityY);
                            existingPlayer.anims.play('jump', true);
                        }
                    });

                    // Listen for attack events from the server
                    socket.current.on('playerAttacked', (data) => {
                        if (players.current[data.id]) {
                            const existingPlayer = players.current[data.id];
                            existingPlayer.flipX = (data.direction === 'left');
                        
                            // Set attacking flag to prevent other animations during attack
                            existingPlayer.isAttacking = true;
                        
                            // Play attack animation
                            existingPlayer.anims.play('attack', true);
                        
                            // Clear attacking flag when attack animation is complete
                            existingPlayer.once('animationcomplete', () => {
                                existingPlayer.isAttacking = false;
                            });
                        }
                    });
                },
                update: function () {
                    let moving = false;
                    let speed = 350;
                
                    // Movement and jumping
                    if (!this.isAttacking) {
                
                        // Handle horizontal movement
                        if (this.cursors.left.isDown) {
                            this.player.setVelocityX(-speed);
                            this.player.flipX = true; // Face left
                            moving = true;
                            this.facingDirection = 'left';
                        } else if (this.cursors.right.isDown) {
                            this.player.setVelocityX(speed);
                            this.player.flipX = false; // Face right
                            moving = true;
                            this.facingDirection = 'right';
                        } else {
                            this.player.setVelocityX(0); // Stop horizontal movement
                        }
                
                        // Jumping logic
                        if (Phaser.Input.Keyboard.JustDown(this.cursors.up) && this.jumpCount < this.maxJumps) {
                            this.player.setVelocityY(this.jumpVelocity);
                            this.jumpCount++; // Increment the jump count when jumping
                            socket.current.emit('playerJump', {
                                id: myId.current,
                                position: { x: this.player.x, y: this.player.y },
                                direction: this.facingDirection,
                                velocityY: this.jumpVelocity,
                            });
                            this.player.anims.play('jump', true);
                        }
                
                        // Reset jump count only after fully landing
                        if (this.player.body.blocked.down) {
                            this.jumpCount = 0; // Reset the jump count when fully grounded
                        }
                
                        // Update animation based on movement
                        if (moving) {
                            socket.current.emit('playerMovement', {
                                id: myId.current,
                                position: { x: this.player.x, y: this.player.y },
                                direction: this.facingDirection,
                                isMoving: true,
                            });
                
                            // Play walking animation
                            if (!this.player.anims.isPlaying || this.player.anims.currentAnim.key !== 'walk') {
                                this.player.anims.play('walk', true);
                            }
                        } else {
                            socket.current.emit('playerMovement', {
                                id: myId.current,
                                position: { x: this.player.x, y: this.player.y },
                                direction: this.facingDirection,
                                isMoving: false,
                            });
                
                            // Play idle animation
                            if (!this.player.anims.isPlaying || this.player.anims.currentAnim.key !== 'idle') {
                                this.player.anims.play('idle', true);
                            }
                        }
                    } else {
                        // Emit position even when attacking
                        socket.current.emit('playerMovement', {
                            id: myId.current,
                            position: { x: this.player.x, y: this.player.y },
                            direction: this.facingDirection,
                            isMoving: moving,
                        });
                
                        // Play attack animation
                        if (!this.player.anims.isPlaying || this.player.anims.currentAnim.key !== 'attack') {
                            this.player.anims.play('attack', true);
                        }
                    }
                
                    // Attack handling
                    if (!this.isAttacking && Phaser.Input.Keyboard.JustDown(this.attackKey)) {
                        this.isAttacking = true;
                        const currentVelocityX = this.player.body.velocity.x;
                
                        // Play attack animation and broadcast to others
                        this.player.anims.play('attack', true);
                        socket.current.emit('playerAttack', {
                            id: myId.current,
                            position: { x: this.player.x, y: this.player.y },
                            direction: this.facingDirection,
                            velocityX: currentVelocityX,
                        });
                
                        // Prevent movement animation during attack
                        this.player.once('animationcomplete', () => {
                            this.isAttacking = false;
                
                            // After attack finishes, switch to walk or idle based on movement
                            if (moving) {
                                this.player.anims.play('walk', true);
                            } else {
                                this.player.anims.play('idle', true);
                            }
                        });
                    }
                }                                   
            },
        };

        const game = new Phaser.Game(config);

        return () => {
        game.destroy(true);
        socket.current.disconnect(); // Disconnect on cleanup
        };
  }, []);

  return <div id="phaser-game" />;
};

export default PhaserGame;
