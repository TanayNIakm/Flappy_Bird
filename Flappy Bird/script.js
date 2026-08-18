const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");


const uiLayer = document.getElementById("ui-layer");
const menuTitle = document.getElementById("menu-title");
const scoreDisplay = document.getElementById("score-display");
const highScoreDisplay = document.getElementById("high-score-display");
const startBtn = document.getElementById("start-btn");
const menuBtn = document.getElementById("menu-btn");
const devBtn = document.getElementById("dev-btn");
const closeDevBtn = document.getElementById("close-dev-btn");
const congratsMsg = document.getElementById("congrats-msg"); 


let frames = 0;
let score = 0;
let highScore = localStorage.getItem("flappyHighScore") || 0;
let gameState = "MENU"; 
let isDevMode = false; 
let congratsTimeout; 


const bird = {
    x: 50,
    y: 150,
    width: 20,
    height: 20,
    gravity: 0.25,
    velocity: 0,
    jumpForce: -4.5,

    draw: function() {
        ctx.fillStyle = isDevMode ? "#9b59b6" : "#f1c40f"; 
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.fillStyle = "#000";
        ctx.fillRect(this.x + 12, this.y + 4, 4, 4); 
    },

    update: function() {
        this.velocity += this.gravity;
        this.y += this.velocity;

        if (this.y + this.height >= canvas.height - 20) {
            this.y = canvas.height - 20 - this.height;
            if (!isDevMode) {
                triggerGameOver();
            }
        }

        if (this.y < 0) {
            this.y = 0;
            this.velocity = 0;
        }
    },

    flap: function() {
        this.velocity = this.jumpForce;
    }
};


const pipes = {
    items: [],
    width: 40,
    gap: 110,
    speed: 2,

    draw: function() {
        for (let i = 0; i < this.items.length; i++) {
            let p = this.items[i];
            ctx.fillStyle = isDevMode ? "#e74c3c" : "#2ecc71"; 
            
            ctx.fillRect(p.x, 0, this.width, p.top);
            let bottomY = p.top + this.gap;
            ctx.fillRect(p.x, bottomY, this.width, canvas.height - bottomY - 20);
        }
    },

    update: function() {
        if (frames % 100 === 0) {
            let minPipeHeight = 30;
            let maxPipeHeight = canvas.height - this.gap - 20 - 30; 
            let topHeight = Math.random() * (maxPipeHeight - minPipeHeight) + minPipeHeight;
            this.items.push({ x: canvas.width, top: topHeight, passed: false });
        }

        for (let i = 0; i < this.items.length; i++) {
            let p = this.items[i];
            p.x -= this.speed;

            if (!isDevMode) {
                if (bird.x < p.x + this.width && bird.x + bird.width > p.x && bird.y < p.top) {
                    triggerGameOver();
                }
                if (bird.x < p.x + this.width && bird.x + bird.width > p.x && bird.y + bird.height > p.top + this.gap) {
                    triggerGameOver();
                }
            }

            if (p.x + this.width < bird.x && !p.passed) {
                score++;
                p.passed = true;
            }

            if (p.x + this.width < 0) {
                this.items.shift();
                i--;
            }
        }
    },
    reset: function() { this.items = []; }
};

function drawGround() {
    ctx.fillStyle = "#ded895";
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
    ctx.fillStyle = "#73bf2e"; 
    ctx.fillRect(0, canvas.height - 25, canvas.width, 5);
}

function drawScore() {
    if (gameState === "PLAYING") {
        ctx.fillStyle = "#fff";
        ctx.font = "bold 30px Arial";
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 3;
        ctx.strokeText(score, canvas.width / 2 - 10, 50);
        ctx.fillText(score, canvas.width / 2 - 10, 50);
    }
}


devBtn.addEventListener("click", function() {
    let password = prompt("Enter Developer Password:");
    if (password === "admin") {
        isDevMode = true;
        devBtn.classList.add("hidden"); 
        closeDevBtn.classList.remove("hidden"); 
        alert("Developer Mode Activated! You Are Invincible.");
    } else if (password !== null) {
        alert("You Are Not Developer. Access Denied.");
    }
});

closeDevBtn.addEventListener("click", function() {
    isDevMode = false;
    closeDevBtn.classList.add("hidden"); 
    
    if (gameState === "MENU") {
        devBtn.classList.remove("hidden"); 
    }
    alert("Developer Mode Deactivated.");
});

function showMainMenu() {
    gameState = "MENU";
    bird.y = 150;
    pipes.reset();

    menuTitle.innerText = "Flappy Bird";
    
    highScoreDisplay.innerText = "Highest Score: " + highScore;
    highScoreDisplay.classList.remove("hidden");
    scoreDisplay.classList.add("hidden");
    
  
    congratsMsg.classList.add("hidden");
    clearTimeout(congratsTimeout);
    
    startBtn.innerText = "Play";
    menuBtn.classList.add("hidden"); 
    
    if (!isDevMode) {
        devBtn.classList.remove("hidden");
    }
    
    uiLayer.classList.remove("hidden");
}

function triggerGameOver() {
    gameState = "GAME_OVER";
    
    let isNewHighScore = false;
    
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("flappyHighScore", highScore);
        isNewHighScore = true;
    }
    
    menuTitle.innerText = "Game Over!";
    scoreDisplay.innerText = "Score: " + score;
    scoreDisplay.classList.remove("hidden");
    highScoreDisplay.classList.add("hidden");
    
   
    if (isNewHighScore && score > 0) {
        congratsMsg.classList.remove("hidden");
        
        
        clearTimeout(congratsTimeout); 
        congratsTimeout = setTimeout(function() {
            congratsMsg.classList.add("hidden");
        }, 5000);
    } else {
        congratsMsg.classList.add("hidden");
    }
    
    startBtn.innerText = "Restart";
    menuBtn.classList.remove("hidden"); 
    
    devBtn.classList.add("hidden");
    
    uiLayer.classList.remove("hidden");
}

function startGame() {
    bird.y = 150;
    bird.velocity = 0;
    pipes.reset();
    score = 0;
    frames = 0;
    
    gameState = "PLAYING";
    
    uiLayer.classList.add("hidden");
    devBtn.classList.add("hidden");
    
    
    congratsMsg.classList.add("hidden");
    clearTimeout(congratsTimeout);
    
    bird.flap();
}

startBtn.addEventListener("click", startGame);
menuBtn.addEventListener("click", showMainMenu);

function triggerFlap() {
    if (gameState === "PLAYING") {
        bird.flap();
    }
}

document.addEventListener("keydown", function(e) {
    if (e.code === "Space") {
        e.preventDefault(); 
        if (gameState !== "PLAYING") {
            startGame(); 
        } else {
            triggerFlap();
        }
    }
});

canvas.addEventListener("mousedown", function(e) {
    if (e.target !== closeDevBtn && e.target !== devBtn) {
        triggerFlap();
    }
});

canvas.addEventListener("touchstart", function(e) {
    if (gameState === "PLAYING" && e.target !== closeDevBtn && e.target !== devBtn) {
        e.preventDefault(); 
        triggerFlap();
    }
}, {passive: false});

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    bird.draw();
    pipes.draw();
    drawGround();
    drawScore();

    if (gameState === "PLAYING") {
        bird.update();
        pipes.update();
        frames++;
    }

    requestAnimationFrame(loop);
}

showMainMenu();
loop();