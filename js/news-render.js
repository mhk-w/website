// ============================================================================
// Renders NEWS_ITEMS (data/news.js) into:
//   - the full archive on news.html, grouped into collapsible year sections
//     -> renderNewsArchive()
//   - the homepage's "Recent News" widget, most recent N items flat
//     -> renderRecentNews()
// ============================================================================

function newsItemHTML(item) {
  const links = (item.links || [])
    .map((l) => `<a href="${l.url}" target="_blank" rel="noopener" class="news-btn"><i class="fas ${l.icon}"></i> ${l.label}</a>`)
    .join(' ');
  const linksHTML = links ? `<div class="news-links">${links}</div>` : '';

  return `
    <div class="news-item">
      <div class="news-date">${item.date}</div>
      <div class="news-title"><b>[${item.type}]</b> ${item.title}</div>
      ${linksHTML}
    </div>
  `;
}

/** Full archive, grouped by year into collapsible sections (most recent
 *  year open by default, older years collapsed), plus an optional year
 *  filter row that shows/hides whole sections. */
function renderNewsArchive(containerSelector, filterSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const years = [...new Set(NEWS_ITEMS.map((n) => n.year))].sort((a, b) => b - a);

  container.innerHTML = years
    .map((year, i) => {
      const items = NEWS_ITEMS.filter((n) => n.year === year);
      const openClass = i === 0 ? ' open' : '';
      return `
        <div class="dropdown-section${openClass}" data-year="${year}">
          <div class="dropdown-header" onclick="toggleDropdown(this)">
            ${year} <span class="dropdown-arrow">&#9654;</span>
          </div>
          <div class="dropdown-content">
            ${items.map(newsItemHTML).join('')}
          </div>
        </div>
      `;
    })
    .join('');

  if (filterSelector) initNewsYearFilter(filterSelector, years);
}

/** Single-category year filter, styled like the Publications filter pills.
 *  "All" restores each section's original open/closed state; picking a
 *  specific year hides the rest and auto-expands the one left showing. */
function initNewsYearFilter(filterSelector, years) {
  const filterEl = document.querySelector(filterSelector);
  if (!filterEl) return;

  const yearBtns = years.map((y) => `<button class="year-btn" data-year="${y}">${y}</button>`).join('');
  filterEl.innerHTML = `
    <div class="filter-row">
      <strong>Filter by Year:</strong>
      <div class="filter-btns">
        <button class="year-btn active" data-year="all">All</button>
        ${yearBtns}
      </div>
    </div>
  `;

  const sections = Array.from(document.querySelectorAll('#newsArchive .dropdown-section'));
  const defaultOpenYears = new Set(
    sections.filter((s) => s.classList.contains('open')).map((s) => s.dataset.year)
  );

  filterEl.querySelectorAll('.year-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      filterEl.querySelectorAll('.year-btn').forEach((b) => b.classList.toggle('active', b === btn));
      const year = btn.dataset.year;

      sections.forEach((section) => {
        const matches = year === 'all' || section.dataset.year === year;
        section.style.display = matches ? '' : 'none';
        section.classList.toggle('open', year === 'all' ? defaultOpenYears.has(section.dataset.year) : matches);
      });
    });
  });
}

/** Homepage widget: most recent `n` items, flat (no year grouping). */
function renderRecentNews(containerSelector, n = 10) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  container.innerHTML = NEWS_ITEMS.slice(0, n).map(newsItemHTML).join('');
}
