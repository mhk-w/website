// ============================================================================
// Research page network visualization.
//
// Three areas — Human (left), Environment (right), Technology (bottom)
// ============================================================================

const RESEARCH_AREAS = [
  {
    id: 'human',
    number: '01',
    title: 'Human',
    description: '',
    tags: ['urban', 'planning'],
    color: '#3366cc',
    cx: 0.26, cy: 0.33,
    keywords: [
      { tag: 'planning', label: 'Decision-Making' },
      { label: 'Community Resilience',
        pubIds: ['c15-homeowner-responsibility', 'w1-mapping-responsibility'],
        description: 'Spatial metrics that map shared responsibility for risk mitigation among neighboring homeowners in the Wildland Urban Interface.' },
      { label: 'Shared Responsibility',
        pubIds: ['c15-homeowner-responsibility', 'w1-mapping-responsibility'],
        description: 'Mapping how responsibility for wildfire risk mitigation is shared and distributed among neighboring homeowners.' },
      { tag: 'planning', label: 'Planning' },
      { label: 'Governance',
        pubIds: ['w3-catastrophic-risk', 'o3-catastrophic-governance'],
        description: 'Modeling cascading risk and governance in complex adaptive systems with the Center for Catastrophic Risk Management.' },
    ],
  },
  {
    id: 'environment',
    number: '02',
    title: 'Environment',
    description: '',
    tags: ['wildfire', 'nathaz'],
    color: '#5559b7',
    cx: 0.74, cy: 0.33,
    keywords: [
      { tag: 'wildfire', label: 'Wildfires' },
      { label: 'Fire Weather',
        pubIds: ['w5-pyromes', 'w4-korea-fire'],
        description: 'Characterizing dynamic global pyromes and unprecedented fire behavior driven by compounding climate extremes.' },
      { label: 'Land Cover',
        pubIds: ['p4-lcz-attention', 'c10-landform-segmentation', 'c6-lst-fusion'],
        description: 'High-resolution local climate zone, landform, and land cover mapping to monitor urban development and mitigate urban heat.' },
      { label: 'LCZ Mapping',
        pubIds: ['p4-lcz-attention', 'c10-landform-segmentation', 'c6-lst-fusion'],
        description: 'High-resolution local climate zone mapping to monitor urban development and mitigate urban heat.' },
      { label: 'Climate Extreme',
        pubIds: ['w5-pyromes', 'w4-korea-fire'],
        description: 'Characterizing dynamic global pyromes and unprecedented fire behavior driven by compounding climate extremes.' },
      { tag: 'nathaz', label: 'Natural Hazard' },
    ],
  },
  {
    id: 'technology',
    number: '03',
    title: 'Technology',
    description: '',
    tags: ['rs', 'ml', 'geospatial', 'netsci'],
    color: '#764ba2',
    cx: 0.50, cy: 0.60,
    keywords: [
      { tag: 'ml', label: 'Machine Learning' },
      { label: 'GeoAI',
        pubIds: ['c8-inaccessible-areas', 'p4-lcz-attention', 'c7-lcz-training-samples'],
        description: 'Applying AI to geospatial problems, from semantic segmentation to attention-based deep learning for satellite imagery.' },
      { tag: 'geospatial', label: 'GIS' },
      { label: 'Computer Vision',
        pubIds: ['c8-inaccessible-areas', 'p4-lcz-attention', 'c7-lcz-training-samples'],
        description: 'Image classification and segmentation models for extracting information from satellite and aerial imagery at high resolution.' },
      { tag: 'geospatial', label: 'Data Science' },
      { tag: 'rs', label: 'Remote Sensing' },
      { tag: 'netsci', label: 'Network Science' },
    ],
  },
];

// Bridge nodes sit along the corridor between two areas, grounded in
// publications that genuinely span both domains. Each pair gets a primary
// bridge (at the midpoint, seeding that corridor's unlabeled interstitial
// nodes) plus a second, more specific bridge labeled and positioned
// further along the same corridor.
const SHARED_NODES = [
  {
    id: 'bridge-human-environment',
    label: 'Suppression Networks',
    areaIds: ['human', 'environment'],
    pubIds: ['p7-fire-spread-polygons', 'c12-fire-potential-networks'],
    description: 'A spatial network of fire potential polygons, identifying critical fire-spread pathways and suppression opportunities, tested in the field with the Catalan Fire Service.',
  },
  {
    id: 'bridge-human-environment-2',
    label: 'Wildfire Policy',
    areaIds: ['human', 'environment'],
    t: 0.32,
    skipInterstitial: true,
    pubIds: ['o3-catastrophic-governance', 'o2-sediment-bulking'],
    description: 'Governance and infrastructure policy responses to wildfire and post-fire hazards.',
  },
  {
    id: 'bridge-environment-technology',
    label: 'Fire Sensing',
    areaIds: ['environment', 'technology'],
    pubIds: ['p2-histogram-matching', 'c3-sentinel-planetscope', 'c1-mendocino-wildfire'],
    description: 'Calibrating and monitoring wildfire behavior against satellite-derived fire perimeters and multispectral imagery.',
  },
  {
    id: 'bridge-environment-technology-2',
    label: 'Vegetation Mapping',
    areaIds: ['environment', 'technology'],
    t: 0.32,
    skipInterstitial: true,
    pubIds: ['c10-landform-segmentation', 'p4-lcz-attention'],
    description: 'Remote sensing of vegetation and fuel conditions that shape wildfire risk across landscapes.',
  },
  {
    id: 'bridge-environment-technology-3',
    label: 'Fire Monitoring',
    areaIds: ['environment', 'technology'],
    t: 0.68,
    skipInterstitial: true,
    pubIds: ['p2-histogram-matching', 'c3-sentinel-planetscope', 'c1-mendocino-wildfire'],
    description: 'Calibrating and monitoring wildfire behavior against satellite-derived fire perimeters and multispectral imagery.',
  },
  {
    id: 'bridge-technology-human',
    label: 'Risk Mapping',
    areaIds: ['technology', 'human'],
    pubIds: ['p5-microclimate', 'c9-urban-vegetation-lst', 'c11-lidar-urban-forest', 'c5-smart-city', 'o1-interdisciplinary-approach'],
    description: 'Remote sensing and geospatial analytics that inform urban planning, microclimate management, and interdisciplinary risk assessment.',
  },
  {
    id: 'bridge-technology-human-2',
    label: 'Smart Cities',
    areaIds: ['technology', 'human'],
    t: 0.32,
    skipInterstitial: true,
    pubIds: ['c5-smart-city', 'p5-microclimate'],
    description: 'Geospatial technology applications that inform smart, resilient urban planning.',
  },
];

const UNLABELED_PER_AREA = 2;
const INTERSTITIAL_PER_PAIR = 2;

// Physics/layout constants.
const KEYWORD_SPREAD_MIN = 130;
const KEYWORD_SPREAD_MAX = 180;
const BRIDGE_JITTER = 22;
const BLOB_RADIUS = 190;
const CONNECTION_DIST = 125;
const BRIDGE_CONNECTION_DIST = 130;
const DRIFT_SPEED = 0.4;
const TICK_MS = 55;

let svgEl = null;
let nodeEls = new Map();
let anchorEls = new Map();
let nodes = [];
let diagramSize = { w: 0, h: 0 };
let timeClock = 0;
let tickTimer = null;
let activeAreaId = null;
let activeKeywordId = null;
let resizeDebounce = null;

function nsSvg(tag) {
  return document.createElementNS('http://www.w3.org/2000/svg', tag);
}

function areaColorMix(idA, idB) {
  const a = RESEARCH_AREAS.find((ar) => ar.id === idA);
  const b = RESEARCH_AREAS.find((ar) => ar.id === idB);
  if (!a || !b) return '#8a8a8a';
  const pa = parseInt(a.color.slice(1), 16), pb = parseInt(b.color.slice(1), 16);
  const mix = (shift) => Math.round(((pa >> shift & 255) + (pb >> shift & 255)) / 2);
  return `rgb(${mix(16)}, ${mix(8)}, ${mix(0)})`;
}

// Hand-drawn organic blob path — cubic-Bezier ring perturbed by layered
// sine/cosine noise plus a slow "breathing" term, so it visibly wobbles.
function generateBlobPath(cx, cy, baseR, seed, time) {
  const points = 10;
  const coords = [];
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const noise = Math.sin(seed * 17.3 + i * 4.7) * 0.3 + Math.cos(seed * 11.1 + i * 7.3) * 0.25 + Math.sin(seed * 5.9 + i * 2.1) * 0.15;
    const breathe = Math.sin(time * 0.4 + i * 1.3 + seed * 2.7) * 0.03 + Math.cos(time * 0.3 + i * 0.9 + seed * 1.1) * 0.02;
    const r = baseR * (0.8 + noise * 0.55 + breathe);
    const yScale = 0.7 + Math.sin(seed * 3.3 + i * 1.7) * 0.15;
    coords.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r * yScale });
  }
  let d = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 0; i < coords.length; i++) {
    const prev = coords[(i - 1 + coords.length) % coords.length];
    const curr = coords[i];
    const next = coords[(i + 1) % coords.length];
    const next2 = coords[(i + 2) % coords.length];
    const cp1x = curr.x + (next.x - prev.x) * 0.28, cp1y = curr.y + (next.y - prev.y) * 0.28;
    const cp2x = next.x - (next2.x - curr.x) * 0.28, cp2y = next.y - (next2.y - curr.y) * 0.28;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
  }
  return d + ' Z';
}

function buildNodes() {
  nodes = [];
  RESEARCH_AREAS.forEach((area) => {
    const cx = area.cx * diagramSize.w;
    const cy = area.cy * diagramSize.h;
    const n = area.keywords.length;

    area.keywords.forEach((kw, i) => {
      const angle = (i / n) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
      const radius = KEYWORD_SPREAD_MIN + Math.random() * (KEYWORD_SPREAD_MAX - KEYWORD_SPREAD_MIN);
      nodes.push({
        id: `${area.id}-${kw.tag || i}`,
        areaId: area.id,
        color: area.color,
        labeled: true,
        keyword: kw,
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius * 0.8,
        vx: (Math.random() - 0.5) * DRIFT_SPEED,
        vy: (Math.random() - 0.5) * DRIFT_SPEED,
        boundsMinX: cx - KEYWORD_SPREAD_MAX * 1.15, boundsMaxX: cx + KEYWORD_SPREAD_MAX * 1.15,
        boundsMinY: cy - KEYWORD_SPREAD_MAX * 0.9, boundsMaxY: cy + KEYWORD_SPREAD_MAX * 0.9,
      });
    });

    // A few small, unlabeled nodes per area — open-ended future directions.
    for (let i = 0; i < UNLABELED_PER_AREA; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = KEYWORD_SPREAD_MIN * 0.5 + Math.random() * KEYWORD_SPREAD_MAX * 0.75;
      nodes.push({
        id: `${area.id}-future-${i}`,
        areaId: area.id,
        color: area.color,
        labeled: false,
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius * 0.8,
        vx: (Math.random() - 0.5) * DRIFT_SPEED * 0.7,
        vy: (Math.random() - 0.5) * DRIFT_SPEED * 0.7,
        boundsMinX: cx - KEYWORD_SPREAD_MAX * 1.2, boundsMaxX: cx + KEYWORD_SPREAD_MAX * 1.2,
        boundsMinY: cy - KEYWORD_SPREAD_MAX * 0.95, boundsMaxY: cy + KEYWORD_SPREAD_MAX * 0.95,
      });
    }
  });

  SHARED_NODES.forEach((bridge) => {
    const areaA = RESEARCH_AREAS.find((a) => a.id === bridge.areaIds[0]);
    const areaB = RESEARCH_AREAS.find((a) => a.id === bridge.areaIds[1]);
    const ax = areaA.cx * diagramSize.w, ay = areaA.cy * diagramSize.h;
    const bx = areaB.cx * diagramSize.w, by = areaB.cy * diagramSize.h;
    const bridgeT = bridge.t !== undefined ? bridge.t : 0.5;
    const mx = ax + (bx - ax) * bridgeT, my = ay + (by - ay) * bridgeT;

    nodes.push({
      id: bridge.id,
      areaId: null,
      shared: true,
      areaIds: bridge.areaIds,
      color: areaColorMix(bridge.areaIds[0], bridge.areaIds[1]),
      colorA: areaA.color,
      colorB: areaB.color,
      labeled: true,
      keyword: bridge,
      x: mx + (Math.random() - 0.5) * BRIDGE_JITTER,
      y: my + (Math.random() - 0.5) * BRIDGE_JITTER,
      vx: (Math.random() - 0.5) * DRIFT_SPEED * 0.5,
      vy: (Math.random() - 0.5) * DRIFT_SPEED * 0.5,
      boundsMinX: mx - BRIDGE_JITTER, boundsMaxX: mx + BRIDGE_JITTER,
      boundsMinY: my - BRIDGE_JITTER, boundsMaxY: my + BRIDGE_JITTER,
    });

    // Extra unlabeled nodes scattered along the corridor between this pair
    // of clusters — decorative connective tissue reinforcing that the
    // network is interconnected, not just three isolated stars. Only the
    // primary bridge per pair seeds these, so a second labeled bridge on
    // the same corridor doesn't double up the clutter.
    if (!bridge.skipInterstitial) {
      const perpAngle = Math.atan2(by - ay, bx - ax) + Math.PI / 2;
      for (let i = 0; i < INTERSTITIAL_PER_PAIR; i++) {
        const t = 0.15 + Math.random() * 0.7;
        const px = ax + (bx - ax) * t;
        const py = ay + (by - ay) * t;
        const perpOffset = (Math.random() - 0.5) * 70;
        const ix = px + Math.cos(perpAngle) * perpOffset;
        const iy = py + Math.sin(perpAngle) * perpOffset;
        nodes.push({
          id: `interstitial-${bridge.id}-${i}`,
          areaId: null,
          shared: false,
          interstitial: true,
          areaIds: bridge.areaIds,
          color: '#b9bcc4',
          labeled: false,
          x: ix, y: iy,
          vx: (Math.random() - 0.5) * DRIFT_SPEED * 0.6,
          vy: (Math.random() - 0.5) * DRIFT_SPEED * 0.6,
          boundsMinX: ix - 35, boundsMaxX: ix + 35,
          boundsMinY: iy - 35, boundsMaxY: iy + 35,
        });
      }
    }
  });
}

function createKeywordNodeEl(node) {
  const g = nsSvg('g');
  g.classList.add('keyword-node');
  if (!node.labeled) g.classList.add('unlabeled');
  if (node.shared) g.classList.add('shared-node');
  g.dataset.id = node.id;

  if (node.labeled) {
    const glow = nsSvg('circle');
    glow.setAttribute('r', 12);
    glow.setAttribute('fill', node.color);
    glow.classList.add('kw-glow');
    g.appendChild(glow);
  }

  if (node.shared) {
    const half = 4;
    const dotA = nsSvg('circle');
    dotA.setAttribute('r', half);
    dotA.setAttribute('cx', -2);
    dotA.setAttribute('fill', node.colorA);
    const dotB = nsSvg('circle');
    dotB.setAttribute('r', half);
    dotB.setAttribute('cx', 2);
    dotB.setAttribute('fill', node.colorB);
    g.appendChild(dotA);
    g.appendChild(dotB);
  } else {
    const dot = nsSvg('circle');
    dot.setAttribute('r', node.labeled ? 4 : 2.5);
    dot.setAttribute('fill', node.color);
    dot.classList.add('kw-dot');
    g.appendChild(dot);
  }

  if (node.labeled) {
    const label = nsSvg('text');
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('dy', -13);
    label.classList.add('kw-label');
    label.textContent = node.keyword.label;
    g.appendChild(label);
  }

  if (node.labeled) {
    g.addEventListener('click', (e) => {
      e.stopPropagation();
      selectKeyword(node);
    });
  }
  return g;
}

function createAreaAnchorEl(area) {
  const cx = area.cx * diagramSize.w;
  const cy = area.cy * diagramSize.h;

  const g = nsSvg('g');
  g.classList.add('area-anchor');
  g.dataset.id = area.id;

  const dot = nsSvg('circle');
  dot.setAttribute('cx', cx);
  dot.setAttribute('cy', cy - 38);
  dot.setAttribute('r', 9);
  dot.setAttribute('fill', area.color);
  dot.classList.add('anchor-dot');

  const title = nsSvg('text');
  title.setAttribute('x', cx);
  title.setAttribute('y', cy - 8);
  title.setAttribute('text-anchor', 'middle');
  title.setAttribute('fill', area.color);
  title.classList.add('area-title');
  title.textContent = area.title;

  g.appendChild(dot);
  g.appendChild(title);
  g.addEventListener('click', (e) => {
    e.stopPropagation();
    selectArea(area.id);
  });
  return g;
}

function measureDiagram() {
  const el = document.getElementById('networkDiagram');
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return false;
  diagramSize = { w: rect.width, h: rect.height };
  return true;
}

function renderNetworkView() {
  svgEl = document.getElementById('networkSvg');
  if (!svgEl || !measureDiagram()) return;

  svgEl.setAttribute('viewBox', `0 0 ${diagramSize.w} ${diagramSize.h}`);
  svgEl.innerHTML = '';
  nodeEls = new Map();
  anchorEls = new Map();

  buildNodes();

  const blobLayer = nsSvg('g');
  const edgeLayer = nsSvg('g');
  edgeLayer.id = 'meshEdgeLayer';
  const nodeLayer = nsSvg('g');
  const anchorLayer = nsSvg('g');

  RESEARCH_AREAS.forEach((area, i) => {
    const path = nsSvg('path');
    path.classList.add('area-blob-path');
    path.dataset.id = area.id;
    path.setAttribute('fill', area.color);
    path.setAttribute('d', generateBlobPath(area.cx * diagramSize.w, area.cy * diagramSize.h, BLOB_RADIUS, i * 3.1 + 1, timeClock));
    path.addEventListener('click', (e) => {
      e.stopPropagation();
      selectArea(area.id);
    });
    blobLayer.appendChild(path);
    anchorEls.set(area.id, { blobPath: path, seed: i * 3.1 + 1 });
  });

  nodes.forEach((node) => {
    const g = createKeywordNodeEl(node);
    g.setAttribute('transform', `translate(${node.x},${node.y})`);
    nodeLayer.appendChild(g);
    nodeEls.set(node.id, g);
  });

  RESEARCH_AREAS.forEach((area) => {
    const anchorG = createAreaAnchorEl(area);
    anchorLayer.appendChild(anchorG);
    anchorEls.get(area.id).group = anchorG;
  });

  svgEl.appendChild(blobLayer);
  svgEl.appendChild(edgeLayer);
  svgEl.appendChild(nodeLayer);
  svgEl.appendChild(anchorLayer);

  applySelectionStyles();
  startAnimation();
}

function isBridgeLike(n) {
  return n.shared || n.interstitial;
}

function buildMeshEdgesHTML() {
  const parts = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];

      // Two regular (non-bridge) nodes from different areas never connect
      // directly — cross-cluster connectivity flows only through the
      // deliberate bridge/interstitial nodes, keeping the "between areas"
      // edges limited to the ones actually grounded in bridging research.
      const crossAreaNonBridge = !isBridgeLike(a) && !isBridgeLike(b) && a.areaId !== b.areaId;
      if (crossAreaNonBridge) continue;

      const dx = a.x - b.x, dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const threshold = (isBridgeLike(a) || isBridgeLike(b)) ? BRIDGE_CONNECTION_DIST : CONNECTION_DIST;
      if (dist >= threshold) continue;

      const sameArea = !isBridgeLike(a) && !isBridgeLike(b) && a.areaId === b.areaId;
      let color, involvesActive;
      if (isBridgeLike(a) && !isBridgeLike(b)) { color = b.color; involvesActive = b.areaId === activeAreaId; }
      else if (isBridgeLike(b) && !isBridgeLike(a)) { color = a.color; involvesActive = a.areaId === activeAreaId; }
      else if (sameArea) { color = a.color; involvesActive = a.areaId === activeAreaId; }
      else { color = '#b9bcc4'; involvesActive = false; }

      let opacity = (1 - dist / threshold) * (sameArea || isBridgeLike(a) || isBridgeLike(b) ? 0.4 : 0.18);
      if (activeAreaId) opacity = involvesActive ? Math.min(1, opacity * 1.8) : opacity * 0.25;
      parts.push(`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${color}" stroke-width="${sameArea ? 1.3 : 1}" opacity="${opacity.toFixed(2)}" />`);
    }
  }
  return parts.join('');
}

function tick() {
  timeClock += TICK_MS / 1000;

  nodes.forEach((node) => {
    node.x += node.vx;
    node.y += node.vy;
    if (node.x < node.boundsMinX || node.x > node.boundsMaxX) node.vx *= -1;
    if (node.y < node.boundsMinY || node.y > node.boundsMaxY) node.vy *= -1;
    const g = nodeEls.get(node.id);
    if (g) g.setAttribute('transform', `translate(${node.x},${node.y})`);
  });

  const edgeLayer = document.getElementById('meshEdgeLayer');
  if (edgeLayer) edgeLayer.innerHTML = buildMeshEdgesHTML();

  RESEARCH_AREAS.forEach((area, i) => {
    const entry = anchorEls.get(area.id);
    if (!entry) return;
    entry.blobPath.setAttribute('d', generateBlobPath(area.cx * diagramSize.w, area.cy * diagramSize.h, BLOB_RADIUS, i * 3.1 + 1, timeClock));
  });
}

function startAnimation() {
  if (tickTimer) clearInterval(tickTimer);
  tickTimer = setInterval(tick, TICK_MS);
}

function applySelectionStyles() {
  anchorEls.forEach((entry, areaId) => {
    if (entry.group) entry.group.classList.toggle('active', areaId === activeAreaId);
    entry.blobPath.classList.toggle('active', areaId === activeAreaId);
  });
  nodeEls.forEach((g, id) => {
    const isActiveKeyword = id === activeKeywordId;
    g.classList.toggle('active', isActiveKeyword);
    const node = nodes.find((n) => n.id === id);
    const belongsToActiveArea = node && (node.areaId === activeAreaId || (node.shared && node.areaIds && node.areaIds.includes(activeAreaId)));
    const dimmed = !!(activeAreaId || activeKeywordId) && !(belongsToActiveArea || isActiveKeyword);
    g.classList.toggle('dimmed', dimmed);
  });
}

function renderListView() {
  const container = document.getElementById('areaList');
  if (!container) return;

  container.innerHTML = RESEARCH_AREAS.map((area) => `
    <div class="area-list-card area-${area.id}" data-area="${area.id}">
      <div class="area-list-header">
        <div><span class="area-number">[${area.number}]</span><h3>${area.title}</h3></div>
        <i class="fas fa-chevron-down area-list-chevron"></i>
      </div>
      <p>${area.description}</p>
      <div class="area-list-tags">
        ${area.keywords.map((k) => `<span class="tag-pill">${(k.label || TAG_LABELS[k.tag] || k.tag).toUpperCase()}</span>`).join('')}
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.area-list-card').forEach((card) => {
    card.addEventListener('click', () => selectArea(card.dataset.area));
  });
}

function selectArea(areaId) {
  const area = RESEARCH_AREAS.find((a) => a.id === areaId);
  if (!area) return;

  activeKeywordId = null;
  activeAreaId = activeAreaId === areaId ? null : areaId;
  applySelectionStyles();

  if (!activeAreaId) {
    closePanel();
    return;
  }
  openPanel(area.number, area.title, area.description, { tags: area.tags });
}

function selectKeyword(node) {
  activeAreaId = null;
  activeKeywordId = activeKeywordId === node.id ? null : node.id;
  applySelectionStyles();

  if (!activeKeywordId) {
    closePanel();
    return;
  }
  const kw = node.keyword;
  const label = kw.label || TAG_LABELS[kw.tag] || kw.tag;
  if (kw.pubIds) {
    openPanel(null, label, kw.description, { pubIds: kw.pubIds });
  } else {
    openPanel(null, label, kw.description, { tags: [kw.tag] });
  }
}

function openPanel(number, title, description, opts) {
  opts = opts || {};
  const pubs = opts.pubIds
    ? PUBLICATIONS.filter((p) => opts.pubIds.includes(p.id)).sort((a, b) => b.year - a.year)
    : PUBLICATIONS.filter((p) => p.tags.some((t) => (opts.tags || []).includes(t))).sort((a, b) => b.year - a.year);

  document.getElementById('panelNumber').textContent = number ? `[${number}]` : '';
  document.getElementById('panelNumber').style.display = number ? 'block' : 'none';
  document.getElementById('panelTitle').textContent = title;

  const descEl = document.getElementById('panelDesc');
  if (description) {
    descEl.innerHTML = description;
    descEl.style.display = 'block';
  } else {
    descEl.style.display = 'none';
  }

  const figureEl = document.getElementById('panelFigure');
  if (figureEl) {
    figureEl.innerHTML = opts.figure
      ? `
        <figure class="panel-figure">
          <img src="${opts.figure.src}" alt="${opts.figure.alt || ''}">
          <figcaption>${opts.figure.caption}</figcaption>
        </figure>
      `
      : '';
  }

  document.getElementById('panelPubs').innerHTML = pubs.length
    ? pubs.map((p) => {
        const titleHTML = p.link
          ? `<a href="${p.link}" target="_blank" rel="noopener">${p.title} <i class="fas fa-arrow-up-right-from-square"></i></a>`
          : p.title;
        return `
          <div class="panel-pub">
            <div class="panel-pub-title">${titleHTML}</div>
            <div class="panel-pub-meta">${p.authors} &mdash; <em>${p.venue}</em>, ${p.year}</div>
          </div>
        `;
      }).join('')
    : '<p class="research-detail-empty">No publications tagged yet.</p>';

  document.getElementById('sidePanel').classList.add('open');
  document.getElementById('sidePanelOverlay').classList.add('open');
}

function closePanel() {
  document.getElementById('sidePanel').classList.remove('open');
  document.getElementById('sidePanelOverlay').classList.remove('open');
}

function initResearchPage() {
  if (!document.getElementById('networkDiagram')) return;

  renderNetworkView();
  renderListView();

  document.getElementById('panelClose').addEventListener('click', () => {
    closePanel();
    activeAreaId = null;
    activeKeywordId = null;
    applySelectionStyles();
  });
  document.getElementById('sidePanelOverlay').addEventListener('click', () => {
    closePanel();
    activeAreaId = null;
    activeKeywordId = null;
    applySelectionStyles();
  });

  window.addEventListener('resize', () => {
    clearTimeout(resizeDebounce);
    resizeDebounce = setTimeout(renderNetworkView, 200);
  });
}

document.addEventListener('DOMContentLoaded', initResearchPage);
