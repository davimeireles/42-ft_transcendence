function initialize3DPong() {
    // Scene, Camera, and Renderer
    const pongScene = new THREE.Scene();
    const pongCamera = new THREE.PerspectiveCamera(75, 600 / 300, 0.1, 1000);
    const pongRenderer = new THREE.WebGLRenderer({ canvas: document.getElementById('game3d-board') });
    pongRenderer.setSize(600, 300);

    // Basic lighting
    const ambientLight3D = new THREE.AmbientLight(0x404040); // Soft white light
    pongScene.add(ambientLight3D);

    const directionalLight3D = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight3D.position.set(0, 1, 1).normalize();
    pongScene.add(directionalLight3D);

    pongCamera.position.z = 15;

    // Paddle dimensions
    const paddle3DWidth = 1;
    const paddle3DHeight = 4;
    const paddle3DDepth = 1;

    // Ball dimensions
    const ball3DRadius = 0.5;

    // Paddle 1 (Left)
    const paddle13DGeometry = new THREE.BoxGeometry(paddle3DWidth, paddle3DHeight, paddle3DDepth);
    const paddle13DMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
    const paddle13D = new THREE.Mesh(paddle13DGeometry, paddle13DMaterial);
    paddle13D.position.x = -10;
    pongScene.add(paddle13D);

    // Paddle 2 (Right)
    const paddle23DGeometry = new THREE.BoxGeometry(paddle3DWidth, paddle3DHeight, paddle3DDepth);
    const paddle23DMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
    const paddle23D = new THREE.Mesh(paddle23DGeometry, paddle23DMaterial);
    paddle23D.position.x = 10;
    pongScene.add(paddle23D);

    // Ball
    const ball3DGeometry = new THREE.SphereGeometry(ball3DRadius, 32, 32);
    const ball3DMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const ball3D = new THREE.Mesh(ball3DGeometry, ball3DMaterial);
    pongScene.add(ball3D);

    // Background texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('../images/hoquei-field.jpg', function (texture) {
        pongScene.background = texture;
        console.log('Texture loaded successfully');
    }, undefined, function (error) {
        console.error('Error loading texture:', error);
    });

    // Keyboard input
    const keys3D = {};

    document.addEventListener('keydown', (event) => {
        keys3D[event.key] = true;
    });

    document.addEventListener('keyup', (event) => {
        keys3D[event.key] = false;
    });

    // Paddle movement speed
    const paddle3DSpeed = 0.2;

    function updatePaddleMovement3D() {
        if (keys3D['w']) {
            paddle13D.position.y += paddle3DSpeed;
        }
        if (keys3D['s']) {
            paddle13D.position.y -= paddle3DSpeed;
        }
        if (keys3D['ArrowUp']) {
            paddle23D.position.y += paddle3DSpeed;
        }
        if (keys3D['ArrowDown']) {
            paddle23D.position.y -= paddle3DSpeed;
        }

        // Keep paddles within bounds
        const bound3D = 9 - paddle3DHeight / 2;
        paddle13D.position.y = Math.max(Math.min(paddle13D.position.y, bound3D), -bound3D);
        paddle23D.position.y = Math.max(Math.min(paddle23D.position.y, bound3D), -bound3D);
    }

    // Ball movement
    let ball3DSpeedX = 0.1;
    let ball3DSpeedY = 0.05;

    function updateBallMovement3D() {
        ball3D.position.x += ball3DSpeedX;
        ball3D.position.y += ball3DSpeedY;

        // Bounce off top and bottom walls
        if (ball3D.position.y > 9 - ball3DRadius || ball3D.position.y < -9 + ball3DRadius) {
            ball3DSpeedY = -ball3DSpeedY;
        }

        // Bounce off paddles
        if (ball3D.position.x < paddle13D.position.x + paddle3DWidth / 2 &&
            ball3D.position.x > paddle13D.position.x - paddle3DWidth / 2 &&
            ball3D.position.y > paddle13D.position.y - paddle3DHeight / 2 &&
            ball3D.position.y < paddle13D.position.y + paddle3DHeight / 2) {
            ball3DSpeedX = Math.abs(ball3DSpeedX); // Ensure the ball moves to the right
        }
        if (ball3D.position.x > paddle23D.position.x - paddle3DWidth / 2 &&
            ball3D.position.x < paddle23D.position.x + paddle3DWidth / 2 &&
            ball3D.position.y > paddle23D.position.y - paddle3DHeight / 2 &&
            ball3D.position.y < paddle23D.position.y + paddle3DHeight / 2) {
            ball3DSpeedX = -Math.abs(ball3DSpeedX); // Ensure the ball moves to the left
        }

        // Reset ball if it goes out of bounds
        if (ball3D.position.x > 11 || ball3D.position.x < -11) {
            if (ball3D.position.x > 11) {
                player1Score++;
            } else {
                player2Score++;
            }
            updateScoreDisplay();
            ball3D.position.set(0, 0, 0);
            ball3DSpeedX = -ball3DSpeedX;
        }
    }

    // Scores
    let player1Score = 0;
    let player2Score = 0;

    function updateScoreDisplay() {
        document.getElementById('player1-score').innerText = player1Score;
        document.getElementById('player2-score').innerText = player2Score;
    }

    // Animation loop
    function animate3D() {
        requestAnimationFrame(animate3D);

        updatePaddleMovement3D();
        updateBallMovement3D();

        pongRenderer.render(pongScene, pongCamera);
    }

    animate3D();
}