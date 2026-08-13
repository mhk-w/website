// ============================================================================
// Single source of truth for news items. Consumed by:
//   - news.html   (full archive, grouped by year, collapsible) -> renderNewsArchive()
//   - index.html  (homepage "Recent News", most recent N items) -> renderRecentNews()
//
// Fields:
//   date     display string (e.g. "Mar 2026")
//   sort     ISO-ish "YYYY-MM" string used to sort newest-first
//   year     number, used for archive grouping
//   type     short tag shown in [Brackets] before the title (Talk, Paper, Award, ...)
//   title    HTML string (the news item body)
//   links    optional array of {icon, label, url} rendered as .news-btn pills
// ============================================================================

const NEWS_ITEMS = [
  {
    date: 'Aug 2026', sort: '2026-08', year: 2026, type: 'Career',
    title: 'I started as a <b>Postdoctoral Scholar</b> in the Stanford Urban Resilience Initiative, Dept. of Civil and Environmental Engineering, working with Professor <a href="https://scholar.google.com/citations?user=im82jgIAAAAJ&hl=en&oi=ao">Jack Baker</a>!',
  },
  {
    date: 'Jul 2026', sort: '2026-07', year: 2026, type: 'Talk',
    title: 'I gave an invited seminar, &ldquo;Multiscale analysis of wildfire risk in the built and natural environments,&rdquo; at the <b>Center for Catastrophic Risk Management</b>, UC Berkeley.',
  },
  {
    date: 'May 2026', sort: '2026-05-b', year: 2026, type: 'Career',
    title: 'I completed my <b>PhD in Environmental Planning</b> at UC Berkeley! My dissertation: &ldquo;Data-Driven Planning for Natural Hazard Risk Management.&rdquo;',
  },
  {
    date: 'May 2026', sort: '2026-05-a', year: 2026, type: 'Talk',
    title: 'I presented our work on "Coupling Cell2Fire with Downscaled High Resolution Wind Data" at the <b>NHERI Computational Symposium</b> in Berkeley.',
  },
  {
    date: 'Apr 2026', sort: '2026-04-b', year: 2026, type: 'Talk',
    title: 'I gave guest lectures on geospatial data science for natural hazard risk analysis for <b>CE153: Resilient Cities by Design</b> at UC Berkeley and <b>457.539: Advanced Remote Sensing</b> at Seoul National University.',
  },
  {
    date: 'Apr 2026', sort: '2026-04-a', year: 2026, type: 'Research',
    title: 'Our work was featured in the <b>Just Climate Futures Exhibition</b> at UC Berkeley.',
  },
  {
    date: 'Mar 2026', sort: '2026-03', year: 2026, type: 'Talk',
    title: 'I presented our work on "Mapping Responsibility of Wildfire Risk Mitigation as Networks" at <b>AAG26</b> in San Francisco.',
  },
  {
    date: 'Dec 2025', sort: '2025-12-b', year: 2025, type: 'Conference',
    title: 'I presented two talks at <b>AGU 2025</b> in New Orleans: "A Network Modeling Approach to Quantify Homeowner Responsibility for Wildfire Risk Mitigation in the Wildland Urban Interface" and "Flood after Fires: A Scalable Decision-Support Framework for Post-Fire Debris Flow Risk."',
  },
  {
    date: 'Dec 2025', sort: '2025-12-a', year: 2025, type: 'Conference',
    title: 'I presented "Fire spread simulations using Cell2Fire on synthetic and real landscapes" at the <b>International Fire Ecology and Management Congress</b> in New Orleans.',
  },
  {
    date: 'Oct 2025', sort: '2025-10-b', year: 2025, type: 'Paper',
    title: 'Our paper on "Modeling potential fire spread polygons and networks for suppression strategies" was published in <em>International Journal of Disaster Risk Reduction</em>.',
    links: [{ icon: 'fa-file-alt', label: 'Paper', url: 'https://www.sciencedirect.com/science/article/pii/S2212420925006776' }],
  },
  {
    date: 'Oct 2025', sort: '2025-10-a', year: 2025, type: 'Talk',
    title: 'I was invited to present a guest lecture on wildfires and climate change at <b>Georgia Tech</b> for CP4190: Introduction to Climate Change Planning.',
  },
  {
    date: 'Sep 2025', sort: '2025-09', year: 2025, type: 'Talk',
    title: 'I presented "Modeling fire potential networks for suppression strategies" at the <b>Conference of Complexity Sciences 2025</b> in Siena, Italy.',
  },
  {
    date: 'Aug 2025', sort: '2025-08', year: 2025, type: 'Talk',
    title: 'I was invited to present my research on wildfires and decision-making tools at the <b>Ecological Sensing AI Lab</b> in <b>Seoul National University</b>.',
  },
  {
    date: 'Jul 2025', sort: '2025-07', year: 2025, type: 'Award',
    title: 'I was awarded the <b>AEP Student Scholarship</b> by the Association of Environmental Professionals!',
  },
  {
    date: 'Jun 2025', sort: '2025-06-b', year: 2025, type: 'Paper',
    title: 'Our paper on "Community-scale microclimate simulation and object-based urban tree classification" was published in <em>Landscape and Urban Planning</em>.',
    links: [{ icon: 'fa-file-alt', label: 'Paper', url: 'https://doi.org/10.1016/j.landurbplan.2025.105420' }],
  },
  {
    date: 'Jun 2025', sort: '2025-06-a', year: 2025, type: 'Paper',
    title: 'Our paper on "Fire Spread Simulations Using Cell2Fire on Synthetic and Real Landscapes" was accepted to <em>Scientific Reports</em>.',
    links: [{ icon: 'fa-file-alt', label: 'Paper', url: 'https://doi.org/10.1038/s41598-025-05706-6' }],
  },
  {
    date: 'May 2025', sort: '2025-05', year: 2025, type: 'Research',
    title: 'Our proposal on "Multi-scale mitigation of wildfire risk vulnerabilities in the natural and built environment" was awarded the <b>2025 Lau Grant for Just Climate Futures</b>.',
    links: [{ icon: 'fa-graduation-cap', label: 'News', url: 'https://ced.berkeley.edu/news/ced-awards-seed-grants-for-climate-research' }],
  },
  {
    date: 'Sep 2024', sort: '2024-09', year: 2024, type: 'Research',
    title: 'We released the final report for our project with CalTrans on estimating bulking factors to protect critical infrastructure from post-fire debris flow risks.',
    links: [{ icon: 'fa-file-alt', label: 'Report', url: 'https://rosap.ntl.bts.gov/view/dot/82348' }],
  },
  {
    date: 'Aug 2024', sort: '2024-08', year: 2024, type: 'Talk',
    title: 'I was invited to present on WUI risk modeling and fire suppression strategies at the <b>Pau Costa Foundation</b>.',
  },
  {
    date: 'Jul 2024', sort: '2024-07-c', year: 2024, type: 'Talk',
    title: 'I was invited to present on WUI risk modeling and fire suppression strategies at the <b>Catalan Fire Service (Spain)</b>.',
  },
  {
    date: 'Jul 2024', sort: '2024-07-b', year: 2024, type: 'Talk',
    title: 'I was invited to present on fire spread modeling and fire suppression strategies at <b>Wageningen University</b>.',
  },
  {
    date: 'Jul 2024', sort: '2024-07-a', year: 2024, type: 'Research',
    title: 'I am visiting the <b>Catalan Fire Service</b> (headquarters in Universitat Aut&ograve;noma de Barcelona) to research and gain field experience with the generous support of the GRAF (Group of Support to Forest Actions) team and Pau Costa Foundation.',
  },
  {
    date: 'May 2024', sort: '2024-05', year: 2024, type: 'Award',
    title: 'I received the <b>Beatrix C. Farrand Memorial Fellowship</b> for Research.',
  },
  {
    date: 'Apr 2024', sort: '2024-04', year: 2024, type: 'Award',
    title: 'I received the <b>2024 Outstanding Graduate Student Instructor Award</b> from UC Berkeley.',
  },
  {
    date: 'Feb 2024', sort: '2024-02', year: 2024, type: 'Talk',
    title: 'I was invited to present a guest lecture on data-driven planning and fire spread modeling at <b>Georgia Tech</b> for CP4190: Introduction to Climate Change Planning.',
  },
  {
    date: 'Jan 2024', sort: '2024-01', year: 2024, type: 'Career',
    title: 'I will be the Graduate Student Instructor for LDARCH/ESPM C289: Applied Remote Sensing, taught by Prof. <a href="https://scholar.google.com/citations?user=qDUBrUMAAAAJ&hl=en">Iryna Dronova</a>. Looking forward to sharing remote sensing with all the students!',
  },
  {
    date: 'Jul 2023', sort: '2023-07', year: 2023, type: 'Conference',
    title: 'I attended <b>IGARSS 2023</b> in Pasadena, CA and presented an oral presentation on semantic segmentation of lifeforms. Honored to serve as <b>Session Chair</b> for the Session on Image Analysis for Land Cover Mapping.',
    links: [
      { icon: 'fa-file-alt', label: 'Paper', url: 'https://doi.org/10.1109/IGARSS52108.2023.10282737' },
      { icon: 'fa-circle-info', label: 'Session', url: 'https://2023.ieeeigarss.org/view_session.php?SessionID=1033' },
    ],
  },
  {
    date: 'May 2023', sort: '2023-05-b', year: 2023, type: 'Career',
    title: 'I <b>successfully passed my qualifying exam</b>. Thank you to my committee members: <a href="https://ced.berkeley.edu/people/john-radke">John Radke</a>, <a href="https://scholar.google.com/citations?user=YAGjro8AAAAJ&hl=en">Marta C. Gonzalez</a>, <a href="https://scholar.google.com/citations?user=qDUBrUMAAAAJ&hl=en">Iryna Dronova</a>, and <a href="https://scholar.google.com/citations?user=1QlLPcEAAAAJ&hl=en">Solomon Hsiang</a>.',
  },
  {
    date: 'May 2023', sort: '2023-05-a', year: 2023, type: 'Award',
    title: 'I received the <b>Beatrix C. Farrand Memorial Fellowship</b> for Conference Travel.',
  },
  {
    date: 'Feb 2023', sort: '2023-02', year: 2023, type: 'Award',
    title: 'I received the <b>Robert N. Colwell Memorial Fellowship</b> from ASPRS.',
    links: [{ icon: 'fa-graduation-cap', label: 'News', url: 'https://www.asprs.org/awards-and-scholarships/award-winners/2023-award-winners.html' }],
  },
];

// Already authored newest-first above, but sort defensively so ordering
// never depends on manual placement in this file.
NEWS_ITEMS.sort((a, b) => (a.sort < b.sort ? 1 : -1));
