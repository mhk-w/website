// About page: a minimalist world map (equirectangular, WORLD_MAP_PATH from
// data/world-map-path.js) pinning the institutions I currently work and
// collaborate with. Pins are plain 📍 emoji glyphs in SVG <text> nodes,
// all the same size — red for where I am now, greyscale for everywhere
// else. Hovering or clicking a pin updates a fixed info panel to the
// right of the map (rather than a floating popup), so a location with
// several collaborators still reads cleanly.

const MAP_W = 1000, MAP_H = 500;

function projectLatLon(lat, lon) {
  const x = (lon + 180) / 360 * MAP_W;
  const y = (90 - lat) / 180 * MAP_H;
  return [x, y];
}

// Single combined list so each pin can carry a plain index back to its
// full data (location + every collaborator there) instead of trying to
// cram a nested list into HTML data-attributes.
const ALL_LOCATIONS = [ME].concat(COLLABORATORS).map((entry, i) => Object.assign({}, entry, { isMe: i === 0 }));

function buildPinMarkup(entry, index) {
  const [x, y] = projectLatLon(entry.lat, entry.lon);
  return `
    <g class="collab-pin ${entry.isMe ? 'collab-pin-me' : 'collab-pin-collaborator'}" tabindex="0" data-idx="${index}">
      <circle class="collab-pin-hit" cx="${x}" cy="${y - 6}" r="14"></circle>
      <text class="collab-pin-emoji" x="${x}" y="${y}" text-anchor="middle">\u{1F4CD}</text>
    </g>
  `;
}

function renderCollaborationsMap() {
  const container = document.getElementById('collaborationsMap');
  const panel = document.getElementById('collabInfoPanel');
  if (!container || !panel || typeof WORLD_MAP_PATH === 'undefined') return;

  // "Me" renders last (on top) so it's never hidden behind a
  // collaborator pin when a few sit close together at map scale.
  const order = ALL_LOCATIONS.map((_, i) => i).filter((i) => i !== 0).concat([0]);
  const pinsMarkup = order.map((i) => buildPinMarkup(ALL_LOCATIONS[i], i)).join('');

  container.innerHTML = `
    <svg viewBox="0 0 ${MAP_W} ${MAP_H}" class="collab-map-svg" role="img" aria-label="World map of institutions I work with">
      <path class="collab-map-land" d="${WORLD_MAP_PATH}" fill-rule="evenodd"></path>
      ${pinsMarkup}
    </svg>
  `;

  let selectedIdx = 0; // defaults to "me"

  function renderPanel(idx) {
    const entry = ALL_LOCATIONS[idx];
    const listHTML = entry.collaborators.map((c) => `
      <div class="collab-panel-item">
        <span class="collab-panel-item-name">${c.name}</span>
        <span class="collab-panel-item-assoc">${c.association}</span>
      </div>
    `).join('');
    panel.innerHTML = `
      <div class="collab-panel-location">${entry.location}</div>
      <div class="collab-panel-list">${listHTML}</div>
    `;
  }

  function setActivePin(idx) {
    container.querySelectorAll('.collab-pin').forEach((p) => {
      p.classList.toggle('active', Number(p.dataset.idx) === idx);
    });
  }

  renderPanel(selectedIdx);
  setActivePin(selectedIdx);

  container.querySelectorAll('.collab-pin').forEach((pinEl) => {
    const idx = Number(pinEl.dataset.idx);
    pinEl.addEventListener('mouseenter', () => renderPanel(idx));
    pinEl.addEventListener('mouseleave', () => renderPanel(selectedIdx));
    pinEl.addEventListener('focus', () => renderPanel(idx));
    pinEl.addEventListener('click', (e) => {
      e.stopPropagation();
      selectedIdx = idx;
      renderPanel(idx);
      setActivePin(idx);
    });
  });

  initZoomControls(container.querySelector('.collab-map-svg'), container.closest('.collab-map-wrap'));
}

const ZOOM_MIN = 1;
const ZOOM_MAX = 4;
const ZOOM_STEP = 0.5;

function touchDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function initZoomControls(svg, wrap) {
  const zoomInBtn = document.getElementById('collabZoomIn');
  const zoomOutBtn = document.getElementById('collabZoomOut');
  const resetBtn = document.getElementById('collabZoomReset');
  if (!svg || !wrap || !zoomInBtn || !zoomOutBtn || !resetBtn) return;

  let zoom = 1;
  let panX = 0, panY = 0;

  function clampPan() {
    const rect = wrap.getBoundingClientRect();
    const maxX = Math.max(0, (zoom - 1) * rect.width / 2);
    const maxY = Math.max(0, (zoom - 1) * rect.height / 2);
    panX = Math.min(maxX, Math.max(-maxX, panX));
    panY = Math.min(maxY, Math.max(-maxY, panY));
  }

  function apply() {
    clampPan();
    svg.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
    zoomInBtn.disabled = zoom >= ZOOM_MAX;
    zoomOutBtn.disabled = zoom <= ZOOM_MIN;
  }

  function setZoom(next) {
    zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next));
    apply();
  }

  zoomInBtn.addEventListener('click', () => setZoom(zoom + ZOOM_STEP));
  zoomOutBtn.addEventListener('click', () => setZoom(zoom - ZOOM_STEP));
  resetBtn.addEventListener('click', () => {
    zoom = 1;
    panX = 0;
    panY = 0;
    apply();
  });

  // Keyboard zoom (+/- , 0 to reset) once the map has focus.
  wrap.setAttribute('tabindex', '0');
  wrap.addEventListener('keydown', (e) => {
    if (e.key === '+' || e.key === '=') { setZoom(zoom + ZOOM_STEP); e.preventDefault(); }
    else if (e.key === '-' || e.key === '_') { setZoom(zoom - ZOOM_STEP); e.preventDefault(); }
    else if (e.key === '0') { zoom = 1; panX = 0; panY = 0; apply(); e.preventDefault(); }
  });

  // Drag-to-pan, so zooming in actually has somewhere to look. Bound to
  // the svg itself: a plain click (no meaningful movement) still reaches
  // the pin underneath and opens its info panel as normal.
  svg.style.cursor = 'grab';
  let dragging = false;
  let startX = 0, startY = 0, startPanX = 0, startPanY = 0;

  function dragStart(clientX, clientY) {
    dragging = true;
    startX = clientX;
    startY = clientY;
    startPanX = panX;
    startPanY = panY;
    svg.classList.add('dragging');
    svg.style.cursor = 'grabbing';
  }

  function dragMove(clientX, clientY) {
    if (!dragging) return;
    panX = startPanX + (clientX - startX);
    panY = startPanY + (clientY - startY);
    apply();
  }

  function dragEnd() {
    dragging = false;
    svg.classList.remove('dragging');
    svg.style.cursor = 'grab';
  }

  svg.addEventListener('mousedown', (e) => { dragStart(e.clientX, e.clientY); e.preventDefault(); });
  window.addEventListener('mousemove', (e) => dragMove(e.clientX, e.clientY));
  window.addEventListener('mouseup', dragEnd);

  // Mouse wheel/trackpad scroll zooms the map in and out, like a real map.
  svg.addEventListener('wheel', (e) => {
    e.preventDefault();
    setZoom(zoom + (e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP));
  }, { passive: false });

  // Touch: one finger pans, two fingers pinch-to-zoom.
  let pinchStartDist = null;
  let pinchStartZoom = 1;

  svg.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      dragging = false;
      pinchStartDist = touchDistance(e.touches);
      pinchStartZoom = zoom;
    } else {
      const t = e.touches[0];
      dragStart(t.clientX, t.clientY);
    }
  }, { passive: true });
  window.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2 && pinchStartDist) {
      const dist = touchDistance(e.touches);
      setZoom(pinchStartZoom * (dist / pinchStartDist));
      return;
    }
    if (!dragging || e.touches.length !== 1) return;
    const t = e.touches[0];
    dragMove(t.clientX, t.clientY);
  }, { passive: true });
  window.addEventListener('touchend', (e) => {
    if (e.touches.length < 2) pinchStartDist = null;
    dragEnd();
  });

  apply();
}

document.addEventListener('DOMContentLoaded', renderCollaborationsMap);
