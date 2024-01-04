class InputHandler {
    constructor() {
        document.addEventListener("keydown", (event) => {
            switch (event.keyCode) {
                case 32:
                    game.jump = true;
                    break;
                default:
                    break;
            }
        });
        document.addEventListener("keyup", (event) => {
            switch (event.keyCode) {
                case 32:
                    game.jump = false;
                    if (game.gamestate === GAMESTATE.MENU) {
                        game.start()
                    }
                    break;
                default:
                    break;
            }
        });
    }
}

const GAMESTATE = {
    MENU: 0,
    RUNNING: 1,
    GAMEOVER: 2,
};

function increase() {
    game.score += 0.1
    if (game.score > game.accelerationStepSize * game.accelerationSteps) {
        game.accelerationSteps += 1
        game.accelerationFactor *= game.accelerationSlowdownFactor
        game.timeStep *= (1 - game.accelerationFactor)
        console.log(game.timeStep)
    }
}

function detectCollision(a, b) {
    return !(
        ((a.position.y + a.height - a.hitboxPadding.y) < (b.position.y + b.hitboxPadding.y)) ||
        ((a.position.y + a.hitboxPadding.y) > (b.position.y + b.height - b.hitboxPadding.y)) ||
        ((a.position.x + a.width - a.hitboxPadding.x) < b.position.x + b.hitboxPadding.x) ||
        (a.position.x + a.hitboxPadding.x > (b.position.x + b.width - b.hitboxPadding.x))
    );
}

class Egg {
    constructor(game, position) {
        this.game = game;
        this.image = document.getElementById("egg");
        this.position = position;
        this.width = this.game.tileSize;
        this.height = this.game.tileSize;
        this.position.y -= this.height;
        this.markedForDeletion = false;
        this.hitboxPadding = {
            x: 16,
            y: 4
        }
    }

    update() {
        this.position.x -= game.speed;
        if (this.position.x + this.width <= 0) {
            this.markedForDeletion = true;
        }
        if (detectCollision(this, game.player)) {
            this.image = document.getElementById("angry")
            game.gamestate = GAMESTATE.GAMEOVER
        }
    }

    draw(ctx) {
        ctx.drawImage(
            this.image,
            this.position.x,
            this.position.y,
            this.width,
            this.height
        );
    }
}

class BigEgg {
    constructor(game, position) {
        this.game = game;
        this.image = document.getElementById("bigEgg");
        this.position = position;
        this.width = this.game.tileSize;
        this.height = this.game.tileSize * 2;
        this.position.y -= this.height;
        this.markedForDeletion = false;
        this.hitboxPadding = {
            x: 16,
            y: 4
        }
    }

    update() {
        this.position.x -= game.speed;
        if (this.position.x + this.width <= 0) {
            this.markedForDeletion = true;
        }
        if (detectCollision(this, game.player)) {
            game.gamestate = GAMESTATE.GAMEOVER
        }
    }

    draw(ctx) {
        ctx.drawImage(
            this.image,
            this.position.x,
            this.position.y,
            this.width,
            this.height
        );
    }
}

class Nest {
    constructor(game, position) {
        this.game = game;
        this.image = document.getElementById("nest");
        this.position = position;
        this.width = 2 * this.game.tileSize;
        this.height = this.game.tileSize;
        this.position.y -= this.height;
        this.markedForDeletion = false;
        this.hitboxPadding = {
            x: 16,
            y: 4
        }
    }

    update() {
        this.position.x -= game.speed;
        if (this.position.x + this.width <= 0) {
            this.markedForDeletion = true;
        }
        if (detectCollision(this, game.player)) {
            game.gamestate = GAMESTATE.GAMEOVER
        }
    }

    draw(ctx) {
        ctx.drawImage(
            this.image,
            this.position.x,
            this.position.y,
            this.width,
            this.height
        );
    }
}

class Bird {
    constructor(game, position) {
        this.game = game;
        this.image2 = document.getElementById("bird2");
        this.image1 = document.getElementById("bird1");
        this.image = document.getElementById("bird1");
        this.position = position;
        this.width = this.game.tileSize;
        this.height = this.game.tileSize;
        this.position.y -= this.height;
        this.markedForDeletion = false;
        this.hitboxPadding = {
            x: 8,
            y: 8
        }
    }

    update() {
        this.position.x -= game.speed;
        if (this.position.x + this.width <= 0) {
            this.markedForDeletion = true;
        }
        if (detectCollision(this, game.player)) {
            game.gamestate = GAMESTATE.GAMEOVER;
        }
    }

    draw(ctx) {
        if (Date.now() % 500 > 250) {
            this.image = this.image1;
        }
        else {
            this.image = this.image2;
        }
        ctx.drawImage(
            this.image,
            this.position.x,
            this.position.y,
            this.width,
            this.height
        );
    }
}

class Player {
    constructor(game) {
        this.game = game;
        this.image = document.getElementById("eagel");
        this.width = this.game.playerSize;
        this.height = this.game.playerSize;
        this.position = { x: game.playerX, y: game.groundHeight - this.height }
        this.velocity = 0;
        this.hitboxPadding = {
            x: 5,
            y: 5
        }
        this.angle = 0
    }

    update() {
        if (game.jump && this.position.y == game.groundHeight - this.height) {
            this.velocity = game.jumpVelocity
            this.position.y -= this.velocity
            this.velocity += game.gravity * game.speed
            this.angle -= game.speed * 0.3
        }
        else if (this.position.y < game.groundHeight - this.height) {
            this.position.y -= this.velocity
            this.velocity += game.gravity * game.speed
            this.angle -= game.speed * 0.3
        }
        else {
            this.position.y = game.groundHeight - this.height
            this.velocity = 0
            this.angle -= game.speed * 0.6
        }
    }

    draw(ctx) {
        ctx.save(); // Save the current state of the context
        ctx.translate(this.position.x + this.width / 2, this.position.y + this.height / 2); // Move the rotation point to the center of the image
        ctx.rotate((-this.angle * Math.PI) / 180); // Rotate by 70 degrees
        ctx.drawImage(
            this.image,
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height
        );
        ctx.restore()
        //ctx.rect(this.position.x + this.hitboxPadding.x, this.position.y + this.hitboxPadding.y, this.position.x + this.width - this.hitboxPadding.x, this.position.y + this.height - this.hitboxPadding.y);
    }
}

class Chicken {
    constructor(game) {
        this.game = game;
        this.image1 = document.getElementById("chicken1");
        this.image2 = document.getElementById("chicken2");
        this.image = document.getElementById("chicken1");
        this.width = this.game.chickenSize;
        this.height = this.game.chickenSize;
        this.position = { x: game.gameWidth - this.width - game.chickenX, y: game.groundHeight - this.height }
    }
    update() {
    }
    draw(ctx) {
        if (Date.now() % 500 > 250) {
            this.image = this.image1;
        }
        else {
            this.image = this.image2;
        }
        ctx.drawImage(
            this.image,
            this.position.x,
            this.position.y,
            this.width,
            this.height
        );
    }
}

class Game {
    constructor(gameWidth, gameHeight) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.gamestate = GAMESTATE.MENU;
        new InputHandler();
        this.speed = 4;
        this.tileSize = 64;
        this.playerSize = 64;
        this.chickenSize = 64;
        this.groundHeight = this.gameHeight * 0.75;
        this.playerX = 2 * this.tileSize
        this.chickenX = 2 * this.tileSize
        this.jumpVelocity = 10
        this.gravity = -.065
        this.gameObjects = [];
        this.obstacles = [];
        this.timeStep = 10;
        this.accelerationStepSize = 50;
        this.accelerationSlowdownFactor = .95;
        this.chicken = null;
        this.birdNext = false;
    }

    start() {
        if (
            this.gamestate === GAMESTATE.RUNNING
        ) {
            return;
        }
        this.gameObjects = [];
        this.time = 0
        this.jump = false;
        this.obstacles = [];
        this.nextObstacle = 5 * this.tileSize;
        this.gamestate = GAMESTATE.RUNNING;
        this.player = new Player(game)
        this.chicken = new Chicken(game)
        this.gameObjects.push(this.player)
        this.gameObjects.push(this.chicken)
        this.timeStep = 10;
        this.accelerationSteps = 1;
        this.score = 0;
        this.accelerationFactor = .075;
        this.offset = 0;
        this.birdNext = false;
    }

    update(timeLeft) {
        let timeLeftGame = timeLeft
        if (
            this.gamestate !== GAMESTATE.RUNNING
        ) {
            return 0;
        }
        while (timeLeftGame >= this.timeStep) {
            if (
                this.gamestate !== GAMESTATE.RUNNING
            ) {
                return 0;
            }
            this.offset = (this.offset - this.speed + this.gameWidth) % this.gameWidth
            this.gameObjects.forEach((object) =>
                object.update()
            );
            this.obstacles = this.obstacles.filter((obstacle) => !obstacle.markedForDeletion);
            this.nextObstacle -= this.speed;
            let birdDistance = 5 + 4 / this.accelerationSteps;
            if (this.nextObstacle <= 0) {
                this.nextObstacle = (Math.floor(Math.random() * (20 / game.accelerationSteps + 4)) + 5) * this.tileSize;
                if (this.birdNext) this.nextObstacle += this.tileSize
                if (Math.random() < .1) { // 1/10 chance for small pause
                    this.nextObstacle += 7 * this.tileSize
                }
                else if (Math.random() < .2) { // additional 1/5 chance for min distance
                    this.nextObstacle = 5 * this.tileSize
                }
                let rand = Math.random() - 1.5 / game.accelerationSteps
                let obstacle
                let position = {
                    x: this.chicken.position.x,
                    y: game.groundHeight
                };
                if (rand > .75 && !this.birdNext) {
                    obstacle = new BigEgg(game, position);
                }
                else if (rand > .5) {
                    obstacle = new Nest(game, position);
                }
                else {
                    obstacle = new Egg(game, position);
                }
                this.nextObstacle += obstacle.width / this.tileSize
                this.obstacles.push(obstacle);
                this.gameObjects.push(obstacle);
                this.birdNext = false;
            }
            else if ((this.nextObstacle <= birdDistance * this.tileSize) && (this.nextObstacle + this.speed >= birdDistance * this.tileSize)) {
                if (Math.random() > 1 / this.accelerationSteps + .7) {
                    let position = {
                        x: this.chicken.position.x + 3 * this.tileSize,
                        y: game.groundHeight - 2 * this.tileSize
                    }
                    let bird = new Bird(game, position);
                    this.obstacles.push(bird);
                    this.gameObjects.push(bird);
                    this.birdNext = true;
                }
            }
            increase()
            timeLeftGame -= this.timeStep
        }
        return timeLeftGame;
    }

    draw(ctx) {
        ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        var bg = document.getElementById("bg");
        ctx.drawImage(bg, this.offset, 0);
        ctx.drawImage(bg, this.offset - this.gameWidth, 0);
        this.gameObjects.forEach((object) => object.draw(ctx));
        if (this.chicken)
            this.chicken.draw(ctx)
        ctx.font = "bold 60px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "left";
        ctx.fillText(Math.round(game.score), 10, 55);

        if (this.gamestate === GAMESTATE.MENU) {
            ctx.rect(0, 0, this.gameWidth, this.gameHeight);
            ctx.fillStyle = "rgb(0, 0, 0)";
            ctx.fill();

            ctx.font = "bold 50px Arial";
            ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
            ctx.textAlign = "center";
            ctx.fillText(
                "Klicke, um zu starten",
                this.gameWidth / 2,
                this.gameHeight / 2 + 20
            );
        }
        if (this.gamestate === GAMESTATE.GAMEOVER) {
            ctx.rect(0, 0, this.gameWidth, this.gameHeight);
            ctx.fillStyle = "rgb(0, 0, 0, 0.5)";
            ctx.fill();

            ctx.font = "bold 50px Arial";
            ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
            ctx.textAlign = "center";
            ctx.fillText(
                "Game Over",
                this.gameWidth / 2,
                this.gameHeight / 2 - 20
            );
            ctx.font = "25px Arial";
            ctx.fillText(
                "Du hast " + Math.round(this.score) + " Punkte",
                this.gameWidth / 2,
                this.gameHeight / 2 + 20
            );
        }
    }
}

//#region init
let canvas = document.getElementById("gameScreen");
let ctx = canvas.getContext("2d");

const GAME_WIDTH = 1280;
const GAME_HEIGHT = 640;

let game = new Game(GAME_WIDTH, GAME_HEIGHT);

game.draw(ctx);

var fullScreenCanvas = document.querySelector('canvas');

function fullScreen() {
    var el = document.getElementById('gameScreen')
    if (el.webkitRequestFullScreen) {
        el.webkitRequestFullScreen();
    }
    else {
        el.mozRequestFullScreen();
    }
}

function click(evt) {
    evt.preventDefault()
    if (game.gamestate === GAMESTATE.RUNNING) {
        game.jump = true
    }
    else {
        game.start();
    }
}

function released(evt) {
    evt.preventDefault()
    game.jump = false
}

function moved(evt, canvas) {

}

fullScreenCanvas.addEventListener("mousedown", click);
fullScreenCanvas.addEventListener("mouseup", released);
fullScreenCanvas.addEventListener("touchstart", click);
fullScreenCanvas.addEventListener("touchend", released);
fullScreenCanvas.addEventListener("mousemove", function (evt) { moved(evt, fullScreenCanvas) });

var lastTime = 0;
var timeLeft = 0;
var oldGamestate = GAMESTATE.RUNNING;
//#endregion

function gameLoop(timestamp) {
    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    timeLeft += deltaTime

    if (oldGamestate !== game.gamestate) {
        oldGamestate = game.gamestate;
        game.draw(ctx);
        timeLeft = 0;
    }

    if (game.gamestate === GAMESTATE.RUNNING) {
        timeLeft = game.update(timeLeft);
        game.draw(ctx);
    }

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);