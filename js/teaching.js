// ============================================================================
// Teaching page: a single-column vertical timeline of all teaching
// experience, grouped into collapsible per-institution sections, alongside
// a column of field icons. Hovering a timeline entry highlights the
// icon(s) for the field(s) that course draws on.
// ============================================================================

const TEACHING_FIELDS = [
  { id: 'gis', icon: 'fa-map', title: 'GIS' },
  { id: 'remote-sensing', icon: 'fa-satellite-dish', title: 'Remote Sensing' },
  { id: 'surveying', icon: 'fa-ruler-combined', title: 'Surveying (Geomatics)' },
  { id: 'env-modeling', icon: 'fa-chart-line', title: 'Environmental Modeling' },
  { id: 'ml', icon: 'fa-brain', title: 'Machine Learning' },
  { id: 'image-processing', icon: 'fa-image', title: 'Image Processing' },
  { id: 'planning', icon: 'fa-city', title: 'Environmental Planning (Studio)' },
  { id: 'disaster', icon: 'fa-fire', title: 'Disaster Studies' },
  { id: 'climate', icon: 'fa-temperature-high', title: 'Climate Change Planning' },
];

const TEACHING_TIMELINE = [
  { institution: 'UC Berkeley', year: 'Fall 2022', role: 'Lead Instructor',
    course: 'GEOG/LDARCH C188: Geographic Information Systems',
    note: 'Designed and delivered full GIS course. Received teaching score of 6.311/7.',
    fields: ['gis'] },
  { institution: 'UC Berkeley', year: 'Spring 2024', role: 'Graduate Student Instructor',
    course: 'LDARCH/ESPM C289: Applied Remote Sensing',
    note: 'Received the 2024 Outstanding Graduate Student Instructor award.',
    fields: ['remote-sensing'] },
  { institution: 'UC Berkeley', year: 'Fall 2021', role: 'Graduate Student Instructor',
    course: 'GEOG/LDARCH C188: Geographic Information Systems',
    fields: ['gis'] },
  { institution: 'Seoul National University', year: 'Spring 2021', role: 'Head TA',
    course: '457.542: Advanced Surveying',
    fields: ['surveying'] },
  { institution: 'Seoul National University', year: 'Spring 2021', role: 'Head TA',
    course: '457.205: Introduction to Geospatial Engineering',
    fields: ['gis', 'surveying'] },
  { institution: 'Seoul National University', year: 'Fall 2020', role: 'Head TA',
    course: '457.539: Advanced Remote Sensing: VHR Imagery',
    fields: ['remote-sensing', 'image-processing'] },
  { institution: 'Seoul National University', year: 'Fall 2020', role: 'Head TA',
    course: '457.402: Remote Sensing',
    fields: ['remote-sensing'] },
  { institution: 'Seoul National University', year: 'Spring 2020', role: 'Head TA',
    course: '457.544: Satellite Image Interpretation',
    fields: ['remote-sensing', 'image-processing'] },
  { institution: 'Seoul National University', year: 'Spring 2020', role: 'Head TA',
    course: '457.205: Spatial Informatics and Systems',
    fields: ['gis', 'env-modeling'] },
  { institution: 'Seoul National University', year: 'Spring 2020', role: 'TA',
    course: 'Leadership for Civil Engineers',
    fields: [] },
];

function groupByInstitution(items) {
  const groups = [];
  let current = null;
  items.forEach((item) => {
    if (!current || current.institution !== item.institution) {
      current = { institution: item.institution, items: [] };
      groups.push(current);
    }
    current.items.push(item);
  });
  return groups;
}

function renderTeachingTimeline() {
  const container = document.getElementById('teachingTimeline');
  if (!container) return;

  const groups = groupByInstitution(TEACHING_TIMELINE);

  container.innerHTML = groups.map((group, i) => {
    const itemsHTML = group.items.map((item) => {
      const noteHTML = item.note ? `<p>${item.note}</p>` : '';
      const fieldsAttr = (item.fields || []).join(',');

      return `
        <div class="vt-item" data-fields="${fieldsAttr}">
          <div class="vt-year">${item.year}</div>
          <div class="vt-content">
            <div class="vt-line"><strong>${item.role}</strong> &middot; ${item.course}</div>
            ${noteHTML}
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="dropdown-section timeline-institution-group open" id="teachingGroup${i}">
        <div class="dropdown-header" onclick="toggleDropdown(this)">
          ${group.institution} <span class="dropdown-arrow">&#9654;</span>
        </div>
        <div class="dropdown-content">${itemsHTML}</div>
      </div>
    `;
  }).join('');
}

function renderFieldIconList() {
  const container = document.getElementById('fieldIconList');
  if (!container) return;

  container.innerHTML = TEACHING_FIELDS.map((f) => `
    <div class="field-icon-item" data-field="${f.id}">
      <div class="field-icon-item-icon"><i class="fas ${f.icon}"></i></div>
      <span class="field-icon-item-title">${f.title}</span>
    </div>
  `).join('');
}

function setActiveFields(fieldIds) {
  document.querySelectorAll('.field-icon-item').forEach((el) => {
    el.classList.toggle('active', fieldIds.includes(el.dataset.field));
  });
}

function initTimelineHover() {
  document.querySelectorAll('.vt-item').forEach((item) => {
    const fields = (item.dataset.fields || '').split(',').filter(Boolean);
    if (!fields.length) return;
    item.addEventListener('mouseenter', () => setActiveFields(fields));
    item.addEventListener('mouseleave', () => setActiveFields([]));
  });
}

function initTeachingPage() {
  if (!document.getElementById('teachingTimeline')) return;
  renderTeachingTimeline();
  renderFieldIconList();
  initTimelineHover();
}

document.addEventListener('DOMContentLoaded', initTeachingPage);
