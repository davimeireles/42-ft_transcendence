function initialize3DPong() {
    // Get the dimensions of the home-games div
    const homeGamesDiv = document.getElementById("home-games");
    gameButton = document.getElementById("gamesDropdown");
    profileButton = document.getElementById("profile-button")
    settingsButton = document.getElementById("setting-button")
    tournamentButton = document.getElementById("tournament-button")
  
    profileButton.style.display = "none";
    gameButton.style.display = "none";
    settingsButton.style.display = "none";
    tournamentButton.style.display = "none";

    const width = homeGamesDiv.clientWidth;
    const height = homeGamesDiv.clientHeight;

    // Scene, Camera, and Renderer
    const pongScene = new THREE.Scene();
    const pongCamera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const pongRenderer = new THREE.WebGLRenderer({ antialias: true });
    pongRenderer.setClearColor(0x000000); // Black background
    pongRenderer.setSize(width, height);
    pongRenderer.domElement.style.position = 'absolute';
    pongRenderer.domElement.style.left = '50%';
    pongRenderer.domElement.style.top = '50%';
    pongRenderer.domElement.style.transform = 'translate(-50%, -50%)';
    pongRenderer.shadowMap.enabled = true; // Enable shadows
    pongRenderer.shadowMap.type = THREE.PCFSoftShadowMap; // Smoother shadows
    homeGamesDiv.appendChild(pongRenderer.domElement);

    // Game Over Flag
    let gameOver = false;

    // Score to Win
    const scoreToWin = 3;

    // Create a win message element
    let winMessage = document.getElementById("win-message");
    if (!winMessage) {
      winMessage = document.createElement("div");
      winMessage.id = "win-message";
      winMessage.style.display = "none"; // Initially hidden
      winMessage.style.position = "absolute";
      winMessage.style.top = "50%";
      winMessage.style.left = "50%";
      winMessage.style.transform = "translate(-50%, -50%)";
      winMessage.style.zIndex = "1000"; // Ensure it's above the 3D canvas
      winMessage.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
      winMessage.style.color = "white";
      winMessage.style.padding = "20px";
      winMessage.style.fontSize = "24px";
      winMessage.style.textAlign = "center";
      homeGamesDiv.appendChild(winMessage); // Append to homeGamesDiv
    }

    // Dynamically handle resizing
    window.addEventListener("resize", () => {
        const newWidth = homeGamesDiv.clientWidth;
        const newHeight = homeGamesDiv.clientHeight;
      
        pongRenderer.setSize(newWidth, newHeight);
        pongCamera.aspect = newWidth / newHeight;
        pongCamera.updateProjectionMatrix();
      
        // Update the position of the renderer
        pongRenderer.domElement.style.left = '50%';
        pongRenderer.domElement.style.top = '50%';
      });

    // Adjust camera position for depth perspective
    pongCamera.position.set(0, 20, 30); // Further back and higher
    pongCamera.lookAt(0, 0, 0);

    // Lighting - Enhanced
    const ambientLight = new THREE.AmbientLight(0x333333); // Softer ambient light
    pongScene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7); // Slightly dimmer
    directionalLight.position.set(5, 10, 10);
    directionalLight.castShadow = true; // Enable shadow casting

    directionalLight.shadow.mapSize.width = 2048; // Increase shadow map size
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;

    pongScene.add(directionalLight);

    // Add a spotlight for dramatic effect
    const spotlight = new THREE.SpotLight(0xffffff, 0.8);
    spotlight.position.set(0, 25, 0);
    spotlight.angle = Math.PI / 4;
    spotlight.penumbra = 0.05;
    spotlight.decay = 2;
    spotlight.distance = 40;
    spotlight.castShadow = true;
    pongScene.add(spotlight);

    // Playing field - Upgraded
    const fieldWidth = 16;    // Reduced width
    const fieldDepth = 40;    // Increased depth
    const fieldThickness = 1; // Thicker field

    const fieldGeometry = new THREE.BoxGeometry(fieldWidth, fieldThickness, fieldDepth);
    const fieldMaterial = new THREE.MeshPhongMaterial({
      color: 0x003366,
      shininess: 30,
    }); // Darker blue with shine
    const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
    field.position.set(0, -0.5, 0); // Lower the field slightly
    field.receiveShadow = true; // Receive shadows
    pongScene.add(field);

    // Walls - Enhanced appearance
    const wallHeight = 4; // Higher walls
    const wallThickness = 0.5;
    const wallMaterial = new THREE.MeshPhongMaterial({
      color: 0x222222,
      shininess: 50,
    }); // Darker, shinier walls

    const leftWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, wallHeight, fieldDepth),
      wallMaterial
    );
    leftWall.position.set(-fieldWidth / 2, wallHeight / 2 - 1, 0); // Adjusted position
    leftWall.castShadow = true; // Cast shadows
    leftWall.receiveShadow = true; // Receive shadows
    pongScene.add(leftWall);

    const rightWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, wallHeight, fieldDepth),
      wallMaterial
    );
    rightWall.position.set(fieldWidth / 2, wallHeight / 2 - 1, 0); // Adjusted position
    rightWall.castShadow = true; // Cast shadows
    rightWall.receiveShadow = true; // Receive shadows
    pongScene.add(rightWall);

    // Paddles - Sleek design
    const paddleWidth = 3;
    const paddleHeight = 0.5;
    const paddleDepth = 0.5; // Deeper paddles

    const paddleMaterial1 = new THREE.MeshPhongMaterial({
      color: 0x0077cc,
      shininess: 70,
    }); // Brighter blue, shinier
    const paddle1 = new THREE.Mesh(
      new THREE.BoxGeometry(paddleWidth, paddleHeight, paddleDepth),
      paddleMaterial1
    );
    paddle1.position.set(0, paddleHeight / 2, -18); // Top paddle
    paddle1.castShadow = true; // Cast shadows
    paddle1.receiveShadow = true; // Receive shadows
    pongScene.add(paddle1);

    const paddleMaterial2 = new THREE.MeshPhongMaterial({
      color: 0xcc3300,
      shininess: 70,
    }); // Brighter red, shinier
    const paddle2 = new THREE.Mesh(
      new THREE.BoxGeometry(paddleWidth, paddleHeight, paddleDepth),
      paddleMaterial2
    );
    paddle2.position.set(0, paddleHeight / 2, 19); // Bottom paddle
    paddle2.castShadow = true; // Cast shadows
    paddle2.receiveShadow = true; // Receive shadows
    pongScene.add(paddle2);

    // Ball - Glowing effect
    const ballRadius = 0.5;
    const ballMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      emissive: 0x333333,
    }); // Glowing effect
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(ballRadius, 32, 32),
      ballMaterial
    );
    ball.position.set(0, ballRadius, 0);
    ball.castShadow = true; // Cast shadows
    pongScene.add(ball);

    // Ball movement - Randomized start
    const initialBallSpeed = 0.50; // Increased speed
    let ballSpeedX = 0;
    let ballSpeedZ = 0;

    //Scores
    let player1Score = 0; // Blue paddle
    let player2Score = 0; // Red paddle

    // Display scores - Stylized
    const scoreDisplay = document.createElement("div");
    scoreDisplay.style.position = "absolute";
    scoreDisplay.style.top = "20px";
    scoreDisplay.style.left = "50%";
    scoreDisplay.style.transform = "translateX(-50%)";
    scoreDisplay.style.color = "#eee";
    scoreDisplay.style.fontSize = "28px";
    scoreDisplay.style.fontFamily = "Helvetica, sans-serif";
    scoreDisplay.style.textShadow = "2px 2px 4px rgba(0,0,0,0.5)";
    scoreDisplay.style.zIndex = "1000"; // Ensure it's above the 3D canvas
    homeGamesDiv.appendChild(scoreDisplay);

    function updateScoreDisplay() {
        scoreDisplay.textContent = `Red: ${player1Score} | Blue: ${player2Score}`;
    }
    updateScoreDisplay();


    // Paddle movement
    const paddleSpeed = 0.5; // Increased speed
    const keys = {}; // Track key presses

    document.addEventListener("keydown", (event) => {
      keys[event.key] = true;
    });

    document.addEventListener("keyup", (event) => {
      keys[event.key] = false;
    });

    function updatePaddles()
    {
        const paddleLimitX = (fieldWidth / 2 - paddleWidth / 2) - 0.5;

        // Paddle 1 (Blue, Top)
        if (keys["a"] && paddle1.position.x > -paddleLimitX) {
            paddle1.position.x -= paddleSpeed;
        }
        if (keys["d"] && paddle1.position.x < paddleLimitX) {
            paddle1.position.x += paddleSpeed;
        }

        // Paddle 2 (Red, Bottom)
        if (keys["ArrowLeft"] && paddle2.position.x > -paddleLimitX) {
            paddle2.position.x -= paddleSpeed;
        }
        if (keys["ArrowRight"] && paddle2.position.x < paddleLimitX) {
            paddle2.position.x += paddleSpeed;
        }
    }


    async function updateBall() {
      if (gameOver)
        return;

      ball.position.x += ballSpeedX;
      ball.position.z += ballSpeedZ;

      // Ball collision with walls
      if (
        ball.position.x > fieldWidth / 2 - (ballRadius + 0.5) ||
        ball.position.x < -fieldWidth / 2 + (ballRadius + 0.5)
      ) {
        ballSpeedX = -ballSpeedX;
      }

      if (
        ball.position.z < paddle1.position.z + paddleDepth * 1.5 &&
        ball.position.z > paddle1.position.z - paddleDepth / 2 &&
        ball.position.x > paddle1.position.x - paddleWidth / 2 &&
        ball.position.x < paddle1.position.x + paddleWidth / 2
    ) {
        ballSpeedZ = Math.abs(ballSpeedZ);
    
        // Adjust ballSpeedX based on where the ball hits the paddle
        const hitPosition = (ball.position.x - paddle1.position.x) / (paddleWidth / 2);
        ballSpeedX = hitPosition * initialBallSpeed;
    }
    
    // Ball collision with red paddle (bottom)
    if (
        ball.position.z > paddle2.position.z - paddleDepth * 1.5 &&
        ball.position.z < paddle2.position.z + paddleDepth / 2 &&
        ball.position.x > paddle2.position.x - paddleWidth / 2 &&
        ball.position.x < paddle2.position.x + paddleWidth / 2
    ) {
        ballSpeedZ = -Math.abs(ballSpeedZ);
    
        // Adjust ballSpeedX based on where the ball hits the paddle
        const hitPosition = (ball.position.x - paddle2.position.x) / (paddleWidth / 2);
        ballSpeedX = hitPosition * initialBallSpeed;
    }

      // Check if the ball goes out of bounds (goal)
      if (ball.position.z > fieldDepth / 2 + ballRadius) {
        player2Score++; // Blue player scores
        resetBall();
      } else if (ball.position.z < -fieldDepth / 2 - ballRadius) {
        player1Score++; // Red player scores
        resetBall();
      }

      // Check for win condition
      if ((player1Score >= scoreToWin || player2Score >= scoreToWin) && !gameOver) {
          gameOver = true;
      
          const session_user = JSON.parse(localStorage.getItem('sessionUser'))
      
          let winner;
      
          if (player1Score >= 3)
              winner = session_user.username
          else
              winner = 'LocalPlayer'
      
      
          const data = {
              game_type_id: 3,
              match_winner: winner,
              p1_score: player1Score,
              p2_score: player2Score,
              p1_username: session_user.username,
              p2_username: 'LocalPlayer',
          };
      
          try {
              const response = await fetch("http://localhost:8000/get_match_details/", {
                  method: "POST",
                  headers: { "Content-Type": "application/json",
                              "Authorization": `Bearer ${localStorage.getItem('access_token')}`},
                  body: JSON.stringify(data),
                  credentials: "include",
              });
              if (response.ok) {
                  console.log("Match details sent successfully");
              }
          } catch (error) {
              console.error('Error:', error);
          }
          displayWinMessage();
        }
    }

    function resetBall() {
        ball.position.set(0, ballRadius, 0); // Reset ball position
    
        // Set the ball's initial direction to only move vertically
        ballSpeedX = (Math.random() > 0.5 ? 1 : -1) * initialBallSpeed * Math.random();
        ballSpeedZ = (Math.random() > 0.5 ? 1 : -1) * initialBallSpeed;
    
        updateScoreDisplay();
    }

    function displayWinMessage() {
        const winMessage = document.getElementById("win-message");
        winMessage.innerHTML = ""; // Clear existing content

        let winnerText = "";
        if (player1Score >= scoreToWin) {
            winnerText = `Red Wins!`;
        } else {
            winnerText = `Blue Wins!`;
        }

        const winnerAnnouncement = document.createElement("div");
        winnerAnnouncement.textContent = winnerText;
        winMessage.appendChild(winnerAnnouncement);

        // Create "Play Again" button
        const playAgainButton = document.createElement("button");
        playAgainButton.textContent = "Play Again";
        playAgainButton.addEventListener("click", resetGame);
        winMessage.appendChild(playAgainButton);

        // Create "Exit to Home" button
        const exitHomeButton = document.createElement("button");
        exitHomeButton.textContent = "Exit to Home";
        exitHomeButton.addEventListener("click", exitToHome);
        winMessage.appendChild(exitHomeButton);

        winMessage.style.display = "block";
    }

    function exitToHome() {
        window.location.href = "/home"; // Redirect to the home page
    }

    function resetGame() {
        gameOver = false;
        player1Score = 0;
        player2Score = 0;

        // Reset ball position and speed
        resetBall();

        // Hide win message
        const winMessage = document.getElementById("win-message");
        winMessage.style.display = "none";

        // Restart the animation loop
        animate();
    }

    // Start the game by initializing the ball's direction
    resetBall();

    // Animation loop
    function animate() {
        if (!gameOver) {
            requestAnimationFrame(animate);
        }

        updatePaddles();
        updateBall();

        pongRenderer.render(pongScene, pongCamera);
    }

    animate();
}