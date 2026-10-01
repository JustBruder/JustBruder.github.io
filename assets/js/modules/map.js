// assets/js/modules/map.js

// Contornos simplificados dos continentes: [lon, lat, lon, lat, ...]
const POLY = [
  [-168,66,-162,70,-140,70,-125,72,-95,72,-80,73,-65,62,-56,52,-66,44,-76,35,-81,25,-90,29,-97,26,-97,20,-88,16,-83,10,-77,8,-80,7,-86,11,-95,16,-105,20,-112,29,-117,33,-124,40,-125,49,-135,58,-150,60,-165,55],
  [-77,8,-72,12,-62,10,-52,5,-50,0,-35,-6,-39,-15,-48,-26,-58,-38,-65,-42,-68,-52,-72,-52,-74,-42,-71,-30,-70,-18,-76,-14,-81,-5,-79,2],
  [-10,36,-9,43,-2,44,-4,48,2,51,8,54,10,58,5,62,15,69,30,71,45,68,60,69,70,73,100,77,115,74,140,72,160,70,180,68,178,64,165,60,160,54,156,51,143,52,140,45,130,42,127,35,122,40,121,31,122,24,110,20,108,15,106,10,100,13,100,4,104,1,98,8,94,17,90,22,80,15,77,8,73,17,70,22,67,25,57,25,56,27,50,30,48,29,52,24,56,24,59,22,52,16,43,13,39,21,35,28,34,31,36,36,27,37,26,40,23,38,19,40,16,38,12,42,8,44,3,43,-1,37,-6,36],
  [-17,21,-10,30,-6,36,10,37,11,33,20,31,32,31,34,28,38,18,43,12,51,12,45,2,40,-4,40,-15,35,-24,32,-29,26,-34,19,-35,15,-27,12,-15,13,-6,9,4,4,6,-8,4,-13,8,-17,14],
  [114,-22,122,-18,130,-12,136,-12,142,-11,146,-19,153,-26,150,-37,141,-38,135,-34,125,-33,115,-34],
  [-55,60,-45,60,-20,70,-20,80,-40,83,-60,82,-70,77],
  [-5,50,1,51,-2,56,-5,58,-6,55],
  [130,31,141,36,142,44,140,41,132,34],
  [44,-25,50,-15,49,-12,44,-17],
  [109,1,117,7,119,1,116,-4,110,-3]
];

// Alvo: São Paulo. Todos os ataques convergem para cá.
const SP = ['São Paulo', -46.6, -23.5];
const ORIGINS = [
  ['Nova York', -74, 40.7], ['Londres', 0, 51.5], ['Frankfurt', 8.7, 50],
  ['Moscou', 37.6, 55.7], ['Mumbai', 72.8, 19], ['Singapura', 103.8, 1.3],
  ['Tóquio', 139.7, 35.7], ['Sydney', 151, -33.9], ['Joanesburgo', 28, -26],
  ['Lagos', 3.4, 6.5], ['Los Angeles', -118, 34], ['Dubai', 55, 25]
];

const KINDS = ['varredura de portas', 'força bruta', 'phishing', 'malware', 'DDoS'];
const SEV_COLORS = ['#FF9ECA', '#FF2A85', '#FF007F', '#D81B60'];
const SEV_NAMES = ['leve', 'média', 'alta', 'crítica'];

function inside(poly, x, y) {
  let r = false;
  for (let i = 0, j = poly.length - 2; i < poly.length; j = i, i += 2) {
    if ((poly[i + 1] > y) !== (poly[j + 1] > y) &&
        x < (poly[j] - poly[i]) * (y - poly[i + 1]) / (poly[j + 1] - poly[i + 1]) + poly[i]) {
      r = !r;
    }
  }
  return r;
}

export function initMap() {
  const canvas = document.getElementById('map');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const bg = document.createElement('canvas');
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let MW = 0, MH = 0;
  let dots = [], arcs = [], rips = [];
  let events = 0, blocked = 0, critical = 0;
  let visible = false;

  const el = {
    c1: document.getElementById('c1'),
    c2: document.getElementById('c2'),
    c3: document.getElementById('c3'),
    feed: document.getElementById('feed')
  };

  function project(c) {
    return [(c[1] + 180) / 360 * MW, (85 - c[2]) / 145 * MH];
  }

  // Pontinhos dos continentes (desenhados uma vez numa camada separada)
  function paintBg() {
    if (!MW) return;
    const g = bg.getContext('2d');
    g.clearRect(0, 0, MW, MH);
    const css = getComputedStyle(root);
    g.fillStyle = css.getPropertyValue('--map-dot').trim() ||
                  css.getPropertyValue('--border-color').trim() || '#3a3338';
    dots.forEach(d => g.fillRect(d[0] - 1, d[1] - 1, 2.2, 2.2));
  }

  function resize() {
    const w = canvas.clientWidth;
    if (!w) return;
    MW = canvas.width = bg.width = w;
    MH = canvas.height = bg.height = Math.round(MW * 145 / 360);

    dots = [];
    const step = Math.max(5, MW / 115);
    for (let y = step / 2; y < MH; y += step) {
      for (let x = step / 2; x < MW; x += step) {
        const lon = x / MW * 360 - 180;
        const lat = 85 - y / MH * 145;
        if (POLY.some(p => inside(p, lon, lat))) dots.push([x, y]);
      }
    }
    paintBg();
    if (reduce) frame();
  }

  function spawn() {
    const o = ORIGINS[Math.random() * ORIGINS.length | 0];
    const r = Math.random();
    const sev = r < 0.4 ? 0 : r < 0.7 ? 1 : r < 0.9 ? 2 : 3;
    arcs.push({
      sev, from: project(o), to: project(SP),
      label: o[0] + ' → ' + SP[0],
      kind: KINDS[Math.random() * KINDS.length | 0],
      t: 0, color: SEV_COLORS[sev], speed: 0.012 + Math.random() * 0.012
    });
  }

  // Curva de Bézier que sobe como um arco entre origem e destino
  function bezier(a, u) {
    const mx = (a.from[0] + a.to[0]) / 2;
    const my = (a.from[1] + a.to[1]) / 2 - Math.abs(a.to[0] - a.from[0]) * 0.22 - 8;
    const q = 1 - u;
    return [
      q * q * a.from[0] + 2 * q * u * mx + u * u * a.to[0],
      q * q * a.from[1] + 2 * q * u * my + u * u * a.to[1]
    ];
  }

  function land(a) {
    events++;
    if (Math.random() < 0.88) blocked++;
    if (a.sev === 3) critical++;
    rips.push({ x: a.to[0], y: a.to[1], r: 0, color: a.color });

    if (el.c1) el.c1.textContent = events;
    if (el.c2) el.c2.textContent = blocked;
    if (el.c3) el.c3.textContent = critical;

    if (el.feed) {
      const li = document.createElement('li');
      const b = document.createElement('b');
      b.style.color = a.color;
      b.textContent = a.label;
      li.append(b, ` · ${a.kind} · ${SEV_NAMES[a.sev]}`);
      el.feed.appendChild(li);
      while (el.feed.children.length > 4) el.feed.removeChild(el.feed.firstChild);
    }
  }

  function frame() {
    if (!MW) return;
    ctx.clearRect(0, 0, MW, MH);
    ctx.drawImage(bg, 0, 0);

    ctx.shadowBlur = 12;
    for (let i = arcs.length - 1; i >= 0; i--) {
      const a = arcs[i];
      a.t += a.speed;
      ctx.shadowColor = ctx.strokeStyle = ctx.fillStyle = a.color;

      const u0 = Math.max(0, a.t - 0.3), u1 = Math.min(1, a.t);
      ctx.globalAlpha = 0.9;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let s = 0; s <= 14; s++) {
        const p = bezier(a, u0 + (u1 - u0) * s / 14);
        s ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]);
      }
      ctx.stroke();

      const h = bezier(a, u1);
      ctx.beginPath();
      ctx.arc(h[0], h[1], 2.6, 0, 6.3);
      ctx.fill();

      if (a.t >= 1) { land(a); arcs.splice(i, 1); }
    }

    for (let i = rips.length - 1; i >= 0; i--) {
      const r = rips[i];
      r.r += 0.5;
      ctx.shadowColor = ctx.strokeStyle = r.color;
      ctx.globalAlpha = Math.max(0, 1 - r.r / 18);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, 6.3);
      ctx.stroke();
      if (r.r > 18) rips.splice(i, 1);
    }

    // Marcador "meow (SP)"
    const sp = project(SP);
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 10;
    ctx.shadowColor = ctx.fillStyle = '#FF2A85';
    ctx.beginPath();
    ctx.arc(sp[0], sp[1], 4, 0, 6.3);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.font = '10px "DM Mono", monospace';
    ctx.fillText('meow (SP)', sp[0] + 8, sp[1] + 3);
  }

  function loop() {
    if (visible) frame();
    requestAnimationFrame(loop);
  }

  resize();
  new ResizeObserver(resize).observe(canvas);
  // Repinta os pontinhos quando o tema claro/escuro muda
  new MutationObserver(paintBg).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

  if (reduce) {
    frame();
  } else {
    new IntersectionObserver(e => { visible = e[0].isIntersecting; }).observe(canvas);
    setInterval(() => { if (visible && arcs.length < 15) spawn(); }, 300);
    loop();
  }
}