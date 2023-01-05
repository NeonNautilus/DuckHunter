$(function() {
    document.body.style.cursor = 'url(crosshair.cur), auto';
    
    // Set up background image
    var backgroundImage = new Image();
    backgroundImage.src = "background.png";
    
    // Set up duck image
    var duckImage = new Image();
    duckImage.src = "duck.png";
    
    // Set up start button image
    var startButtonImage = new Image();
    startButtonImage.src = "start-game.png";
    
    // Set up gun image
    var cursorImage = new Image();
    cursorImage.src = "gun.png";
    
    // set up audio
    var noAmmo = new Audio("empty.mp3");
    var fireAmmo = new Audio("gunshot.mp3");
    var missedAudio = new Audio("duckQuack.mp3");
    var quack = new Audio("anotherQuack.mp3");

  // all assets
    var assets = [
      "background.png",
      "duck.png",
      "start-game.png",
      "empty.mp3",
      "gunshot.mp3",
      "duckQauck.mp3",
      "anotherQuack.mp3"
    ];

    // Duck movement patterns
    var movementPatterns = ["straight", "zigzag"];
    var currentMovementPattern = "straight";

    // Set up canvas
    var canvas = $("#game")[0];
    canvas.width = window.innerWidth - 100;
    canvas.height = window.innerHeight - 100;
    var ctx = canvas.getContext("2d");
    var width = canvas.width;
    var height = canvas.height;

    // Initialize game variables
    var score = 0;
    var duckX = -50;
    var duckY = Math.random() * (height - 300);
    var speed = 3;
    var missed = 0;
    var ammo = 10;
    var gameStarted = false;
    var gameOver = false;
    var cursorX = 0;
    var cursorY = 0;
    var isPlaying = false;
    var assetsLoaded = 0;
    var ducks = [];
    
    // Set up the padding for the HUD elements
    const padding = 50;
    
    // Load all the assets
    assets.forEach(function(asset) {
        if (asset.endsWith(".png") || asset.endsWith(".jpg")) {
            // asset is an image
            var img = new Image();
            img.onload = function() {
                assetsLoaded++;
            };
            img.src = asset;
        } else if (asset.endsWith(".mp3") || asset.endsWith(".wav")) {
            // asset is an audio file
            var audio = new Audio();
            audio.oncanplaythrough = function() {
                assetsLoaded++;
            };
            audio.src = asset;
        }
    });

    // Check all assets have been loaded
    function checkIfAssetsLoaded() {
        if (assetsLoaded === assets.length) {
            // all assets have been loaded
            console.log("Everything loaded");
            drawStartButton();
        } else {
            // not all assets have been loaded
            setTimeout(checkIfAssetsLoaded, 100); // check again in 100ms
        }
    }
    checkIfAssetsLoaded();
    
    // Set up the background color for the HUD
    ctx.fillStyle = 'black';
    
    // Set up the radius for the curved corners of the HUD elements
    const radius = 10;
    
    // Define a function to draw a rounded rectangle on the canvas
    function drawRect(x, y, width, height) {
        ctx.fillRect(x, y, width, height);
    }
    
    // Show background
    backgroundImage.onload = function() {
        drawBackground();
    };
    
    // Draw background image on canvas
    function drawBackground() {
        ctx.drawImage(backgroundImage, 0, 0, width, height);
    }
    
    // Draw start button on canvas
    function drawStartButton() {
        var x = (width - startButtonImage.width) / 2;
        var y = (height - startButtonImage.height) / 2;
        ctx.drawImage(startButtonImage, x, y);
    }
    
    // Draw duck on canvas
    function spawnDuck() {
        // Randomly determine the number of ducks to spawn
        var numDucks = Math.floor(Math.random() * (score / 4)) + 1;
        
        if (numDucks <= 0) {
            numDucks = 1
        }
    
        // Spawn the ducks
        for (var i = 0; i < numDucks; i++) {
            // Set the movement pattern for the duck
            var movementPattern = movementPatterns[Math.floor(Math.random() * movementPatterns.length)];

            // Create the duck object
            var duck = {
                x: -50, // set the x position for the duck
                y: Math.random() * (height - 300), // set the y position for the duck
                movementPattern: movementPattern, // set the movement pattern for the duck
                image: duckImage, // set the image for the duck
                width: 50, // set the width of the duck
                height: 50, // set the height of the duck
                speed: Math.floor(Math.random() * 5) - 2 + speed, // set the speed of the duck
            };
            ducks.push(duck);
        }
    }

    function drawDucks() {
        ducks.forEach(function(duck) {
            ctx.drawImage(duck.image, duck.x, duck.y, duck.width, duck.height);
        });
    }

    function updateDucks() {
      ducks.forEach(function(duck) {
        // Update the position of the duck based on its movement pattern
        if (duck.movementPattern === "straight") {
            duck.x += duck.speed;
        } else if (duck.movementPattern === "zigzag") {
            duck.x += duck.speed;
            duck.y += Math.sin(duck.x / 50) * 3;
        }

        // If the duck goes off the canvas, remove it from the array
        if (duck.x > canvas.width || duck.y > canvas.height) {
            ducks.splice(ducks.indexOf(duck), 1);
            missedAudio.play();
            missed++;
            if (missed > 5) {
                gameOver = true;
            }
        }
      });
    }

    // Change the movement pattern of the ducks
    function changeMovementPattern() {
        // update all the ducks movement patterns
        ducks.forEach(function(duck) {
            duck.movementPattern = movementPatterns[Math.floor(Math.random() * movementPatterns.length)];;
        });

        setTimeout(changeMovementPattern, 2000);
    }

    // Draw the gun and rotate
    function drawCursor() {
        var angle = (cursorX - width / 2) / (width / 2); // calculate angle based on mouse x-coordinate
        angle = angle * Math.PI / 4; // convert to radians and scale
        ctx.translate(cursorX, cursorY); // translate to bottom center of canvas
        ctx.rotate(angle); // rotate canvas
        ctx.drawImage(cursorImage, -cursorImage.width / 2, -cursorImage.height / 2); // draw image centered on canvas
        ctx.rotate(-angle); // rotate canvas back
        ctx.translate(-cursorX, -cursorY); // translate back
    }


    // Draw other game elements on top of background
    function drawGameElements() {
        drawDucks();
        updateDucks();
    }

    // Draw the HUD
    function drawHUD() {
        ctx.font = "20px Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";

        // Draw the ammo count and score on the left and right sides of the canvas, respectively
        drawRect(0, canvas.height - padding, canvas.width / 2, padding * 2);
        drawRect(canvas.width / 2, canvas.height - padding, canvas.width / 2, padding * 2);
        // Draw the score above the missed counter on the right side of the canvas
        drawRect(canvas.width / 2, canvas.height - padding * 2, canvas.width / 2, padding * 2);
        // Use the fillText method to draw the text for the ammo count, score, and missed counter
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('Ammo: ' + ammo, canvas.width / 4, canvas.height - (padding / 2) - 10);
        ctx.textAlign = 'right';
        ctx.fillText('Score: ' + score, canvas.width * 3 / 4, canvas.height - ((padding / 2) * 2) - 20);
        ctx.fillText('Missed: ' + missed, canvas.width * 3 / 4, canvas.height - (padding / 2) - 10);
        ctx.fillText('Speed: ' + speed, 150, 50);
        ctx.fillText('Move: ' + currentMovementPattern, 150, 100);
    }

    // Shoot the gun
    function shoot(e) {
        if (ammo > 0) {
            var mouseX = e.offsetX;
            var mouseY = e.offsetY;

            ducks.forEach(function(duck, index) {
                if (mouseX >= duck.x && mouseX <= duck.x + duck.width && mouseY >= duck.y && mouseY <= duck.y + duck.height) {
                    score++;
                    speed = speed * 1.05;   
                    quack.play();
                    ducks.splice(index, 1);
                    ctx.clearRect(0, 0, width, height);
                    if (ducks.length === 0) {
                        spawnDuck();
                    }
                }
            });
            
            ammo--;
            fireAmmo.play();
        } else {
            noAmmo.play();
        }
    }
    
    // Main game loop
    function update() {
        ctx.clearRect(0, 0, width, height);
        drawBackground();
        drawHUD();
        if (gameOver) {
            ctx.font = "40px Arial";
            ctx.fillStyle = "red";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("Game Over!", width / 2, height / 2);
            ctx.font = "20px Arial";
            ctx.fillStyle = "blue";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("Restart", width / 2, height / 2 + 50);
            gameStarted = false;
        } else {
            drawGameElements();
            drawCursor();
        }
    }
    
    // Handle mouse clicks
    $("#game").mousedown(function(e) {
        if (gameStarted) {
            shoot(e)
        }
    });
    
    // Handle start button clicks
    $("#game").mouseup(function(e) {
        if (!gameStarted && !gameOver) {
            var x = e.offsetX;
            var y = e.offsetY;
            var startButtonX = (width - startButtonImage.width) / 2;
            var startButtonY = (height - startButtonImage.height) / 2;
            if (x > startButtonX && x < startButtonX + startButtonImage.width && y > startButtonY && y < startButtonY + startButtonImage.height) {
                console.log("Start button clicked!");
                setInterval(update, 1000 / 60);
                gameStarted = true;
                changeMovementPattern();
                spawnDuck()
                setInterval(spawnDuck, Math.random() * 1000 + 2000);
            }
        } else if (gameOver) {
            var x = e.offsetX;
            var y = e.offsetY;
            if (x > width / 2 - 50 && x < width / 2 + 50 && y > height / 2 + 30 && y < height / 2 + 70) {
                console.log("Restart button clicked!");
                score = 0;
                speed = 3;
                missed = 0;
                ammo = 10;
                duckX = Math.random() * (width - 50);
                duckY = Math.random() * (height - 300);
                gameOver = false;
                gameStarted = true;
                ducks = [];
            }
        }
    });
    
    $(document).keydown(function(e) {
        if (e.keyCode == 82) { // "R" key
            ammo = 10;
        }
    });
    
    $("#game").mousemove(function(e) {
        cursorX = e.offsetX;
        cursorY = e.offsetY;
    });

});
