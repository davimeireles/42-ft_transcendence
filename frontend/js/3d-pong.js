function initialize3DPong() {
    // Get the dimensions of the home-games div
    const homeGamesDiv = document.getElementById("home-games");
    const width = homeGamesDiv.clientWidth;
    const height = homeGamesDiv.clientHeight;
  
    // Scene, Camera, and Renderer
    const pongScene = new THREE.Scene();
    const pongCamera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const pongRenderer = new THREE.WebGLRenderer({ antialias: true });
    pongRenderer.setClearColor(0x151314);
    pongRenderer.setSize(width, height);
    homeGamesDiv.appendChild(pongRenderer.domElement);
    pongRenderer.domElement.style.marginTop = "-100px";
  
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
    });
  
    // Adjust camera position for depth perspective
    pongCamera.position.set(0, 15, 15);
    pongCamera.lookAt(0, 0, 0);
  
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    pongScene.add(ambientLight);
  
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 10, 10);
    pongScene.add(directionalLight);
  
    // Playing field
    const fieldGeometry = new THREE.PlaneGeometry(12, 20);
    const fieldMaterial = new THREE.MeshPhongMaterial({ color: 0x0055ff }); // Blue field
    const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
    field.rotation.x = -Math.PI / 2;
    field.position.set(0, 0, 0);
    pongScene.add(field);
  
    // Walls
    const wallHeight = 2;
    const wallThickness = 0.5;
    const wallMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff }); // White walls
  
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallHeight, 20), wallMaterial);
    leftWall.position.set(-6, wallHeight / 2, 0); // Left wall
    pongScene.add(leftWall);
  
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallHeight, 20), wallMaterial);
    rightWall.position.set(6, wallHeight / 2, 0); // Right wall
    pongScene.add(rightWall);
  
    // Paddles
    const paddleWidth = 3;
    const paddleHeight = 0.5;
    const paddleDepth = 0.5;
  
    const paddleMaterial1 = new THREE.MeshPhongMaterial({ color: 0x0000ff }); // Blue paddle
    const paddle1 = new THREE.Mesh(
      new THREE.BoxGeometry(paddleWidth, paddleHeight, paddleDepth),
      paddleMaterial1
    );
    paddle1.position.set(0, paddleHeight / 2, -8.5); // Top paddle
    pongScene.add(paddle1);
  
    const paddleMaterial2 = new THREE.MeshPhongMaterial({ color: 0xff0000 }); // Red paddle
    const paddle2 = new THREE.Mesh(
      new THREE.BoxGeometry(paddleWidth, paddleHeight, paddleDepth),
      paddleMaterial2
    );
    paddle2.position.set(0, paddleHeight / 2, 8.5); // Bottom paddle
    pongScene.add(paddle2);
  
    // Ball
    const ballRadius = 0.5;
    const ballMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff }); // White ball
    const ball = new THREE.Mesh(new THREE.SphereGeometry(ballRadius, 32, 32), ballMaterial);
    ball.position.set(0, ballRadius, 0);
    pongScene.add(ball);
  
    // Ball movement
    const initialBallSpeedX = 0.08;
    const initialBallSpeedZ = 0.1;
    let ballSpeedX = initialBallSpeedX;
    let ballSpeedZ = initialBallSpeedZ;
  
    // Scores
    let player1Score = 0; // Blue paddle
    let player2Score = 0; // Red paddle
  
    // Display scores
    const scoreDisplay = document.createElement("div");
    scoreDisplay.style.position = "absolute";
    scoreDisplay.style.top = "10px";
    scoreDisplay.style.left = "50%";
    scoreDisplay.style.transform = "translateX(-50%)";
    scoreDisplay.style.color = "white";
    scoreDisplay.style.fontSize = "24px";
    scoreDisplay.style.fontFamily = "Arial, sans-serif";
    homeGamesDiv.appendChild(scoreDisplay); //Append scoreDisplay to homeGamesDiv
  
    function updateScoreDisplay() {
      scoreDisplay.textContent = `Blue: ${player1Score} | Red: ${player2Score}`;
    }
    updateScoreDisplay();
  
    // Paddle movement
    const paddleSpeed = 0.3;
    const keys = {}; // Track key presses
  
    document.addEventListener("keydown", (event) => {
      keys[event.key] = true;
    });
  
    document.addEventListener("keyup", (event) => {
      keys[event.key] = false;
    });
  
    function updatePaddles() {
      const paddleLimitX = 4; // Limit paddles to stay within the walls
  
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
  
    function updateBall() {
      if (gameOver) return;
  
      ball.position.x += ballSpeedX;
      ball.position.z += ballSpeedZ;
  
      // Ball collision with walls
      if (ball.position.x > 5.5 - ballRadius || ball.position.x < -5.5 + ballRadius) {
        ballSpeedX = -ballSpeedX;
      }
  
      // Ball collision with blue paddle (top)
      if (
        ball.position.z < paddle1.position.z + paddleDepth * 1.5 && // Increase the hitbox depth
        ball.position.z > paddle1.position.z - paddleDepth / 2 && // Include a slight back margin
        ball.position.x > paddle1.position.x - paddleWidth * 0.5 && // Increase the hitbox width
        ball.position.x < paddle1.position.x + paddleWidth * 0.5
      ) {
        ballSpeedZ = Math.abs(ballSpeedZ); // Bounce downward
      }
  
      // Ball collision with red paddle (bottom)
      if (
        ball.position.z > paddle2.position.z - paddleDepth * 1.5 && // Increase the hitbox depth
        ball.position.z < paddle2.position.z + paddleDepth / 2 && // Include a slight back margin
        ball.position.x > paddle2.position.x - paddleWidth * 0.5 && // Increase the hitbox width
        ball.position.x < paddle2.position.x + paddleWidth * 0.5
      ) {
        ballSpeedZ = -Math.abs(ballSpeedZ); // Bounce upward
      }
  
      // Check if the ball goes out of bounds (goal)
      if (ball.position.z > 10) {
        player1Score++; // Blue player scores
        resetBall();
      } else if (ball.position.z < -10) {
        player2Score++; // Red player scores
        resetBall();
      }
  
      // Check for win condition
      if (player1Score >= scoreToWin || player2Score >= scoreToWin) {
        gameOver = true;
        displayWinMessage();
      }
    }
  
    function resetBall() {
      ball.position.set(0, ballRadius, 0); // Reset ball position
      ballSpeedX = initialBallSpeedX; // Reset ball speed to initial values
      ballSpeedZ = initialBallSpeedZ;
      updateScoreDisplay();
    }
  
    function displayWinMessage() {
      const winMessage = document.getElementById("win-message");
      winMessage.innerHTML = ""; // Clear existing content
  
      let winnerText = "";
      if (player1Score >= scoreToWin) {
        winnerText = `Blue Wins!`;
      } else {
        winnerText = `Red Wins!`;
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