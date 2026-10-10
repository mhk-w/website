// ============================================================================
// Renders the PUBLICATIONS array (data/publications.js) into:
//   - the compact, filterable table on research.html      -> renderPublicationTable()
//   - the "Highlighted Research" cards on index.html      -> renderHighlightedResearch()
//   - the "Related Publications" list on research-*.html  -> renderPubList()
//
// Filter buttons are generated FROM the data (every year/type/tag actually
// present gets a button, and only those), so the buttons can never drift
// out of sync with the underlying publications.
// ============================================================================

const TAG_LABELS = {
  wildfire: 'Wildfire',
  netsci: 'Network Science',
  ml: 'Machine Learning',
  urban: 'Urban',
  nathaz: 'Natural Hazards',
  rs: 'Remote Sensing',
  geospatial: 'Geospatial',
  planning: 'Planning',
};

// The three research areas. These are the site's primary taxonomy: the same
// three drive the homepage cards, the research.html network diagram, and the
// dedicated research-*.html pages. A publication may belong to more than one.
const AREA_LABELS = {
  modeling: 'Computational Modeling',
  networks: 'Disaster Resilience',
  geospatial: 'Geospatial Data Science',
};

const AREA_PAGES = {
  modeling: 'research-modeling.html',
  networks: 'research-networks.html',
  geospatial: 'research-geospatial.html',
};

const TYPE_LABELS = {
  paper: 'Paper',
  cpaper: 'Conference',
  preprint: 'Preprint',
  report: 'Report',
};

function pubTitleHTML(pub) {
  const titleHTML = pub.link
    ? `<a href="${pub.link}" target="_blank" rel="noopener">${pub.title}</a>`
    : pub.title;
  const note = pub.note ? ` <span class="pub-note">(*${pub.note})</span>` : '';
  const code = pub.code
    ? ` <a href="${pub.code}" target="_blank" rel="noopener" class="pub-code-link" title="Code repository" aria-label="Code repository"><i class="fab fa-github"></i></a>`
    : '';
  const demo = pub.demo
    ? ` <a href="${pub.demo}" target="_blank" rel="noopener" class="pub-code-link" title="Interactive visualization" aria-label="Interactive visualization"><i class="fas fa-diagram-project"></i></a>`
    : '';
  return `${titleHTML}${note}${code}${demo}`;
}

/** Renders a fixed set of publications (by id) as a simple list, reusing
 *  the same .panel-pub markup as the research-page side panel. Used by
 *  the standalone research area detail pages (research-human.html etc.)
 *  to list the works grounding that area, most recent first. */
function renderPubList(containerSelector, pubIds) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const pubs = PUBLICATIONS.filter((p) => pubIds.includes(p.id)).sort((a, b) => b.year - a.year);
  container.innerHTML = pubs.map((p) => `
    <div class="panel-pub">
      <div class="panel-pub-title">${pubTitleHTML(p)}</div>
      <div class="panel-pub-meta">${p.authors} &mdash; <em>${p.venue}</em>, ${p.year}</div>
    </div>
  `).join('');
}

/** Renders every publication belonging to a research area, most recent first.
 *  Used by the dedicated research-*.html pages so their "Related Publications"
 *  list stays in sync with data/publications.js automatically -- adding a
 *  publication with the right `areas` value is enough, nothing else to edit. */
function renderPubListByArea(containerSelector, area) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const TYPE_RANK = { paper: 0, preprint: 1, cpaper: 2, report: 3 };
  const pubs = PUBLICATIONS
    .filter((p) => (p.areas || []).includes(area))
    .sort((a, b) => (b.year - a.year) || (TYPE_RANK[a.type] - TYPE_RANK[b.type]));

  container.innerHTML = pubs.map((p) => `
    <div class="panel-pub">
      <div class="panel-pub-title">${pubTitleHTML(p)}</div>
      <div class="panel-pub-meta">${p.authors} &mdash; <em>${p.venue}</em>, ${p.year}</div>
    </div>
  `).join('');
}

/**
 * Renders the compact, Airtable-style publication table into
 * `bodySelector` (a <tbody>) and wires up year/type/tag filter buttons
 * (also rendered by this function) into `filterSelector`.
 */
function renderPublicationTable(bodySelector, filterSelector) {
  const bodyEl = document.querySelector(bodySelector);
  const filterEl = document.querySelector(filterSelector);
  if (!bodyEl || !filterEl) return;

  const sorted = [...PUBLICATIONS].sort((a, b) => b.year - a.year);

  bodyEl.innerHTML = sorted
    .map((pub) => `
      <tr class="pub-row" id="${pub.id}" data-year="${pub.year}" data-type="${pub.type}" data-tags="${pub.tags.join(',')}" data-areas="${(pub.areas || []).join(',')}">
        <td class="pub-col-year">${pub.year}</td>
        <td class="pub-col-title">${pubTitleHTML(pub)}</td>
        <td class="pub-col-venue">${pub.venue}</td>
        <td class="pub-col-type"><span class="research-tag ${pub.type}">${TYPE_LABELS[pub.type]}</span></td>
        <td class="pub-col-tags">${pub.tags.map((t) => `<span class="research-tag ${t}">${TAG_LABELS[t] || t}</span>`).join('')}</td>
      </tr>
    `)
    .join('');

  // Build filter buttons from whatever years/types/tags are actually
  // present. Type follows a fixed display order (rather than whatever
  // order it happens to first appear in the data) so the filter reads
  // consistently: Journal Paper, Conference, Report, Preprint.
  const years = [...new Set(sorted.map((p) => p.year))].sort((a, b) => a - b);
  const TYPE_ORDER = ['paper', 'cpaper', 'report', 'preprint'];
  const types = TYPE_ORDER.filter((t) => sorted.some((p) => p.type === t));
  const tags = [...new Set(sorted.flatMap((p) => p.tags))].sort();
  const AREA_ORDER = ['modeling', 'networks', 'geospatial'];
  const areas = AREA_ORDER.filter((a) => sorted.some((p) => (p.areas || []).includes(a)));

  const yearTicksHTML = years.map((y) => `
    <button class="year-btn year-tick" data-year="${y}">
      <span class="year-tick-dot"></span>
      <span class="year-tick-label">${y}</span>
    </button>
  `).join('');
  const typeBtns = types.map((t) => `<button class="type-btn" data-type="${t}">${TYPE_LABELS[t] || t}</button>`).join('');
  const tagBtns = tags.map((t) => `<button class="tag-btn" data-tag="${t}">${TAG_LABELS[t] || t}</button>`).join('');
  const areaBtns = areas.map((a) => `<button class="area-btn" data-area="${a}">${AREA_LABELS[a] || a}</button>`).join('');

  filterEl.innerHTML = `
    <div class="filter-row">
      <strong>Filter by Year:</strong>
      <div class="year-slider-wrap">
        <button class="year-btn year-all-btn active" data-year="all">All</button>
        <div class="year-timeline">
          <div class="year-timeline-track"></div>
          ${yearTicksHTML}
        </div>
      </div>
    </div>
    <div class="filter-row">
      <strong>Filter by Research Area:</strong>
      <div class="filter-btns">
        <button class="area-btn active" data-area="all">All</button>
        ${areaBtns}
      </div>
    </div>
    <div class="filter-row">
      <strong>Filter by Type:</strong>
      <div class="filter-btns">
        <button class="type-btn active" data-type="all">All</button>
        ${typeBtns}
      </div>
    </div>
    <div class="filter-row">
      <strong>Filter by Topic:</strong>
      <div class="filter-btns">
        <button class="tag-btn active" data-tag="all">All</button>
        ${tagBtns}
      </div>
    </div>
  `;

  initPublicationFilter();
}

/** Multi-select AND-across-categories / OR-within-category filter, driven
 *  entirely by whatever buttons renderPublicationTable() generated. */
function initPublicationFilter() {
  const allItems = Array.from(document.querySelectorAll('.pub-row'));
  const selected = { year: new Set(['all']), type: new Set(['all']), tag: new Set(['all']), area: new Set(['all']) };

  function toggle(set, value) {
    if (value === 'all') {
      set.clear();
      set.add('all');
      return;
    }
    if (set.has('all')) set.clear();
    set.has(value) ? set.delete(value) : set.add(value);
    if (set.size === 0) set.add('all');
  }

  function apply() {
    let shown = 0;
    allItems.forEach((item) => {
      const yearMatch = selected.year.has('all') || selected.year.has(item.dataset.year);
      const typeMatch = selected.type.has('all') || selected.type.has(item.dataset.type);
      const itemTags = item.dataset.tags.split(',');
      const tagMatch = selected.tag.has('all') || itemTags.some((t) => selected.tag.has(t));
      const itemAreas = (item.dataset.areas || '').split(',');
      const areaMatch = selected.area.has('all') || itemAreas.some((a) => selected.area.has(a));
      const visible = yearMatch && typeMatch && tagMatch && areaMatch;
      item.style.display = visible ? '' : 'none';
      if (visible) shown++;
    });

    const info = document.getElementById('resultsInfo');
    if (info) info.textContent = `Showing ${shown} of ${allItems.length}`;
  }

  function wire(btnClass, key, datasetKey) {
    document.querySelectorAll(`.${btnClass}`).forEach((btn) => {
      btn.addEventListener('click', () => {
        toggle(selected[key], btn.dataset[datasetKey]);
        document.querySelectorAll(`.${btnClass}`).forEach((b) => {
          b.classList.toggle('active', selected[key].has(b.dataset[datasetKey]));
        });
        apply();
      });
    });
  }

  wire('year-btn', 'year', 'year');
  wire('type-btn', 'type', 'type');
  wire('tag-btn', 'tag', 'tag');
  wire('area-btn', 'area', 'area');
  apply();
}

/** Renders the homepage's curated "Highlighted Research" cards. Supports
 *  two layouts: "panel" (the default) -- a grid of self-contained project
 *  panels that lead with a large framed image and carry only the short
 *  title, so the row reads as a set of figures -- or a compact "list" of
 *  thumbnail-and-text rows, which is where the blurb still shows.
 *  Toggled via the icons next to the section heading. */
function renderHighlightedResearch(containerSelector, layout) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  layout = layout || 'panel';
  const highlighted = PUBLICATIONS.filter((p) => p.highlighted)
    .sort((a, b) => (a.highlightOrder || 99) - (b.highlightOrder || 99));

  container.className = layout === 'panel' ? 'research-highlight-grid' : '';
  container.innerHTML = highlighted
    .map((pub) => {
      // Recent working papers may not have a figure yet. Rather than leaving
      // an empty frame, fall back to a typographic tile tinted by the
      // publication's primary research area.
      const primaryArea = (pub.areas && pub.areas[0]) || 'modeling';
      // Panel cards print the short title directly beneath the frame, so the
      // tile carries only the area label there -- repeating the title inside
      // the tile reads as a stutter once the blurb is gone.
      const placeholderTitle = layout === 'panel'
        ? ''
        : `<span class="highlight-placeholder-title">${pub.shortTitle || pub.title}</span>`;
      const img = pub.image
        ? `<img src="${pub.image}" alt="${pub.highlightTitle || pub.title}">`
        : `<div class="highlight-placeholder highlight-placeholder-${primaryArea}">
             <span class="highlight-placeholder-area">${AREA_LABELS[primaryArea] || ''}</span>
             ${placeholderTitle}
           </div>`;
      const paperLink = pub.link
        ? `<a href="${pub.link}" target="_blank" rel="noopener" class="news-btn"><i class="fas fa-file-alt"></i> Paper</a>`
        : '';
      const videoLink = pub.video
        ? `<a href="${pub.video}" target="_blank" rel="noopener" class="news-btn"><i class="fas fa-video"></i> Presentation</a>`
        : '';
      const codeLink = pub.code
        ? `<a href="${pub.code}" target="_blank" rel="noopener" class="news-btn"><i class="fab fa-github"></i> Code</a>`
        : '';
      const demoLink = pub.demo
        ? `<a href="${pub.demo}" target="_blank" rel="noopener" class="news-btn"><i class="fas fa-diagram-project"></i> Interactive</a>`
        : '';

      if (layout === 'panel') {
        return `
          <div class="research-highlight-card">
            <div class="research-highlight-card-media">${img}</div>
            <div class="research-content">
              <h3>${pub.highlightTitle || pub.title}</h3>
              <div class="research-card-links">${paperLink}${codeLink}${demoLink}${videoLink}</div>
            </div>
          </div>
        `;
      }

      return `
        <div class="research-highlight">
          <div class="research-highlight-media">${img}</div>
          <div class="research-content">
            <h3>${pub.highlightTitle || pub.title}</h3>
            <p>${pub.blurb || ''}</p>
            <div class="research-card-links">${paperLink}${codeLink}${demoLink}${videoLink}</div>
          </div>
        </div>
      `;
    })
    .join('');
}

/** Wires up the list/panel toggle icons next to "Highlighted Research". */
function initHighlightedResearchLayoutToggle(toggleSelector, containerSelector) {
  const toggle = document.querySelector(toggleSelector);
  if (!toggle) return;

  toggle.querySelectorAll('.layout-toggle-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      toggle.querySelectorAll('.layout-toggle-btn').forEach((b) => b.classList.toggle('active', b === btn));
      renderHighlightedResearch(containerSelector, btn.dataset.layout);
    });
  });
}
