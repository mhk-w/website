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
  return `${titleHTML}${note}`;
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
      <tr class="pub-row" id="${pub.id}" data-year="${pub.year}" data-type="${pub.type}" data-tags="${pub.tags.join(',')}">
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

  const yearTicksHTML = years.map((y) => `
    <button class="year-btn year-tick" data-year="${y}">
      <span class="year-tick-dot"></span>
      <span class="year-tick-label">${y}</span>
    </button>
  `).join('');
  const typeBtns = types.map((t) => `<button class="type-btn" data-type="${t}">${TYPE_LABELS[t] || t}</button>`).join('');
  const tagBtns = tags.map((t) => `<button class="tag-btn" data-tag="${t}">${TAG_LABELS[t] || t}</button>`).join('');

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
  const selected = { year: new Set(['all']), type: new Set(['all']), tag: new Set(['all']) };

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
      const visible = yearMatch && typeMatch && tagMatch;
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
  apply();
}

/** Renders the homepage's curated "Highlighted Research" cards. Supports
 *  two layouts: "panel" (the default) -- a grid of self-contained project
 *  panels with a framed image, type badge, title, and blurb -- or a
 *  compact "list" of thumbnail-and-text rows. Toggled via the icons next
 *  to the section heading. */
function renderHighlightedResearch(containerSelector, layout) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  layout = layout || 'panel';
  const highlighted = PUBLICATIONS.filter((p) => p.highlighted)
    .sort((a, b) => (a.highlightOrder || 99) - (b.highlightOrder || 99));

  container.className = layout === 'panel' ? 'research-highlight-grid' : '';
  container.innerHTML = highlighted
    .map((pub) => {
      const img = pub.image ? `<img src="${pub.image}" alt="${pub.highlightTitle || pub.title}">` : '';
      const paperLink = pub.link
        ? `<a href="${pub.link}" target="_blank" rel="noopener" class="news-btn"><i class="fas fa-file-alt"></i> Paper</a>`
        : '';
      const videoLink = pub.video
        ? `<a href="${pub.video}" target="_blank" rel="noopener" class="news-btn"><i class="fas fa-video"></i> Presentation</a>`
        : '';

      if (layout === 'panel') {
        return `
          <div class="research-highlight-card">
            <div class="research-highlight-card-media">${img}</div>
            <div class="research-content">
              <h3>${pub.shortTitle || pub.highlightTitle || pub.title}</h3>
              <p>${pub.blurb || ''}</p>
              <div class="research-card-links">${paperLink}${videoLink}</div>
            </div>
          </div>
        `;
      }

      return `
        <div class="research-highlight">
          ${img}
          <div class="research-content">
            <h3>${pub.highlightTitle || pub.title}</h3>
            <p>${pub.blurb || ''} ${paperLink} ${videoLink}</p>
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
