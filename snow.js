(function () {
  if (window.__snowLoaded) return;
  window.__snowLoaded = true;

  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);

  canvas.style.cssText = `
    position:fixed;
    inset:0;
    pointer-events:none;
    z-index:9999;
  `;

  const ctx = canvas.getContext("2d");
  let w, h;
  let flakes = [];

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  function createFlakes(n = 200) {
    flakes = [];
    for (let i = 0; i < n; i++) {
      flakes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 3 + 1,
        s: Math.random() * 2 + 0.5,
        d: Math.random() - 0.5,
        a: Math.random()
      });
    }
  }

  function animate() {
    ctx.clearRect(0, 0, w, h);
    flakes.forEach(f => {
      f.y += f.s;
      f.x += f.d;

      if (f.y > h) {
        f.y = -f.r;
        f.x = Math.random() * w;
      }

      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${f.a})`;
      ctx.fill();
    });
    requestAnimationFrame(animate);
  }

  createFlakes(250);
  animate();
})();
