// 3D Scene Setup
let scene, camera, renderer;

function init3DScene() {
    const container = document.getElementById('hero-3d');
    
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    
    camera.position.z = 5;
    
    // Create rotating cube
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshPhongMaterial({
        color: 0x00d9ff,
        emissive: 0x00d9ff,
        wireframe: false
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    
    // Add lighting
    const light = new THREE.PointLight(0xff006e, 1);
    light.position.set(5, 5, 5);
    scene.add(light);
    
    const ambientLight = new THREE.AmbientLight(0x00d9ff, 0.5);
    scene.add(ambientLight);
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer.render(scene, camera);
    }
    animate();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}

// Game Logic
let gameScore = 0;
let playerX = 150;
let playerY = 150;
const playerSize = 15;
let orbs = [];

class Orb {
    constructor() {
        this.x = Math.random() * 600;
        this.y = Math.random() * 400;
        this.radius = 8;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        
        if (this.x - this.radius < 0 || this.x + this.radius > 600) this.vx *= -1;
        if (this.y - this.radius < 0 || this.y + this.radius > 400) this.vy *= -1;
        
        this.x = Math.max(this.radius, Math.min(600 - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(400 - this.radius, this.y));
    }
    
    draw(ctx) {
        ctx.fillStyle = '#00d9ff';
        ctx.shadowColor = '#00d9ff';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initGame() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const keys = {};
    
    // Create orbs
    for (let i = 0; i < 5; i++) {
        orbs.push(new Orb());
    }
    
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        keys[e.key] = true;
    });
    
    document.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });
    
    function gameLoop() {
        // Clear canvas
        ctx.fillStyle = 'rgba(10, 14, 39, 0.8)';
        ctx.fillRect(0, 0, 600, 400);
        
        // Update player position
        const speed = 5;
        if (keys['ArrowUp'] || keys['w'] || keys['W']) playerY -= speed;
        if (keys['ArrowDown'] || keys['s'] || keys['S']) playerY += speed;
        if (keys['ArrowLeft'] || keys['a'] || keys['A']) playerX -= speed;
        if (keys['ArrowRight'] || keys['d'] || keys['D']) playerX += speed;
        
        playerX = Math.max(playerSize, Math.min(600 - playerSize, playerX));
        playerY = Math.max(playerSize, Math.min(400 - playerSize, playerY));
        
        // Draw player
        ctx.fillStyle = '#ff006e';
        ctx.shadowColor = '#ff006e';
        ctx.shadowBlur = 15;
        ctx.fillRect(playerX - playerSize, playerY - playerSize, playerSize * 2, playerSize * 2);
        
        // Update and draw orbs
        for (let i = 0; i < orbs.length; i++) {
            orbs[i].update();
            orbs[i].draw(ctx);
            
            // Check collision
            const dx = playerX - orbs[i].x;
            const dy = playerY - orbs[i].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < playerSize + orbs[i].radius) {
                gameScore++;
                orbs[i] = new Orb();
                document.getElementById('gameScore').textContent = `Score: ${gameScore}`;
            }
        }
        
        requestAnimationFrame(gameLoop);
    }
    
    gameLoop();
}

// Chat functionality
const responses = [
    "That's awesome! Tell me more about your projects.",
    "I love your enthusiasm! What are you working on?",
    "Interesting! How can I help you today?",
    "Great question! I'm always learning new things.",
    "That sounds cool! Let's collaborate sometime.",
    "I appreciate that! Keep pushing boundaries.",
    "Innovation is key to growth.",
    "Nice! What's your next big goal?"
];

function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    const chatBox = document.getElementById('chatBox');
    
    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-message user';
    userMsg.textContent = message;
    chatBox.appendChild(userMsg);
    
    input.value = '';
    chatBox.scrollTop = chatBox.scrollHeight;
    
    // Simulate bot response
    setTimeout(() => {
        const botMsg = document.createElement('div');
        botMsg.className = 'chat-message bot';
        botMsg.textContent = responses[Math.floor(Math.random() * responses.length)];
        chatBox.appendChild(botMsg);
        chatBox.scrollTop = chatBox.scrollHeight;
    }, 500);
}

// Allow Enter key to send message
document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
});

// Scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    // Initialize 3D scene
    init3DScene();
    
    // Initialize game
    initGame();
    
    // Observe elements for scroll animation
    document.querySelectorAll('.about-card, .skill-category, .project-card').forEach(el => {
        observer.observe(el);
    });
});
