(function() {
    const style = document.createElement('style');
    style.textContent = `
        #fireworks-container { 
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw; 
            height: 100vh;
            z-index: 9999;
            pointer-events: none;
        }
        #fireworks-container canvas {
            pointer-events: none;
        }
    `;
    document.head.appendChild(style);
    
    const container = document.createElement('div');
    container.id = 'fireworks-container';
    document.body.appendChild(container);

    class Fireworks {
        constructor(container, options = {}) {
            this.container = typeof container === 'string' ? document.querySelector(container) : container;
            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');
            
            this.container.appendChild(this.canvas);
            this.canvas.style.display = 'block';
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';
            
            this.options = {
                autoresize: true,
                opacity: 0.15,
                acceleration: 1.05,
                friction: 0.98,
                gravity: 1.5,
                particles: 80,
                traceLength: 3,
                traceSpeed: 10,
                explosion: 5,
                delay: { min: 30, max: 60 },
                lineWidth: { explosion: { min: 1, max: 3 }, trace: { min: 1, max: 2 } },
                lineStyle: 'round',
                brightness: { min: 50, max: 80 },
                decay: { min: 0.015, max: 0.03 },
                ...options
            };
            
            this.rockets = [];
            this.particles = [];
            this.running = false;
            this.autoLaunch = null;
            
            this.resize();
            if (this.options.autoresize) {
                window.addEventListener('resize', () => this.resize());
            }
        }
        
        resize() {
            this.canvas.width = this.container.offsetWidth;
            this.canvas.height = this.container.offsetHeight;
            this.width = this.canvas.width;
            this.height = this.canvas.height;
        }
        
        start() {
            if (this.running) return;
            this.running = true;
            this.animate();
            this.startAutoLaunch();
        }
        
        stop() {
            this.running = false;
            if (this.autoLaunch) {
                clearInterval(this.autoLaunch);
                this.autoLaunch = null;
            }
        }
        
        clear() {
            this.rockets = [];
            this.particles = [];
            this.ctx.clearRect(0, 0, this.width, this.height);
        }
        
        launch(count = 1) {
            for (let i = 0; i < count; i++) {
                setTimeout(() => this.createRocket(), i * 100);
            }
        }
        
        startAutoLaunch() {
            if (this.autoLaunch) return;
            this.autoLaunch = setInterval(() => {
                const count = Math.random() > 0.7 ? 2 : 1;
                this.launch(count);
            }, this.randomRange(this.options.delay.min, this.options.delay.max) * 10);
        }
        
        createRocket() {
            const side = Math.floor(Math.random() * 3);
            let sx, sy;
            
            if (side === 0) {
                sx = Math.random() * this.width * 0.3;
                sy = this.height;
            } else if (side === 1) {
                sx = this.width * 0.35 + Math.random() * this.width * 0.3;
                sy = this.height;
            } else {
                sx = this.width * 0.7 + Math.random() * this.width * 0.3;
                sy = this.height;
            }
            
            const tx = this.width * 0.2 + Math.random() * this.width * 0.6;
            const ty = this.height * 0.15 + Math.random() * this.height * 0.35;
            
            this.rockets.push(new Rocket(sx, sy, tx, ty, this));
        }
        
        animate() {
            if (!this.running) return;
            
            // Clear canvas completely for transparent effect
            this.ctx.clearRect(0, 0, this.width, this.height);
            
            // Use lighter composite for bright fireworks
            this.ctx.globalCompositeOperation = 'lighter';
            
            for (let i = this.rockets.length - 1; i >= 0; i--) {
                this.rockets[i].update();
                this.rockets[i].draw();
                
                if (this.rockets[i].exploded) {
                    this.rockets.splice(i, 1);
                }
            }
            
            for (let i = this.particles.length - 1; i >= 0; i--) {
                this.particles[i].update();
                this.particles[i].draw();
                
                if (this.particles[i].alpha <= 0) {
                    this.particles.splice(i, 1);
                }
            }
            
            requestAnimationFrame(() => this.animate());
        }
        
        randomRange(min, max) {
            return Math.random() * (max - min) + min;
        }
    }

    class Rocket {
        constructor(sx, sy, tx, ty, fw) {
            this.fw = fw;
            this.x = sx;
            this.y = sy;
            this.sx = sx;
            this.sy = sy;
            this.tx = tx;
            this.ty = ty;
            
            const angle = Math.atan2(ty - sy, tx - sx);
            const distance = Math.hypot(tx - sx, ty - sy);
            const speed = 2.5 + Math.random() * 2;
            
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            
            this.wobble = (Math.random() - 0.5) * 0.4;
            this.wobbleSpeed = 0.04 + Math.random() * 0.06;
            this.wobbleOffset = Math.random() * Math.PI * 2;
            
            this.trail = [];
            this.hue = Math.random() * 360;
            this.brightness = fw.randomRange(fw.options.brightness.min, fw.options.brightness.max);
            this.targetDist = distance;
            this.distanceTraveled = 0;
            this.exploded = false;
        }
        
        update() {
            if (this.exploded) return;
            
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > this.fw.options.traceSpeed) {
                this.trail.shift();
            }
            
            const wobbleX = Math.sin(this.distanceTraveled * this.wobbleSpeed + this.wobbleOffset) * this.wobble;
            const wobbleY = Math.cos(this.distanceTraveled * this.wobbleSpeed + this.wobbleOffset) * this.wobble;
            
            this.vx *= this.fw.options.acceleration;
            this.vy *= this.fw.options.acceleration;
            
            this.x += this.vx + wobbleX;
            this.y += this.vy + wobbleY;
            
            this.distanceTraveled = Math.hypot(this.x - this.sx, this.y - this.sy);
            
            if (this.distanceTraveled >= this.targetDist * 0.8) {
                this.explode();
                this.exploded = true;
            }
        }
        
        draw() {
            if (this.exploded) return;
            
            const ctx = this.fw.ctx;
            
            ctx.beginPath();
            ctx.moveTo(this.trail[0]?.x || this.x, this.trail[0]?.y || this.y);
            
            this.trail.forEach(point => {
                ctx.lineTo(point.x, point.y);
            });
            
            ctx.strokeStyle = `hsl(${this.hue}, 100%, ${this.brightness}%)`;
            ctx.lineWidth = this.fw.randomRange(this.fw.options.lineWidth.trace.min, this.fw.options.lineWidth.trace.max);
            ctx.lineCap = this.fw.options.lineStyle;
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = `hsl(${this.hue}, 100%, 90%)`;
            ctx.fill();
        }
        
        explode() {
            const particleCount = this.fw.options.particles + Math.floor(Math.random() * 20);
            
            for (let i = 0; i < particleCount; i++) {
                this.fw.particles.push(new Particle(this.x, this.y, this.hue, this.fw));
            }
        }
    }

    class Particle {
        constructor(x, y, hue, fw) {
            this.fw = fw;
            this.x = x;
            this.y = y;
            this.hue = hue + (Math.random() * 30 - 15);
            
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * fw.options.explosion + 1;
            
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            
            this.friction = fw.options.friction;
            this.gravity = fw.options.gravity * 0.01;
            this.alpha = 1;
            this.decay = fw.randomRange(fw.options.decay.min, fw.options.decay.max);
            this.size = fw.randomRange(fw.options.lineWidth.explosion.min, fw.options.lineWidth.explosion.max);
        }
        
        update() {
            this.vx *= this.friction;
            this.vy *= this.friction;
            this.vy += this.gravity;
            
            this.x += this.vx;
            this.y += this.vy;
            
            this.alpha -= this.decay;
        }
        
        draw() {
            const ctx = this.fw.ctx;
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsl(${this.hue}, 100%, 60%)`;
            ctx.fill();
            ctx.restore();
        }
    }

    window.addEventListener('DOMContentLoaded', () => {
        const fireworks = new Fireworks('#fireworks-container');
        fireworks.start();
        window.fireworks = fireworks;
    });
})();
