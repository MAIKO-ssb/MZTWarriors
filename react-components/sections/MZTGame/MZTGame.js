import Phaser from 'phaser';
import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import Enemy from '../MZTGame/enemies/Enemy';

class MainScene extends Phaser.Scene {
    constructor(config, refs) {
        super({ key: 'mainScene' });
        this.refs = refs;
    }

    preload() {
        if (!this.textures.exists('manzanita')) {
            this.load.atlas('manzanita', '/images/characters/manzanita.png', '/images/characters/manzanita.json');
        }
        this.load.image('sky', '/images/backgrounds/mzt-bg-village.png');
        this.load.image('teepee', '/images/items/mzt-fg-village-teepee.png');
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
    }

    create() {
        this.refs.sceneRef.current = this;

        // Detect mobile device
        this.isMobile = ('ontouchstart' in window || navigator.maxTouchPoints > 0) &&
                        window.matchMedia("(pointer: coarse)").matches;
        this.input.addPointer(2);

        // Set world bounds to fixed 1280x720
        this.physics.world.setBounds(0, 0, 1280, 720);
        console.log('World bounds set:', this.physics.world.bounds);

        // Set up camera
        this.cameras.main.setBounds(0, 0, 1280, 720);
        if (this.isMobile) {
            // Mobile: Smaller viewport for camera follow
            this.cameras.main.setSize(800, 600); // Adjusted for mobile focus
        } else {
            // Desktop: Full world view by default
            this.cameras.main.setSize(1280, 720);
        }
        this.cameras.main.setDeadzone(100, 100); // Smooth follow
        console.log('Camera bounds:', this.cameras.main.getBounds());
        console.log('Camera size:', this.cameras.main.width, this.cameras.main.height);

        // Toggle camera follow on desktop (for testing)
        this.isCameraFollowing = this.isMobile; // Mobile follows by default, desktop doesn't
        this.input.keyboard.on('keydown-C', () => {
            if (!this.isMobile) {
                this.isCameraFollowing = !this.isCameraFollowing;
                if (this.isCameraFollowing && this.player) {
                    this.cameras.main.startFollow(this.player, false, 0.1, 0.1);
                    this.cameras.main.setSize(800, 600);
                } else {
                    this.cameras.main.stopFollow();
                    this.cameras.main.setSize(1280, 720);
                    this.cameras.main.setPosition(0, 0);
                }
                console.log('Camera follow toggled:', this.isCameraFollowing);
            }
        });

        console.log('Scene created, container:', this.refs.containerRef.current);

        if (!this.textures.exists('manzanita')) {
            console.error('Manzanita texture not loaded. Animations will not work.');
        } else {
            console.log('Manzanita texture loaded successfully');
        }

        // Background
        const background = this.add.image(0, 0, 'sky').setDepth(0);
        background.setOrigin(0, 0);
        background.setDisplaySize(1280, 720); // Fixed world size
        console.log('Background set at 0,0, size: 1280x720');

        this.enemy = null;
        this.attackHitbox = null;

        // Platforms
        this.platforms = this.physics.add.staticGroup();
        let ground = this.add.rectangle(640, 655, 1280, 32, 0x000000, 0);
        this.physics.add.existing(ground, true);
        this.platforms.add(ground);
        console.log('Ground created at y=655, width=1280');

        // Firepit
        this.firepit = this.physics.add.sprite(700, 555, 'firepit').setScale(0.42);
        this.firepit.setDepth(1);
        this.firepit.body.setImmovable(true);
        this.firepit.body.setAllowGravity(false);
        const bodyWidth = 315 * 0.3;
        const bodyHeight = 464 * 0.3;
        this.firepit.body.setSize(bodyWidth, bodyHeight);
        this.firepit.body.offset.set(100, 280);
        console.log('Firepit created at 700,555');

        // Teepee
        this.teepee = this.add.image(174, 695, 'teepee').setDepth(3);
        this.teepee.setOrigin(0.5, 1);
        this.teepee.setScale(1);
        console.log('Teepee created at 174,695');

        // Animations
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

        // Create touch controls after world setup
        if (this.isMobile) {
            console.log('Mobile detected - enabling touch controls');
            this.createTouchControls();
        }

        // Create player
        if (this.refs.isConnected.current && this.refs.myId.current && !this.refs.players.current[this.refs.myId.current]) {
            this.createPlayer(this);
        }

        // Enemy spawning
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
                this.refs.enemies.current.push(enemy);
                this.enemyCount++;

                this.physics.add.overlap(
                    this.attackHitbox,
                    enemy.sprite,
                    (hitbox, enemySprite) => {
                        if (this.attackHitbox.body.enable && enemySprite.isAlive) {
                            console.log('Enemy hit by attack hitbox!');
                            this.createPopupText(enemySprite.x, enemySprite.y - 30, '*SQUISH!*', '#ffae00');
                            enemy.destroy();
                            this.refs.enemies.current = this.refs.enemies.current.filter(e => e.sprite !== enemySprite);
                            this.enemyCount--;
                        }
                    },
                    null,
                    this
                );
            },
            loop: true
        });

        // Input setup
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
        this.lastSendTime = 0;

        this.input.keyboard.on('keydown-F', () => {
            this.scale.fullscreenTarget = this.refs.containerRef.current;
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
            } else {
                this.scale.startFullscreen();
            }
        });

        // Popup text
        this.activePopups = [];
        this.createPopupText = (x, y, text, color = '#ffff00') => {
            const popupText = this.add.text(x, y, text, {
                fontSize: '16px',
                fill: color,
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                padding: { x: 10, y: 5 },
                align: 'center',
            }).setOrigin(0.5).setDepth(4);

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
    }

    createTouchControls() {
        const canvas = this.game.canvas;
        const parent = canvas.parentElement;

        // Remove old controls
        const old = document.getElementById('mobile-controls');
        if (old) old.remove();

        const controls = document.createElement('div');
        controls.id = 'mobile-controls';
        
        // MAGIC: Use env(safe-area-inset-bottom) so controls sit ABOVE the browser UI
        controls.style.cssText = `
            position: fixed;
            left: 0;
            right: 0;
            bottom: 0;
            height: 160px;
            padding-bottom: env(safe-area-inset-bottom, 20px);
            background: linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.6));
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 30px;
            box-sizing: border-box;
            pointer-events: none; /* Let touches pass through background */
            z-index: 9999;
            font-family: 'Arial Black', sans-serif;
            user-select: none;
            touch-action: manipulation;
        `;

        // LEFT: D-PAD
        const dpad = document.createElement('div');
        dpad.style.cssText = `
            width: 150px;
            height: 150px;
            background: rgba(30,30,30,0.95);
            border-radius: 30px;
            border: 10px solid #000;
            position: relative;
            pointer-events: auto;
            box-shadow: 0 10px 30px rgba(0,0,0,0.8);
        `;

        const crossH = document.createElement('div');
        const crossV = document.createElement('div');
        Object.assign(crossH.style, { position:'absolute', width:'100px', height:'20px', background:'white', borderRadius:'10px', top:'50%', left:'50%', transform:'translate(-50%,-50%)', opacity:'0.9' });
        Object.assign(crossV.style, { position:'absolute', width:'20px', height:'100px', background:'white', borderRadius:'10px', top:'50%', left:'50%', transform:'translate(-50%,-50%)', opacity:'0.9' });
        dpad.appendChild(crossH);
        dpad.appendChild(crossV);

        // RIGHT: B BUTTON (Attack)
        const bButton = document.createElement('div');
        bButton.innerHTML = 'B';
        bButton.style.cssText = `
            width: 120px;
            height: 120px;
            background: #ff3333;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 56px;
            color: white;
            font-weight: 900;
            text-shadow: 0 4px 10px black;
            box-shadow: 0 12px 30px rgba(0,0,0,0.7), inset 0 -8px 20px rgba(0,0,0,0.4);
            pointer-events: auto;
            transition: all 0.08s;
            transform: translateY(0);
        `;

        const press = () => {
            bButton.style.transform = 'scale(0.88) translateY(4px)';
            bButton.style.background = '#ff5555';
            this.onAttackTouch?.();
        };
        const release = () => {
            bButton.style.transform = 'scale(1) translateY(0)';
            bButton.style.background = '#ff3333';
        };

        bButton.addEventListener('touchstart', press, { passive: true });
        bButton.addEventListener('touchend', release);
        bButton.addEventListener('touchcancel', release);

        // Add to DOM
        controls.appendChild(dpad);
        controls.appendChild(bButton);
        document.body.appendChild(controls); // ← Put on <body>, not canvas parent

        // D-PAD LOGIC
        let activeTouch = null;

        const updateDPad = (e) => {
            if (!e.touches?.length) return;
            const touch = Array.from(e.touches).find(t => t.clientX < window.innerWidth * 0.5);
            if (!touch) {
                this.touchLeft = this.touchRight = this.touchJump = false;
                activeTouch = null;
                return;
            }

            activeTouch = touch.identifier;
            const rect = dpad.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = touch.clientX - cx;
            const dy = touch.clientY - cy;

            this.touchLeft  = dx < -40;
            this.touchRight = dx > 40;
            this.touchJump  = dy < -50;

            if (this.touchJump) this.triggerJumpIfPossible();
        };

        const touchStart = updateDPad;
        const touchMove = updateDPad;
        const touchEnd = () => {
            this.touchLeft = this.touchRight = this.touchJump = false;
            activeTouch = null;
        };

        document.addEventListener('touchstart', touchStart, { passive: false });
        document.addEventListener('touchmove', touchMove, { passive: false });
        document.addEventListener('touchend', touchEnd);
        document.addEventListener('touchcancel', touchEnd);

        // Store for cleanup
        this.mobileControls = {
            element: controls,
            cleanup: () => {
                document.removeEventListener('touchstart', touchStart);
                document.removeEventListener('touchmove', touchMove);
                document.removeEventListener('touchend', touchEnd);
                document.removeEventListener('touchcancel', touchEnd);
            }
        };
    }

    triggerJumpIfPossible() {
        if (this.player && this.jumpCount < this.maxJumps && !this.isAttacking) {
            this.player.setVelocityY(this.jumpVelocity);
            this.jumpCount++;

            if (this.refs.socket.current) {
                this.refs.socket.current.emit('playerJump', {
                    id: this.refs.myId.current,
                    position: { x: this.player.x, y: this.player.y },
                    direction: this.facingDirection,
                    velocityY: this.jumpVelocity,
                });
            }

            if (this.anims.exists('jump')) {
                this.player.anims.play('jump', true);
                this.lastAnimation = 'jump';
            }
        }
    }

    onAttackTouch() {
        if (!this.isAttacking && this.player) {
            this.isAttacking = true;
            this.player.body.setDragX(500);
            this.player.removeAllListeners('animationcomplete');
            this.player.baseX = this.player.x;

            if (this.anims.exists('attack')) {
                this.player.anims.play('attack', true);
                this.lastAnimation = 'attack';
                this.animationLock = true;
                this.time.delayedCall(100, () => { this.animationLock = false; });
            }

            const isAirborne = !this.player.body.blocked.down;
            if (this.refs.socket.current) {
                this.refs.socket.current.emit('playerAttack', {
                    id: this.refs.myId.current,
                    position: { x: this.player.x, y: this.player.y },
                    direction: this.facingDirection,
                    isAirborne
                });
            }

            const hitboxOffsetX = this.player.flipX ? -50 : 50;
            const hitboxOffsetY = 5;
            this.attackHitbox.setPosition(this.player.x + hitboxOffsetX, this.player.y + hitboxOffsetY);

            this.player.once('animationcomplete', () => {
                this.isAttacking = false;
                this.animationLock = false;
                if (this.attackHitbox?.body) {
                    this.attackHitbox.body.setEnable(false);
                }
                const isGrounded = this.player.body.blocked.down;
                const isAirborne = !isGrounded;
                const isMoving = this.cursors.left.isDown ||
                                this.WASD?.A.isDown ||
                                (this.isMobile && this.touchLeft) ||
                                this.cursors.right.isDown ||
                                this.WASD?.D.isDown ||
                                (this.isMobile && this.touchRight);
                if (isGrounded) {
                    this.player.setVelocityY(0);
                }
                this.updatePlayerAnimation(this.player, isAirborne, isMoving, this);
                if (this.refs.socket.current) {
                    this.refs.socket.current.emit('playerMovement', {
                        id: this.refs.myId.current,
                        position: { x: this.player.x, y: this.player.y },
                        direction: this.facingDirection,
                        isMoving: isMoving,
                        isAirborne: isAirborne
                    });
                }
            });
        }
    }

    update() {
        if (!this.player) {
            return;
        }

        // Update camera to follow player on mobile or when toggled
        if (this.isCameraFollowing && this.player) {
            this.cameras.main.startFollow(this.player, false, 0.1, 0.1);
            console.log('Camera following player at:', this.player.x, this.player.y);
        }

        const isLeftPressed = this.cursors.left.isDown ||
                             this.WASD?.A.isDown ||
                             (this.isMobile && this.touchLeft);
        const isRightPressed = this.cursors.right.isDown ||
                              this.WASD?.D.isDown ||
                              (this.isMobile && this.touchRight);
        let moving = false;
        let speed = 350;

        if (this.refs.myId.current != null) {
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

                if (!this.isAttacking && this.jumpCount < this.maxJumps) {
                    if (
                        Phaser.Input.Keyboard.JustDown(this.jumpKey) ||
                        Phaser.Input.Keyboard.JustDown(this.jumpKeyWASD) ||
                        Phaser.Input.Keyboard.JustDown(this.jumpKeyUpArrow) ||
                        (this.isMobile && this.touchJump)
                    ) {
                        this.player.setVelocityY(this.jumpVelocity);
                        this.jumpCount++;
                        if (this.refs.socket.current) {
                            this.refs.socket.current.emit('playerJump', {
                                id: this.refs.myId.current,
                                position: { x: this.player.x, y: this.player.y },
                                direction: this.facingDirection,
                                velocityY: this.jumpVelocity,
                            });
                        }
                        if (this.anims.exists('jump')) {
                            this.player.anims.play('jump', true);
                            this.lastAnimation = 'jump';
                            this.animationLock = true;
                            this.time.delayedCall(100, () => { this.animationLock = false; });
                        } else {
                            console.error('Jump animation not available');
                        }
                    }
                }
            }

            const isGrounded = this.player.body.blocked.down && Math.abs(this.player.body.velocity.y) < 10;
            if (isGrounded) {
                this.jumpCount = 0;
            }
            const isAirborne = !isGrounded;
            const isMoving = isLeftPressed || isRightPressed;

            const positionChanged = Math.abs(this.player.x - this.lastPosition.x) > 1 ||
                                  Math.abs(this.player.y - this.lastPosition.y) > 1;
            const stateChanged = isMoving !== this.lastState.isMoving || isAirborne !== this.lastState.isAirborne;
            const now = Date.now();
            if (this.refs.socket.current && (positionChanged || stateChanged) && (stateChanged || now - this.lastSendTime > 50)) {
                this.refs.socket.current.emit('playerMovement', {
                    id: this.refs.myId.current,
                    position: { x: this.player.x, y: this.player.y },
                    direction: this.facingDirection,
                    isMoving: isMoving,
                    isAirborne: isAirborne
                });
                this.lastPosition = { x: this.player.x, y: this.player.y };
                this.lastState = { isMoving: isMoving, isAirborne: isAirborne };
                this.lastSendTime = now;
            }

            if (!this.isAttacking) {
                this.updatePlayerAnimation(this.player, isAirborne, isMoving, this);
            }

            this.lastMoving = isMoving;

            if (!this.isAttacking && (Phaser.Input.Keyboard.JustDown(this.attackKey) ||
                                      Phaser.Input.Keyboard.JustDown(this.WASD.attackKey))) {
                this.isAttacking = true;
                this.player.body.setDragX(500);
                this.player.removeAllListeners('animationcomplete');
                this.player.baseX = this.player.x;

                if (this.anims.exists('attack')) {
                    this.player.anims.play('attack', true);
                    this.lastAnimation = 'attack';
                    this.animationLock = true;
                    this.time.delayedCall(100, () => { this.animationLock = false; });
                } else {
                    console.error('Attack animation not available');
                    this.isAttacking = false;
                }
                if (this.refs.socket.current) {
                    this.refs.socket.current.emit('playerAttack', {
                        id: this.refs.myId.current,
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
                    if (this.attackHitbox?.body) {
                        this.attackHitbox.body.setEnable(false);
                    }
                    const isGrounded = this.player.body.blocked.down;
                    const isAirborne = !isGrounded;
                    const isMoving = isLeftPressed || isRightPressed;
                    if (isGrounded) {
                        this.player.setVelocityY(0);
                    }
                    if (
                        this.lastState.isMoving !== isMoving ||
                        this.lastState.isAirborne !== isAirborne ||
                        this.lastAnimation !== this.player.anims?.currentAnim?.key
                    ) {
                        this.updatePlayerAnimation(this.player, isAirborne, isMoving, this);
                    }
                    this.lastState = { isMoving, isAirborne };

                    if (this.refs.socket.current) {
                        this.refs.socket.current.emit('playerMovement', {
                            id: this.refs.myId.current,
                            position: { x: this.player.x, y: this.player.y },
                            direction: this.facingDirection,
                            isMoving: isMoving,
                            isAirborne: isAirborne
                        });
                    }
                });
            }
        }

        if (this.enterKey.isDown && !this.enterKeyPressed) {
            console.log('Enter Key pressed');
            this.refs.gameRef.current.input.keyboard.enabled = !this.refs.gameRef.current.input.keyboard.enabled;
            console.log('Keyboard Disabled:', this.refs.gameRef.current.input.keyboard.enabled);
            this.refs.chatInputRef.current.focus();
            this.enterKeyPressed = true;
        }

        if (this.enterKey.isUp) {
            this.enterKeyPressed = false;
        }

        this.refs.enemies.current.forEach(enemy => enemy.update());

        Object.keys(this.refs.players.current).forEach(id => {
            const p = this.refs.players.current[id];
            if (id !== this.refs.myId.current && p.targetX !== undefined && p.targetY !== undefined) {
                p.x = Phaser.Math.Linear(p.x, p.targetX, 0.2);
                p.y = Phaser.Math.Linear(p.y, p.targetY, 0.2);
            }
        });
    }

    updatePlayerAnimation(player, isAirborne, isMoving, scene) {
        if (scene.animationLock) return;
        const currentAnim = player.anims.currentAnim ? player.anims.currentAnim.key : null;
        let targetAnim = null;

        if (isAirborne) {
            targetAnim = 'jump';
        } else {
            targetAnim = isMoving ? 'walk' : 'idle';
        }

        if (targetAnim && scene.anims.exists(targetAnim) && currentAnim !== targetAnim) {
            player.anims.play(targetAnim, true);
            scene.lastAnimation = targetAnim;
            scene.animationLock = true;
            scene.time.delayedCall(100, () => { scene.animationLock = false; });
        } else if (targetAnim && !scene.anims.exists(targetAnim)) {
            if (scene.anims.exists('idle') && currentAnim !== 'idle') {
                player.anims.play('idle', true);
                scene.lastAnimation = 'idle';
                scene.animationLock = true;
                scene.time.delayedCall(100, () => { scene.animationLock = false; });
            }
        }
    }

    createRemotePlayer(scene, x, y) {
        const player = scene.physics.add.sprite(x, y, 'manzanita');
        player.setScale(1);
        player.setDepth(2);
        player.body.setAllowGravity(false);
        player.setCollideWorldBounds(true);
        scene.physics.add.collider(player, scene.platforms, null, null, scene);
        player.body.setSize(55, 55);
        player.body.setOffset(25, 10);
        player.body.debugShowBody = false;
        player.isAttacking = false;
        player.lastIsAirborne = false;
        player.lastIsMoving = false;
        player.targetX = x;
        player.targetY = y;
        if (scene.anims.exists('idle')) {
            player.anims.play('idle', true);
        }
        return player;
    }

    createPlayer(scene) {
        if (!this.refs.myId.current || this.refs.players.current[this.refs.myId.current]) {
            console.log('Player creation skipped:', { id: this.refs.myId.current, exists: !!this.refs.players.current[this.refs.myId.current] });
            return;
        }

        try {
            scene.player = this.createRemotePlayer(scene, 100, 50);
            scene.player.body.setAllowGravity(true);
            scene.player.body.setDragX(3000);
            this.refs.players.current[this.refs.myId.current] = scene.player;

            // Start camera follow on mobile
            if (this.isMobile) {
                scene.cameras.main.startFollow(scene.player, false, 0.1, 0.1);
                console.log('Camera following player on mobile');
            }

            console.log('Local player created at 100,50:', this.refs.myId.current);

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
            scene.attackHitbox.body.debugShowBody = false;

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

            scene.animationLock = false;

            scene.isOuching = false;
            scene.ouchDelay = 550;
            scene.physics.add.overlap(scene.player, scene.firepit, (player, firepit) => {
                if (!scene.isOuching) {
                    this.createPopupText(player.x, player.y - 50, '*ouch*', '#ffaa00');
                    scene.isOuching = true;
                    scene.time.delayedCall(scene.ouchDelay, () => scene.isOuching = false);
                }
            });

            this.refs.socket.current.emit('newPlayer', { id: this.refs.myId.current, x: 100, y: 50 });

        } catch (error) {
            console.error('Error creating local player:', error);
        }
    }

    shutdown() {
        // Remove DOM element
        const controls = document.getElementById('mobile-controls');
        if (controls?.parentElement) {
            controls.parentElement.removeChild(controls);
        }

        // Remove listeners
        this.mobileControls?.cleanup?.();

        console.log('Mobile controls fully cleaned up');
    }
}

const PhaserGame = () => {
    const players = useRef({});
    const myId = useRef(null);
    const socket = useRef(null);
    const gameRef = useRef(null);
    const containerRef = useRef(null);
    const chatInputRef = useRef(null);
    const isChatFocused = useRef(false);
    const [message, setMessage] = useState('');
    const isConnected = useRef(false);
    const sceneRef = useRef(null);
    const isGameInitialized = useRef(false);
    const enemies = useRef([]);
    // const [isPortrait, setIsPortrait] = useState(false);

    useEffect(() => {
        if (!containerRef.current || isGameInitialized.current) {
            console.warn('Container ref not ready or game already initialized, skipping initialization');
            return;
        }

        console.log('Initializing Phaser game and socket with container:', containerRef.current);
        isGameInitialized.current = true;

        // Prevent mobile zoom
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) e.preventDefault();
        }, { passive: false });
        document.addEventListener('gesturestart', (e) => e.preventDefault());

        // Handle orientation and fullscreen
        const isMobile = ('ontouchstart' in window || navigator.maxTouchPoints > 0) &&
                        window.matchMedia("(pointer: coarse)").matches;

        // const checkOrientation = () => {
        //     const orientation = window.screen.orientation ? window.screen.orientation.type : (window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');
        //     setIsPortrait(orientation.includes('portrait'));
        //     console.log('Orientation:', orientation);
        // };

        // const lockOrientation = () => {
        //     if (isMobile && window.screen.orientation && window.screen.orientation.lock) {
        //         window.screen.orientation.lock('landscape').catch((err) => {
        //             console.warn('Orientation lock failed:', err);
        //         });
        //     }
        // };

        const requestFullscreen = () => {
            if (isMobile && containerRef.current) {
                const elem = containerRef.current;
                if (elem.requestFullscreen) {
                    elem.requestFullscreen().catch((err) => {
                        console.warn('Fullscreen request failed:', err);
                    });
                } else if (elem.webkitRequestFullscreen) {
                    elem.webkitRequestFullscreen();
                }
            }
        };

        // Initial checks
        // checkOrientation();
        // if (isMobile) {
        //     lockOrientation();
        //     requestFullscreen();
        // }

        // Listen for orientation changes
        // window.addEventListener('orientationchange', () => {
        //     checkOrientation();
        //     if (!isPortrait) {
        //         requestFullscreen();
        //     }
        // });

        const SOCKET_URL = process.env.NODE_ENV === 'development'
            ? 'https://mztwarriors-backend-production.up.railway.app'
            : 'https://mztwarriors-backend-production.up.railway.app';

        socket.current = io(SOCKET_URL, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            timeout: 20000
        });

        socket.current.on('connect', () => {
            myId.current = socket.current.id;
            console.log('Connected to server with ID:', myId.current);
            isConnected.current = true;

            const tryCreatePlayer = () => {
                if (!players.current[myId.current] && sceneRef.current) {
                    console.log('Creating new player with ID:', myId.current);
                    sceneRef.current.createPlayer(sceneRef.current);
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
                        const newPlayer = scene.createRemotePlayer(scene, x, y);
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
                    const newPlayer = scene.createRemotePlayer(scene, x, y);
                    newPlayer.lastIsAirborne = data.isAirborne ?? false;
                    newPlayer.lastIsMoving = data.isMoving ?? false;
                    players.current[data.id] = newPlayer;
                    console.log(`Created new player ${data.id} at (${x}, ${y})`);
                } else {
                    const existingPlayer = players.current[data.id];
                    existingPlayer.targetX = data.position?.x ?? existingPlayer.targetX;
                    existingPlayer.targetY = data.position?.y ?? existingPlayer.targetY;
                    existingPlayer.flipX = (data.direction === 'left');
                    existingPlayer.lastIsAirborne = data.isAirborne ?? existingPlayer.lastIsAirborne;
                    existingPlayer.lastIsMoving = data.isMoving ?? existingPlayer.lastIsMoving;
                    if (!existingPlayer.isAttacking) {
                        scene.updatePlayerAnimation(existingPlayer, existingPlayer.lastIsAirborne, existingPlayer.lastIsMoving, scene);
                    }
                }
            } else {
                console.warn('Scene not ready for playerMoved event');
            }
        });

        socket.current.on('playerJumped', (data) => {
            if (!players.current[data.id]) return;

            const existingPlayer = players.current[data.id];
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
                    sceneRef.current.updatePlayerAnimation(existingPlayer, existingPlayer.lastIsAirborne, existingPlayer.lastIsMoving, sceneRef.current);
                    if (data.id === myId.current && socket.current) {
                        socket.current.emit('playerMovement', {
                            id: myId.current,
                            position: { x: existingPlayer.x, y: existingPlayer.y },
                            direction: data.direction,
                            isMoving: false,
                            isAirborne: data.isAirborne ?? false
                        });
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
            width: 800,
            height: 600,
            parent: containerRef.current,
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
            },
            callbacks: {
                postBoot: (game) => {
                    if (isMobile) {
                        // lockOrientation();
                        requestFullscreen();
                    }
                    console.log('Canvas size:', game.scale.width, game.scale.height);
                    console.log('Display size:', game.scale.displaySize.width, game.scale.displaySize.height);
                }
            },
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 1200 },
                    debug: false,
                    tileBias: 32,
                },
            },
            scene: new MainScene({}, {
                sceneRef,
                containerRef,
                socket,
                myId,
                players,
                enemies,
                isConnected,
                gameRef,
                chatInputRef
            })
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
            document.removeEventListener('touchstart', () => {});
            document.removeEventListener('gesturestart', () => {});
            // window.removeEventListener('orientationchange', checkOrientation);
        };
    }, []);

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
            style={{
                width: '100vw',
                height: '100vh',
                overflow: 'hidden',
                backgroundColor: 'black',
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            {/* {isPortrait && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 9999,
                        color: 'white',
                        fontSize: '24px',
                        textAlign: 'center',
                        padding: '20px',
                        fontFamily: '-apple-system, monospace'
                    }}
                >
                    Please rotate your device to landscape mode to play the game.
                </div>
            )} */}
            <div
                ref={containerRef}
                style={{
                    width: '100%',
                    height: '100%',
                    position: 'relative'
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        zIndex: 1000
                    }}
                >
                    <input
                        ref={chatInputRef}
                        id='chat-input'
                        type='text'
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onFocus={() => { isChatFocused.current = true; }}
                        onBlur={() => {
                            isChatFocused.current = false;
                            if (gameRef.current) gameRef.current.input.keyboard.enabled = true;
                        }}
                        placeholder={isChatFocused.current ? 'ENTER to send, ESC to cancel' : 'Press ENTER to chat...'}
                        onKeyDown={(e) => handleChatKeyDown(e)}
                        style={{
                            backgroundColor: isChatFocused.current ? 'rgba(0,0,0,0.95)' : 'rgba(0,0,0,0.42)',
                            backdropFilter: 'blur(12px)',
                            border: isChatFocused.current ? '2px solid #ffff00' : '2px solid rgba(255,255,255,0.3)',
                            borderRadius: '12px',
                            padding: '14px 20px',
                            fontSize: '16px',
                            fontFamily: '-apple-system, monospace',
                            color: '#ffff00',
                            width: '300px',
                            outline: 'none',
                            boxShadow: isChatFocused.current
                                ? '0 0 0 4px rgba(255,255,0,0.4), 0 12px 40px rgba(0,0,0,0.6)'
                                : '0 8px 32px rgba(0,0,0,0.5)',
                            opacity: 1,
                            transition: 'all 0.25s cubic-bezier(0,0,0.2,1)',
                            cursor: 'text'
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default PhaserGame;