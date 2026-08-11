// Home page: a hand-drawn Venn diagram of the three research areas,
// mirroring the wobbly-stroke look of the emphasis annotations (see
// .annotate-mark in styles.css). At rest it's just three overlapping
// sketched circles; hovering, focusing, or clicking sets it "active" —
// the circles start a slow organic breathing wobble and drift slightly
// apart, and a small hub-and-spoke network fades in across their shared
// center, echoing the Research page's node-and-edge diagram to show the
// three areas are interconnected. Clicking toggles a locked/pinned state
// so touch users (and anyone who wants it to stay open) don't need to
// keep hovering.

const VENN_AREAS = [
  { key: 'modeling', cx: 250, cy: 165, r: 135, color: '#3366cc', label: ['Computational', 'Modeling'], labelX: 155, labelY: 85 },
  { key: 'geospatial', cx: 390, cy: 165, r: 135, color: '#1f9d5a', label: ['Geospatial Data', 'Science'], labelX: 485, labelY: 85 },
  { key: 'decision', cx: 320, cy: 270, r: 135, color: '#b8891f', label: ['Decision', 'Support'], labelX: 320, labelY: 368 },
];

const VENN_HUB = { x: 320, y: 200 };
const VENN_ANCHORS = {
  modeling: { x: 258, y: 172 },
  geospatial: { x: 382, y: 172 },
  decision: { x: 320, y: 248 },
};

// Same construction as research-network.js's blob paths (a ring of
// points perturbed by layered sine/cosine noise, smoothed with
// Catmull-Rom-style bezier handles) but tuned for a much smaller wobble
// so it still clearly reads as a circle rather than an amoeba.
function handDrawnCircle(cx, cy, r, seed, time) {
  const points = 14;
  const coords = [];
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const noise = Math.sin(seed * 12.9 + i * 3.7) * 0.05 + Math.cos(seed * 7.3 + i * 5.1) * 0.04;
    const breathe = Math.sin(time * 0.5 + i * 1.1 + seed * 2.1) * 0.018;
    const rr = r * (1 + noise + breathe);
    coords.push({ x: cx + Math.cos(angle) * rr, y: cy + Math.sin(angle) * rr });
  }
  let d = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 0; i < coords.length; i++) {
    const prev = coords[(i - 1 + coords.length) % coords.length];
    const curr = coords[i];
    const next = coords[(i + 1) % coords.length];
    const next2 = coords[(i + 2) % coords.length];
    const cp1x = curr.x + (next.x - prev.x) * 0.2, cp1y = curr.y + (next.y - prev.y) * 0.2;
    const cp2x = next.x - (next2.x - curr.x) * 0.2, cp2y = next.y - (next2.y - curr.y) * 0.2;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
  }
  return d + ' Z';
}

function nsSvg(tag) {
  return document.createElementNS('http://www.w3.org/2000/svg', tag);
}

function initVennDiagram() {
  const container = document.getElementById('vennDiagram');
  if (!container) return;

  const svg = nsSvg('svg');
  svg.setAttribute('viewBox', '0 0 640 400');
  svg.setAttribute('class', 'venn-svg');
  svg.setAttribute('role', 'img');
  svg.setAttribute('tabindex', '0');
  svg.setAttribute('aria-label', 'Venn diagram of three interconnected research areas: Computational Modeling, Geospatial Data Science, and Decision Support. Hover, focus, or click to see how they connect.');

  const circleState = {};
  VENN_AREAS.forEach((area, i) => {
    const g = nsSvg('g');
    g.classList.add('venn-circle-group');
    g.dataset.area = area.key;

    const path = nsSvg('path');
    path.classList.add('venn-circle');
    const seed = i * 3.1 + 1;
    path.setAttribute('d', handDrawnCircle(area.cx, area.cy, area.r, seed, 0));
    g.appendChild(path);
    circleState[area.key] = { path, seed, area };

    const text = nsSvg('text');
    text.classList.add('venn-label');
    text.setAttribute('x', area.labelX);
    text.setAttribute('y', area.labelY);
    area.label.forEach((line, li) => {
      const tspan = nsSvg('tspan');
      tspan.setAttribute('x', area.labelX);
      if (li > 0) tspan.setAttribute('dy', '18');
      tspan.textContent = line;
      text.appendChild(tspan);
    });
    g.appendChild(text);

    svg.appendChild(g);
  });

  const networkG = nsSvg('g');
  networkG.classList.add('venn-network');

  VENN_AREAS.forEach((area) => {
    const a = VENN_ANCHORS[area.key];
    const line = nsSvg('line');
    line.setAttribute('x1', a.x);
    line.setAttribute('y1', a.y);
    line.setAttribute('x2', VENN_HUB.x);
    line.setAttribute('y2', VENN_HUB.y);
    line.setAttribute('stroke', area.color);
    networkG.appendChild(line);

    const dot = nsSvg('circle');
    dot.setAttribute('cx', a.x);
    dot.setAttribute('cy', a.y);
    dot.setAttribute('r', 5);
    dot.setAttribute('fill', area.color);
    networkG.appendChild(dot);
  });

  const hubDot = nsSvg('circle');
  hubDot.setAttribute('cx', VENN_HUB.x);
  hubDot.setAttribute('cy', VENN_HUB.y);
  hubDot.setAttribute('r', 6);
  hubDot.setAttribute('class', 'venn-network-hub');
  networkG.appendChild(hubDot);

  svg.appendChild(networkG);
  container.innerHTML = '';
  container.appendChild(svg);

  let time = 0;
  let tickTimer = null;
  let locked = false;

  function tick() {
    time += 0.09;
    Object.values(circleState).forEach(({ path, seed, area }) => {
      path.setAttribute('d', handDrawnCircle(area.cx, area.cy, area.r, seed, time));
    });
  }

  function setActive(active) {
    svg.querySelectorAll('.venn-circle-group').forEach((g) => g.classList.toggle('drift', active));
    networkG.classList.toggle('active', active);
    if (active && !tickTimer) {
      tickTimer = setInterval(tick, 60);
    } else if (!active && tickTimer) {
      clearInterval(tickTimer);
      tickTimer = null;
    }
  }

  svg.addEventListener('mouseenter', () => setActive(true));
  svg.addEventListener('mouseleave', () => setActive(locked));
  svg.addEventListener('focus', () => setActive(true));
  svg.addEventListener('blur', () => setActive(locked));
  svg.addEventListener('click', () => {
    locked = !locked;
    setActive(locked);
  });
  svg.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      locked = !locked;
      setActive(locked);
    }
  });
}

document.addEventListener('DOMContentLoaded', initVennDiagram);
