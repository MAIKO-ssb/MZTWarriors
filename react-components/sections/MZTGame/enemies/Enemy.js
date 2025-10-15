// Enemy.js
class Enemy {
    constructor(scene, x, y) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, 'enemy');
        if (this.sprite) {
            this.sprite.setScale(0.2);
            this.sprite.setCollideWorldBounds(true);
            this.sprite.setDepth(2);

            // Add physics collisions with platforms
            scene.physics.add.collider(this.sprite, scene.platforms);

            // Enemy state
            this.sprite.isAlive = true;
            this.sprite.patrolSpeed = 70;

            // Movement setup
            this.sprite.setVelocityX(this.sprite.patrolSpeed);
            this.sprite.flipX = false;

            // Adjust hitbox size
            this.sprite.body.setSize(this.sprite.width, this.sprite.height);

            // Debugging: show body
            this.sprite.body.debugShowBody = true;
            
            console.log(
                'Enemy created at x:', this.sprite.x,
                'y:', this.sprite.y,
                'body size:', this.sprite.body.width, this.sprite.body.height
            );
        }
    }

    update() {
        if (this.sprite && this.sprite.isAlive) {
            const enemyBody = this.sprite.body;
            if (enemyBody.velocity.x === 0) {
                this.sprite.patrolSpeed *= -1;
                this.sprite.setVelocityX(this.sprite.patrolSpeed);
            } else if ((this.sprite.patrolSpeed > 0 && enemyBody.blocked.right) ||
                       (this.sprite.patrolSpeed < 0 && enemyBody.blocked.left)) {
                this.sprite.patrolSpeed *= -1;
                this.sprite.setVelocityX(this.sprite.patrolSpeed);
            }
            this.sprite.flipX = (enemyBody.velocity.x < 0);
        }
    }

    destroy() {
        if (this.sprite && this.sprite.isAlive) {
            this.sprite.destroy();
            this.sprite = null;
        }
    }
}

export default Enemy;