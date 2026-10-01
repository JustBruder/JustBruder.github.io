export function initGlitter() {
  // Sem efeito para quem pede menos animação e em telas de toque
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (matchMedia('(pointer: coarse)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, {
    position: 'fixed', inset: '0', width: '100%', height: '100%',
    pointerEvents: 'none', zIndex: '9999'
  });
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const COLORS = {
    dark:  ['#FF9ECA', '#FF2A85', '#FF007F', '#FFD9EA'],
    light: ['#FF2A85', '#FF007F', '#FFFFFF', '#FFD9EA']  // branco aparece bem no fundo malva
  };
  const MAX = 160;
  let parts = [];
  let running = false;
  let lastX = null, lastY = null;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  addEventListener('resize', resize);

  function spawn(x, y) {
    const theme = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
    const palette = COLORS[theme];
    parts.push({
      x: x + (Math.random() - 0.5) * 10,
      y: y + (Math.random() - 0.5) * 10,
      vx: (Math.random() - 0.5) * 1.2,
      vy: Math.random() * 0.8 - 0.3,
      size: 2 + Math.random() * 4,
      life: 0,
      max: 40 + Math.random() * 40,
      color: palette[Math.random() * palette.length | 0],
      spin: Math.random() * Math.PI,
      star: Math.random() < 0.6
    });
    if (parts.length > MAX) parts.shift();
  }

  addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') return;
    if (lastX !== null) {
      const d = Math.hypot(e.clientX - lastX, e.clientY - lastY);
      const n = Math.min(3, 1 + (d / 25 | 0));
      for (let i = 0; i < n; i++) spawn(e.clientX, e.clientY);
    }
    lastX = e.clientX;
    lastY = e.clientY;
    if (!running) { running = true; requestAnimationFrame(frame); }
  });

  function drawStar(x, y, r, rot) {
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = rot + i * Math.PI / 4;
      const rad = i % 2 === 0 ? r : r * 0.28;
      const px = x + Math.cos(a) * rad;
      const py = y + Math.sin(a) * rad;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }

  function frame() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.03;                 // cai devagar, como glitter
      p.spin += 0.05;
      const k = p.life / p.max;
      if (k >= 1) { parts.splice(i, 1); continue; }

      const twinkle = 0.65 + 0.35 * Math.sin(p.life * 0.5);
      ctx.globalAlpha = (1 - k) * twinkle;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      if (p.star) {
        drawStar(p.x, p.y, p.size * (1 - k * 0.4), p.spin);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.4, 0, 6.3);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    if (parts.length) requestAnimationFrame(frame);
    else running = false;           // para de gastar processador quando não há partículas
  }
}