/**
 * Snow Falling Effect
 * Lightweight snow animation script for HTML5 Canvas
 */

(function() {
  'use strict';
  
  const config = {
    snowflakeCount: 100,
    maxSize: 12,
    minSize: 6,
    maxSpeed: 2,
    minSpeed: 0.5,
    wind: 0.5
  };

  class Snowflake {
    constructor(canvas) {
      this.canvas = canvas;
      this.reset();
    }

    reset() {
      this.x = Math.random() * this.canvas.width;
      this.y = Math.random() * -this.canvas.height;
      this.size = Math.random() * (config.maxSize - config.minSize) + config.minSize;
      this.speed = Math.random() * (config.maxSpeed - config.minSpeed) + config.minSpeed;
      this.wind = Math.random() * config.wind - config.wind / 2;
      this.opacity = Math.random() * 0.5 + 0.5;
    }

    update() {
      this.y += this.speed;
      this.x += this.wind;

      if (this.y > this.canvas.height) {
        this.y = -10;
        this.x = Math.random() * this.canvas.width;
      }

      if (this.x > this.canvas.width) {
        this.x = 0;
      } else if (this.x < 0) {
        this.x = this.canvas.width;
      }
    }

    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
      ctx.fill();
    }
  }

  function initSnowEffect() {
    const canvas = document.createElement('canvas');
    canvas.id = 'snowCanvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const snowflakes = [];
    for (let i = 0; i < config.snowflakeCount; i++) {
      snowflakes.push(new Snowflake(canvas));
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      snowflakes.forEach(snowflake => {
        snowflake.update();
        snowflake.draw(ctx);
      });

      requestAnimationFrame(animate);
    }

    animate();

    return {
      stop: () => {
        canvas.remove();
      },
      setCount: (count) => {
        config.snowflakeCount = count;
        snowflakes.length = 0;
        for (let i = 0; i < count; i++) {
          snowflakes.push(new Snowflake(canvas));
        }
      }
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSnowEffect);
  } else {
    initSnowEffect();
  }

  window.SnowEffect = {
    init: initSnowEffect
  };

})();
