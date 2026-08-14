// ============================================================================
// Research page network visualization.
//
// Three areas — Humans (left), Environment (right), Technology (bottom)
// ============================================================================

// Each area's keywords are now built from two tiers:
//   - Topic nodes: one per entry in that area's own `tags`, labeled with
//     the same TAG_LABELS used to filter the Publications table -- these
//     are the "main" labels and render in the area's color.
//   - Muted nodes (`muted: true`): narrower or forward-looking themes
//     that don't map cleanly onto a single Topic tag (either because
//     they cut across several, or because they're not tied to a
//     published work yet). These render grey rather than colored, so
//     the colored Topic tags stay the primary read of the diagram.
const RESEARCH_AREAS = [
  {
    id: 'human',
    number: '01',
    title: 'Humans',
    description: '',
    tags: ['urban', 'planning'],
    color: '#3366cc',
    cx: 0.21, cy: 0.30,
    keywords: [
      { tag: 'urban', label: 'Urban', topic: true },
      { tag: 'planning', label: 'Planning', topic: true },
      { tag: 'planning', label: 'Decision-Making', muted: true },
      { label: 'Community Resilience', muted: true,
        pubIds: ['w1-mapping-responsibility'],
        description: 'Spatial metrics that map shared responsibility for risk mitigation among neighboring homeowners in the Wildland Urban Interface.' },
      { label: 'Governance', muted: true,
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
    cx: 0.79, cy: 0.30,
    keywords: [
      { tag: 'wildfire', label: 'Wildfire', topic: true },
      { tag: 'nathaz', label: 'Natural Hazards', topic: true },
      { label: 'Fire Weather', muted: true,
        pubIds: ['w5-pyromes', 'w4-korea-fire'],
        description: 'Characterizing dynamic global pyromes and unprecedented fire behavior driven by compounding climate extremes.' },
      { label: 'Climate Extreme', muted: true,
        pubIds: ['w5-pyromes', 'w4-korea-fire'],
        description: 'Characterizing dynamic global pyromes and unprecedented fire behavior driven by compounding climate extremes.' },
    ],
  },
  {
    id: 'technology',
    number: '03',
    title: 'Technology',
    description: '',
    tags: ['rs', 'ml', 'geospatial', 'netsci'],
    color: '#764ba2',
    cx: 0.50, cy: 0.66,
    keywords: [
      { tag: 'rs', label: 'Remote Sensing', topic: true },
      { tag: 'ml', label: 'Machine Learning', topic: true },
      { tag: 'geospatial', label: 'Geospatial', topic: true },
      { tag: 'netsci', label: 'Network Science', topic: true },
      { label: 'GeoAI', muted: true,
        pubIds: ['c8-inaccessible-areas', 'p4-lcz-attention', 'c7-lcz-training-samples', 'c10-landform-segmentation'],
        description: 'Applying AI to geospatial problems, from semantic segmentation to attention-based deep learning for satellite imagery.' },
      { tag: 'geospatial', label: 'GIS', muted: true },
      { label: 'Computer Vision', muted: true,
        pubIds: ['c8-inaccessible-areas', 'p4-lcz-attention', 'c7-lcz-training-samples', 'c10-landform-segmentation'],
        description: 'Image classification and segmentation models for extracting information from satellite and aerial imagery at high resolution.' },
      { tag: 'geospatial', label: 'Data Science', muted: true },
    ],
  },
];

// Bridge nodes sit along the corridor between two areas, grounded in
// publications that genuinely span both domains -- one labeled bridge
// per pair that actually has one (at the midpoint, also seeding that
// corridor's unlabeled interstitial nodes). Not every pair of areas
// necessarily has a bridge.
const SHARED_NODES = [
  {
    id: 'bridge-human-environment',
    label: 'Suppression Networks',
    areaIds: ['human', 'environment'],
    pubIds: ['p7-fire-spread-polygons'],
    description: 'A spatial network of fire potential polygons, identifying critical fire-spread pathways and suppression opportunities, tested in the field with the Catalan Fire Service.',
  },
  {
    id: 'bridge-technology-human',
    label: 'Risk Mapping',
    areaIds: ['technology', 'human'],
    pubIds: ['p5-microclimate', 'c9-urban-vegetation-lst', 'c6-lst-fusion', 'c5-smart-city', 'o1-interdisciplinary-approach'],
    description: 'Remote sensing and geospatial analytics that inform urban planning, microclimate management, and interdisciplinary risk assessment.',
  },
];

const UNLABELED_PER_AREA = 2;
const INTERSTITIAL_PER_PAIR = 3;

// Physics/layout constants, tuned for a ~600px-wide desktop diagram.
// Below that width these are scaled down in measureDiagram() (see
// SPREAD_SCALE) so the mesh doesn't spill past a narrow mobile
// container's edges -- desktop-width diagrams get scale 1, i.e. no
// change from these base values.
const KEYWORD_SPREAD_MIN_BASE = 105;
const KEYWORD_SPREAD_MAX_BASE = 145;
const BRIDGE_JITTER_BASE = 22;
const BLOB_RADIUS_BASE = 160;
const CONNECTION_DIST_BASE = 160;
const BRIDGE_CONNECTION_DIST_BASE = 170;
const SPREAD_REFERENCE_WIDTH = 600;

let KEYWORD_SPREAD_MIN = KEYWORD_SPREAD_MIN_BASE;
let KEYWORD_SPREAD_MAX = KEYWORD_SPREAD_MAX_BASE;
let BRIDGE_JITTER = BRIDGE_JITTER_BASE;
let BLOB_RADIUS = BLOB_RADIUS_BASE;
let CONNECTION_DIST = CONNECTION_DIST_BASE;
let BRIDGE_CONNECTION_DIST = BRIDGE_CONNECTION_DIST_BASE;

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
        id: `${area.id}-${i}`,
        areaId: area.id,
        color: kw.muted ? '#b9bcc4' : area.color,
        muted: !!kw.muted,
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
  });

  // Interstitial connector dots along the corridor between EVERY pair of
  // areas -- not just pairs that happen to have a labeled SHARED_NODES
  // bridge -- so no two clusters ever go fully without a connection.
  for (let i = 0; i < RESEARCH_AREAS.length; i++) {
    for (let j = i + 1; j < RESEARCH_AREAS.length; j++) {
      const areaA = RESEARCH_AREAS[i], areaB = RESEARCH_AREAS[j];
      const ax = areaA.cx * diagramSize.w, ay = areaA.cy * diagramSize.h;
      const bx = areaB.cx * diagramSize.w, by = areaB.cy * diagramSize.h;
      const pairIds = [areaA.id, areaB.id];
      const perpAngle = Math.atan2(by - ay, bx - ax) + Math.PI / 2;

      for (let k = 0; k < INTERSTITIAL_PER_PAIR; k++) {
        const t = 0.15 + Math.random() * 0.7;
        const px = ax + (bx - ax) * t;
        const py = ay + (by - ay) * t;
        const perpOffset = (Math.random() - 0.5) * 70;
        const ix = px + Math.cos(perpAngle) * perpOffset;
        const iy = py + Math.sin(perpAngle) * perpOffset;
        nodes.push({
          id: `interstitial-${areaA.id}-${areaB.id}-${k}`,
          areaId: null,
          shared: false,
          interstitial: true,
          areaIds: pairIds,
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
  }
}

function createKeywordNodeEl(node) {
  const g = nsSvg('g');
  g.classList.add('keyword-node');
  if (!node.labeled) g.classList.add('unlabeled');
  if (node.shared) g.classList.add('shared-node');
  if (node.muted) g.classList.add('muted-node');
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

  const scale = Math.max(0.35, Math.min(1, diagramSize.w / SPREAD_REFERENCE_WIDTH));
  KEYWORD_SPREAD_MIN = KEYWORD_SPREAD_MIN_BASE * scale;
  KEYWORD_SPREAD_MAX = KEYWORD_SPREAD_MAX_BASE * scale;
  BRIDGE_JITTER = BRIDGE_JITTER_BASE * scale;
  CONNECTION_DIST = CONNECTION_DIST_BASE * scale;
  BRIDGE_CONNECTION_DIST = BRIDGE_CONNECTION_DIST_BASE * scale;

  // At scale 1 (desktop) both of these stay exactly `scale` (1), so
  // nothing changes there. Below that, pulling the three area centers
  // toward the middle by the *same* scale as the blob radius (the
  // original behavior) shrank the gaps between them faster than the
  // blobs themselves shrank, so on narrow phones the three blobs ended
  // up overlapping and cluttered near the center. Now the centers are
  // pulled in less aggressively (a higher floor keeps them further
  // apart) while the radius shrinks more (lower multiplier), so there's
  // consistently a visible gap between blobs instead of a bunched-up
  // overlap.
  const centerScale = scale === 1 ? 1 : Math.max(scale, 0.75);
  const radiusScale = scale === 1 ? 1 : scale * 0.65;
  BLOB_RADIUS = BLOB_RADIUS_BASE * radiusScale;

  RESEARCH_AREAS.forEach((area) => {
    if (area.cxBase === undefined) {
      area.cxBase = area.cx;
      area.cyBase = area.cy;
    }
    area.cx = 0.5 + (area.cxBase - 0.5) * centerScale;
    area.cy = 0.5 + (area.cyBase - 0.5) * centerScale;
  });

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
  const connected = new Set();

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

      let opacity = (1 - dist / threshold) * (sameArea ? 0.6 : isBridgeLike(a) || isBridgeLike(b) ? 0.4 : 0.18);
      if (activeAreaId) opacity = involvesActive ? Math.min(1, opacity * 1.8) : opacity * 0.25;
      parts.push(`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${color}" stroke-width="${sameArea ? 1.6 : 1}" opacity="${opacity.toFixed(2)}" />`);
      connected.add(i);
      connected.add(j);
    }
  }

  // Guarantee: every labeled, non-bridge node has at least one edge to
  // its nearest same-cluster neighbor, even if that neighbor currently
  // drifted just past the normal connection distance -- so no keyword
  // node ever reads as its own disconnected island.
  const byArea = new Map();
  nodes.forEach((n, idx) => {
    if (!n.labeled || isBridgeLike(n)) return;
    if (!byArea.has(n.areaId)) byArea.set(n.areaId, []);
    byArea.get(n.areaId).push(idx);
  });

  byArea.forEach((idxs) => {
    if (idxs.length < 2) return;
    idxs.forEach((i) => {
      if (connected.has(i)) return;
      let best = -1, bestDist = Infinity;
      idxs.forEach((j) => {
        if (j === i) return;
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < bestDist) { bestDist = d; best = j; }
      });
      if (best === -1) return;
      const a = nodes[i], b = nodes[best];
      parts.push(`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${a.color}" stroke-width="1.6" opacity="0.4" />`);
      connected.add(i);
      connected.add(best);
    });
  });

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

// Bridge nodes are labeled in the diagram but belong to a corridor
// between two areas rather than any single one -- without this, their
// labels never show up in either area's keyword panel.
function bridgeLabelsForArea(areaId) {
  return SHARED_NODES.filter((bridge) => bridge.areaIds.includes(areaId)).map((bridge) => bridge.label);
}

function renderListView() {
  const container = document.getElementById('areaList');
  if (!container) return;

  container.innerHTML = RESEARCH_AREAS.map((area) => `
    <div class="area-list-card area-${area.id}" data-area="${area.id}">
      <div class="area-list-header">
        <div class="area-list-title-zone"><span class="area-number">[${area.number}]</span><h3>${area.title}</h3></div>
        <i class="fas fa-chevron-down area-list-chevron"></i>
      </div>
      <p>${area.description}</p>
      <div class="area-list-tags">
        ${area.keywords.map((k) => `<span class="tag-pill${k.muted ? ' tag-pill-muted' : ''}">${(k.label || TAG_LABELS[k.tag] || k.tag).toUpperCase()}</span>`).join('')}
        ${bridgeLabelsForArea(area.id).map((label) => `<span class="tag-pill tag-pill-bridge">${label.toUpperCase()}</span>`).join('')}
      </div>
    </div>
  `).join('');

  // Split so the two actions don't always happen together: clicking the
  // title (area number + name) opens the side panel, while clicking
  // anywhere else on the card (the chevron, in particular) only
  // expands/collapses the tag pills -- mobile-only in effect (see
  // .area-list-tags in styles.css), a harmless no-op on desktop where
  // tags are always visible regardless of this class.
  container.querySelectorAll('.area-list-card').forEach((card) => {
    card.addEventListener('click', () => {
      card.classList.toggle('expanded');
    });
    const titleZone = card.querySelector('.area-list-title-zone');
    if (titleZone) {
      titleZone.addEventListener('click', (e) => {
        e.stopPropagation();
        selectArea(card.dataset.area);
      });
    }
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

  const tryEl = document.getElementById('panelTry');
  if (tryEl) {
    tryEl.innerHTML = opts.tryUrl
      ? `
        <a class="panel-try-btn" href="${opts.tryUrl}" target="_blank" rel="noopener">
          ${opts.tryLabel || 'Try it'} <i class="fas fa-arrow-up-right-from-square"></i>
        </a>
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

function stopAnimation() {
  if (tickTimer) {
    clearInterval(tickTimer);
    tickTimer = null;
  }
}

// The left-side text panel and the right-side visual step through
// together as a small carousel: the live network diagram first, then a
// couple of static figures with their own framing text. Only the first
// slide (the diagram) shows the Human/Environment/Technology keyword
// list underneath, since that list describes the diagram specifically.
// Each slide leads with a short "lede" statement (bolded, like the
// diagram's own "I adopt a systems-based view..." line) followed by at
// most one short supporting sentence -- not a block of prose.
const RESEARCH_SLIDES = [
  {
    type: 'diagram',
    lede: `I study at the complex interface of:
      <span class="rp-hl rp-hl-human">Humans</span>,
      <span class="rp-hl rp-hl-environment">Environment</span>, &
      <span class="rp-hl rp-hl-technology">Technology</span>.`,
    body: '',
    showAreaList: true,
  },
  {
    type: 'image',
    src: 'images/sets.png',
    imgHeight: '550px',
    alt: 'Social, Environmental, and Technological dimensions interacting to produce disaster resilience',
    lede: `My research applies data and analysis to each pillar of wildfire risk &mdash;
      the <span class="rp-hl rp-hl-human">Social</span>,
      <span class="rp-hl rp-hl-environment">Environmental</span>, and
      <span class="rp-hl rp-hl-technology">Technological</span> systems.`,
    body: `My research has focused on understanding the role of decision-makers (fire managers, homeowners) in managing wildfire risk on landscapes and neighborhoods by viewing through the lens of socio-environmental (ecological) systems. 
    I also studied the effect of wildfires on socio-technical systems such as interconnected critical infrastructure networks (transportation, hydraulic, communication) and multi-organization governance (operational fire management).
    The convergence of these interdisciplinary works pushes the need for a more integrative framework, especially when managing the complexity of wildfire risk in the wildland urban interface.`,
    showAreaList: false,
  },
  {
    type: 'image',
    src: 'images/complex_adaptive_system.png',
    alt: 'Multi-layer infrastructure networks and a temporal command-structure network illustrating complex adaptive systems',
    lede: `Looking ahead, I will explore how complex natural hazard risks interact with interconnected systems in our built and natural environments.`,
      // <span class="rp-hl rp-hl-human">social</span>,
      // <span class="rp-hl rp-hl-environment">environmental</span>, and
      // <span class="rp-hl rp-hl-technology">technological</span> systems interconnect as one complex adaptive system.`,
    body: `My focus is shifting toward complex systems in natural hazard risk management and disaster risk reduction, especially the extreme tail events reshaping wildfire behavior today &mdash; from fire-atmosphere interactions that produce pyrocumulonimbus clouds to fast-moving fires in the wildland-urban interface.
      This means studying multi-hazard risk, where cascading impacts (like post-fire debris flows) and compound weather extremes interact across interconnected socio-technical networks, all pointing toward a more general theory of disaster resilience.`,
    showAreaList: false,
  },
];

let currentSlide = 0;

function renderResearchSlide(index) {
  const slide = RESEARCH_SLIDES[index];
  if (!slide) return;
  currentSlide = index;

  const descEl = document.getElementById('researchSlideDesc');
  if (descEl) {
    descEl.innerHTML = `<p class="research-slide-lede">${slide.lede}</p>`
      + (slide.body
        ? `<button type="button" class="reveal-toggle-btn" onclick="toggleMobileReveal(this)">Read more <i class="fas fa-chevron-down"></i></button>`
          + `<p class="hero-description mobile-hide-until-expanded">${slide.body}</p>`
        : '');
  }

  const areaListEl = document.getElementById('areaList');
  if (areaListEl) areaListEl.style.display = slide.showAreaList ? '' : 'none';

  const diagramEl = document.getElementById('networkDiagram');
  const imgEl = document.getElementById('researchSlideImg');

  if (slide.type === 'diagram') {
    if (imgEl) imgEl.style.display = 'none';
    if (diagramEl) diagramEl.style.display = '';
    renderNetworkView();
  } else {
    if (diagramEl) diagramEl.style.display = 'none';
    stopAnimation();
    if (imgEl) {
      imgEl.src = slide.src;
      imgEl.alt = slide.alt || '';
      imgEl.style.display = '';
      // A per-slide custom height (imgHeight) is tuned for desktop --
      // below 768px, let the mobile CSS height rule apply instead, since
      // a fixed desktop-sized inline height would otherwise win out over
      // any media query (inline styles beat class-based CSS regardless
      // of breakpoint).
      imgEl.style.height = window.innerWidth > 768 ? (slide.imgHeight || '') : '';
    }
  }

  const dotsEl = document.getElementById('slideDots');
  if (dotsEl) {
    dotsEl.querySelectorAll('.slide-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }
}

function initResearchSlides() {
  const prevBtn = document.getElementById('slidePrevBtn');
  const nextBtn = document.getElementById('slideNextBtn');
  const dotsEl = document.getElementById('slideDots');
  if (!prevBtn || !nextBtn) return;

  if (dotsEl) {
    dotsEl.innerHTML = RESEARCH_SLIDES.map((_, i) => `<span class="slide-dot${i === 0 ? ' active' : ''}" data-index="${i}"></span>`).join('');
    dotsEl.querySelectorAll('.slide-dot').forEach((dot) => {
      dot.addEventListener('click', () => renderResearchSlide(Number(dot.dataset.index)));
    });
  }

  prevBtn.addEventListener('click', () => {
    renderResearchSlide((currentSlide - 1 + RESEARCH_SLIDES.length) % RESEARCH_SLIDES.length);
  });
  nextBtn.addEventListener('click', () => {
    renderResearchSlide((currentSlide + 1) % RESEARCH_SLIDES.length);
  });
}

function initResearchPage() {
  if (!document.getElementById('networkDiagram')) return;

  renderListView();
  initResearchSlides();
  renderResearchSlide(0);

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
    resizeDebounce = setTimeout(() => renderResearchSlide(currentSlide), 200);
  });
}

document.addEventListener('DOMContentLoaded', initResearchPage);
