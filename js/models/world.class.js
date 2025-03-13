class World{

  
        level = level1;
        character = new Character();
        finalEnemy = new FinalEnemy();
        coin = new Coin();
        jellyFish = new JellyFish();
        pufferFish = new PufferFish();
        canvas;
        ctx;
        keyboard;
        camera_x = 0;
        statusBarCoin = new StatusBarCoin(coinPercentage);
        statusBarPoison = new StatusBarPoison();
        statusBarLife = new StatusBarLife();
        screenWin = new ScreenWin();
        screenLose = new ScreenLose();
        screenStart = new ScreenStart();
        throwBubble = [];
        throwPoisonBubble = [];
        poisonBubbles = [];
        remainingEnemies = [];


      /**
     * Constructs a new GameWorld instance.
     * @param {HTMLCanvasElement} canvas - The canvas element used for rendering the game.
     * @param {object} keyboard - The keyboard object used for handling user input.
     * @param {number} coinPercentage - The initial percentage of the coin status.
     */
    constructor(canvas, keyboard, coinPercentage){
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.coinPercentage = coinPercentage;
        this.collisionsCount = 0;
        this.draw();
        this.setWorld();
        this.checkCollisions();
     
    }
 
        /**
     * Sets the game world context for the character and final enemy.
     */

    setWorld(){
        this.character.world = this;
        this.finalEnemy.world =this;
    }
     
    /**
     * Adds the images to the canvas (backgrounds and objects)
     */
    draw(){
       
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.translate(this.camera_x, 0);      
        this.addObjectsToMap(this.level.backgroundObjects);
        this.addObjectsToMap(this.level.enemies);
        this.addObjectsToMap(this.level.coins);
        this.addObjectsToMap(this.level.poisons);
        this.ctx.translate(-this.camera_x, 0);
        //-----space for fixed objects-----//      
        this.addToMap(this.statusBarCoin);
        this.addToMap(this.statusBarLife);
        this.addToMap(this.statusBarPoison);   
        this.addToMap(this.screenWin);  
        this.addToMap(this.screenLose);   
        this.addToMap(this.screenStart);   
        this.ctx.translate(this.camera_x, 0);       
        this.addObjectsToMap(this.throwBubble);      
        this.addObjectsToMap(this.throwPoisonBubble);
        this.addToMap(this.character);        
        this.ctx.translate(-this.camera_x, 0);
        self = this;
        requestAnimationFrame(function (){
            self.draw();//das Wort this funktioniert hier nicht. Deshalb muss das Wort this als Variable übergeben werden. self = this. 
        } );
     
    }

    /**
     * Adds multiple objects to the game map.
     * @param {DrawableObject[]} objects - An array of objects to be added to the map.
     */
    addObjectsToMap(objects) {
        objects.forEach(o => {
            this.addToMap(o);
        });
    }

    /**
     * Adds a single object to the game map.
     * @param {DrawableObject} mo - The object to be added to the map.
     * @private
     */
    addToMap(mo) {
        if (mo.otherDirection) {
            this.flipImage(mo);
        }
        mo.draw(this.ctx);
        if (mo.otherDirection) {
            this.flipImageBack(mo);
        }
    }

    /**
     * turns the image of the character to the left.
     * @param {mo} mo - movable object
     */
    flipImage(mo){
        this.ctx.save();
        this.ctx.translate(mo.width, 0);
        this.ctx.scale(-1, 1);
        mo.x = mo.x * - 1;  
    }

    /**
     * turns the image of the character back to right.
     * @param {mo} mo - movable object
     */
    flipImageBack(mo){
        mo.x = mo.x * - 1;
        this.ctx.restore();
    }

    /**
     * Idntifies Collisions every period of time
     */
    checkCollisions(){
        setInterval(() => {
            this.checkCollisionsWithEnemies();
            this.throwBubbles();
            this.throwPoisonBubbles();
            this.checkCollisionWithBubble();
            this.checkCollisionsWithCoins();
            this.checkCollisionsWithPoisons();
            this.checkFinalEnemyAttack();        
            if(!this.finalEnemyApproaching){
                this.checkApprochingFinalEnemy();              
            }  
        }, 200);
    }
   
     /**
     * Checks if the Character is colliding with enemies
     */    
    checkCollisionsWithEnemies() {
        this.level.enemies.forEach((enemy) => {
            if (this.character.isColliding(enemy)) {
                this.character.hit();
                this.statusBarLife.setPercentage(this.character.energy);
                // console.log('collision with character, energy', this.character.energy);
            }            
            if (enemy instanceof JellyFish && this.character.isColliding(enemy)) {
                // console.log('collision with JellyFish, energy', this.character.energy);
                this.collidedEnemyType = 'jellyfish';
            }
            
            if (enemy instanceof PufferFish && this.character.isColliding(enemy)) {
                // console.log('collision with PufferFish, energy', this.character.energy);
                this.collidedEnemyType = 'pufferfish';
            }  
            if (enemy instanceof FinalEnemy && this.character.isColliding(enemy)) {
                // console.log('collision with FINALENEMY, energy', this.character.energy);
                this.collidedEnemyType = 'finalenemy';
            }  
        });
    }   

     /**
     * Checks keyboard SPACE and throw the bubble corresponding to the coordinates to the character. 
     * this.character.x + 165, this.character.y + 100 =  adjusts the position of the bubbles 
     */
    throwBubbles() {
        if (this.character.isAlive()) {
            let bubble;
            if (this.keyboard.SPACE) {
                if (this.character.otherDirection) {
                    bubble = new ThrowBubble(this.character.x - 35, this.character.y + 100, true);
                } else {
                    bubble = new ThrowBubble(this.character.x + 165, this.character.y + 100, false);
                }
                this.throwBubble.push(bubble);
            }
        }
    }

    /**
     * Throws a poison bubble if the character is alive, the 'D' key is pressed, and there is sufficient poison in the status bar.
     * @returns {void}
     */
    throwPoisonBubbles() {
        if (this.character.isAlive() && this.keyboard.D && this.statusBarPoison.percentage > 0) {
            this.createPoisonBubble();
            this.updateStatusBar();
        }
    }

    /**
     * Creates a new poison bubble and adds it to the list of thrown poison bubbles.
     * @returns {void}
     */
    createPoisonBubble() {
        let poisonBubble;
        if (this.character.otherDirection) {
            poisonBubble = new ThrowPoisonBubble(this.character.x - 35, this.character.y + 100, true);
        } else {
            poisonBubble = new ThrowPoisonBubble(this.character.x + 165, this.character.y + 100, false);
        }      
        this.throwPoisonBubble.push(poisonBubble);
    }

    /**
     * Updates the poison status bar by reducing its percentage and removing the oldest poison bubble if any exist.
     * @returns {void}
     */
    updateStatusBar() {
        const newPercentage = Math.max(0, this.statusBarPoison.percentage - 20);
        this.statusBarPoison.setPercentage(newPercentage);
        if (this.poisonBubbles.length > 0) {
            this.poisonBubbles.splice(0, 1);                 
        }
    }
       
    /**
     * Detects collisions between bubbles and enemies and adds the indices of collided bubbles to the provided array.
     * @param {number[]} bubblesToRemove - Array to store the indices of collided bubbles.
     */
    detectCollisions(bubblesToRemove) {
        this.throwPoisonBubble.forEach((poisonBubble, poisonBubbleIndex) => {
            if (this.level.enemies.some(enemy => enemy instanceof FinalEnemy && enemy.isColliding(poisonBubble))) {
                this.handleFinalEnemyCollision(poisonBubbleIndex, bubblesToRemove);
            }    
        });
            this.throwBubble.forEach((bubble, bubbleIndex) => {
            this.level.enemies.forEach((enemy, enemyIndex) => {
                if (enemy.isColliding(bubble)) {
                    this.handleCollision(enemy, enemyIndex, bubbleIndex, bubblesToRemove);
                }
            });
        });
    }

    /**
     * Handles the collision between a poison bubble and the FinalEnemy.
     * If the number of collisions reaches 5, it triggers the FinalEnemy's death sequence.
     * Adds the index of the poison bubble to the `bubblesToRemove` array.
     * 
     * @param {number} poisonBubbleIndex - The index of the poison bubble in the `throwPoisonBubble` array.
     * @param {Array<number>} bubblesToRemove - An array to which the indices of bubbles to be removed will be pushed.
     * @returns {void}
     */
    handleFinalEnemyCollision(poisonBubbleIndex, bubblesToRemove) {
        const finalEnemy = this.level.enemies.find(enemy => enemy instanceof FinalEnemy); 
        this.count(poisonBubbleIndex);
        console.log('Number of collisions between FinalEnemy and poison bubbles:', this.collisionsCount);
        if (this.collisionsCount === 5) {
            finalEnemy.deadFinalEnemy(() => {
                this.handleFinalEnemyDead();
            });
        }
        bubblesToRemove.push(poisonBubbleIndex);
    }

    /**
     * Increments the collision count and updates the FinalEnemy's hit count when a poison bubble hits it.
     * 
     * @param {number} poisonBubbleIndex - The index of the poison bubble in the `throwPoisonBubble` array.
     * @returns {void}
     */
    count(poisonBubbleIndex) {
        if (this.finalEnemyApproaching) {
            const finalEnemy = this.level.enemies.find(enemy => enemy instanceof FinalEnemy);  
            finalEnemy.hit(poisonBubbleIndex); 
            this.collisionsCount++;
            finalEnemy.hitCount++;
        }
    }

    /**
     * Checks for collisions between thrown bubbles and enemies.
     * Handles the collision logic for both poison bubbles and regular bubbles.
     * Removes the bubbles that have collided from the arrays.
     * 
     * @returns {void}
     */
    checkCollisionWithBubble() {
        const bubblesToRemove = [];        
        
        // Check collision for poison bubbles
        this.throwPoisonBubble.forEach((poisonBubble, poisonBubbleIndex) => {
            if (this.level.enemies.some(enemy => enemy instanceof FinalEnemy && enemy.isColliding(poisonBubble))) {
                this.handleFinalEnemyCollision(poisonBubbleIndex, bubblesToRemove);
            }
        });    

        // Check collision for regular bubbles
        this.throwBubble.forEach((bubble, bubbleIndex) => {
            this.level.enemies.forEach((enemy, enemyIndex) => {
                if (enemy.isColliding(bubble)) {
                    this.handleCollision(enemy, enemyIndex, bubbleIndex, bubblesToRemove);
                }
            });
        });    

        this.removeCollidedBubbles(bubblesToRemove);   
    }
  
    /**
     * Handles collision between a bubble and an enemy, applying appropriate actions (as like removals) and updating removal array.
     * @param {Enemy} enemy - The enemy involved in the collision.
     * @param {number} enemyIndex - The index of the enemy in the enemies array.
     * @param {number} bubbleIndex - The index of the bubble involved in the collision.
     * @param {number[]} bubblesToRemove - Array storing indices of collided bubbles.
    */
    handleCollision(enemy, enemyIndex, bubbleIndex, bubblesToRemove) {
        enemy.hit();
        bubblesToRemove.push(bubbleIndex);
        if (enemy instanceof JellyFish) {
            enemy.deadJellyFish(() => {
                this.removeEnemy(enemyIndex);
            });
        } else if (enemy instanceof PufferFish) {
            enemy.deadPufferFish(() => {
                this.removeEnemy(enemyIndex);
            });
        } 
    }
    
    /**
     * Removes an enemy from the enemies array.
     * @param {number} enemyIndex - The index of the enemy to be removed.
    */
    removeEnemy(enemyIndex) {
        this.level.enemies.splice(enemyIndex, 1);
    }
    
    /**
     * Removes collided bubbles from the throwBubble array.
     * @param {number[]} bubblesToRemove - Array containing indices of collided bubbles.
     */
    removeCollidedBubbles(bubblesToRemove) {
        bubblesToRemove.forEach((index) => {
            this.throwBubble.splice(index, 1);
            this.throwPoisonBubble.splice(index, 1);
        });
    }

    /**
     * This function check the collision between an coin and the character
     * 
     * @param {string} coin This is the coin you want to check
     * @param {*} i This is the index of the coin
     */
    checkCollisionsWithCoins() {
        for (let i = 0; i < this.level.coins.length; i++) {
            const coin = this.level.coins[i];
            if (this.character.isColliding(coin) && this.statusBarCoin.percentage < 100) {
                this.statusBarCoin.setPercentage(Math.min(100, this.statusBarCoin.percentage + 20)); 
                this.level.coins.splice(i, 1);
            }
        }
    }

    /**
     * This function check the collision between an poison and the character
     * 
     * @param {string} poison This poison the coin you want to check
     * @param {*} i This is the index of the poison
     */
     checkCollisionsWithPoisons() {
        for (let i = 0; i < this.level.poisons.length; i++) {
            let poison = this.level.poisons[i];
            if (this.character.isColliding(poison) && this.statusBarPoison.percentage < 100) {
                this.statusBarPoison.setPercentage(Math.min(100, this.statusBarPoison.percentage + 20));
                this.level.poisons.splice(i, 1); 
                let poisonBubble = new ThrowPoisonBubble(this.character.x, this.character.y, this.character.otherDirection);
                this.poisonBubbles.push(poisonBubble);
                console.log(this.poisonBubbles);
            }
        }
    }

    /**
     * Checks if the FinalEnemy is approaching the character and initiates the FinalEnemy's animation if it is.
     * The FinalEnemy is considered to be approaching if its x-coordinate is within 500 units of the character's x-coordinate.
     * 
     * @returns {void}
     */
    checkApprochingFinalEnemy() {
        const finalEnemy = this.level.enemies.find(enemy => enemy instanceof FinalEnemy);
        
        if (finalEnemy && this.character.isAlive()) {
            if (finalEnemy.x - this.character.x < 500) {
                this.finalEnemy.finalEnemyApproaching = true;
                console.log('final enemy is approaching');
                finalEnemy.animate();
            }
        }
    }

    /**
     * Displays the winning screen by animating it.
     * 
     * @returns {void}
     */
    showWinningScreen() {
        this.screenWin.animate();
    }

    /**
     * Displays the losing screen by animating it and then checks the character's status after 3 seconds.
     * 
     * @returns {void}
     */
    showLosingScreen() {
        this.screenLose.animate();
        setTimeout(() => {
            this.character.checkCharacterStatus();
        }, 3000); 
    }

    /**
     * Handles the FinalEnemy's death sequence and shows the winning screen.
     * Animates the character with winning images and then shows the winning screen.
     * 
     * @returns {void}
     */
    handleFinalEnemyDead() {     
        let currentIndex = 0;
        const animationInterval = 90;
        const animationIntervalId = setInterval(() => {
            this.character.playAnimation([this.character.IMAGES_WINNING[currentIndex]]);
            currentIndex++;
            if (currentIndex >= this.character.IMAGES_WINNING.length) {
                clearInterval(animationIntervalId);                
                this.showWinningScreen();
                const finalEnemy = this.level.enemies.find(enemy => enemy instanceof FinalEnemy);
                finalEnemy.deadFinalEnemy();
            }
        }, animationInterval);
    }

    /**
     * Checks if the FinalEnemy is attacking and triggers the FinalEnemy's attack animation if it is within 400 units of the character.
     * Also handles the character's response to the attack and the resetting of the FinalEnemy if the character is not alive.
     * 
     * @returns {void}
     */
    checkFinalEnemyAttack() {        
        const finalEnemy = this.level.enemies.find(enemy => enemy instanceof FinalEnemy);
        if (finalEnemy && finalEnemy.isAlive && this.character.isAlive()) { 
            if (finalEnemy.x - this.character.x < 400) {
                finalEnemy.finalEnemyIsAttacking();
                console.log("attack character");        
                this.character.attackFinalEnemy(() => {
                    this.showWinningScreen();
                });
            }      }         
        // } else if (!this.character.isAlive() && showStartScreen() && showTryAgainScreen()) {
        //     finalEnemy.reset();
        // }       
    }

}