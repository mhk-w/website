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
  { id: 'planning', icon: 'fa-city', title: 'Environmental Planning' },
  { id: 'disaster', icon: 'fa-fire', title: 'Disaster Studies' },
  { id: 'climate', icon: 'fa-temperature-high', title: 'Climate Change Planning' },
];

const TEACHING_TIMELINE = [
  { institution: 'UC Berkeley', year: 'Spring 2024', role: 'Graduate Student Instructor',
    course: 'LDARCH/ESPM C289: Applied Remote Sensing',
    fields: ['remote-sensing'],
    evaluation: { scale: 7, n: 10, criteria: [
      { label: 'Overall Teaching Effectiveness', score: 7.00, deptAvg: 6.12 },
      { label: 'Learning Enhanced by Instruction', score: 6.90, deptAvg: 6.06 },
      { label: 'Created Inclusive Environment', score: 7.00, deptAvg: 6.38 },
    ] } },
  { institution: 'UC Berkeley', year: 'Fall 2022', role: 'Lead Instructor',
    course: 'GEOG/LDARCH C188: Geographic Information Systems',
    fields: ['gis'],
    evaluation: { scale: 7, n: 61, criteria: [
      { label: 'Overall Teaching Effectiveness', score: 6.31, deptAvg: 6.23 },
      { label: 'Learning Enhanced by Instruction', score: 6.26, deptAvg: 6.28 },
      { label: 'Created Inclusive Environment', score: 6.38, deptAvg: 6.35 },
    ] } },
  { institution: 'UC Berkeley', year: 'Fall 2021', role: 'Graduate Student Instructor',
    course: 'GEOG/LDARCH C188: Geographic Information Systems',
    fields: ['gis'] },
  { institution: 'Seoul National University', year: 'Spring 2021', role: 'Head TA',
    course: '457.542: Advanced Surveying',
    fields: ['surveying'] },
  { institution: 'Seoul National University', year: 'Spring 2021', role: 'Head TA',
    course: '457.205: Introduction to Geospatial Engineering',
    fields: ['gis', 'surveying', 'remote-sensing'] },
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
    fields: ['gis', 'surveying', 'remote-sensing'] },
  { institution: 'Seoul National University', year: 'Spring 2020', role: 'TA',
    course: 'Leadership for Civil Engineers',
    fields: [] },
];

/** Renders a compact "You vs. department average" bar comparison, one pair
 *  of bars per evaluation criterion, echoing the bar charts in the
 *  underlying Berkeley course evaluation reports. Hidden by default and
 *  revealed via the toggle icon rendered alongside the timeline entry. */
function evalBarsHTML(evaluation) {
  if (!evaluation) return '';

  const criteriaHTML = evaluation.criteria.map((c) => {
    const youPct = (c.score / evaluation.scale) * 100;
    const deptPct = (c.deptAvg / evaluation.scale) * 100;
    return `
      <div class="vt-eval-criterion">
        <div class="vt-eval-criterion-label">${c.label}</div>
        <div class="vt-eval-bar-row">
          <span class="vt-eval-bar-label">You</span>
          <div class="vt-eval-bar-track"><div class="vt-eval-bar-fill vt-eval-bar-you" style="width: ${youPct}%"></div></div>
          <span class="vt-eval-bar-value">${c.score.toFixed(2)}</span>
        </div>
        <div class="vt-eval-bar-row">
          <span class="vt-eval-bar-label">Dept. avg</span>
          <div class="vt-eval-bar-track"><div class="vt-eval-bar-fill vt-eval-bar-dept" style="width: ${deptPct}%"></div></div>
          <span class="vt-eval-bar-value">${c.deptAvg.toFixed(2)}</span>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="vt-eval" id="${evaluation.domId}" hidden>
      <div class="vt-eval-n">Course evaluation &middot; n=${evaluation.n} student responses</div>
      <div class="vt-eval-criteria-row">${criteriaHTML}</div>
    </div>
  `;
}

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
    const itemsHTML = group.items.map((item, j) => {
      const noteHTML = item.note ? `<p class="vt-note">${item.note}</p>` : '';
      const fieldsAttr = (item.fields || []).join(',');

      const hasEval = !!item.evaluation;
      let evalHTML = '';
      let rowAttrs = '';
      if (hasEval) {
        item.evaluation.domId = `vtEval-${i}-${j}`;
        evalHTML = evalBarsHTML(item.evaluation);
        rowAttrs = ` data-eval-target="${item.evaluation.domId}" role="button" tabindex="0" aria-expanded="false" aria-label="Show course evaluation scores"`;
      }

      return `
        <div class="vt-item" data-fields="${fieldsAttr}">
          <div class="vt-row${hasEval ? ' vt-row-eval' : ''}"${rowAttrs}>
            <div class="vt-year${hasEval ? ' vt-year-eval' : ''}">${item.year}</div>
            <div class="vt-line"><strong${hasEval ? ' class="vt-role-eval"' : ''}>${item.role}</strong> &middot; ${item.course}</div>
          </div>
          ${noteHTML}
          ${evalHTML}
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

/** Fields not referenced by any timeline entry represent topics not yet
 *  taught in an actual course (e.g. only touched via guest lectures) --
 *  those icons render greyed out rather than in their usual color. */
function taughtFieldIds() {
  return new Set(TEACHING_TIMELINE.flatMap((item) => item.fields || []));
}

function renderFieldIconList() {
  const container = document.getElementById('fieldIconList');
  if (!container) return;

  const taught = taughtFieldIds();
  // Taught (colored) fields first, untaught (greyed-out) fields after --
  // a stable sort so relative order within each group is unchanged.
  const ordered = [...TEACHING_FIELDS].sort((a, b) => {
    return (taught.has(b.id) ? 1 : 0) - (taught.has(a.id) ? 1 : 0);
  });

  container.innerHTML = ordered.map((f) => `
    <div class="field-icon-item${taught.has(f.id) ? '' : ' not-taught'}" data-field="${f.id}" title="${taught.has(f.id) ? '' : 'Not yet taught in a course'}">
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

/** Evaluation scores stay hidden until a viewer asks for them. Entries
 *  that have scores are marked with a highlighted date and underlined
 *  role (see .vt-year-eval / .vt-role-eval) rather than a separate icon,
 *  and that same row toggles the scores open on click. */
function initEvalToggles() {
  document.querySelectorAll('.vt-row-eval').forEach((row) => {
    const toggle = () => {
      const target = document.getElementById(row.dataset.evalTarget);
      if (!target) return;
      const isHidden = target.hidden;
      target.hidden = !isHidden;
      row.classList.toggle('active', isHidden);
      row.setAttribute('aria-expanded', String(isHidden));
    };
    row.addEventListener('click', toggle);
    row.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  });
}

/** Concrete classroom examples for each thinking mode, drawn from my
 *  teaching statement, shown when a thinking-card is clicked. */
const THINKING_EXAMPLES = {
  spatial: {
    title: 'Spatial Thinking in the Classroom',
    text: "I use collaborative platforms like Google Slides and shared Colab notebooks so students can conceptualize spatial problems together before applying geospatial tools on their own. I have students represent real-world, complex problems in multiple ways, a map, a table, a model output, so the tools of representation become second nature rather than a one-off exercise.",
  },
  systems: {
    title: 'Systems Thinking in the Classroom',
    text: 'I connect spatial and systems thinking with critical reasoning by guiding students step by step through the same programming and geospatial tools such as Python, ArcGIS/QGIS, Google Earth Engine. Throughout the semester, I present students the "yellow brick road" of stepping stones and milestones. This helps students see how a single skill, a script, a model, a dataset, fits into the larger analysis pipeline towards achieving their end goals in the course.',
  },
  critical: {
    title: 'Critical Thinking in the Classroom',
    text: "Students synthesize what they've learned through semester-long, open-ended research projects that address real-world challenges. I provide hands-on support, troubleshooting, milestone check-ins, feedback on drafts, but let students have the freedom and curiosity to think and set their own research direction. I act as their pacemaker, reviewer, or advisor depending on what they need.",
  },
};

/** Clicking a thinking-card reveals a concrete classroom example below
 *  the grid; clicking the same card again (or another card) toggles or
 *  swaps it. */
function initThinkingCards() {
  const cards = document.querySelectorAll('.thinking-card');
  const demo = document.getElementById('thinkingDemo');
  const demoTitle = document.getElementById('thinkingDemoTitle');
  const demoText = document.getElementById('thinkingDemoText');
  if (!cards.length || !demo) return;

  cards.forEach((card) => {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');

    const activate = () => {
      const wasActive = card.classList.contains('active');
      cards.forEach((c) => c.classList.remove('active'));
      if (wasActive) {
        demo.hidden = true;
        return;
      }
      card.classList.add('active');
      const example = THINKING_EXAMPLES[card.dataset.mode];
      if (!example) return;
      demoTitle.textContent = example.title;
      demoText.textContent = example.text;
      demo.hidden = false;
    };

    card.addEventListener('click', activate);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activate();
      }
    });
  });
}

function initTeachingPage() {
  initThinkingCards();
  if (!document.getElementById('teachingTimeline')) return;
  renderTeachingTimeline();
  // renderFieldIconList(); // field icons (GIS, remote sensing, surveying, etc.) disabled for now
  initTimelineHover();
  initEvalToggles();
}

document.addEventListener('DOMContentLoaded', initTeachingPage);
