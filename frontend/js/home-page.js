function createBouncingBallBackground() {
    // Set up the scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    const pongBackground = document.getElementById('pong-background');

    if (pongBackground)
    {
        document.getElementById('pong-background').appendChild(renderer.domElement);

        // Add lighting
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 5, 5).normalize();
        scene.add(light);
    
        // Create a ball
        const ballGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const ballMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
        const ball = new THREE.Mesh(ballGeometry, ballMaterial);
        scene.add(ball);
    
        // Set camera position
        camera.position.z = 5;
    
        // Random initial direction
        let ballDirection = new THREE.Vector3(
            (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.1,
            0
        ).normalize();
    
        const ballSpeed = 0.05;
    
        // Render loop
        function animate() {
            requestAnimationFrame(animate);
    
            // Move the ball
            ball.position.add(ballDirection.clone().multiplyScalar(ballSpeed));
    
            // Bounce off edges
            if (ball.position.x > 5 || ball.position.x < -5) {
                ballDirection.x *= -1;
            }
            if (ball.position.y > 3 || ball.position.y < -3) {
                ballDirection.y *= -1;
            }
    
            // Render the scene
            renderer.render(scene, camera);
        }
    
        animate();
    
        // Handle window resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
}

// Call the function to start the bouncing ball background
createBouncingBallBackground();