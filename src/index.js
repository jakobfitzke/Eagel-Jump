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
    game.score += 0.2
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
        this.width = this.game.eggSize;
        this.height = this.game.eggSize;
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
        this.angle -= game.speed / 2
        if (game.jump && this.position.y == game.groundHeight - this.height) {
            this.velocity = game.jumpVelocity
            this.position.y -= this.velocity
            this.velocity += game.gravity
        }
        else if (this.position.y < game.groundHeight - this.height) {
            this.position.y -= this.velocity
            this.velocity += game.gravity
        }
        else {
            this.position.y = game.groundHeight - this.height
            this.velocity = 0
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
        this.image = document.getElementById("chicken");
        this.width = this.game.chickenSize;
        this.height = this.game.chickenSize;
        this.position = { x: game.gameWidth - this.width - game.chickenX, y: game.groundHeight - this.height }
    }
    update() {
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

class Game {
    constructor(gameWidth, gameHeight) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.gamestate = GAMESTATE.MENU;
        new InputHandler();
        this.speed = 10;
        this.eggSize = 64;
        this.playerSize = 64;
        this.chickenSize = 64;
        this.groundHeight = this.gameHeight * 0.75;
        this.playerX = this.gameWidth * 0.1
        this.chickenX = this.gameWidth * 0.1
        this.jumpVelocity = 20
        this.gravity = -1
        this.gameObjects = [];
        this.jumpHeight = 128;
        this.jumpLength = 128;
        this.timeStep = 25;
        this.accelerationStepSize = 50;
        this.accelerationSlowdownFactor = .95;
        this.chicken = null
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
        this.eggs = [];
        this.nextEgg = 5 * this.eggSize;
        this.gamestate = GAMESTATE.RUNNING;
        this.player = new Player(game)
        this.chicken = new Chicken(game)
        this.gameObjects.push(this.player)
        this.timeStep = 25;
        this.accelerationSteps = 1;
        this.score = 0;
        this.accelerationFactor = .1;
        this.offset = 0
    }

    update(timeLeft) {
        let timeLeftGame = timeLeft
        if (
            this.gamestate === GAMESTATE.MENU || this.gamestate === GAMESTATE.GAMEOVER
        ) {
            return 0;
        }
        this.offset = (this.offset - this.speed / 2 + this.gameWidth) % this.gameWidth
        while (timeLeftGame >= this.timeStep) {
            this.gameObjects.forEach((object) =>
                object.update()
            );

            this.eggs = this.eggs.filter((egg) => !egg.markedForDeletion);
            this.nextEgg -= this.speed;
            if (this.nextEgg <= 0) {
                this.nextEgg = (Math.floor(Math.random() * 10) + 6) * this.eggSize;
                let position = {
                    x: this.chicken.position.x,
                    y: game.groundHeight - this.eggSize
                };
                let egg = new Egg(game, position);
                this.eggs.push(egg);
                this.gameObjects.push(egg);
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

function gameLoop(timestamp) {
    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    timeLeft += deltaTime

    timeLeft = game.update(timeLeft);
    game.draw(ctx);

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
//#endregion