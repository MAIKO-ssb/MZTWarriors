// components/PhaserGame.js
import Phaser from 'phaser';
import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const PhaserGame = () => {
    const players = useRef({}); // Store player instances
    const myId = useRef(null); // Store the player's unique ID
    const socket = useRef(null); // Store the Socket.IO connection
    const gameRef = useRef(null); // Store game instance
    const containerRef = useRef(null); // NEW: ref to the container div
    
    const chatInputRef = useRef(null);
    const isChatFocused = useRef(false); // UseRef to avoid re-renders on chat focus state
    
    const [message, setMessage] = useState(''); // Store chat message input
    
    useEffect(() => {
        // Initialize Socket.IO connection
        // socket.current = io('http://192.168.100.31:4000');
        socket.current = io(`http://${window.location.hostname}:4000`);

        // Store the socket ID once the connection is established
        socket.current.on('connect', () => {
            myId.current = socket.current.id; // Store this player's unique ID
            console.log('Connected to server with ID:', myId.current);
            // Check if the player already exists
            if (!players.current[myId.current]) {
                // Emit new player event only if player does not exist
                console.log('creating new player with ID,', myId.current);
                players.current[myId.current] = { x: 100, y: 50 }; // Add new player instance
                socket.current.emit('newPlayer', { id: myId.current, x: 100, y: 50 }); // Example position
            } else {
                console.log('Player already exists:', myId.current);
            }
        });

        const config = {
            type: Phaser.AUTO,
            width: 1280,
            height: 720,
            parent: containerRef.current, // MOUNT CANVAS INSIDE CONTAINER
            scale: {
                mode: Phaser.Scale.FIT, // Fits the game to the screen while maintaining aspect ratio
                autoCenter: Phaser.Scale.CENTER_BOTH // Centers the game
            },
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 1200 }, // Adjust gravity to a reasonable value
                    debug: true,
                },
            },
            scene: {
                key: 'mainScene', // Add a key for the scene
                preload: function () {
                    this.load.image('sky', '/images/backgrounds/forest-bg.png');
                    this.load.image('ground', '/images/platforms/platform.png');
                    this.load.spritesheet('character', '/images/characters/warrior-spritesheet.png', {
                        frameWidth: 200,
                        frameHeight: 216,
                    });
                    this.load.spritesheet('firepit', '/images/items/firepit.png', {
                        frameWidth: 409,
                        frameHeight: 401,
                    });
                    this.load.image('enemy', '/images/enemies/enemy.png'); 
                },
                create: function () {
                    // Create Scene
                    const scene = this; // Store a reference to the scene
                    this.add.image(700, 300, 'sky');

                    // Initialize enemy and attack hitbox variables
                    this.enemy = null;
                    this.attackHitbox = null;

                    // Create platforms
                    this.platforms = this.physics.add.staticGroup();
                    for (let i = 100; i <= 1300; i += 200) {
                        this.platforms.create(i, 668, 'ground').setScale(1).refreshBody();
                    }
                    console.log("Platforms Group:", this.platforms);


                    // Add the firepit as a sprite and play animation
                    this.firepit = this.physics.add.sprite(600, 570, 'firepit').setScale(.3); // Create as physics sprite
                    this.firepit.setDepth(1); // A higher number means it's closer to the front
                    this.firepit.body.setImmovable(true); // Make it static for collision
                    this.firepit.body.setAllowGravity(false);

                    // ADJUST THESE VALUES BASED ON YOUR SPRITE SHEET
                    const bodyWidth = 409; // Example: Reduce width by 40%
                    const bodyHeight = 401; // Example: Reduce height by 30%
                    this.firepit.body.setSize(bodyWidth, bodyHeight);
                    this.firepit.body.offset.set(0, 0);

                    this.physics.add.collider(this.firepit, this.platforms, (firepit, platform) => {
                        console.log("Collision detected between firepit and platform!");
                    });
                    console.log("Firepit Body:", this.firepit.body); // Add this line


                    this.anims.create({
                        key: 'burning',
                        frames: this.anims.generateFrameNumbers('firepit', { start: 0, end: 15 }), // Adjust start/end frames as needed
                        frameRate: 15,
                        repeat: -1,
                    });
                    this.firepit.play('burning');

                    // Create local player
                    if(myId.current){
                        this.player = this.physics.add.sprite(100, 50, 'character'); // Start position
                        this.player.setCollideWorldBounds(true);
                        this.physics.add.collider(this.player, this.platforms);
                        this.player.setScale(0.5);
                        console.log('Player created locally:', this.player, myId.current);
                        console.log('adding local player to players', myId.current);
                        // Add the local player to the `players` object
                        players.current[myId.current] = this.player;
                        // Add overlap with firepit to trigger the 'ouch'
                        this.isOuching = false; // Flag to prevent spamming "ouch"
                        this.ouchDelay = 550;
                        this.physics.add.overlap(
                            this.player,
                            this.firepit,
                            function(player, firepit) { // Use a traditional function
                                if (!this.isOuching) {
                                    console.log("Ouch triggered!");
                                    this.createPopupText(player.x, player.y - 50, '*ouch*', '#ffaa00');
                                    this.isOuching = true;
                                    this.time.delayedCall(this.ouchDelay, () => {
                                        this.isOuching = false;
                                    });
                                }
                            }.bind(this), // Bind the scene's 'this' to this function                          
                            null, // Process callback (optional, can be null)
                            this // Context for the callback
                        );

                        // === CREATE ATTACK HITBOX INSIDE THIS BLOCK ===
                        // Use this.player.displayHeight to get the scaled height
                        const playerVisualHeight = this.player.displayHeight;
                        this.attackHitbox = this.add.rectangle(0, 0, 80, playerVisualHeight * 0.7, 0xff0000, 0.0); // Adjust width/height factor
                        this.physics.add.existing(this.attackHitbox);
                        if (this.attackHitbox.body) { // Ensure body exists before setting its properties
                            this.attackHitbox.body.setAllowGravity(false);
                            this.attackHitbox.body.setEnable(false);
                        } else {
                            console.error("Attack hitbox body not created!"); // Should not happen if physics.add.existing works
                        }
                    }

                    // Create Enemy
                    // Place the enemy at a suitable starting position
                    const enemyStartX = 700;
                    const enemyStartY = 300; // Make sure it's above a platform
                    this.enemy = this.physics.add.sprite(enemyStartX, enemyStartY, 'enemy');
                    if (this.enemy) { // Check if enemy sprite was created successfully
                        this.enemy.setScale(0.2); // Adjust scale as needed
                        this.enemy.setCollideWorldBounds(true); // Keep enemy within game bounds
                        this.physics.add.collider(this.enemy, this.platforms); // Enemy collides with platforms

                        this.enemy.isAlive = true;
                        this.enemy.patrolSpeed = 70; // Adjust speed
                        this.enemy.setVelocityX(this.enemy.patrolSpeed);
                        this.enemy.flipX = 0; // Initial facing direction
                    }

                    // Create =-=- CONTROLS -=-=
                    this.cursors = this.input.keyboard.createCursorKeys();
                    this.jumpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE); // Add spacebar for jumping
                    this.jumpKeyWASD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE); // Add spacebar for jumping
                    this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
                    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
                    this.fullscreen = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
                    this.enterKeyPressed = false;  // Flag to prevent multiple triggers

                    this.WASD = {
                        W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
                        A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
                        S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
                        D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
                        attackKey: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J)
                    };
                
                    // ACTION CONTROLS
                    this.isAttacking = false;
                    this.jumpVelocity = -500; // Adjusted jump velocity
                    this.jumpCount = 0;
                    this.maxJumps = 1; // +1 = 2
                    this.facingDirection = 'right'; // Store the direction player is facing

                    this.input.keyboard.on('keydown-F', () => {
                        this.scale.fullscreenTarget = containerRef.current;
                        if (this.scale.isFullscreen) {
                            this.scale.stopFullscreen();
                        } else {
                            this.scale.startFullscreen();
                        }
                    });

                    // Utility function to create popup text
                    this.activePopups = [];
                    this.createPopupText = (x, y, text, color = '#ffff00') => {
                        const popupText = this.add.text(x, y, text, {
                            fontSize: '16px',
                            fill: color,
                            backgroundColor: 'rgba(0, 0, 0, 0.85)',
                            padding: { x: 10, y: 5 },
                            align: 'center',
                        }).setOrigin(0.5);

                        // Shift existing popups upwards
                        const popupSpacing = 24; // How much space between popups
                        this.activePopups.forEach(existingPopup => {
                            existingPopup.y -= popupSpacing;
                        });

                        // Add the new popup to the list
                        this.activePopups.push(popupText);
                        // Wait before tweening (popup holds still first)
                        const holdDuration = 0; // 1 second hold before moving

                        this.time.delayedCall(holdDuration, () => {
                            this.tweens.add({
                                targets: popupText,
                                y: popupText.y - 50,
                                alpha: 0,
                                duration: 2000, // fade/move duration
                                ease: 'Cubic.easeOut',
                                onComplete: () => {
                                    const index = this.activePopups.indexOf(popupText);
                                    if (index > -1) {
                                        this.activePopups.splice(index, 1);
                                    }
                                    popupText.destroy();
                                }
                            });
                        });
                    };


                    // ANIMATION STATES
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
                    if(myId.current != null){
                        this.player.anims.play('idle');
                    }
                    

                    // -=-=-=-=--==-= INIT SOCKET CODE =-=-=-=-=-=-==-=-=-=-
                    socket.current.on('currentPlayers', (playersList) => {
                        playersList.forEach((playerData) => {
                            if (!players.current[playerData.id]) {
                                const newPlayer = scene.physics.add.sprite(playerData.x, playerData.y, 'character');
                                newPlayer.setScale(0.5);
                                newPlayer.setCollideWorldBounds(true);
                                scene.physics.add.collider(newPlayer, scene.platforms);
                                players.current[playerData.id] = newPlayer;
                            }
                        });
                    });

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

                    // Listen to player disconnection
                    socket.current.on('playerDisconnected', (data) => {
                        if (players.current[data.id]) {
                            players.current[data.id].destroy(); // Remove the player sprite
                            delete players.current[data.id]; // Remove from the players object
                        }
                    });  
                    
                    // Listen for chat messages and display them
                    socket.current.on('chatMessageReceived', (data) => {
                        console.log("Received message via socket:", data, "from player", data.id);

                        let player = players.current[data.id];
                        
                        if (!player) {
                            // If the player isn't rendered yet, you can fetch or store their message for later rendering
                            console.log('Player not found for message:', player, data.message);
                            return;
                        }
                    
                        console.log('Rendering message via socket:', data.message, 'for player:', data.id, '(', player.x, player.y, ')');
                        
                        // -=-=-=- READING SERVER CHAT -=-=-=-=-
                        const chatText = this.add.text(player.x, player.y - 50, data.message, {
                            fontSize: '18px',
                            fill: '#ffff00',
                            backgroundColor: '#000000',
                            padding: { x: 10, y: 5 },
                            align: 'center',
                        }).setOrigin(0.5);
                    
                        // Update text position dynamically for 3 seconds
                        const textUpdate = this.time.addEvent({
                            delay: 25,
                            callback: () => {
                                chatText.setPosition(player.x, player.y - 50);
                            },
                            loop: true,
                        });
                    
                        // Auto-remove chat text after 3 seconds
                        this.time.addEvent({
                            delay: 3000,
                            callback: () => {
                                chatText.destroy();
                                textUpdate.remove(false);
                            },
                        });
                    });
                },

                handleFirepitTouch: function (player, firepit) {
                    this.createPopupText(player.x, player.y - 50, '*ouch*', '#ffff00');
                },

                // =-=-=- UPDATE FUNCTION -=-=-=
                update: function () {
                    //console.log('player check on update', this.player);
                    // if (!this.player && !myId.current) return; // Exit if player is not defined
                    if (!this.player && !myId.current) { // Exit if player related objects aren't ready
                        // Also check if this.enemy is being updated before player is fully initialized
                        // If enemy logic depends on player, ensure player exists.
                        // For simple patrol, it doesn't directly depend on the player.
                    }

                    // Enemy Patrolling Logic
                    if (this.enemy && this.enemy.isAlive) {
                        const enemyBody = this.enemy.body;

                        // If enemy is somehow stopped (e.g. stuck) or hits a wall/platform edge it collides with
                        if (enemyBody.velocity.x === 0) {
                            // If it was moving right and now stopped, or moving left and now stopped
                            this.enemy.patrolSpeed *= -1;
                            this.enemy.setVelocityX(this.enemy.patrolSpeed);
                        }
                        // Or if blocked by world bounds or a platform
                        else if ((this.enemy.patrolSpeed > 0 && enemyBody.blocked.right) || (this.enemy.patrolSpeed < 0 && enemyBody.blocked.left)) {
                            this.enemy.patrolSpeed *= -1;
                            this.enemy.setVelocityX(this.enemy.patrolSpeed);
                        }
                        this.enemy.flipX = (enemyBody.velocity.x < 0); // Use enemyBody.velocity.x
                    }

                    // Player specific logic should be guarded
                    if (!this.player || !myId.current) return;

                    const isLeftPressed = this.cursors.left.isDown || this.WASD.A.isDown;
                    const isRightPressed = this.cursors.right.isDown || this.WASD.D.isDown;
                    const isUpPressed = this.cursors.up.isDown || this.WASD.W.isDown;

                    let moving = false;
                    let speed = 350;
                
                    if(myId.current != null){
                        // MOVEMENT & JUMPING WHEN NOT ATTACKING
                        if (!this.isAttacking) {                    
                            
                            // Handle horizontal movement
                            if (isLeftPressed) {
                                this.player.setVelocityX(-speed);
                                this.player.flipX = true; // Face left
                                moving = true;
                                this.facingDirection = 'left';
                            } else if (isRightPressed) {
                                this.player.setVelocityX(speed);
                                this.player.flipX = false; // Face right
                                moving = true;
                                this.facingDirection = 'right';
                            } else {
                                this.player.setVelocityX(0); // Stop horizontal movement
                            }
                    
                            // Jumping logic
                            if (Phaser.Input.Keyboard.JustDown(this.jumpKey) && this.jumpCount < this.maxJumps || Phaser.Input.Keyboard.JustDown(this.jumpKeyWASD) && this.jumpCount < this.maxJumps) {
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
                        if (!this.isAttacking && Phaser.Input.Keyboard.JustDown(this.attackKey) || !this.isAttacking && Phaser.Input.Keyboard.JustDown(this.WASD.attackKey)) {
                            this.isAttacking = true;
                            //const currentVelocityX = this.player.body.velocity.x;
                    
                            // Play attack animation and broadcast to others
                            this.player.anims.play('attack', true);
                            socket.current.emit('playerAttack', {
                                id: myId.current,
                                position: { x: this.player.x, y: this.player.y },
                                direction: this.facingDirection,
                                //velocityX: currentVelocityX,
                            });

                            if (this.player.body.blocked.down) {
                                this.player.body.velocity.x = 0; // Kill horizontal momentum
                            }

                            // Activate and position hitbox
                            // Adjust hitboxOffsetX/Y based on your character's sprite and attack animation
                            const hitboxOffsetX = this.player.flipX ? -50 : 50; // e.g., 50 pixels in front
                            const hitboxOffsetY = 5; // e.g., slightly above player's origin y
                            this.attackHitbox.setPosition(this.player.x + hitboxOffsetX, this.player.y + hitboxOffsetY);
                            this.attackHitbox.body.setEnable(true);
                            // Optional: make hitbox visible for debugging
                            // this.attackHitbox.setFillStyle(0xff0000, 0.3); // red, semi-transparent

                            // Check for hit against the enemy
                            if (this.enemy && this.enemy.isAlive && this.physics.world.overlap(this.attackHitbox, this.enemy)) {
                                console.log('Enemy hit!');
                                this.createPopupText(this.enemy.x, this.enemy.y - 30, 'OUCH!', '#FF8C00'); // Enemy OUCH
                                
                                // For simplicity, one hit kills the enemy. You could add health later.
                                this.enemy.isAlive = false;
                                // Optional: Play enemy death animation here before destroying
                                // this.enemy.anims.play('enemy_death_animation', true);
                                // this.enemy.once('animationcomplete', () => { this.enemy.destroy(); });
                                this.enemy.destroy(); // Remove from game
                                this.enemy = null; // Clear the reference
                                
                                this.createPopupText(this.player.x + (this.player.flipX ? -30 : 30), this.player.y - 60, '*ENEMY KILLED*', '#ff4444');
                            }

                            // Disable hitbox after a short delay (e.g., duration of attack swing)
                            // Adjust delay (e.g., 200ms) to match your attack animation's active frames
                            this.time.delayedCall(300, () => {
                                if (this.attackHitbox && this.attackHitbox.body) { // Check if hitbox still exists
                                    this.attackHitbox.body.setEnable(false);
                                    // this.attackHitbox.setFillStyle(0xff0000, 0.0); // Make invisible again
                                }
                            });

                            // Prevent movement animation during attack
                            this.player.once('animationcomplete', () => {
                                // After attack finishes, switch to walk or idle based on movement
                                if (moving) {
                                    this.player.anims.play('walk', true);
                                } else {
                                    this.player.anims.play('idle', true);
                                    // this.player.body.velocity.x = 0; // Ensure no unwanted movement
                                }
                                this.isAttacking = false;
                            });
                        }
                    }

                    if (this.enterKey.isDown && !this.enterKeyPressed) {
                        console.log('Enter Key pressed');
                        // Disable Game Keyboard - Allow Input Access
                        gameRef.current.input.keyboard.enabled = !gameRef.current.input.keyboard.enabled;
                        console.log('Keyboard Disabled:', gameRef.current.input.keyboard.enabled);

                        chatInputRef.current.focus(); // Focus chat
                        this.enterKeyPressed = true; // Prevent repeat triggering
                    }
                
                    if (this.enterKey.isUp) {
                        this.enterKeyPressed = false; // Reset flag when key is released
                    }
                    
                }                                   
            },
        };

        gameRef.current = new Phaser.Game(config);
        // this.createPopupText(player.x, player.y - 50, data.message, '#ffff00'); // <- POPUP METHOD!

        
        return () => {
            // Clean up the game when the component unmounts
            if (gameRef.current) {
                gameRef.current.destroy(true);
            }
            socket.current.disconnect(); // Disconnect from Socket.IO when the component unmounts
        };
        
    }, []); 
    //End UseEffect
    
    const sendChatMessage = () => {
        if (message.trim() === "") return; // Don't send if message is empty

        if (message.trim()) {
            // console.log('Sending message:', message);
            // console.log('Chat myId:', myId.current);
            // console.log('Chat players:', players.current);

            socket.current.emit('chatMessage', { id: myId.current, message, timestamp: new Date().toISOString() });
            // setIsChatActive(false); // Deactivate chat
            chatInputRef.current.blur(); // Blur the input
            
            const player = players.current[myId.current];
            if (!player) {
                console.error(`Player ${player} not found for message: ${message}`);
                return; // Exit if the player is not found
            }
    
            setMessage('');
        }
    };

    // Chat Key Down
    const handleChatKeyDown = (event) => {

        if (event.key === 'Enter') {
            console.log('Chat enter detected, sending message - unfocusing');
            event.preventDefault(); // Prevents new line in input

            // Send Message
            if (message.trim() !== '') {
                console.log('message sent:', message );
                sendChatMessage(); // Send message
            }
            // Unfocus Field
            chatInputRef.current.blur(); // Unfocus input so next Enter returns focus to game

            // IF GAME FOCUSED .?
            if (gameRef.current) {
                // FOCUS OFF gameRef
                console.log('is keyboard enabled?:', gameRef.current.input.keyboard.enabled);
                // ENABLE KEYBOARD AGAIN
                gameRef.current.input.keyboard.enabled = true;
            }
            console.log('is keyboard enabled now?:', gameRef.current.input.keyboard.enabled);
        }
    };


    return (
        <div 
          ref={containerRef} 
          style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'end',
            overflow: 'hidden',
            backgroundColor: 'black' // optional, looks nice behind game
          }}
        >
            <div style={{ position: 'absolute', bottom: '10px', left: '10px',   zIndex: '10' }}>
                <input
                    ref={chatInputRef}
                    id="chat-input"
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onFocus={() => { isChatFocused.current = true; }}
                    onBlur={() => { isChatFocused.current = false; }}
                    placeholder="Type a message..."
                    onKeyDown={(e) => handleChatKeyDown(e)}
                />
                {/* <button onClick={sendChatMessage}>Send</button> */}
            </div>
        </div>
    );
};

export default PhaserGame;


