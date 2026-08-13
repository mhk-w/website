// ============================================================================
// Renders NEWS_ITEMS (data/news.js) into:
//   - the full archive on news.html, a flat most-recent-first list capped
//     at N entries with a "Show All" control -> renderNewsArchive()
//   - the homepage's "Recent News" widget, most recent N items flat
//     -> renderRecentNews()
// ============================================================================

// Fixed display order for the Category filter (not alphabetical), shared
// by both the homepage widget and the full archive.
const NEWS_CATEGORY_ORDER = ['Career', 'Award', 'Paper', 'Conference', 'Talk', 'Research'];

function orderNewsCategories(categories) {
  return NEWS_CATEGORY_ORDER.filter((c) => categories.includes(c));
}

function newsItemHTML(item) {
  const links = (item.links || [])
    .map((l) => `<a href="${l.url}" target="_blank" rel="noopener" class="news-btn"><i class="fas ${l.icon}"></i> ${l.label}</a>`)
    .join(' ');
  const linksHTML = links ? `<div class="news-links">${links}</div>` : '';

  return `
    <div class="news-item" data-type="${item.type}" data-year="${item.year}">
      <div class="news-meta">
        <div class="news-date">${item.date}</div>
      </div>
      <div class="news-body">
        <div class="news-title"><span class="news-title-badge">${item.type}</span>${item.title}</div>
        ${linksHTML}
      </div>
    </div>
  `;
}

/** Full archive: a flat, most-recent-first list (no year section headers),
 *  capped at `initialCount` with a "Show All" control, plus Year and
 *  Category filters that show/hide individual entries in place. */
function renderNewsArchive(containerSelector, filterSelector, initialCount = 50) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const state = { year: 'all', cat: 'all', expanded: false };

  function applyFilters() {
    container.querySelectorAll('.news-item').forEach((item) => {
      const yearMatch = state.year === 'all' || item.dataset.year === state.year;
      const catMatch = state.cat === 'all' || item.dataset.type === state.cat;
      item.style.display = (yearMatch && catMatch) ? '' : 'none';
    });
  }

  function renderList() {
    const shown = state.expanded ? NEWS_ITEMS : NEWS_ITEMS.slice(0, initialCount);
    const remaining = NEWS_ITEMS.length - shown.length;
    const moreHTML = remaining > 0
      ? `<div class="see-more-link"><button class="see-more-btn" id="newsShowAllBtn" type="button">Show All (${remaining} more)</button></div>`
      : '';
    container.innerHTML = shown.map(newsItemHTML).join('') + moreHTML;
    applyFilters();

    const btn = document.getElementById('newsShowAllBtn');
    if (btn) {
      btn.addEventListener('click', () => {
        state.expanded = true;
        renderList();
      });
    }
  }

  renderList();

  if (filterSelector) {
    const years = [...new Set(NEWS_ITEMS.map((n) => n.year))].sort((a, b) => b - a);
    const categories = orderNewsCategories([...new Set(NEWS_ITEMS.map((i) => i.type))]);
    initNewsArchiveFilters(filterSelector, years, categories, state, applyFilters);
  }
}

/** Year + Category filters for the full archive, each filtering
 *  individual entries directly (AND across categories) rather than
 *  toggling whole year sections. */
function initNewsArchiveFilters(filterSelector, years, categories, state, applyFilters) {
  const filterEl = document.querySelector(filterSelector);
  if (!filterEl) return;

  const yearBtns = years.map((y) => `<button class="year-btn" data-year="${y}">${y}</button>`).join('');
  const catBtns = categories.map((c) => `<button class="cat-btn" data-cat="${c}">${c}</button>`).join('');

  filterEl.innerHTML = `
    <div class="filter-row">
      <strong><span class="filter-by-prefix">Filter by </span>Year:</strong>
      <div class="filter-btns">
        <button class="year-btn active" data-year="all">All</button>
        ${yearBtns}
      </div>
    </div>
    <div class="filter-row">
      <strong><span class="filter-by-prefix">Filter by </span>Category:</strong>
      <div class="filter-btns">
        <button class="cat-btn active" data-cat="all">All</button>
        ${catBtns}
      </div>
    </div>
  `;

  filterEl.querySelectorAll('.year-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      filterEl.querySelectorAll('.year-btn').forEach((b) => b.classList.toggle('active', b === btn));
      state.year = btn.dataset.year;
      applyFilters();
    });
  });

  filterEl.querySelectorAll('.cat-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      filterEl.querySelectorAll('.cat-btn').forEach((b) => b.classList.toggle('active', b === btn));
      state.cat = btn.dataset.cat;
      applyFilters();
    });
  });
}

/** Homepage widget: most recent `n` items, flat, plus an optional Category
 *  filter (built from whichever types actually appear among those `n`
 *  items, in the shared fixed display order). */
function renderRecentNews(containerSelector, n = 10, filterSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const items = NEWS_ITEMS.slice(0, n);
  container.innerHTML = items.map(newsItemHTML).join('');

  if (filterSelector) {
    // Sourced from the full NEWS_ITEMS list (not just the sliced widget
    // items) so the category pills always mirror the full News page,
    // even if a category isn't represented among the most recent N.
    const categories = orderNewsCategories([...new Set(NEWS_ITEMS.map((i) => i.type))]);
    initNewsCategoryFilter(filterSelector, containerSelector, categories);
  }
}

/** Single-select Category filter for the homepage's Recent News widget,
 *  styled like the Publications filter pills. */
function initNewsCategoryFilter(filterSelector, containerSelector, categories) {
  const filterEl = document.querySelector(filterSelector);
  const containerEl = document.querySelector(containerSelector);
  if (!filterEl || !containerEl) return;

  const catBtns = categories.map((c) => `<button class="cat-btn" data-cat="${c}">${c}</button>`).join('');
  filterEl.innerHTML = `
    <div class="filter-row">
      <strong>Filter by Category:</strong>
      <div class="filter-btns">
        <button class="cat-btn active" data-cat="all">All</button>
        ${catBtns}
      </div>
    </div>
  `;

  filterEl.querySelectorAll('.cat-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      filterEl.querySelectorAll('.cat-btn').forEach((b) => b.classList.toggle('active', b === btn));
      const cat = btn.dataset.cat;
      containerEl.querySelectorAll('.news-item').forEach((item) => {
        item.style.display = (cat === 'all' || item.dataset.type === cat) ? '' : 'none';
      });
    });
  });
}
