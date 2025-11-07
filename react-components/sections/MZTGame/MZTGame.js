import Phaser from 'phaser';
import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import Enemy from '../MZTGame/enemies/Enemy';

const PhaserGame = () => {
    const players = useRef({}); // Store player instances
    const myId = useRef(null); // Store the player's unique ID
    const socket = useRef(null); // Store the Socket.IO connection
    const gameRef = useRef(null); // Store game instance
    const containerRef = useRef(null); // Ref to the container div
    const chatInputRef = useRef(null);
    const isChatFocused = useRef(false); // UseRef to avoid re-renders on chat focus state
    const [message, setMessage] = useState(''); // Store chat message input
    const isConnected = useRef(false); // Track socket connection status
    const sceneRef = useRef(null); // Store reference to Phaser scene
    const isGameInitialized = useRef(false); // Prevent double initialization
    const enemies = useRef([]); // Store enemy instances

    // Helper function to update animations
    const updatePlayerAnimation = (player, isAirborne, isMoving, scene) => {
        // if (scene.animationLock) return;
        if (player.animationLock) return;
        player.animationLock = true;
        scene.time.delayedCall(100, () => { player.animationLock = false; });

        // const currentAnim = player.anims.currentAnim ? player.anims.currentAnim.key : null;
        // let targetAnim = null;
        const currentAnim = player.anims.currentAnim?.key;
        const targetAnim = isAirborne ? 'jump' : (isMoving ? 'walk' : 'idle');

        // if (isAirborne) {
        //     targetAnim = 'jump';
        // } else {
        //     targetAnim = isMoving ? 'walk' : 'idle';
        // }

        // if (targetAnim && scene.anims.exists(targetAnim) && currentAnim !== targetAnim) {
        //     player.anims.play(targetAnim, true);
        //     scene.lastAnimation = targetAnim;
        //     scene.animationLock = true;
        //     scene.time.delayedCall(100, () => { scene.animationLock = false; }); 
        // } else if (targetAnim && !scene.anims.exists(targetAnim)) {
        //     if (scene.anims.exists('idle') && currentAnim !== 'idle') {
        //         player.anims.play('idle', true);
        //         scene.lastAnimation = 'idle';
        //         scene.animationLock = true;
        //         scene.time.delayedCall(100, () => { scene.animationLock = false; });
        //     }
        // }
        if (targetAnim && scene.anims.exists(targetAnim) && currentAnim !== targetAnim) {
            player.anims.play(targetAnim, true);
        }
       
    };

    // PERFECT PLAYER FACTORY — same for local + remote
    const createRemotePlayer = (scene, x, y) => {
        const player = scene.physics.add.sprite(x, y, 'manzanita');
        
        // EXACT SAME SETUP AS LOCAL PLAYER
        player.setScale(1);                    // Visual size match
        player.setDepth(2);
        player.body.setAllowGravity(false);       // Remote = no real physics
        // player.body.setImmovable(true);
        player.setCollideWorldBounds(true);
        // scene.physics.add.collider(player, scene.platforms);
        scene.physics.add.collider(player, scene.platforms, null, null, scene);
        
        // PERFECT COLLISION MATCH
        player.body.setSize(55, 55);              // Tight hitbox
        player.body.setOffset(25, 10);            // Precise offset
        player.body.debugShowBody = true;         // Debug visible
        
        // State init
        player.isAttacking = false;
        player.lastIsAirborne = false;
        player.lastIsMoving = false;
        player.targetX = x;
        player.targetY = y;

        player.animationLock = false;
        
        if (scene.anims.exists('idle')) {
            player.anims.play('idle', true);
        }
        
        return player;
    };

    useEffect(() => {
        if (!containerRef.current || isGameInitialized.current) {
            console.warn('Container ref not ready or game already initialized, skipping initialization');
            return;
        }

        console.log('Initializing Phaser game and socket with container:', containerRef.current);
        isGameInitialized.current = true;

        // Initialize Socket.IO connection (LOCALHOST METHOD)
        // socket.current = io(`http://${window.location.hostname}:4000`, {
        //     reconnection: true,
        //     reconnectionAttempts: 5,
        // });
        
        // CONNECT TO RAILWAY BACKEND — LIVE MULTIPLAYER
        const SOCKET_URL = process.env.NODE_ENV === 'development'
          ? 'http://localhost:4000'
          : 'https://mztwarriors-backend-production.up.railway.app';

        socket.current = io(SOCKET_URL, {
          transports: ['websocket'],
          reconnection: true,
          reconnectionAttempts: 10,
          reconnectionDelay: 1000,
          timeout: 20000
        });

        // Handle socket connection
        socket.current.on('connect', () => {
            myId.current = socket.current.id;
            console.log('Connected to server with ID:', myId.current);
            isConnected.current = true;

            const tryCreatePlayer = () => {
                if (!players.current[myId.current] && sceneRef.current) {
                    console.log('Creating new player with ID:', myId.current);
                    createPlayer(sceneRef.current);
                } else if (!sceneRef.current) {
                    console.log('Scene not ready, retrying player creation...');
                    setTimeout(tryCreatePlayer, 100);
                } else {
                    console.log('Player already exists:', myId.current);
                }
            };
            tryCreatePlayer();
        });

        socket.current.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            isConnected.current = false;
        });

        socket.current.on('currentPlayers', (playersList) => {
            console.log('Received currentPlayers:', playersList);
            if (sceneRef.current) {
                const scene = sceneRef.current;
                playersList.forEach((playerData) => {
                    if (playerData.id !== myId.current && !players.current[playerData.id]) {
                        const x = playerData.position?.x ?? 100;
                        const y = playerData.position?.y ?? 650;
                        const newPlayer = createRemotePlayer(scene, x, y);
                        players.current[playerData.id] = newPlayer;
                        console.log(`Added player ${playerData.id} at (${x}, ${y})`);
                    }
                });
            } else {
                console.warn('Scene not ready for currentPlayers event');
            }
        });

        socket.current.on('playerMoved', (data) => {
            if (sceneRef.current) {
                const scene = sceneRef.current;
                if (!players.current[data.id]) {
                    const x = data.position?.x ?? 100;
                    const y = data.position?.y ?? 650;
                    const newPlayer = createRemotePlayer(scene, x, y);
                    newPlayer.lastIsAirborne = data.isAirborne ?? false;
                    newPlayer.lastIsMoving = data.isMoving ?? false;
                    players.current[data.id] = newPlayer;
                    console.log(`Created new player ${data.id} at (${x}, ${y})`);
                } else {
                    const existingPlayer = players.current[data.id];
                    // NEW: Update target positions for lerp instead of setPosition
                    existingPlayer.targetX = data.position?.x ?? existingPlayer.targetX;
                    existingPlayer.targetY = data.position?.y ?? existingPlayer.targetY;
                    existingPlayer.flipX = (data.direction === 'left');
                    existingPlayer.lastIsAirborne = data.isAirborne ?? existingPlayer.lastIsAirborne;
                    existingPlayer.lastIsMoving = data.isMoving ?? existingPlayer.lastIsMoving;
                    if (!existingPlayer.isAttacking) {
                        // updatePlayerAnimation(existingPlayer, existingPlayer.lastIsAirborne, existingPlayer.lastIsMoving, scene);
                        updatePlayerAnimation(existingPlayer, data.isAirborne ?? false, data.isMoving ?? false, scene);
                    }
                }
            } else {
                console.log('Scene not ready for playerMoved event');
            }
        });

        socket.current.on('playerJumped', (data) => {
            if (!players.current[data.id]) return;

            const existingPlayer = players.current[data.id];
            // NEW: Update target positions for lerp
            existingPlayer.targetX = data.position?.x ?? existingPlayer.targetX;
            existingPlayer.targetY = data.position?.y ?? existingPlayer.targetY;
            existingPlayer.flipX = (data.direction === 'left');

            if (data.id === myId.current) {
                if (existingPlayer.body) {
                    existingPlayer.body.setAllowGravity(true);
                    existingPlayer.setVelocityY(data.velocityY);
                }
            } else {
                if (sceneRef.current && sceneRef.current.anims.exists('jump')) {
                    existingPlayer.anims.play('jump', true);
                }
                if (sceneRef.current && sceneRef.current.tweens) {
                    const scene = sceneRef.current;
                    scene.tweens.killTweensOf(existingPlayer);
                    scene.tweens.add({
                        targets: existingPlayer,
                        y: (data.position?.y ?? existingPlayer.targetY) - 40,
                        duration: 140,
                        yoyo: true,
                        ease: 'Quad.easeOut'
                    });
                }
            }
        });

        socket.current.on('playerAttacked', (data) => {
            if (players.current[data.id]) {
                const existingPlayer = players.current[data.id];
                existingPlayer.targetX = data.position?.x ?? existingPlayer.targetX;
                existingPlayer.targetY = data.position?.y ?? existingPlayer.targetY;
                existingPlayer.flipX = (data.direction === 'left');
                existingPlayer.isAttacking = true;
                existingPlayer.anims.play('attack', true);
                existingPlayer.once('animationcomplete', () => {
                    existingPlayer.isAttacking = false;
                    // updatePlayerAnimation(existingPlayer, existingPlayer.lastIsAirborne, existingPlayer.lastIsMoving, sceneRef.current);
                    // if (data.id === myId.current && socket.current) {
                    //     socket.current.emit('playerMovement', {
                    //         id: myId.current,
                    //         position: { x: existingPlayer.x, y: existingPlayer.y },
                    //         direction: data.direction,
                    //         isMoving: false,
                    //         isAirborne: data.isAirborne ?? false
                    //     });
                    // }
                    const scene = sceneRef.current;
                    if (scene) {
                        const isGrounded = scene.player?.body.blocked.down;
                        const isAirborne = !isGrounded;
                        const isMoving = false;
                        updatePlayerAnimation(existingPlayer, isAirborne, isMoving, scene);
                    }
                });
            }
        });

        socket.current.on('playerDisconnected', (data) => {
            if (players.current[data.id]) {
                players.current[data.id].destroy();
                if (data.id === myId.current && sceneRef.current) {
                    sceneRef.current.player = null;
                }
                delete players.current[data.id];
                console.log(`Player ${data.id} disconnected and removed`);
            }
        });

        socket.current.on('chatMessageReceived', (data) => {
            console.log('Received message via socket:', data, 'from player', data.id);
            if (sceneRef.current) {
                const scene = sceneRef.current;
                let player = players.current[data.id];
                if (!player) {
                    console.log('Player not found for message:', data.message);
                    return;
                }
                const chatText = scene.add.text(player.x, player.y - 50, data.message, {
                    fontSize: '18px',
                    fill: '#ffff00',
                    backgroundColor: '#000000',
                    padding: { x: 10, y: 5 },
                    align: 'center',
                }).setOrigin(0.5);
                const textUpdate = scene.time.addEvent({
                    delay: 25,
                    callback: () => {
                        chatText.setPosition(player.x, player.y - 50);
                    },
                    loop: true,
                });
                scene.time.addEvent({
                    delay: 3000,
                    callback: () => {
                        chatText.destroy();
                        textUpdate.remove(false);
                    },
                });
            } else {
                console.warn('Scene not ready for chatMessageReceived event');
            }
        });

        const config = {
            type: Phaser.AUTO,
            width: 1280,
            height: 720,
            parent: containerRef.current,
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH
            },
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 1200 },
                    debug: true,
                    tileBias: 32,
                },
            },
            scene: {
                key: 'mainScene',
                preload: function () {
                    this.load.image('sky', '/images/backgrounds/mzt-bg-village.png');
                    this.load.image('teepee', '/images/items/mzt-fg-village-teepee.png');
                    this.load.atlas('manzanita', '/images/characters/manzanita.png', '/images/characters/manzanita.json');
                    this.load.spritesheet('firepit', '/images/items/firepit.png', {
                        frameWidth: 316,
                        frameHeight: 463.3,
                    });
                    this.load.image('enemy', '/images/enemies/enemy.png');
                    this.load.on('filecomplete', (key) => {
                        console.log(`Asset loaded: ${key}`);
                        if (key === 'manzanita') {
                            console.log('Manzanita atlas loaded successfully');
                        }
                    });
                    this.load.on('loaderror', (file) => {
                        console.error(`Error loading asset: ${file.key}. URL: ${file.url}`);
                        if (file.key === 'manzanita') {
                            console.error('Manzanita atlas failed to load. Animations will not work.');
                        }
                    });
                    this.load.once('complete', () => {
                        console.log('All assets loaded successfully');
                    });
                },
                create: function () {
                    sceneRef.current = this;
                    const scene = this;
                    console.log('Scene created, container:', containerRef.current);

                    if (!this.textures.exists('manzanita')) {
                        console.error('Manzanita texture not loaded. Animations will not work.');
                    } else {
                        console.log('Manzanita texture loaded successfully');
                    }

                    const background = this.add.image(0, 0, 'sky').setDepth(0);
                    background.setOrigin(0, 0);
                    background.setDisplaySize(this.scale.width, this.scale.height);

                    this.enemy = null;
                    this.attackHitbox = null;

                    this.platforms = this.physics.add.staticGroup();
                    let ground = this.add.rectangle(
                        this.scale.width / 2,
                        655,
                        this.scale.width,
                        32,
                        0x000000,
                        0
                    );
                    this.physics.add.existing(ground, true);
                    this.platforms.add(ground);
                    console.log('Platforms Group:', this.platforms);

                    this.firepit = this.physics.add.sprite(700, 555, 'firepit').setScale(0.42);
                    this.firepit.setDepth(1);
                    this.firepit.body.setImmovable(true);
                    this.firepit.body.setAllowGravity(false);
                    const bodyWidth = 315 * 0.3;
                    const bodyHeight = 464 * 0.3;
                    this.firepit.body.setSize(bodyWidth, bodyHeight);
                    this.firepit.body.offset.set(100, 280);
                    console.log('Firepit Body:', this.firepit.body);

                    this.teepee = this.add.image(174, 695, 'teepee').setDepth(3); // Position and depth
                    this.teepee.setOrigin(0.5, 1); // Anchor at bottom center for ground alignment
                    this.teepee.setScale(1); // Adjust scale as needed

                    this.anims.create({
                        key: 'burning',
                        frames: this.anims.generateFrameNumbers('firepit', { start: 0, end: 14 }),
                        frameRate: 20,
                        repeat: -1,
                    });
                    this.firepit.play('burning');

                    this.anims.create({
                        key: 'idle',
                        frames: this.anims.generateFrameNames('manzanita', {
                            prefix: 'mzt_idle',
                            start: 0,
                            end: 10,
                            zeroPad: 4
                        }),
                        frameRate: 15,
                        repeat: -1
                    });
                    this.anims.create({
                        key: 'walk',
                        frames: this.anims.generateFrameNames('manzanita', {
                            prefix: 'mzt_walk',
                            start: 0,
                            end: 8,
                            zeroPad: 4
                        }),
                        frameRate: 20,
                        repeat: -1
                    });
                    this.anims.create({
                        key: 'attack',
                        frames: this.anims.generateFrameNames('manzanita', {
                            prefix: 'mzt_attack',
                            start: 0,
                            end: 2,
                            zeroPad: 4
                        }),
                        frameRate: 30,
                        repeat: 0
                    });
                    this.anims.create({
                        key: 'jump',
                        frames: this.anims.generateFrameNames('manzanita', {
                            prefix: 'mzt_jump',
                            start: 0,
                            end: 4,
                            zeroPad: 4
                        }),
                        frameRate: 20,
                        repeat: -1
                    });

                    if (isConnected.current && myId.current && !players.current[myId.current]) {
                        createPlayer(this);
                    }

                    this.enemyCount = 0;
                    this.enemyMaxCount = 0;
                    this.time.addEvent({
                        delay: 500,
                        callback: () => {
                            if (this.enemyCount >= this.enemyMaxCount) {
                                console.log('Max enemies reached, skipping spawn.');
                                return;
                            }
                            const spawnX = Phaser.Math.Between(100, 1180);
                            const spawnY = 0;
                            const enemy = new Enemy(this, spawnX, spawnY);
                            enemies.current.push(enemy);
                            this.enemyCount++;

                            this.physics.add.overlap(
                                this.attackHitbox,
                                enemy.sprite,
                                (hitbox, enemySprite) => {
                                    if (this.attackHitbox.body.enable && enemySprite.isAlive) {
                                        console.log('Enemy hit by attack hitbox!');
                                        this.createPopupText(enemySprite.x, enemySprite.y - 30, '*SQUISH!*', '#ffae00ff');
                                        enemy.destroy();
                                        enemies.current = enemies.current.filter(e => e.sprite !== enemySprite);
                                        this.enemyCount--;
                                    }
                                },
                                null,
                                this
                            );
                        },
                        loop: true
                    });

                    this.cursors = this.input.keyboard.createCursorKeys();
                    this.jumpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
                    this.jumpKeyWASD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
                    this.jumpKeyUpArrow = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
                    this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
                    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
                    this.fullscreen = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
                    this.enterKeyPressed = false;

                    this.WASD = {
                        W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
                        A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
                        S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
                        D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
                        attackKey: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J)
                    };

                    this.isAttacking = false;
                    this.jumpVelocity = -500;
                    this.jumpCount = 0;
                    this.maxJumps = 2;
                    this.facingDirection = 'right';
                    this.lastMoving = false;
                    this.lastPosition = { x: 0, y: 0 };
                    this.lastState = { isMoving: false, isAirborne: false };
                    this.lastAnimation = null;
                    this.lastSendTime = 0; // NEW: For throttling movement updates

                    this.input.keyboard.on('keydown-F', () => {
                        this.scale.fullscreenTarget = containerRef.current;
                        if (this.scale.isFullscreen) {
                            this.scale.stopFullscreen();
                        } else {
                            this.scale.startFullscreen();
                        }
                    });

                    this.activePopups = [];
                    this.createPopupText = (x, y, text, color = '#ffff00') => {
                        const popupText = this.add.text(x, y, text, {
                            fontSize: '16px',
                            fill: color,
                            backgroundColor: 'rgba(0, 0, 0, 0.85)',
                            padding: { x: 10, y: 5 },
                            align: 'center',
                        }).setOrigin(0.5);

                        const popupSpacing = 24;
                        this.activePopups.forEach(existingPopup => {
                            existingPopup.y -= popupSpacing;
                        });

                        this.activePopups.push(popupText);
                        const holdDuration = 0;

                        this.time.delayedCall(holdDuration, () => {
                            this.tweens.add({
                                targets: popupText,
                                y: popupText.y - 50,
                                alpha: 0,
                                duration: 2000,
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
                },

                handleFirepitTouch: function (player, firepit) {
                    this.createPopupText(player.x, player.y - 50, '*ouch*', '#ffaa00');
                },

                update: function () {
                    if (!this.player) {
                        return;
                    }

                    const isLeftPressed = this.cursors.left.isDown || this.WASD.A.isDown;
                    const isRightPressed = this.cursors.right.isDown || this.WASD.D.isDown;
                    let moving = false;
                    let speed = 350;

                    if (myId.current != null) {
                        if (!this.isAttacking) {
                            if (isLeftPressed) {
                                this.player.setVelocityX(-speed);
                                this.player.flipX = true;
                                moving = true;
                                this.facingDirection = 'left';
                            } else if (isRightPressed) {
                                this.player.setVelocityX(speed);
                                this.player.flipX = false;
                                moving = true;
                                this.facingDirection = 'right';
                            } else {
                                if (!this.isAttacking) {
                                    this.player.setVelocityX(0);
                                }
                                moving = false;
                            }

                            if (this.player.flipX) {
                                this.player.body.setOffset(47, 10);
                            } else {
                                this.player.body.setOffset(28, 10);
                            }

                            if (!this.isAttacking) {
                                if (
                                    (Phaser.Input.Keyboard.JustDown(this.jumpKey) ||
                                    Phaser.Input.Keyboard.JustDown(this.jumpKeyWASD) ||
                                    Phaser.Input.Keyboard.JustDown(this.jumpKeyUpArrow)) &&
                                    this.jumpCount < this.maxJumps
                                ) {
                                    this.player.setVelocityY(this.jumpVelocity);
                                    this.jumpCount++;

                                    // FORCE JUMP ANIM IMMEDIATELY
                                    if (this.anims.exists('jump')) {
                                        this.player.anims.play('jump', true);
                                    }

                                    if (socket.current) {
                                        socket.current.emit('playerJump', {
                                            id: myId.current,
                                            position: { x: this.player.x, y: this.player.y },
                                            direction: this.facingDirection,
                                            velocityY: this.jumpVelocity,
                                        });
                                    }
                                    // if (this.anims.exists('jump')) {
                                    //     // this.player.anims.play('jump', true);
                                    //     // this.lastAnimation = 'jump';
                                    //     // this.animationLock = true;
                                    //     // this.time.delayedCall(100, () => { this.animationLock = false; });
                                    // } else {
                                    //     console.error('Jump animation not available');
                                    // }
                                }
                            }
                        }

                        const isGrounded = this.player.body.blocked.down && Math.abs(this.player.body.velocity.y) < 10;
                        if (isGrounded) {
                            this.jumpCount = 0;
                        }
                        const isAirborne = !isGrounded;
                        const isMoving = isLeftPressed || isRightPressed;

                        // NEW: Throttle movement updates
                        const positionChanged = Math.abs(this.player.x - this.lastPosition.x) > 1 || Math.abs(this.player.y - this.lastPosition.y) > 1;
                        const stateChanged = isMoving !== this.lastState.isMoving || isAirborne !== this.lastState.isAirborne;
                        const now = Date.now();
                        if (socket.current && (positionChanged || stateChanged) && (stateChanged || now - this.lastSendTime > 50)) {
                            socket.current.emit('playerMovement', {
                                id: myId.current,
                                position: { x: this.player.x, y: this.player.y },
                                direction: this.facingDirection,
                                isMoving: isMoving,
                                isAirborne: isAirborne
                            });
                            this.lastPosition = { x: this.player.x, y: this.player.y };
                            this.lastState = { isMoving: isMoving, isAirborne: isAirborne };
                            this.lastSendTime = now;
                        }

                        // if (!this.isAttacking) {
                        //     updatePlayerAnimation(this.player, isAirborne, isMoving, this);
                        // }
                        // === ANIMATION STATE CHANGE DETECTION ===
                        const currentState = { isMoving, isAirborne };
                        if (!this.isAttacking && 
                            (currentState.isMoving !== this.lastState.isMoving || 
                            currentState.isAirborne !== this.lastState.isAirborne)) {
                            updatePlayerAnimation(this.player, isAirborne, isMoving, this);
                        }
                        this.lastState = currentState;

                        this.lastMoving = isMoving;

                        if (!this.isAttacking && (Phaser.Input.Keyboard.JustDown(this.attackKey) || 
                                                  Phaser.Input.Keyboard.JustDown(this.WASD.attackKey))) {
                            this.isAttacking = true;
                            this.player.body.setDragX(500);
                            this.player.removeAllListeners('animationcomplete');
                            this.player.baseX = this.player.x;

                            if (this.anims.exists('attack')) {
                                this.player.anims.play('attack', true);
                                // this.lastAnimation = 'attack';
                                // this.animationLock = true;
                                // this.time.delayedCall(100, () => { this.animationLock = false; });
                            } else {
                                console.error('Attack animation not available');
                                this.isAttacking = false;
                            }
                            if (socket.current) {
                                socket.current.emit('playerAttack', {
                                    id: myId.current,
                                    position: { x: this.player.x, y: this.player.y },
                                    direction: this.facingDirection,
                                    isAirborne: isAirborne
                                });
                            }

                            const hitboxOffsetX = this.player.flipX ? -50 : 50;
                            const hitboxOffsetY = 5;
                            this.attackHitbox.setPosition(this.player.x + hitboxOffsetX, this.player.y + hitboxOffsetY);

                            this.player.once('animationcomplete', () => {
                                this.isAttacking = false;
                                this.animationLock = false;

                                const isGrounded = this.player.body.blocked.down;
                                const isAirborne = !isGrounded;
                                // const isMoving = isLeftPressed || isRightPressed;
                                const isMoving = false; // Force idle after attack

                                // if (isGrounded) {
                                //     this.player.setVelocityY(0);
                                // }
                                // if (
                                //     this.lastState.isMoving !== isMoving ||
                                //     this.lastState.isAirborne !== isAirborne ||
                                //     this.lastAnimation !== this.player.anims?.currentAnim?.key
                                // ) {
                                //     updatePlayerAnimation(this.player, isAirborne, isMoving, this);
                                // }
                                // this.lastState = { isMoving, isAirborne };

                                // FORCE IDLE — IGNORE LAST STATE
                                if (this.anims.exists('idle')) {
                                    this.player.anims.play('idle', true);
                                }

                                this.lastState = { isMoving, isAirborne };

                                if (socket.current) {
                                    socket.current.emit('playerMovement', {
                                        id: myId.current,
                                        position: { x: this.player.x, y: this.player.y },
                                        direction: this.facingDirection,
                                        // isMoving: isMoving,
                                        // isAirborne: isAirborne
                                        isMoving,
                                        isAirborne
                                    });
                                }
                            });
                        }
                    }

                    if (this.enterKey.isDown && !this.enterKeyPressed) {
                        console.log('Enter Key pressed');
                        gameRef.current.input.keyboard.enabled = !gameRef.current.input.keyboard.enabled;
                        console.log('Keyboard Disabled:', gameRef.current.input.keyboard.enabled);
                        chatInputRef.current.focus();
                        this.enterKeyPressed = true;
                    }

                    if (this.enterKey.isUp) {
                        this.enterKeyPressed = false;
                    }

                    enemies.current.forEach(enemy => enemy.update());

                    // NEW: Lerp remote player positions for smooth movement
                    // Object.keys(players.current).forEach(id => {
                    //     const p = players.current[id];
                    //     if (id !== myId.current && p.targetX !== undefined && p.targetY !== undefined) {
                    //         p.x = Phaser.Math.Linear(p.x, p.targetX, 0.2);
                    //         p.y = Phaser.Math.Linear(p.y, p.targetY, 0.2);
                    //         // NEW: Client-side airborne for remote
                    //         const dy = p.targetY - p.y;
                    //         const isAirborne = Math.abs(dy) > 1;  // Lerping down/up = airborne
                    //         updatePlayerAnimation(p, isAirborne, p.lastIsMoving, this);
                    //     }
                    // });
                    
                    // === LERP REMOTE PLAYERS ===
                    Object.entries(players.current).forEach(([id, p]) => {
                        if (id !== myId.current && p.targetX !== undefined && p.targetY !== undefined) {
                            // Smooth lerp
                            p.x = Phaser.Math.Linear(p.x, p.targetX, 0.2);
                            p.y = Phaser.Math.Linear(p.y, p.targetY, 0.2);

                            // Detect state change
                            const isMoving = Math.abs(p.targetX - p.x) > 0.5;
                            const isAirborne = p.body?.blocked.down === false;

                            // Only update animation if state changed
                            if (!p.isAttacking && 
                                (isMoving !== p.lastIsMoving || isAirborne !== p.lastIsAirborne)) {
                                updatePlayerAnimation(p, isAirborne, isMoving, this);
                            }

                            // Update last known state
                            p.lastIsMoving = isMoving;
                            p.lastIsAirborne = isAirborne;
                        }
                    });
                }
            },
        };

        gameRef.current = new Phaser.Game(config);
        console.log('Phaser game initialized');

        return () => {
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
                console.log('Phaser game destroyed');
            }
            if (socket.current) {
                socket.current.disconnect();
                socket.current = null;
            }
            isGameInitialized.current = false;
        };
    }, []);

    const createPlayer = (scene) => {
        if (!myId.current || players.current[myId.current]) {
            console.log('Player creation skipped:', { id: myId.current, exists: !!players.current[myId.current] });
            return;
        }

        try {
            // USE SAME FACTORY + enable physics for local player
            scene.player = createRemotePlayer(scene, 100, 50);
            scene.player.body.setAllowGravity(true);      // ONLY local gets gravity
            scene.player.body.setDragX(3000);             // ONLY local gets drag
            players.current[myId.current] = scene.player;
            
            console.log('Local player created perfectly:', myId.current);

            // Attack hitbox setup (local only)
            scene.attackOffsets = {};
            const manzanitaFrames = scene.textures.get('manzanita').getFrameNames();
            manzanitaFrames.forEach(frameName => {
                const frameData = scene.textures.get('manzanita').frames[frameName].customData;
                if (frameData && frameData.attackOffset !== undefined) {
                    scene.attackOffsets[frameName] = frameData.attackOffset;
                }
            });

            scene.attackHitbox = scene.add.rectangle(-100, -100, 90, 20, 0x882222, 0);
            scene.physics.add.existing(scene.attackHitbox);
            scene.attackHitbox.body.setAllowGravity(false);
            scene.attackHitbox.body.setEnable(false);
            scene.attackHitbox.body.debugShowBody = true;

            // Attack animation handlers (local only)
            scene.player.on('animationupdate', (animation, frame) => {
                if (animation.key === 'attack') {
                    const offset = scene.attackOffsets[frame.textureFrame] || 0;
                    const dir = scene.player.flipX ? -1 : 1;
                    scene.player.x = scene.player.baseX + offset * dir;
                    const hitboxOffsetX = 30;
                    scene.attackHitbox.x = scene.player.x + (offset + hitboxOffsetX) * dir;
                    scene.attackHitbox.y = scene.player.y + 15;
                    if (frame.index >= 1 && frame.index <= 2) {
                        scene.attackHitbox.body.setEnable(true);
                    } else {
                        scene.attackHitbox.body.setEnable(false);
                    }
                }
            });

            scene.player.on('animationcomplete', (animation) => {
                if (animation.key === 'attack' && scene.attackHitbox?.body) {
                    scene.attackHitbox.body.setEnable(false);
                }
            });

            // scene.animationLock = false;

            // Firepit overlap (local only)
            scene.isOuching = false;
            scene.ouchDelay = 550;
            scene.physics.add.overlap(scene.player, scene.firepit, (player, firepit) => {
                if (!scene.isOuching) {
                    scene.createPopupText(player.x, player.y - 50, '*ouch*', '#ffaa00');
                    scene.isOuching = true;
                    scene.time.delayedCall(scene.ouchDelay, () => scene.isOuching = false);
                }
            });

            // Emit to server
            socket.current.emit('newPlayer', { id: myId.current, x: 100, y: 50 });

        } catch (error) {
            console.error('Error creating local player:', error);
        }
    };

    const sendChatMessage = () => {
        if (message.trim() === '') return;

        if (message.trim()) {
            if (socket.current) {
                socket.current.emit('chatMessage', { id: myId.current, message, timestamp: new Date().toISOString() });
            } else {
                console.error('Socket not available to emit chatMessage event');
            }
            chatInputRef.current.blur();
            const player = players.current[myId.current];
            if (!player) {
                console.error(`Player not found for message: ${message}`);
                return;
            }
            setMessage('');
        }
    };

    const handleChatKeyDown = (event) => {
        if (event.key === 'Enter') {
            console.log('Chat enter detected, sending message - unfocusing');
            event.preventDefault();
            if (message.trim() !== '') {
                console.log('message sent:', message);
                sendChatMessage();
            }
            chatInputRef.current.blur();
            if (gameRef.current) {
                console.log('is keyboard enabled?:', gameRef.current.input.keyboard.enabled);
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
                backgroundColor: 'black'
            }}
        >
            <div style={{ position: 'absolute', bottom: '10px', left: '10px', zIndex: '10' }}>
                <input
                    ref={chatInputRef}
                    id='chat-input'
                    type='text'
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onFocus={() => { isChatFocused.current = true; }}
                    onBlur={() => { isChatFocused.current = false; }}
                    placeholder='Type a message...'
                    onKeyDown={(e) => handleChatKeyDown(e)}
                />
            </div>
        </div>
    );
};

export default PhaserGame;