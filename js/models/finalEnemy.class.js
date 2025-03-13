
class FinalEnemy extends MovableObject {
    
    /** @type {number} The width and the height of the final enemy. */
    width = 500;
    height = 500;
    
    /** @type {boolean} Indicates whether the final enemy is alive. */
    isAlive = true;

    /** @type {Object} The offset values for the final enemy. */
    offset = {
        offsetY: 2,
        offsetX: 2,
        offsetZ: 2,
    };

    /** @type {string[]} Array of image paths for the introduction animation. */
    IMAGES_INTRODUCE = [
        "img/2.Enemy/3 Final Enemy/1.Introduce/1.png",
        "img/2.Enemy/3 Final Enemy/1.Introduce/2.png",
        "img/2.Enemy/3 Final Enemy/1.Introduce/3.png",
        "img/2.Enemy/3 Final Enemy/1.Introduce/4.png",
        "img/2.Enemy/3 Final Enemy/1.Introduce/5.png",
        "img/2.Enemy/3 Final Enemy/1.Introduce/6.png",
        "img/2.Enemy/3 Final Enemy/1.Introduce/7.png",
        "img/2.Enemy/3 Final Enemy/1.Introduce/8.png",
        "img/2.Enemy/3 Final Enemy/1.Introduce/9.png",
        "img/2.Enemy/3 Final Enemy/1.Introduce/10.png"
    ];

    /** @type {string[]} Array of image paths for the swimming animation. */
    IMAGES_SWIMM = [
        "img/2.Enemy/3 Final Enemy/2.floating/1.png",
        "img/2.Enemy/3 Final Enemy/2.floating/2.png",
        "img/2.Enemy/3 Final Enemy/2.floating/3.png",
        "img/2.Enemy/3 Final Enemy/2.floating/4.png",
        "img/2.Enemy/3 Final Enemy/2.floating/5.png",
        "img/2.Enemy/3 Final Enemy/2.floating/6.png",
        "img/2.Enemy/3 Final Enemy/2.floating/7.png",
        "img/2.Enemy/3 Final Enemy/2.floating/8.png",
        "img/2.Enemy/3 Final Enemy/2.floating/9.png",
        "img/2.Enemy/3 Final Enemy/2.floating/10.png",
        "img/2.Enemy/3 Final Enemy/2.floating/11.png",
        "img/2.Enemy/3 Final Enemy/2.floating/12.png",
        "img/2.Enemy/3 Final Enemy/2.floating/13.png"
    ];

    /** @type {string[]} Array of image paths for the attack animation. */
    IMAGES_ATTACK = [
        "img/2.Enemy/3 Final Enemy/Attack/1.png",
        "img/2.Enemy/3 Final Enemy/Attack/2.png",
        "img/2.Enemy/3 Final Enemy/Attack/3.png",
        "img/2.Enemy/3 Final Enemy/Attack/4.png",
        "img/2.Enemy/3 Final Enemy/Attack/5.png",
        "img/2.Enemy/3 Final Enemy/Attack/6.png"
    ];

    /** @type {string[]} Array of image paths for the hurt animation. */
    IMAGES_HURT = [
        "img/2.Enemy/3 Final Enemy/Hurt/1.png",
        "img/2.Enemy/3 Final Enemy/Hurt/2.png",
        "img/2.Enemy/3 Final Enemy/Hurt/3.png",
        "img/2.Enemy/3 Final Enemy/Hurt/4.png"
    ];

    /** @type {string[]} Array of image paths for the dead animation. */
    IMAGES_DEAD = [
        "img/2.Enemy/3 Final Enemy/Dead/Mesa de trabajo 2 copia 6.png",
        "img/2.Enemy/3 Final Enemy/Dead/Mesa de trabajo 2 copia 7.png",
        "img/2.Enemy/3 Final Enemy/Dead/Mesa de trabajo 2 copia 8.png",
        "img/2.Enemy/3 Final Enemy/Dead/Mesa de trabajo 2 copia 9.png",
        "img/2.Enemy/3 Final Enemy/Dead/Mesa de trabajo 2 copia 10.png"
    ];

    /** @type {object} Reference to the game world. */
    world;

    /** @type {number} Index of the current image being displayed. */
    currentImage = 0;

    /** @type {number} Interval ID for the swimming animation. */
    swimmIntervalId = null;

    /**
     * Constructs a new FinalEnemy object and initializes its properties.
     */
    constructor() {
        super().loadImage('img/2.Enemy/3 Final Enemy/1.Introduce/1.png');
        this.hitCount = 0;
        this.loadImages(this.IMAGES_INTRODUCE);
        this.loadImages(this.IMAGES_SWIMM);
        this.loadImages(this.IMAGES_ATTACK);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_DEAD);
        this.x = 1680;
        this.y = 10;
    }

    /**
     * Animates the final enemy by introducing it and then initiating its behavior.
     */
    animate() {
        this.finalEnemyIsIntroduced();
        setTimeout(() => {
            this.swimmIntervalId = setInterval(() => {
                if (this.collisionsCount === 5) {
                    this.deadFinalEnemy();
                } else {
                    this.finalEnemyIsHurt();
                }
            }, 800);
        }, 200);
    }

    /**
     * Moves the final enemy and plays its swimming animation.
     */
    movementFinalEnemy() {
        setInterval(() => {
            this.playAnimation(this.IMAGES_INTRODUCE);
            this.playAnimation(this.IMAGES_SWIMM);
        }, 140);
    }

    /**
     * Plays the final enemy's attack animation and moves it left.
     */
    finalEnemyIsAttacking() {
        this.attackInterval = setInterval(() => {
            this.playAnimation(this.IMAGES_ATTACK);
            this.swimmLeft();
        }, 200);
    }

    /**
     * Plays the final enemy's hurt animation if it has been hit.
     */
    finalEnemyIsHurt() {
        setInterval(() => {
            if (this.hitCount >= 1 && this.hitCount <= 4) {
                console.log('FinalEnemy is Hurt');
                this.playAnimation(this.IMAGES_HURT);
            }
        }, 200);
    }

    /**
     * Plays the final enemy's dead animation and stops all other animations.
     * @param {Function} [callback] - Optional callback function to execute after the animation ends.
     */
    deadFinalEnemy(callback) {
        const animationInterval = setInterval(() => {
            if (this.isHurt()) {
                this.playAnimation(this.IMAGES_DEAD);
                clearInterval(this.swimmIntervalId);
                clearInterval(this.attackInterval);
                clearInterval(this.swimmLeftInterval);
                this.isAlive = false;
            } else {
                clearInterval(animationInterval);
                if (typeof callback === 'function') {
                    callback();
                }
            }
        }, 80);
        this.hitCount = 0;
    }

    /**
     * Introduces the final enemy by playing its introduction animation.
     */
    introducing() {
        if (!this.introduced) {
            this.introduced = true;
            let currentIndex = 0;
            const intervalId = setInterval(() => {
                if (currentIndex < this.IMAGES_INTRODUCE.length) {
                    this.loadImage(this.IMAGES_INTRODUCE[currentIndex]);
                    currentIndex++;
                } else {
                    clearInterval(intervalId);
                }
            }, 2000);
        }
    }

    /**
     * Plays the introduction animation for the final enemy and starts its swimming behavior.
     */
    finalEnemyIsIntroduced() {
        if (!this.introduceFinalEnemy) {
            console.log('introducing');
            this.interduceEnemyAnimation(this.IMAGES_INTRODUCE);
            setTimeout(() => {
                this.swimm();
                this.swimmLeft();
            }, this.IMAGES_INTRODUCE.length * 400);
        }
    }

    /**
     * Plays the swimming animation for the final enemy.
     */
    swimm() {
        this.swimmIntervalId = setInterval(() => {
            this.playAnimation(this.IMAGES_SWIMM);
        }, 140);
    }

    /**
     * Checks if the final enemy is still alive.
     * @returns {boolean} True if the final enemy is alive, otherwise false.
     */
    isAlive() {
        return this.hitCount <= 4;
    }

}