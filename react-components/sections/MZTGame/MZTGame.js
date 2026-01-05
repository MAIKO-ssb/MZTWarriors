import Phaser from 'phaser';
import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import Enemy from '../MZTGame/enemies/Enemy';

class ModularPlayer extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y);
        this.scene = scene;
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setAllowGravity(true);
        this.body.setCollideWorldBounds(true);
        this.body.setDragX(4000);
        // this.body.setSize(40, 55);
        // this.body.setOffset(40, 10);  // Tune later
        this.body.debugShowBody = true;

        this.parts = {};
        this.createParts();
    }

    createParts() {
        // (bottom layer)
        // Legs (first) 
        const legs = this.scene.add.sprite(0, 0, 'legs').setOrigin(0.25, .25);
        legs.setFrame('mzt_idle0000');
        this.add(legs);
        this.parts.legs = legs;

        // Arm-lead (front arm  — behind body)
        const armLead = this.scene.add.sprite(0, 0, 'arm_lead').setOrigin(0.25, 0.25);
        armLead.setFrame('mzt_idle0000');  // ← Add this for each part
        this.add(armLead);
        this.parts.arm_lead = armLead;

        // Body (base, above legs)
        const body = this.scene.add.sprite(0, 0, 'body').setOrigin(0.25, .25);
        body.setFrame('mzt_idle0000');  // ← Add this for each part
        this.add(body);
        this.parts.body = body;

        // Mouth (face layer, above body)
        const mouth = this.scene.add.sprite(0, 0, 'mouth').setOrigin(0.25, 0.25);
        mouth.setFrame('mzt_idle0000');  // ← Add this for each part
        this.add(mouth);
        this.parts.mouth = mouth;

        // Eyes (face again, above mouth)
        const eyes = this.scene.add.sprite(0, 0, 'eyes').setOrigin(0.25, 0.25);
        eyes.setFrame('mzt_idle0000');  // ← Add this for each part
        this.add(eyes);
        this.parts.eyes = eyes;

        // Spear (held in front arm/hand — top layer for weapon)
        const weapon = this.scene.add.sprite(0, 0, 'weapon').setOrigin(0.25, 0.25);  // ← important: pivot near grip (left side of spear)
        weapon.setFrame('mzt_idle0000');  // ← Add this for each part
        this.add(weapon);
        this.parts.weapon = weapon;

        // Arm-rear (rear arm with white gloves — behind shoulder)
        const armRear = this.scene.add.sprite(0, 0, 'arm_rear').setOrigin(0.25, 0.25);
        armRear.setFrame('mzt_idle0000');  // ← Add this for each part
        this.add(armRear);
        this.parts.arm_rear = armRear;

        // Shoulder (front of face)
        const shoulder = this.scene.add.sprite(0, 0, 'shoulder').setOrigin(0.25, 0.25);
        shoulder.setFrame('mzt_idle0000');  // ← Add this for each part
        this.add(shoulder);
        this.parts.shoulder = shoulder;

        // Stem (Uppermost - can cover face)
        const stem = this.scene.add.sprite(0, 0, 'stem').setOrigin(0.25, 0.25);
        stem.setFrame('mzt_idle0000');  // ← Add this for each part
        this.add(stem);
        this.parts.stem = stem;
        // (top layer)

        // Optional offset if misalignment (tune visually)
        // body.setPosition(0, -5);  // Example: shift body up/down
        // Debug: check all parts after creation
    
        console.log('All player parts created:', Object.keys(this.parts));
        Object.entries(this.parts).forEach(([name, sprite]) => {
            if (!sprite) {
                console.error(`Part ${name} is undefined!`);
            } else if (!sprite.texture) {
                console.error(`Part ${name} has no texture! Key: ${sprite.texture?.key}`);
            } else {
                console.log(`Part ${name} OK - texture: ${sprite.texture.key}`);
            }
        });
    }

    playAll(animKey, forceRestart = false) {
        console.log('Playing:', animKey, { forceRestart });

        const tryPlay = (part, animName) => {
            if (!part?.anims) return;
            if (!this.scene.anims.exists(animName)) {
                console.warn(`Animation missing: ${animName} — skipping part`);
                return;
            }
    
            if (forceRestart) {
                // SAFEST: always start from frame 0 when forcing
                part.anims.play({ key: animName, startFrame: 0 }, true);
            } else {
                part.anims.play(animName, true);
            }
        };

        tryPlay(this.parts.legs, `legs_${animKey}`);
        tryPlay(this.parts.stem, `stem_${animKey}`);
        tryPlay(this.parts.shoulder, `shoulder_${animKey}`);
        tryPlay(this.parts.arm_rear, `arm_rear_${animKey}`);
        tryPlay(this.parts.arm_lead, `arm_lead_${animKey}`);
        tryPlay(this.parts.body, `body_${animKey}`);
        tryPlay(this.parts.mouth, `mouth_${animKey}`);
        tryPlay(this.parts.eyes, `eyes_${animKey}`);
        tryPlay(this.parts.weapon, `weapon_${animKey}`);
    }

    resetToFirstFrame(animKey) {
        console.log('Forcing reset to first frame of:', animKey);
        this.playAll(animKey, true); 
    }

    // Add flip/updateBodyOffset later
    setFlipX(flip) {
        this.flipX = flip;                    // container flip (propagates)
        // Explicitly flip children (more reliable with atlases)
        if (this.parts.legs) this.parts.legs.flipX = flip;
        if (this.parts.body) this.parts.body.flipX = flip;
        if (this.parts.shoulder) this.parts.shoulder.flipX = flip;
        if (this.parts.eyes) this.parts.eyes.flipX = flip;
        if (this.parts.stem) this.parts.stem.flipX = flip;
        if (this.parts.mouth) this.parts.mouth.flipX = flip;
        if (this.parts.arm_rear) this.parts.arm_rear.flipX = flip;
        if (this.parts.arm_lead) this.parts.arm_lead.flipX = flip;
        if (this.parts.weapon) this.parts.weapon.flipX = flip;
        // this.scene.updateBodyOffset(this);  // Call your existing method - dated remove soon
    }
}

class MainScene extends Phaser.Scene {
    constructor(config, refs) {
        super({ key: 'mainScene' });
        this.refs = refs;
        this.refs.setConnectionStatus = refs.setConnectionStatus;
    }

    preload() {
        // if (!this.textures.exists('manzanita')) {
        //     this.load.atlas('manzanita', '/game/characters/manzanita.png', '/game/characters/manzanita.json');
        // }
        this.load.atlas('body', '/game/characters/manzanita/body-spritesheet.png', '/game/characters/manzanita/body-spritesheet.json');
        this.load.atlas('legs', '/game/characters/manzanita/legs-spritesheet.png', '/game/characters/manzanita/legs-spritesheet.json');
        this.load.atlas('eyes', '/game/characters/manzanita/eyes-classic.png', '/game/characters/manzanita/eyes-classic.json');
        this.load.atlas('stem', '/game/characters/manzanita/stem-classic.png', '/game/characters/manzanita/stem-classic.json');
        this.load.atlas('mouth', '/game/characters/manzanita/mouth-classic.png', '/game/characters/manzanita/mouth-classic.json');
        this.load.atlas('shoulder', '/game/characters/manzanita/shoulder-leafguard.png', '/game/characters/manzanita/shoulder-leafguard.json');
        this.load.atlas('arm_lead', '/game/characters/manzanita/arm_lead-whitegloves.png', '/game/characters/manzanita/arm_lead-whitegloves.json');
        this.load.atlas('arm_rear', '/game/characters/manzanita/arm_rear-whitegloves.png', '/game/characters/manzanita/arm_rear-whitegloves.json');
        this.load.atlas('weapon', '/game/characters/manzanita/weapon-wooden-spear.png', '/game/characters/manzanita/weapon-wooden-spear.json');

        this.load.image('sceneBg', '/game/backgrounds/bg-mzt-scene-village.png');
        this.load.image('teepee', '/game/items/mzt-fg-village-teepee.png');
        this.load.spritesheet('firepit', '/game/items/firepit.png', {
            frameWidth: 316,
            frameHeight: 463.3,
        });
        // this.load.image('enemy', '/game/enemies/enemy.png');
        // this.load.on('filecomplete', (key) => {
        //     console.log(`Asset loaded: ${key}`);
        //     if (key === 'manzanita') {
        //         console.log('Manzanita atlas loaded successfully');
        //     }
        // });
        // this.load.on('loaderror', (file) => {
        //     console.error(`Error loading asset: ${file.key}. URL: ${file.url}`);
        //     if (file.key === 'manzanita') {
        //         console.error('Manzanita atlas failed to load. Animations will not work.');
        //     }
        // });
        // this.load.once('complete', () => {
        //     console.log('All assets loaded successfully');
        // });
    }

    create() {
        this.refs.sceneRef.current = this;

        // Detect mobile device
        this.isMobile = ('ontouchstart' in window || navigator.maxTouchPoints > 0) &&
                        window.matchMedia("(pointer: coarse)").matches;

        // Initialize chat bubble tracking
        this.activeChatBubbles = {};

        // Dynamic world size based on aspect ratio
        const gameWidth = this.scale.gameSize.width;
        const gameHeight = this.scale.gameSize.height;
        const isPortrait = gameHeight > gameWidth;
        // Mobile = taller → vertical world, zoomed in
        // Desktop = wider → classic horizontal world

       // Use consistent world size on ALL devices
        const worldWidth = 1280;
        const worldHeight = 1000;

        // if (!this.isMobile && !isPortrait) {
        //     // Desktop: expand width to fill browser, keep height fixed
        // }

        // Set world
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
        

        // Background — fit perfectly, no stretch
        this.add.image(worldWidth / 2, worldHeight / 2, 'sceneBg')
            .setDisplaySize(worldWidth, worldHeight)
            .setDepth(-10);

        // Ground
        const groundY = worldHeight - 280;
        this.ground = this.add.rectangle(worldWidth / 2, groundY, worldWidth, 160, 0x0000ff, 0);
        this.physics.add.existing(this.ground, true);
        this.platforms = this.physics.add.staticGroup();
        this.platforms.add(this.ground);

        // Foreground Scaling — use positions relative to new world size
        const scaleX = worldWidth / 1280;
        const scaleY = worldHeight / 1000;

        // FIREPIT
        this.firepit = this.physics.add.sprite(700 * scaleX, groundY - 160, 'firepit')
            .setScale(0.42)
            .setDepth(1);
        this.firepit.body.setImmovable(true);
        this.firepit.body.setAllowGravity(false);
        this.firepit.body.setSize(260, 300);
        this.firepit.body.offset.set(30, 120);
        this.firepit.play('burning');

        // TEEPEE
        this.teepee = this.add.image(175, groundY - 27, 'teepee')
            .setOrigin(0.5, 1)
            .setScale(1)
            .setDepth(10);
        this.teepeeInsidePlat = this.add.rectangle(100, groundY - 165, 60, 180, 0x0000ff, 0);
        this.teepeeTopPlat = this.add.rectangle(170, groundY - 420, 30, 60, 0x000fff, 0)
        this.teepeeDoorWallPlat = this.add.rectangle(200, groundY - 360, 28, 70, 0x000fff, 0)
        this.teepeeDoorCeilPlat = this.add.rectangle(235, groundY - 280, 50, 100, 0x000fff, 0)
        this.platforms.add(this.teepeeInsidePlat);
        this.platforms.add(this.teepeeTopPlat);
        this.platforms.add(this.teepeeDoorWallPlat);
        this.platforms.add(this.teepeeDoorCeilPlat);

        // === CHIEF NPC SETUP ===
        // const chiefStartX = 400;
        // const chiefStartY = groundY - 150;

        // // Create physics sprite directly
        // this.chief = this.physics.add.sprite(chiefStartX, chiefStartY, 'manzanita')
        //     .setScale(1.3)
        //     .setTint(0xffddba)
        //     .setDepth(3);

        // // Physics
        // this.chief.body.setAllowGravity(true);
        // this.chief.body.setCollideWorldBounds(true);
        // this.chief.body.setDragX(3000);
        // this.chief.body.setSize(40, 55);
        // this.chief.body.setOffset(40, 10);

        // // Colliders
        // this.physics.add.collider(this.chief, this.platforms);
        // this.physics.add.collider(this.chief, this.firepit);

        // // Name label — closer and follows perfectly
        // this.chiefName = this.add.text(chiefStartX, chiefStartY - 80, 'Manzanita Chief', {
        //     fontSize: '20px',
        //     fill: '#ffddaa',
        //     stroke: '#331100',
        //     strokeThickness: 4,
        //     fontStyle: 'bold'
        // }).setOrigin(0.5).setDepth(11);

        // // Patrol data directly on chief
        // this.chief.patrolLeft = 300;    // Safe left of teepee
        // this.chief.patrolRight = 600;   // ← Stop well before firepit (~700)
        // this.chief.patrolDirection = 1;
        // this.chief.walkSpeed = 180;
        // this.chief.isPatrolling = true;
        // this.chief.nextPatrolSwitch = 0;

        // Start idle
        // this.chief.anims.play('idle', true);

        // Camera
        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
        this.cameras.main.setBackgroundColor('#010701ff');

        // Mobile gets extra zoom for that focused feel
        if (this.isMobile || isPortrait) {
            this.cameras.main.setZoom(1.4);
        } else {
            this.cameras.main.setZoom(1.5);
        }

        // Always follow player
        this.cameras.main.startFollow(this.player || { x: worldWidth/2, y: groundY - 200 }, false, 0.09, 0.09);
        if (this.isMobile || isPortrait) {
            this.cameras.main.setDeadzone(20, 20);  // tighter feel on mobile
        } else {
            this.cameras.main.setDeadzone(120, 420);  // wider deadzone on desktop for cinematic panning
        }

        this.cameras.main.setLerp(0.15, 0.15);

        if (this.refs.isConnected.current && this.refs.myId.current && !this.refs.players.current[this.refs.myId.current]) {
            this.createPlayer(this);
        }

        // Create attack hitbox (once, shared for the local player)
        this.attackHitbox = this.add.rectangle(0, 0, 90, 20, 0xff0000, 0.4)  // visible red for debugging
        .setDepth(5)
        .setOrigin(0.5, 0.5);

        this.physics.add.existing(this.attackHitbox);
        this.attackHitbox.body.setAllowGravity(false);
        this.attackHitbox.body.setEnable(false);           // disabled by default
        this.attackHitbox.body.debugShowBody = true;       // keep visible during dev

        // Track last flip
        this.lastFlipX = null;

        // Fullscreen on F
        // this.input.keyboard.on('keydown-F', () => {
        //     if (this.scale.isFullscreen) this.scale.stopFullscreen();
        //     else this.scale.startFullscreen();
        // });

        console.log('Scene created, container:', this.refs.containerRef.current);

        // Animations
        this.anims.create({
            key: 'burning',
            frames: this.anims.generateFrameNumbers('firepit', { start: 0, end: 14 }),
            frameRate: 20,
            repeat: -1,
        });
        this.firepit.play('burning');


// Stem idle
this.anims.create({
    key: 'stem_idle',
    // frames: this.anims.generateFrameNames('stem', {
    //     prefix: 'mzt_idle',
    //     start: 0,
    //     end: 10,
    //     zeroPad: 4
    // }),
    frames: [
        { key: 'stem', frame: 'mzt_idle0000' },
        { key: 'stem', frame: 'mzt_idle0001' },
        { key: 'stem', frame: 'mzt_idle0002' },
        { key: 'stem', frame: 'mzt_idle0003' },
        { key: 'stem', frame: 'mzt_idle0004' },
        { key: 'stem', frame: 'mzt_idle0005' },
        { key: 'stem', frame: 'mzt_idle0006' },
        { key: 'stem', frame: 'mzt_idle0007' },
        { key: 'stem', frame: 'mzt_idle0008' },
        { key: 'stem', frame: 'mzt_idle0009' },
        { key: 'stem', frame: 'mzt_idle0010' }
    ],
    frameRate: 16,
    repeat: -1
});

// Stem walk
this.anims.create({
    key: 'stem_walk',
    // frames: this.anims.generateFrameNames('stem', {
    //     prefix: 'mzt_walk',
    //     start: 0,
    //     end: 3,
    //     zeroPad: 4
    // }),
    frames: [
        { key: 'stem', frame: 'mzt_walk0000' },
        { key: 'stem', frame: 'mzt_walk0001' },
        { key: 'stem', frame: 'mzt_walk0002' },
        { key: 'stem', frame: 'mzt_walk0003' }
    ],
    frameRate: 16,
    repeat: -1
});

// Stem jump
this.anims.create({
    key: 'stem_jump',
    // frames: this.anims.generateFrameNames('stem', {
    //     prefix: 'mzt_jump',
    //     start: 0,
    //     end: 4,
    //     zeroPad: 4
    // }),
    frames: [
        { key: 'stem', frame: 'mzt_jump0000' },
        { key: 'stem', frame: 'mzt_jump0001' },
        { key: 'stem', frame: 'mzt_jump0002' },
        { key: 'stem', frame: 'mzt_jump0003' },
        { key: 'stem', frame: 'mzt_jump0004' }
    ],
    frameRate: 16,
    repeat: -1
});

// Stem attack
this.anims.create({
    key: 'stem_attack',
    // frames: this.anims.generateFrameNames('stem', {
    //     prefix: 'mzt_attack',
    //     start: 0,
    //     end: 4,
    //     zeroPad: 4
    // }),
    frames: [
        { key: 'stem', frame: 'mzt_attack0000' },
        { key: 'stem', frame: 'mzt_attack0001' },
        { key: 'stem', frame: 'mzt_attack0002' },
        { key: 'stem', frame: 'mzt_attack0003' },
        { key: 'stem', frame: 'mzt_attack0004' }
    ],
    frameRate: 16,       // same as others — attack punchiness comes from eyes at 24
    repeat: 0
});

// Mouth idle
this.anims.create({
    key: 'mouth_idle',
    // frames: this.anims.generateFrameNames('mouth', {
    //     prefix: 'mzt_idle',
    //     start: 0,
    //     end: 10,
    //     zeroPad: 4
    // }),
    frames: [
        { key: 'mouth', frame: 'mzt_idle0000' },
        { key: 'mouth', frame: 'mzt_idle0001' },
        { key: 'mouth', frame: 'mzt_idle0002' },
        { key: 'mouth', frame: 'mzt_idle0003' },
        { key: 'mouth', frame: 'mzt_idle0004' },
        { key: 'mouth', frame: 'mzt_idle0005' },
        { key: 'mouth', frame: 'mzt_idle0006' },
        { key: 'mouth', frame: 'mzt_idle0007' },
        { key: 'mouth', frame: 'mzt_idle0008' },
        { key: 'mouth', frame: 'mzt_idle0009' },
        { key: 'mouth', frame: 'mzt_idle0010' }
    ],
    frameRate: 16,
    repeat: -1
});

// Mouth walk
this.anims.create({
    key: 'mouth_walk',
    // frames: this.anims.generateFrameNames('mouth', {
    //     prefix: 'mzt_walk',
    //     start: 0,
    //     end: 3,
    //     zeroPad: 4
    // }),
    frames: [
        { key: 'mouth', frame: 'mzt_walk0000' },
        { key: 'mouth', frame: 'mzt_walk0001' },
        { key: 'mouth', frame: 'mzt_walk0002' },
        { key: 'mouth', frame: 'mzt_walk0003' }
    ],
    frameRate: 16,
    repeat: -1
});

// Mouth jump
this.anims.create({
    key: 'mouth_jump',
    // frames: this.anims.generateFrameNames('mouth', {
    //     prefix: 'mzt_jump',
    //     start: 0,
    //     end: 4,
    //     zeroPad: 4
    // }),
    frames: [
        { key: 'mouth', frame: 'mzt_jump0000' },
        { key: 'mouth', frame: 'mzt_jump0001' },
        { key: 'mouth', frame: 'mzt_jump0002' },
        { key: 'mouth', frame: 'mzt_jump0003' },
        { key: 'mouth', frame: 'mzt_jump0004' }
    ],
    frameRate: 16,
    repeat: -1
});

// Mouth attack
this.anims.create({
    key: 'mouth_attack',
    // frames: this.anims.generateFrameNames('mouth', {
    //     prefix: 'mzt_attack',
    //     start: 0,
    //     end: 4,
    //     zeroPad: 4
    // }),
    frames: [
        { key: 'mouth', frame: 'mzt_attack0000' },
        { key: 'mouth', frame: 'mzt_attack0001' },
        { key: 'mouth', frame: 'mzt_attack0002' },
        { key: 'mouth', frame: 'mzt_attack0003' },
        { key: 'mouth', frame: 'mzt_attack0004' },
    ],
    frameRate: 16,
    repeat: 0
});

// Eyes animations — same frame count & naming pattern as body/legs
this.anims.create({
    key: 'eyes_idle',
    // frames: this.anims.generateFrameNames('eyes', {
    //     prefix: 'mzt_idle',
    //     start: 0,
    //     end: 10,
    //     zeroPad: 4
    // }),
    frames: [
        { key: 'eyes', frame: 'mzt_idle0000' },
        { key: 'eyes', frame: 'mzt_idle0001' },
        { key: 'eyes', frame: 'mzt_idle0002' },
        { key: 'eyes', frame: 'mzt_idle0003' },
        { key: 'eyes', frame: 'mzt_idle0004' },
        { key: 'eyes', frame: 'mzt_idle0005' },
        { key: 'eyes', frame: 'mzt_idle0006' },
        { key: 'eyes', frame: 'mzt_idle0007' },
        { key: 'eyes', frame: 'mzt_idle0008' },
        { key: 'eyes', frame: 'mzt_idle0009' },
        { key: 'eyes', frame: 'mzt_idle0010' },
    ],
    frameRate: 16,          // slightly slower than body/legs for natural blink feel?
    repeat: -1
});

this.anims.create({
    key: 'eyes_walk',
    // frames: this.anims.generateFrameNames('eyes', {
    //     prefix: 'mzt_walk',
    //     start: 0,
    //     end: 3,
    //     zeroPad: 4
    // }),
    frames: [
        { key: 'eyes', frame: 'mzt_walk0000' },
        { key: 'eyes', frame: 'mzt_walk0001' },
        { key: 'eyes', frame: 'mzt_walk0002' },
        { key: 'eyes', frame: 'mzt_walk0003' }
    ],
    frameRate: 16,
    repeat: -1
});

this.anims.create({
    key: 'eyes_jump',
    // frames: this.anims.generateFrameNames('eyes', {
    //     prefix: 'mzt_jump',
    //     start: 0,
    //     end: 4,
    //     zeroPad: 4
    // }),
    frames: [
        { key: 'eyes', frame: 'mzt_jump0000' },
        { key: 'eyes', frame: 'mzt_jump0001' },
        { key: 'eyes', frame: 'mzt_jump0002' },
        { key: 'eyes', frame: 'mzt_jump0003' },
        { key: 'eyes', frame: 'mzt_jump0004' }
    ],
    frameRate: 16,
    repeat: -1
});

this.anims.create({
    key: 'eyes_attack',
    // frames: this.anims.generateFrameNames('eyes', {
    //     prefix: 'mzt_attack',
    //     start: 0,
    //     end: 4,
    //     zeroPad: 4
    // }),
    frames: [
        { key: 'eyes', frame: 'mzt_attack0000' },
        { key: 'eyes', frame: 'mzt_attack0001' },
        { key: 'eyes', frame: 'mzt_attack0002' },
        { key: 'eyes', frame: 'mzt_attack0003' },
        { key: 'eyes', frame: 'mzt_attack0004' },
    ],
    frameRate: 24,          // faster for attack intensity
    repeat: 0               // usually play once
});

// Arm-lead idle
this.anims.create({
    key: 'arm_lead_idle',
    // frames: this.anims.generateFrameNames('arm_lead', {
    //     prefix: 'mzt_idle',
    //     start: 0,
    //     end: 10,
    //     zeroPad: 4
    // }),
    frames: [
        { key: 'arm_lead', frame: 'mzt_idle0000' },
        { key: 'arm_lead', frame: 'mzt_idle0001' },
        { key: 'arm_lead', frame: 'mzt_idle0002' },
        { key: 'arm_lead', frame: 'mzt_idle0003' },
        { key: 'arm_lead', frame: 'mzt_idle0004' },
        { key: 'arm_lead', frame: 'mzt_idle0005' },
        { key: 'arm_lead', frame: 'mzt_idle0006' },
        { key: 'arm_lead', frame: 'mzt_idle0007' },
        { key: 'arm_lead', frame: 'mzt_idle0008' },
        { key: 'arm_lead', frame: 'mzt_idle0009' },
        { key: 'arm_lead', frame: 'mzt_idle0010' }
    ],
    frameRate: 16,
    repeat: -1
});

// Arm-lead walk
this.anims.create({
    key: 'arm_lead_walk',
    // frames: this.anims.generateFrameNames('arm_lead', {
    //     prefix: 'mzt_walk',
    //     start: 0,
    //     end: 3,
    //     zeroPad: 4
    // }),
    frames: [
        { key: 'arm_lead', frame: 'mzt_walk0000' },
        { key: 'arm_lead', frame: 'mzt_walk0001' },
        { key: 'arm_lead', frame: 'mzt_walk0002' },
        { key: 'arm_lead', frame: 'mzt_walk0003' }
    ],
    frameRate: 16,
    repeat: -1
});

// Arm-lead jump
this.anims.create({
    key: 'arm_lead_jump',
    // frames: this.anims.generateFrameNames('arm_lead', {
    //     prefix: 'mzt_jump',
    //     start: 0,
    //     end: 4,
    //     zeroPad: 4
    // }),
    frames: [
        { key: 'arm_lead', frame: 'mzt_jump0000' },
        { key: 'arm_lead', frame: 'mzt_jump0001' },
        { key: 'arm_lead', frame: 'mzt_jump0002' },
        { key: 'arm_lead', frame: 'mzt_jump0003' },
        { key: 'arm_lead', frame: 'mzt_jump0004' },
    ],
    frameRate: 16,
    repeat: -1
});

// Arm-lead attack
this.anims.create({
    key: 'arm_lead_attack',
    // frames: this.anims.generateFrameNames('arm_lead', {
    //     prefix: 'mzt_attack',
    //     start: 0,
    //     end: 4,
    //     zeroPad: 4
    // }),
    frames: [
        { key: 'arm_lead', frame: 'mzt_attack0000' },
        { key: 'arm_lead', frame: 'mzt_attack0001' },
        { key: 'arm_lead', frame: 'mzt_attack0002' },
        { key: 'arm_lead', frame: 'mzt_attack0003' },
        { key: 'arm_lead', frame: 'mzt_attack0004' }
    ],
    frameRate: 16,
    repeat: 0
});

// Arm-rear idle
this.anims.create({
    key: 'arm_rear_idle',
    // frames: this.anims.generateFrameNames('arm_rear', {
    //     prefix: 'mzt_idle',
    //     start: 0,
    //     end: 10,
    //     zeroPad: 4
    // }),
    frames: [
        { key: 'arm_rear', frame: 'mzt_idle0000' },
        { key: 'arm_rear', frame: 'mzt_idle0001' },
        { key: 'arm_rear', frame: 'mzt_idle0002' },
        { key: 'arm_rear', frame: 'mzt_idle0003' },
        { key: 'arm_rear', frame: 'mzt_idle0004' },
        { key: 'arm_rear', frame: 'mzt_idle0005' },
        { key: 'arm_rear', frame: 'mzt_idle0006' },
        { key: 'arm_rear', frame: 'mzt_idle0007' },
        { key: 'arm_rear', frame: 'mzt_idle0008' },
        { key: 'arm_rear', frame: 'mzt_idle0009' },
        { key: 'arm_rear', frame: 'mzt_idle0010' }
    ],
    frameRate: 16,
    repeat: -1
});

// Arm-rear walk
this.anims.create({
    key: 'arm_rear_walk',
    // frames: this.anims.generateFrameNames('arm_rear', {
    //     prefix: 'mzt_walk',
    //     start: 0,
    //     end: 3,
    //     zeroPad: 4
    // }),
    frames: [
        { key: 'arm_rear', frame: 'mzt_walk0000' },
        { key: 'arm_rear', frame: 'mzt_walk0001' },
        { key: 'arm_rear', frame: 'mzt_walk0002' },
        { key: 'arm_rear', frame: 'mzt_walk0003' }
    ],
    frameRate: 16,
    repeat: -1
});

// Arm-rear jump
this.anims.create({
    key: 'arm_rear_jump',
    // frames: this.anims.generateFrameNames('arm_rear', {
    //     prefix: 'mzt_jump',
    //     start: 0,
    //     end: 4,
    //     zeroPad: 4
    // }),
    frames: [
        { key: 'arm_rear', frame: 'mzt_jump0000' },
        { key: 'arm_rear', frame: 'mzt_jump0001' },
        { key: 'arm_rear', frame: 'mzt_jump0002' },
        { key: 'arm_rear', frame: 'mzt_jump0003' },
        { key: 'arm_rear', frame: 'mzt_jump0004' }
    ],
    frameRate: 16,
    repeat: -1
});

// Spear idle
this.anims.create({
    key: 'weapon_idle',
    // frames: this.anims.generateFrameNames('weapon', {
    //     prefix: 'mzt_idle',
    //     start: 0,
    //     end: 10,
    //     zeroPad: 4
    // }),
    frames: [
        { key: 'weapon', frame: 'mzt_idle0000' },
        { key: 'weapon', frame: 'mzt_idle0001' },
        { key: 'weapon', frame: 'mzt_idle0002' },
        { key: 'weapon', frame: 'mzt_idle0003' },
        { key: 'weapon', frame: 'mzt_idle0004' },
        { key: 'weapon', frame: 'mzt_idle0005' },
        { key: 'weapon', frame: 'mzt_idle0006' },
        { key: 'weapon', frame: 'mzt_idle0007' },
        { key: 'weapon', frame: 'mzt_idle0008' },
        { key: 'weapon', frame: 'mzt_idle0009' },
        { key: 'weapon', frame: 'mzt_idle0010' }
    ],
    frameRate: 16,
    repeat: -1
});

// Spear walk
this.anims.create({
    key: 'weapon_walk',
    // frames: this.anims.generateFrameNames('weapon', {
    //     prefix: 'mzt_walk',
    //     start: 0,
    //     end: 3,
    //     zeroPad: 4
    // }),
    frames: [
        { key: 'weapon', frame: 'mzt_walk0000' },
        { key: 'weapon', frame: 'mzt_walk0001' },
        { key: 'weapon', frame: 'mzt_walk0002' },
        { key: 'weapon', frame: 'mzt_walk0003' }
    ],
    frameRate: 16,
    repeat: -1
});

// Spear jump
this.anims.create({
    key: 'weapon_jump',
    // frames: this.anims.generateFrameNames('weapon', {
    //     prefix: 'mzt_jump',
    //     start: 0,
    //     end: 4,
    //     zeroPad: 4
    // }),
    frames: [
        { key: 'weapon', frame: 'mzt_jump0000' },
        { key: 'weapon', frame: 'mzt_jump0001' },
        { key: 'weapon', frame: 'mzt_jump0002' },
        { key: 'weapon', frame: 'mzt_jump0003' },
        { key: 'weapon', frame: 'mzt_jump0004' }
    ],
    frameRate: 16,
    repeat: -1
});

// Spear attack (faster for thrust impact — matches eyes_attack)
this.anims.create({
    key: 'weapon_attack',
    // frames: this.anims.generateFrameNames('weapon', {
    //     prefix: 'mzt_attack',
    //     start: 0,
    //     end: 4,
    //     zeroPad: 4
    // }),
    frames: [
        { key: 'weapon', frame: 'mzt_attack0000' },
        { key: 'weapon', frame: 'mzt_attack0001' },
        { key: 'weapon', frame: 'mzt_attack0002' },
        { key: 'weapon', frame: 'mzt_attack0003' },
        { key: 'weapon', frame: 'mzt_attack0004' }
    ],
    frameRate: 24,
    repeat: 0
});

// Arm-rear attack
this.anims.create({
    key: 'arm_rear_attack',
    // frames: this.anims.generateFrameNames('arm_rear', {
    //     prefix: 'mzt_attack',
    //     start: 0,
    //     end: 4,
    //     zeroPad: 4
    // }),
    frames: [
        { key: 'arm_rear', frame: 'mzt_attack0000' },
        { key: 'arm_rear', frame: 'mzt_attack0001' },
        { key: 'arm_rear', frame: 'mzt_attack0002' },
        { key: 'arm_rear', frame: 'mzt_attack0003' },
        { key: 'arm_rear', frame: 'mzt_attack0004' }
    ],
    frameRate: 16,
    repeat: 0
});


// Legs idle
this.anims.create({
    key: 'legs_idle',
    // frames: this.anims.generateFrameNames('legs', {
    //     prefix: 'mzt_idle',
    //     start: 0,
    //     end: 10,
    //     zeroPad: 4
    // }),
    frames: [
        { key: 'legs', frame: 'mzt_idle0000' },
        { key: 'legs', frame: 'mzt_idle0001' },
        { key: 'legs', frame: 'mzt_idle0002' },
        { key: 'legs', frame: 'mzt_idle0003' },
        { key: 'legs', frame: 'mzt_idle0004' },
        { key: 'legs', frame: 'mzt_idle0005' },
        { key: 'legs', frame: 'mzt_idle0006' },
        { key: 'legs', frame: 'mzt_idle0007' },
        { key: 'legs', frame: 'mzt_idle0008' },
        { key: 'legs', frame: 'mzt_idle0009' },
        { key: 'legs', frame: 'mzt_idle0010' },
    ],
    frameRate: 16,
    repeat: -1
});

// Legs walk
this.anims.create({
    key: 'legs_walk',
    // frames: this.anims.generateFrameNames('legs', {
    //     prefix: 'mzt_walk',
    //     start: 0,
    //     end: 3,
    //     zeroPad: 4
    // }),
    frames: [
        { key: 'legs', frame: 'mzt_walk0000' },
        { key: 'legs', frame: 'mzt_walk0001' },
        { key: 'legs', frame: 'mzt_walk0002' },
        { key: 'legs', frame: 'mzt_walk0003' }
    ],
    frameRate: 16,
    repeat: -1
});

// Legs jump
this.anims.create({
    key: 'legs_jump',
    // frames: this.anims.generateFrameNames('legs', {
    //     prefix: 'mzt_jump',
    //     start: 0,
    //     end: 4,
    //     zeroPad: 4
    // }),
    frames: [
        { key: 'legs', frame: 'mzt_jump0000' },
        { key: 'legs', frame: 'mzt_jump0001' },
        { key: 'legs', frame: 'mzt_jump0002' },
        { key: 'legs', frame: 'mzt_jump0003' },
        { key: 'legs', frame: 'mzt_jump0004' },
    ],
    frameRate: 16,
    repeat: -1
});


// Legs attack
this.anims.create({
    key: 'legs_attack',
    // frames: this.anims.generateFrameNames('legs', {
    //     prefix: 'mzt_attack',
    //     start: 0,
    //     end: 4,
    //     zeroPad: 4
    // }),
    frames: [
        { key: 'legs', frame: 'mzt_attack0000' },
        { key: 'legs', frame: 'mzt_attack0001' },
        { key: 'legs', frame: 'mzt_attack0002' },
        { key: 'legs', frame: 'mzt_attack0003' },
        { key: 'legs', frame: 'mzt_attack0004' }
    ],
    frameRate: 16,
    repeat: 0
});

// Body idle
this.anims.create({
    key: 'body_idle',
    // frames: this.anims.generateFrameNames('body', {
    //     prefix: 'mzt_idle',
    //     start: 0,
    //     end: 10,  // Based on JSON
    //     zeroPad: 4
    // }),
    frames: [
        { key: 'body', frame: 'mzt_idle0000' },
        { key: 'body', frame: 'mzt_idle0001' },
        { key: 'body', frame: 'mzt_idle0002' },
        { key: 'body', frame: 'mzt_idle0003' },
        { key: 'body', frame: 'mzt_idle0004' },
        { key: 'body', frame: 'mzt_idle0005' },
        { key: 'body', frame: 'mzt_idle0006' },
        { key: 'body', frame: 'mzt_idle0007' },
        { key: 'body', frame: 'mzt_idle0008' },
        { key: 'body', frame: 'mzt_idle0009' },
        { key: 'body', frame: 'mzt_idle0010' }
    ],
    frameRate: 16,
    repeat: -1
});

// Body attack
this.anims.create({
    key: 'body_attack',
    // frames: this.anims.generateFrameNames('body', {
    //     prefix: 'mzt_attack',
    //     start: 0,
    //     end: 4,     // matches eyes
    //     zeroPad: 4
    // }),
    frames: [
        { key: 'body', frame: 'mzt_attack0000' },
        { key: 'body', frame: 'mzt_attack0001' },
        { key: 'body', frame: 'mzt_attack0002' },
        { key: 'body', frame: 'mzt_attack0003' },
        { key: 'body', frame: 'mzt_attack0004' }
    ],
    frameRate: 16,      // your preferred FPS
    repeat: 0           // plays once
});


// Body jump
this.anims.create({
    key: 'body_jump',
    // frames: this.anims.generateFrameNames('body', {
    //     prefix: 'mzt_jump',
    //     start: 0,
    //     end: 4,     // matches eyes
    //     zeroPad: 4
    // }),
    frames: [
        { key: 'body', frame: 'mzt_jump0000' },
        { key: 'body', frame: 'mzt_jump0001' },
        { key: 'body', frame: 'mzt_jump0002' },
        { key: 'body', frame: 'mzt_jump0003' },
        { key: 'body', frame: 'mzt_jump0004' }
    ],
    frameRate: 16,
    repeat: -1
});

// Body walk
this.anims.create({
    key: 'body_walk',
    // frames: this.anims.generateFrameNames('body', {
    //     prefix: 'mzt_walk',
    //     start: 0,
    //     end: 3,     // matches eyes JSON
    //     zeroPad: 4
    // }),
    frames: [
        { key: 'body', frame: 'mzt_walk0000' },
        { key: 'body', frame: 'mzt_walk0001' },
        { key: 'body', frame: 'mzt_walk0002' },
        { key: 'body', frame: 'mzt_walk0003' }
    ],
    frameRate: 16,
    repeat: -1
});

// Shoulder idle
this.anims.create({
    key: 'shoulder_idle',
    // frames: this.anims.generateFrameNames('shoulder', {
    //     prefix: 'mzt_idle',
    //     start: 0,
    //     end: 10,
    //     zeroPad: 4
    // }),
    frames: [
        { key: 'shoulder', frame: 'mzt_idle0000' },
        { key: 'shoulder', frame: 'mzt_idle0001' },
        { key: 'shoulder', frame: 'mzt_idle0002' },
        { key: 'shoulder', frame: 'mzt_idle0003' },
        { key: 'shoulder', frame: 'mzt_idle0004' },
        { key: 'shoulder', frame: 'mzt_idle0005' },
        { key: 'shoulder', frame: 'mzt_idle0006' },
        { key: 'shoulder', frame: 'mzt_idle0007' },
        { key: 'shoulder', frame: 'mzt_idle0008' },
        { key: 'shoulder', frame: 'mzt_idle0009' },
        { key: 'shoulder', frame: 'mzt_idle0010' },
    ],
    frameRate: 16,
    repeat: -1
});

// Shoulder walk
this.anims.create({
    key: 'shoulder_walk',
    // frames: this.anims.generateFrameNames('shoulder', {
    //     prefix: 'mzt_walk',
    //     start: 0,
    //     end: 3,
    //     zeroPad: 4
    // }),
    frames: [
        { key: 'shoulder', frame: 'mzt_walk0000' },
        { key: 'shoulder', frame: 'mzt_walk0001' },
        { key: 'shoulder', frame: 'mzt_walk0002' },
        { key: 'shoulder', frame: 'mzt_walk0003' }
    ],
    frameRate: 16,
    repeat: -1
});

// Shoulder jump
this.anims.create({
    key: 'shoulder_jump',
    // frames: this.anims.generateFrameNames('shoulder', {
    //     prefix: 'mzt_jump',
    //     start: 0,
    //     end: 4,
    //     zeroPad: 4
    // }),
    frames: [
        { key: 'shoulder', frame: 'mzt_jump0000' },
        { key: 'shoulder', frame: 'mzt_jump0001' },
        { key: 'shoulder', frame: 'mzt_jump0002' },
        { key: 'shoulder', frame: 'mzt_jump0003' },
        { key: 'shoulder', frame: 'mzt_jump0004' }
    ],
    frameRate: 16,
    repeat: -1
});

// Shoulder attack
this.anims.create({
    key: 'shoulder_attack',
    // frames: this.anims.generateFrameNames('shoulder', {
    //     prefix: 'mzt_attack',
    //     start: 0,
    //     end: 4,
    //     zeroPad: 4
    // }),
    frames: [
        { key: 'shoulder', frame: 'mzt_attack0000' },
        { key: 'shoulder', frame: 'mzt_attack0001' },
        { key: 'shoulder', frame: 'mzt_attack0002' },
        { key: 'shoulder', frame: 'mzt_attack0003' },
        { key: 'shoulder', frame: 'mzt_attack0004' }
    ],
    frameRate: 16,
    repeat: 0
});



        // this.anims.create({
        //     key: 'idle',
        //     frames: this.anims.generateFrameNames('manzanita', {
        //         prefix: 'mzt_idle',
        //         start: 0,
        //         end: 10,
        //         zeroPad: 4
        //     }),
        //     frameRate: 15,
        //     repeat: -1
        // });
        // this.anims.create({
        //     key: 'walk',
        //     frames: this.anims.generateFrameNames('manzanita', {
        //         prefix: 'mzt_walk',
        //         start: 0,
        //         end: 8,
        //         zeroPad: 4
        //     }),
        //     frameRate: 20,
        //     repeat: -1
        // });
        // this.anims.create({
        //     key: 'attack',
        //     frames: this.anims.generateFrameNames('manzanita', {
        //         prefix: 'mzt_attack',
        //         start: 0,
        //         end: 2,
        //         zeroPad: 4
        //     }),
        //     frameRate: 30,
        //     repeat: 0
        // });
        // this.anims.create({
        //     key: 'jump',
        //     frames: this.anims.generateFrameNames('manzanita', {
        //         prefix: 'mzt_jump',
        //         start: 0,
        //         end: 4,
        //         zeroPad: 4
        //     }),
        //     frameRate: 20,
        //     repeat: -1
        // });

        // Create player
        if (this.refs.isConnected.current && this.refs.myId.current && !this.refs.players.current[this.refs.myId.current]) {
            this.createPlayer(this);
        }

        // Enemy spawning
        this.enemyCount = 0;
        this.enemyMaxCount = 0;
        this.time.addEvent({
            delay: 2500,
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
        // this.fullscreen = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
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

        // this.input.keyboard.on('keydown-F', () => {
        //     this.scale.fullscreenTarget = this.refs.containerRef.current;
        //     if (this.scale.isFullscreen) {
        //         this.scale.stopFullscreen();
        //     } else {
        //         this.scale.startFullscreen();
        //     }
        // });

        // Popup text
        this.activePopups = [];
        this.createPopupText = (x, y, text, color = '#ffff00') => {
            const popupText = this.add.text(x, y, text, {
                fontSize: '16px',
                fill: color,
                // backgroundColor: 'rgba(0, 0, 0, 0.85)',
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
        // Remove old controls
        const old = document.getElementById('mobile-controls');
        if (old) old.remove();

        const controls = document.createElement('div');
        controls.id = 'mobile-controls';
        controls.style.cssText = `
            position: fixed;
            left: 0; right: 0; bottom: 0;
            height: 28%;
            padding-bottom: max(90px, env(safe-area-inset-bottom));
            pointer-events: none;
            z-index: 9999;
            user-select: none;
            touch-action: none;
            background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%);
            font-family: -apple-system, sans-serif;
            display: ${this.isMobile ? 'block' : 'none'};
        `;

        // LEFT JOYSTICK BASE + KNOB
        const joystickBase = document.createElement('div');
        joystickBase.style.cssText = `
            position: absolute;
            left: 20px; bottom: 25px;
            width: 140px; height: 140px;
            background: rgba(255, 255, 255, 0.15);
            border: 6px solid rgba(35, 68, 34, 0.6);
            border-radius: 50%;
            pointer-events: auto;
            backdrop-filter: blur(6px);
            box-shadow: 0 8px 32px rgba(0,0,0,0.6), inset 0 0 40px rgba(100, 255, 152, 0.3);
        `;

        const knob = document.createElement('div');
        knob.style.cssText = `
            position: absolute;
            width: 60px; height: 60px;
            background: radial-gradient(circle at 30% 30%, #ffffff, #88ffa6ff);
            border-radius: 50%;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            box-shadow: 0 6px 20px rgba(0,0,0,0.7), inset 0 -4px 12px rgba(0,0,0,0.4), 0 0 20px rgba(100, 255, 221, 0.6);
            transition: transform 0.08s ease-out;
        `;
        joystickBase.appendChild(knob);

        // RIGHT ATTACK BUTTON
        const attackBtn = document.createElement('div');
        attackBtn.innerHTML = 'A';
        attackBtn.style.cssText = `
            position: absolute;
            right: 30px; bottom: 40px;
            width: 110px; height: 110px;
            background: rgba(220, 40, 60, 0.9);
            border: 8px solid rgba(255, 80, 100, 0.7);
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 52px; color: white; font-weight: 900;
            text-shadow: 0 4px 12px black;
            pointer-events: auto;
            backdrop-filter: blur(12px);
            box-shadow: 0 12px 40px rgba(0,0,0,0.7), inset 0 -8px 20px rgba(0,0,0,0.4), 0 0 30px rgba(255, 100, 120, 0.5);
            transition: all 0.12s ease;
        `;

        controls.appendChild(joystickBase);
        controls.appendChild(attackBtn);
        document.body.appendChild(controls);

        // === STATE ===
        this.touchLeft = this.touchRight = false;
        this.mobileJumpPressed = false;   // new flag
        let activeTouchId = null;
        const maxDist = 40;
        const deadzone = 25;

        const resetKnob = () => {
            knob.style.transition = 'transform 0.2s cubic-bezier(0.2, 0.8, 0.4, 1)';
            knob.style.transform = 'translate(-50%, -50%)';
            setTimeout(() => knob.style.transition = 'transform 0.08s ease-out', 200);
        };

        const updateKnob = (dx, dy) => {
            const dist = Math.min(maxDist, Math.hypot(dx, dy));
            const angle = Math.atan2(dy, dx);
            const x = Math.cos(angle) * dist;
            const y = Math.sin(angle) * dist;
            knob.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
        };

        const moveHandler = (e) => {
            e.preventDefault();
            if (activeTouchId === null) return;

            const touch = Array.from(e.touches).find(t => t.identifier === activeTouchId);
            if (!touch) return;

            const rect = joystickBase.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            let dx = touch.clientX - cx;
            let dy = touch.clientY - cy;

            const dist = Math.hypot(dx, dy);
            if (dist > 70) {
                dx = (dx / dist) * 70;
                dy = (dy / dist) * 70;
            }

            updateKnob(dx, dy);

            // Horizontal movement
            this.touchLeft  = dx < -deadzone;
            this.touchRight = dx > deadzone;

            // Jump = strong upward pull
            const wantsJump = dy < -deadzone * 1.4;
            if (wantsJump && !this.mobileJumpPressed) {
                this.mobileJumpPressed = true;
                this.triggerJumpIfPossible();  // ← this is the key line
            }
            if (!wantsJump) {
                this.mobileJumpPressed = false;
            }
        };

        const startHandler = (e) => {
            if (activeTouchId !== null) return;
            const touch = e.changedTouches[0];
            const rect = joystickBase.getBoundingClientRect();
            const dx = touch.clientX - (rect.left + rect.width / 2);
            const dy = touch.clientY - (rect.top + rect.height / 2);

            if (Math.hypot(dx, dy) < 80) {
                e.preventDefault();
                activeTouchId = touch.identifier;
                moveHandler(e);
            }
        };

        const endHandler = () => {
            if (activeTouchId === null) return;
            activeTouchId = null;
            this.touchLeft = this.touchRight = false;
            this.mobileJumpPressed = false;
            resetKnob();
        };

        joystickBase.addEventListener('touchstart', startHandler, { passive: false });
        joystickBase.addEventListener('touchmove', moveHandler, { passive: false });
        joystickBase.addEventListener('touchend', endHandler);
        joystickBase.addEventListener('touchcancel', endHandler);

        attackBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            attackBtn.style.transform = 'scale(0.88)';
            this.onAttackTouch();
        }, { passive: false });

        attackBtn.addEventListener('touchend', () => {
            attackBtn.style.transform = 'scale(1)';
        });

        this.mobileControls = {
            cleanup: () => {
                joystickBase.removeEventListener('touchstart', startHandler);
                joystickBase.removeEventListener('touchmove', moveHandler);
                joystickBase.removeEventListener('touchend', endHandler);
                joystickBase.removeEventListener('touchcancel', endHandler);
                controls.remove();
            }
        };
    }
    
    handleResize(gameSize) {
        const width = gameSize.width;
        const height = gameSize.height;
        const isPortrait = height > width;

        // World stays fixed — never changes
        const worldWidth = 1280;
        const worldHeight = 1000;

        // Update world bounds (safe, even if same)
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

        // Background — always fit to fixed world
        if (this.bg) {
            this.bg.setPosition(worldWidth / 2, worldHeight / 2);
            this.bg.setDisplaySize(worldWidth, worldHeight);
        }

        // Ground — anchored
        const groundY = worldHeight - 280;
        if (this.ground) {
            this.ground.setPosition(worldWidth / 2, groundY);
        }

        // Foreground — fixed positions (no scaling!)
        if (this.firepit) {
            this.firepit.setPosition(700, groundY - 160);
        }
        if (this.teepee) {
            this.teepee.setPosition(175, groundY - 27);
        }

        // Camera bounds
        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

        // Zoom
        if (this.isMobile || isPortrait) {
            this.cameras.main.setZoom(1.4);
        } else {
            this.cameras.main.setZoom(1.5);
        }

        // Deadzone
        if (this.isMobile || isPortrait) {
            this.cameras.main.setDeadzone(20, 20);
        } else {
            this.cameras.main.setDeadzone(120, 420);
        }

        // Ensure follow is active
        if (this.player) {
            this.cameras.main.startFollow(this.player, false, 0.09, 0.09);
            this.cameras.main.setLerp(0.15, 0.15);
        }

        // Mobile controls visibility
        const controls = document.getElementById('mobile-controls');
        if (controls) {
            controls.style.display = this.isMobile ? 'block' : 'none';
        }
    }

    triggerJumpIfPossible() {
        if (this.player && this.jumpCount < this.maxJumps && !this.isAttacking) {
            this.player.body.setVelocityY(this.jumpVelocity);
            this.jumpCount++;

            if (this.refs.socket.current) {
                this.refs.socket.current.emit('playerJump', {
                    id: this.refs.myId.current,
                    position: { x: this.player.x, y: this.player.y },
                    direction: this.facingDirection,
                    velocityY: this.jumpVelocity,
                });
            }

            this.player.playAll('jump');
        }
    }

    onAttackTouch() {
        if (!this.isAttacking && this.player) {
            this.isAttacking = true;
            // this.player.body.setDragX(500);
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
            

            this.player.parts.body.once('animationcomplete', () => {
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
                    this.player.body.setVelocityY(0);
                }

                const nextAnim = isAirborne ? 'jump' : (isMoving ? 'walk' : 'idle');
                this.player.playAll(nextAnim, true);  // ← forces startFrame: 0 on every part

                // Update last known state so next update() knows things changed
                this.lastState = { isMoving, isAirborne };
                this.lastAnimation = this.player.parts.body.anims.currentAnim?.key || 'idle';

                console.log('Post-attack reset → current body anim:', {
                    key: this.lastAnimation,
                    isPlaying: this.player.parts.body.anims.isPlaying,
                    currentFrame: this.player.parts.body.anims.currentFrame?.index
                });
                
                if (this.refs.socket.current) {
                    this.refs.socket.current.emit('playerMovement', {
                        id: this.refs.myId.current,
                        position: { x: this.player.x, y: this.player.y },
                        direction: this.facingDirection,
                        isMoving: isMoving,
                        isAirborne: isAirborne
                    });
                }
                console.log('Attack complete → forced animation:', this.lastAnimation);
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
                    this.player.body.setVelocityX(-speed);
                    this.player.setFlipX(true);
                    this.facingDirection = 'left';
                    moving = true;
                    // if (!this.player.flipX) {
                    //     this.player.flipX = true;
                    //     this.updateBodyOffset(this.player);
                    // }
                } else if (isRightPressed) {
                    this.player.body.setVelocityX(speed);
                    this.player.setFlipX(false);
                    this.facingDirection = 'right';
                    moving = true;
                    // if (this.player.flipX) {
                    //     this.player.flipX = false;
                    //     this.updateBodyOffset(this.player);
                    // }
                } else {
                    // this.player.body.setVelocityX(0);
                    // moving = false;
                }

                // this.updateBodyOffset(this.player);
                // if (this.player.flipX) {
                //     this.player.body.setOffset(45, 10);
                // }
                // else {
                //     this.player.body.setOffset(40, 10);
                // }

                if (!this.isAttacking && this.jumpCount < this.maxJumps) {
                    if (
                        Phaser.Input.Keyboard.JustDown(this.jumpKey) ||
                        Phaser.Input.Keyboard.JustDown(this.jumpKeyWASD) ||
                        Phaser.Input.Keyboard.JustDown(this.jumpKeyUpArrow) ||
                        (this.isMobile && this.touchJump)
                    ) {
                        this.player.body.setVelocityY(this.jumpVelocity);
                        this.jumpCount++;
                        if (this.refs.socket.current) {
                            this.refs.socket.current.emit('playerJump', {
                                id: this.refs.myId.current,
                                position: { x: this.player.x, y: this.player.y },
                                direction: this.facingDirection,
                                velocityY: this.jumpVelocity,
                            });
                        }
                        // if (this.anims.exists('jump')) {
                        //     this.player.anims.play('jump', true);
                        //     this.lastAnimation = 'jump';
                        //     this.animationLock = true;
                        //     this.time.delayedCall(100, () => { this.animationLock = false; });
                        // } else {
                        //     console.error('Jump animation not available');
                        // }
                        this.player.playAll('jump');
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
                if (!this.player) {
                    console.warn('Cannot attack: player not yet created');
                    return;
                }

                this.isAttacking = true;
                // this.player.body.setDragX(500);
                this.player.removeAllListeners('animationcomplete');
                this.player.baseX = this.player.x;

                this.player.playAll('attack');
                console.log('Attack started, current anim:', this.player.parts.body.anims.currentAnim?.key);
                // if (this.anims.exists('attack')) {
                //     this.player.anims.play('attack', true);
                //     this.lastAnimation = 'attack';
                //     this.animationLock = true;
                //     this.time.delayedCall(100, () => { this.animationLock = false; });
                // } else {
                //     console.error('Attack animation not available');
                //     this.isAttacking = false;
                // }
                const isAirborne = !this.player.body.blocked.down;
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

                this.player.parts.body.once('animationcomplete', () => {
                    this.isAttacking = false;
                    this.animationLock = false;
                    if (this.attackHitbox?.body) {
                        this.attackHitbox.body.setEnable(false);
                    }
                    const isGrounded = this.player.body.blocked.down;
                    const isAirborne = !isGrounded;
                    const isMoving = isLeftPressed || isRightPressed;

                    // NEW: Force visual reset to first frame of next anim
                    let nextAnim = isAirborne ? 'jump' : (isMoving ? 'walk' : 'idle');
                    this.player.playAll(nextAnim, true);  // ← forces startFrame: 0 on every part

                    // this.updatePlayerAnimation(this.player, isAirborne, isMoving, this);
                    if (isGrounded) {
                        this.player.body.setVelocityY(0);
                    }
                    // Update last known state so next update() knows things changed
                    this.lastState = { isMoving, isAirborne };
                    this.lastAnimation = this.player.parts.body.anims.currentAnim?.key || 'idle';
                    // if (
                    //     this.lastState.isMoving !== isMoving ||
                    //     this.lastState.isAirborne !== isAirborne ||
                    //     this.lastAnimation !== this.player.anims?.currentAnim?.key
                    // ) {
                    //     this.updatePlayerAnimation(this.player, isAirborne, isMoving, this);
                    // }
                    // this.lastState = { isMoving, isAirborne };

                    if (this.refs.socket.current) {
                        this.refs.socket.current.emit('playerMovement', {
                            id: this.refs.myId.current,
                            position: { x: this.player.x, y: this.player.y },
                            direction: this.facingDirection,
                            isMoving: isMoving,
                            isAirborne: isAirborne
                        });
                    }
                    console.log('Attack complete → forced animation:', this.lastAnimation);
                });
            }
        }

        if (this.enterKey.isDown && !this.enterKeyPressed) {
            console.log('Enter Key pressed');
            console.log('Keyboard Disabled:', this.refs.gameRef.current.input.keyboard.enabled);
            // CRITICAL: Stop player movement immediately
            if (this.player) {
                this.player.body.setVelocityX(0);
                // Force idle animation to avoid walking-in-place visuals
                // if (this.anims.exists('idle')) {
                //     this.player.anims.play('idle', true);
                // }
                this.player.playAll('idle');
            }
            this.resetActionKeys();
            this.refs.chatInputRef.current.focus();
            this.enterKeyPressed = true;
        }

        if (this.enterKey.isUp) {
            this.enterKeyPressed = false;
        }

        this.refs.enemies.current.forEach(enemy => enemy.update());

        // === CHIEF PATROL AI — NATURAL, WISE, UNSTUCKABLE ===
        // if (this.chief && this.chief.isPatrolling) {
        //     const chief = this.chief;
        //     const now = this.time.now;

        //     // State machine approach: are we currently walking toward a target?
        //     if (!chief.currentTarget) {
        //         // Pick a new random destination within safe bounds
        //         const minX = 320;
        //         const maxX = 580; // Safe before firepit
        //         chief.currentTarget = Phaser.Math.Between(minX, maxX);

        //         // Random walk speed for this leg
        //         chief.currentSpeed = Phaser.Math.Between(120, 220);

        //         // Random pause at end
        //         chief.pauseTime = Phaser.Math.Between(1000, 4000);
        //     }

        //     // Determine direction to target
        //     if (chief.x < chief.currentTarget - 10) {
        //         chief.setVelocityX(chief.currentSpeed);
        //         chief.flipX = false;
        //         this.updateBodyOffset(chief);
        //         chief.anims.play('walk', true);
        //     } else if (chief.x > chief.currentTarget + 10) {
        //         chief.setVelocityX(-chief.currentSpeed);
        //         chief.flipX = true;
        //         this.updateBodyOffset(chief);
        //         chief.anims.play('walk', true);
        //     } else {
        //         // Close enough to target → stop and idle
        //         chief.setVelocityX(0);
        //         chief.anims.play('idle', true);

        //         // Wait for pause to end before picking new target
        //         if (!chief.pauseEndTime) {
        //             chief.pauseEndTime = now + chief.pauseTime;
        //         }

        //         if (now >= chief.pauseEndTime) {
        //             // Done pausing — pick new target
        //             chief.currentTarget = null;
        //             chief.pauseEndTime = null;
        //         }
        //     }

        //     // Name follows
        //     this.chiefName.setPosition(chief.x, chief.y - 80);
        // }

        Object.keys(this.refs.players.current).forEach(id => {
            const p = this.refs.players.current[id];
            if (id !== this.refs.myId.current && p.targetX !== undefined && p.targetY !== undefined) {
                p.x = Phaser.Math.Linear(p.x, p.targetX, 0.2);
                p.y = Phaser.Math.Linear(p.y, p.targetY, 0.2);
                // Auto-switch to idle/walk when grounded
                const isGrounded = p.body.blocked.down || p.body.touching.down;
                if (isGrounded && p.anims.currentAnim?.key === 'jump') {
                    const isMoving = Math.abs(p.body.velocity.x) > 10;
                    p.anims.play(isMoving ? 'walk' : 'idle', true);
                }
            }
        });
    }

    updatePlayerAnimation(player, isAirborne, isMoving, scene) {
        
        if (scene.animationLock) return;

        let targetAnim = isAirborne ? 'jump' : (isMoving ? 'walk' : 'idle');

        // Only force restart if we were previously in a one-shot animation (like attack)
        const prevAnim = player.parts.body.anims.currentAnim?.key;
        const wasAttack = prevAnim && prevAnim.includes('_attack');        
        
        if (wasAttack) {
            // Small delay to let Phaser process the complete event fully
            scene.time.delayedCall(16, () => {  // ~1 frame delay
                player.playAll(targetAnim, true);
                console.log(`Delayed post-attack play: ${targetAnim} (forced: true)`);
            });
        } else {
            player.playAll(targetAnim, false);
        }
    
        console.log(`Updated animation to: ${targetAnim} (forced: ${wasAttack})`);
        
        // const currentAnim = player.anims.currentAnim ? player.anims.currentAnim.key : null;
        // let targetAnim = null;

        // if (isAirborne) {
        //     targetAnim = 'jump';
        // } else {
        //     targetAnim = isMoving ? 'walk' : 'idle';
        // }

        // State locking? Swapping?
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
    }

    createRemotePlayer(scene, x, y) {
        const player = scene.physics.add.sprite(x, y, 'manzanita');
        player.setScale(1);
        player.setDepth(2);
        player.body.setAllowGravity(false);
        player.setCollideWorldBounds(true);
        scene.physics.add.collider(player, scene.platforms, null, null, scene);
        player.body.setSize(40, 55);
        this.updateBodyOffset(player);
        // player.body.setOffset(40, 10);
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
        // Prevent duplicate player creation
        if (!this.refs.myId.current) return;
        if (this.refs.players.current[this.refs.myId.current]) {
            console.log('Player creation skipped - already exists:', { id: this.refs.myId.current, exists: !!this.refs.players.current[this.refs.myId.current] });
            return;
        }

        // Critical: clear any stale scene.player reference
        if (scene.player) {
            console.warn('Stale local player reference found — clearing');
            scene.player = null;
        }

        try {
            // Get world dimensions from the scene (they exist now)
            const worldWidth = scene.physics.world.bounds.width;
            const worldHeight = scene.physics.world.bounds.height;
            const groundY = worldHeight - 80;  // same as in create()
            const spawnY = groundY - 800;       // safe above ground
            const spawnX = Phaser.Math.Between(300, 600);

            scene.player = new ModularPlayer(scene, spawnX, spawnY);
            // scene.player = this.createRemotePlayer(scene, spawnX, spawnY);
            scene.player.setDepth(3);
            scene.player.body.setAllowGravity(true);
            // scene.player.body.setDragX(3000);
            scene.physics.add.collider(scene.player, scene.platforms);
            this.refs.players.current[this.refs.myId.current] = scene.player;

            // Start idle animation — now safe because all animations were created earlier in scene.create()
            scene.player.playAll('jump', true);  // ← Change to 'jump', force true for clean start


            // Start camera follow
            scene.cameras.main.startFollow(scene.player, false, 0.1, 0.1);
            console.log('Camera following player');


            console.log('Local player created at 100,50:', this.refs.myId.current);
            // Notify React to hide loading overlay
            if (scene.refs.setConnectionStatus) {
                scene.refs.setConnectionStatus('connected');
            }

            // Create mobile controls if on mobile
            if (this.isMobile) {
                this.createTouchControls();
            }

            // scene.attackOffsets = {};
            // const manzanitaFrames = scene.textures.get('manzanita').getFrameNames();
            // manzanitaFrames.forEach(frameName => {
            //     const frameData = scene.textures.get('manzanita').frames[frameName].customData;
            //     if (frameData && frameData.attackOffset !== undefined) {
            //         scene.attackOffsets[frameName] = frameData.attackOffset;
            //     }
            // });

            // scene.attackHitbox = scene.add.rectangle(-100, -100, 90, 20, 0x882222, 0);
            // scene.physics.add.existing(scene.attackHitbox);
            // scene.attackHitbox.body.setAllowGravity(false);
            // scene.attackHitbox.body.setEnable(false);
            // scene.attackHitbox.body.debugShowBody = false;

            // scene.player.on('animationupdate', (animation, frame) => {
            //     if (animation.key === 'attack') {
            //         const offset = scene.attackOffsets[frame.textureFrame] || 0;
            //         const dir = scene.player.flipX ? -1 : 1;
            //         // scene.player.x = scene.player.baseX + offset * dir;
            //         // scene.player.x = scene.player.baseX;
            //         const hitboxOffsetX = 30;
            //         scene.attackHitbox.x = scene.player.x + (offset + hitboxOffsetX) * dir;
            //         scene.attackHitbox.y = scene.player.y + 15;
            //         if (frame.index >= 1 && frame.index <= 2) {
            //             scene.attackHitbox.body.setEnable(true);
            //         } else {
            //             scene.attackHitbox.body.setEnable(false);
            //         }
            //     }
            // });

            // scene.player.on('animationcomplete', (animation) => {
            //     if (animation.key === 'attack' && scene.attackHitbox?.body) {
            //         scene.attackHitbox.body.setEnable(false);
            //     }
            // });

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

            this.refs.socket.current.emit('newPlayer', { 
                id: this.refs.myId.current, 
                x: worldWidth / 2, 
                y: spawnY 
            });

        } catch (error) {
            console.error('Error creating local player:', error);
        }
    }

    updateBodyOffset(player) {
        const offsetX = 40;
        const offsetY = 10;

        if (player.flipX) {
            player.body.setOffset(
            player.displayWidth - player.body.width - offsetX,
            offsetY
            );
        } else {
            player.body.setOffset(offsetX, offsetY);
        }
    }

    resetActionKeys() {
        if (!this.cursors || !this.WASD || !this.attackKey) return;

        // Movement keys
        this.cursors.left.reset();
        this.cursors.right.reset();
        this.WASD.A.reset();
        this.WASD.D.reset();

        // Jump keys
        this.jumpKey.reset();
        this.jumpKeyWASD.reset();
        this.jumpKeyUpArrow.reset();

        // Attack keys — THIS FIXES THE BUG
        this.attackKey.reset();           // X key
        this.WASD.attackKey.reset();      // J key

        // Optional: also reset arrow keys if you use them separately
        // (your code uses createCursorKeys(), so left/right are already covered)
    }


    shutdown() {
        this.mobileControls?.cleanup?.();
        super.shutdown?.();
    }
}

const MZTGame = () => {
    const players = useRef({});
    const myId = useRef(null);
    const socket = useRef(null);
    const gameRef = useRef(null);
    const containerRef = useRef(null);
    const chatInputRef = useRef(null);
    const [isChatFocused, setIsChatFocused] = useState(false);
    const [message, setMessage] = useState('');
    const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'connecting' | 'connected' | 'failed'
    const isConnected = useRef(false);
    const sceneRef = useRef(null);
    const isGameInitialized = useRef(false);
    const enemies = useRef([]);
    const isMobile = ('ontouchstart' in window || navigator.maxTouchPoints > 0) &&
                        window.matchMedia("(pointer: coarse)").matches;

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

        // const requestFullscreen = () => {
        //     if (isMobile && containerRef.current) {
        //         const elem = containerRef.current;
        //         if (elem.requestFullscreen) {
        //             elem.requestFullscreen().catch((err) => {
        //                 console.warn('Fullscreen request failed:', err);
        //             });
        //         } else if (elem.webkitRequestFullscreen) {
        //             elem.webkitRequestFullscreen();
        //         }
        //     }
        // };

        const SOCKET_URL = process.env.NODE_ENV === 'development'
            ? 'http://localhost:3001'
            : 'https://mztwarriors-backend.onrender.com';

        console.log('Connecting to socket:', SOCKET_URL);

        socket.current = io(SOCKET_URL, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            timeout: 60000
        });

        socket.current.on('connect', () => {
            const newId = socket.current.id;
            console.log('Socket connected with ID:', newId);

            // If ID changed (rare, but possible), clean old player
            if (myId.current && myId.current !== newId) {
                const oldPlayer = players.current[myId.current];
                if (oldPlayer) {
                    console.log('Cleaning up old player on reconnect');
                    oldPlayer.destroy();
                    delete players.current[myId.current];

                    // If this was the local player, clear the reference
                    if (sceneRef.current && sceneRef.current.player === oldPlayer) {
                        sceneRef.current.player = null;
                    }
                }
            }

            myId.current = newId;
            isConnected.current = true;

            // ONLY Create Player if we don't already have one
            if (!players.current[myId.current] && sceneRef.current) {
                console.log('Creating local player after (re)connect');
                sceneRef.current.createPlayer(sceneRef.current);
            } else {
                console.log('Player already exists, skipping creation');
            }
        });

        socket.current.on('disconnect', () => {
            console.log('Socket disconnected');
            isConnected.current = false;
            setConnectionStatus('failed');
            // Do NOT destroy player here — server will send playerDisconnected
            // We'll recreate cleanly on reconnect
        });

        socket.current.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            isConnected.current = false;
            setConnectionStatus('failed');
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
                    scene.updateBodyOffset(existingPlayer);
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
            const scene = sceneRef.current;

            const player = players.current[data.id];
            // Update position and direction (same as movement)
            player.targetX = data.position?.x ?? player.targetX;
            player.targetY = data.position?.y ?? player.targetY;
            player.flipX = (data.direction === 'left');
            scene.updateBodyOffset(player);

            // Always play jump animation for visual feedback
            if (sceneRef.current && sceneRef.current.anims.exists('jump')) {
                player.anims.play('jump', true);
            }
            
            // ONLY for remote players: apply the actual jump velocity
            // Local player already applied it when they pressed jump
            if (data.id !== myId.current && player.body) {
                player.body.setVelocityY(data.velocityY || -500);
                // Ensure gravity is on
                player.body.setAllowGravity(true);
            }
        });

        socket.current.on('playerAttacked', (data) => {
            if (players.current[data.id]) {
                const scene = sceneRef.current;
                const existingPlayer = players.current[data.id];
                existingPlayer.targetX = data.position?.x ?? existingPlayer.targetX;
                existingPlayer.targetY = data.position?.y ?? existingPlayer.targetY;
                existingPlayer.flipX = (data.direction === 'left');
                scene.updateBodyOffset(existingPlayer);
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

        // Track active chat bubbles per player
        socket.current.on('chatMessageReceived', (data) => {
            console.log('Received message via socket:', data, 'from player', data.id);
            if (!sceneRef.current) {
                console.warn('Scene not ready for chatMessageReceived event');
                return;
            }

            const scene = sceneRef.current;
            let player = players.current[data.id];
            if (!player) {
                console.log('Player not found for message:', data.message);
                return;
            }

            const playerId = data.id;

            // Destroy previous chat bubble for this player (if exists)
            if (scene.activeChatBubbles[playerId]) {
                const old = scene.activeChatBubbles[playerId];
                old.text.destroy();
                if (old.updateEvent) old.updateEvent.remove(false);
                if (old.timer) old.timer.remove(false);
                delete scene.activeChatBubbles[playerId];
            }
            
            // Create Chat Message text
            const fontSize = scene.isMobile ? '12px' : '16px';

            const chatText = scene.add.text(player.x, player.y - 50, data.message, {
                fontSize: fontSize,
                fill: '#ffff00',
                padding: { x: 12, y: 8 },
                align: 'center',
                wordWrap: { width: 200, useAdvancedWrap: true },
                stroke: '#000000',
                strokeThickness: 6,
                roundPixels: true
            })
            .setOrigin(0.5)
            .setDepth(10);
            
            // Text Follow player
            const textUpdate = scene.time.addEvent({
                delay: 16,
                callback: () => {
                    chatText.setPosition(player.x, player.y - 50);
                },
                loop: true,
            });

            // Auto-remove after 6 seconds
            // scene.time.addEvent({
            //     delay: 6000,
            //     callback: () => {
            //         chatText.destroy();
            //         textUpdate.remove(false);
            //     },
            // });

            // Auto-remove after 6 seconds
            const removalTimer = scene.time.delayedCall(6000, () => {
                chatText.destroy();
                textUpdate.remove(false);
                delete scene.activeChatBubbles[playerId];
            });

            // Store references so we can clean up on next message
            scene.activeChatBubbles[playerId] = {
                text: chatText,
                updateEvent: textUpdate,
                timer: removalTimer
            };
        });

        const config = {
            type: Phaser.AUTO,
            parent: containerRef.current,
            backgroundColor: '#000000',
            scale: {
                mode: Phaser.Scale.RESIZE,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                width: '100%',
                height: '100%',
            },
            render: {
                pixelArt: false,
                antialias: true,
                roundPixels: false,
            },
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 1200 },
                    debug: true,
                    // tileBias: 32,
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
                chatInputRef,
                setConnectionStatus
            })
        };

        gameRef.current = new Phaser.Game(config);
        
        const handleWindowResize = () => {
            if (gameRef.current && gameRef.current.scale) {
                gameRef.current.scale.resize(window.innerWidth, window.innerHeight);
            }
        };
        window.addEventListener('resize', handleWindowResize);
        handleWindowResize(); // initial resize

        console.log('Phaser game initialized');
        
        return () => {
            window.removeEventListener('resize', handleWindowResize);
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
            {/* === LOADING OVERLAY === */}
            {connectionStatus !== 'connected' && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.95)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 99999,
                    color: '#62b95a',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    padding: '16px',
                    boxSizing: 'border-box',
                    pointerEvents: 'none'  // allows clicks to pass through if needed, but safe here
                }}>
                    {connectionStatus === 'failed' ? (
                        // FAILURE STATE
                        <div style={{
                            textAlign: 'center',
                            maxWidth: '90%'
                        }}>
                            <div style={{
                                fontSize: '36px',
                                fontWeight: 'bold',
                                color: '#ff4444',
                                textShadow: '0 0 20px #000',
                                marginBottom: '20px'
                            }}>
                                Connection Failed
                            </div>
                            <div style={{
                                fontSize: '20px',
                                color: '#ffffff',
                                marginBottom: '30px'
                            }}>
                                Unable to reach the game server.
                            </div>
                            <div style={{
                                fontSize: '18px',
                                color: '#aaaaaa'
                            }}>
                                Try refreshing the page in a few seconds.
                            </div>
                        </div>
                    ) : (
                        // ── connecting / loading state with your logo ──
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '24px'
            }}>
                <img
                    src="/img/mzt-logo.png"
                    alt="Manzanita Tribe Warriors Logo"
                    width={250}
                    height={250}
                    className="u-animated a-fadeIn"
                    style={{
                        opacity: 0,           // start hidden
                        animation: 'fadeIn 450ms ease-out forwards', // CSS animation
                        filter: 'drop-shadow(0 0 16px rgba(98, 185, 90, 0.7))',
                    }}
                />

                <div style={{
                    fontSize: '36px',
                    fontWeight: 'bold',
                    color: '#62b95a',
                    textShadow: '0 0 20px #000',
                    textAlign: 'center'
                }}>
                    Connecting to server...
                </div>

                <div style={{
                    fontSize: '18px',
                    color: '#aaaaaa',
                    marginTop: '8px'
                }}>
                    (may take up to 45 seconds)
                </div>

            </div>
                    )}

                    {/* Spinner — only show when connecting, not on failure */}
                    {connectionStatus !== 'failed' && (
                        <div style={{
                            width: '80px',
                            height: '80px',
                            border: '8px solid rgba(98,185,90,0.3)',
                            borderTop: '8px solid #62b95a',
                            marginTop: '36px',
                            borderRadius: '50%',
                            animation: 'spin 1.2s linear infinite'
                        }} />
                    )}
                </div>
            )}

            {/* === GAME CONTAINER === */}           
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
                        onFocus={() => { 
                            setIsChatFocused(true);
                            // if (gameRef.current) gameRef.current.input.keyboard.enabled = false;
                            if (gameRef.current) {
                                gameRef.current.input.keyboard.enabled = false;

                                // Stop player if they're moving (in case keys are held or touch joystick active)
                                const scene = sceneRef.current;
                                if (scene && scene.player) {
                                    scene.player.body.setVelocityX(0);
                                    // if (scene.anims.exists('idle')) {
                                    //     scene.player.anims.play('idle', true);
                                    // }
                                    scene.player.playAll('idle');
                                }
                                scene.resetActionKeys();
                                // Reset mobile joystick state
                                if (scene && scene.mobileControls) {
                                    scene.touchLeft = false;
                                    scene.touchRight = false;
                                }
                            }
                        }}
                        onBlur={() => {
                            setIsChatFocused(false);
                            if (gameRef.current) gameRef.current.input.keyboard.enabled = true;
                        }}
                        placeholder={isChatFocused ? 'Type message… (Enter to send)' : 'Press Enter to chat & send'}
                        onKeyDown={(e) => handleChatKeyDown(e)}
                        style={{
                            backgroundColor: isChatFocused ? 'rgba(0,0,0,0.95)' : 'rgba(0,0,0,0.42)',
                            backdropFilter: 'blur(12px)',
                            border: isChatFocused ? '2px solid #ffff00' : '2px solid rgba(255,255,255,0.3)',
                            borderRadius: '12px',
                            padding: '14px 20px',
                            fontSize: '16px',
                            fontFamily: '-apple-system, monospace',
                            color: '#ffff00',
                            width: '300px',
                            outline: 'none',
                            boxShadow: isChatFocused
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

export default MZTGame;