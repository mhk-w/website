// Home page: the three research-area panels above "Recent News". Reuses
// the same side-panel component and openPanel()/closePanel() from
// js/research-network.js (loaded on this page purely for that shared
// helper — its own init bails out immediately since there's no
// #networkDiagram here) so "Learn More" feels identical to clicking an
// area on the Research page, including a matching publications list and
// (here) a real figure pulled from one of the underlying papers.

const HOME_AREAS = {
  modeling: {
    title: 'Computational Modeling',
    description: 'Computational modeling is how I turn wildfire behavior into something measurable: cellular-automata fire spread simulations calibrated against real fires, and network-based representations of how suppression effort and shared risk move across a landscape. In practice, this means simulating how a fire would grow under different weather and fuel conditions before it happens, and representing landscapes as networks of interacting parcels so that suppression opportunities and mitigation responsibility can be analyzed the same way you would analyze a social or transportation network. These models are what let fire agencies test "what if" scenarios &mdash; different ignition points, wind shifts, or fuel treatments &mdash; without waiting for a real fire to teach the lesson.',
    tags: ['netsci', 'wildfire'],
    figure: {
      src: 'images/fig-modeling.png',
      alt: 'Cell2Fire fire spread simulation validated against FARSITE and satellite-derived fire perimeters',
      caption: 'Cell2Fire fire spread simulation validated against FARSITE and real fire perimeters across a range of wind speeds. Kim, Pais, &amp; Gonz&aacute;lez (2025), <em>Scientific Reports</em>, 15, 25173.',
    },
  },
  geospatial: {
    title: 'Geospatial Data Science',
    description: 'Geospatial data science is how I build the high-resolution maps that models and policy both depend on: applying geospatial AI, remote sensing, and machine learning to satellite and aerial imagery to classify land cover, local climate zones, and vegetation and fuel conditions at fine spatial detail. In practice, this means training deep learning models &mdash; often convolutional neural networks tailored to multi-scale spatial patterns &mdash; on imagery to produce datasets that are otherwise too expensive or slow to map by hand. These datasets become the fuel maps, land cover layers, and microclimate estimates that feed directly into fire spread simulations and hazard mapping.',
    tags: ['geospatial', 'rs', 'ml'],
    figure: {
      src: 'images/fig-geospatial.png',
      alt: 'Multi-scale attention CNN architecture and resulting local climate zone classification maps',
      caption: 'A multi-scale CNN classifies local climate zones from satellite imagery (comparing against a random forest baseline). Kim, Jeong, Choi, &amp; Kim (2020), AI for Earth Sciences Workshop, NeurIPS.',
    },
  },
  decision: {
    title: 'Decision Support',
    description: 'Decision support is where the modeling and the data meet the people who actually have to act on wildfire risk: translating simulations and datasets into tools that help planners, agencies, and communities decide what to do and who should do it. In practice, this means mapping which neighboring homeowners share responsibility for mitigating risk in the Wildland Urban Interface, and identifying where suppression resources create the greatest benefit for the least effort. Rather than just producing a map or a number, the goal is a concrete recommendation &mdash; treat this parcel, coordinate with this neighbor, position resources here &mdash; that a planner or fire agency can act on directly.',
    tags: ['planning', 'nathaz', 'urban'],
    figure: {
      src: 'images/fig-networks.png',
      alt: 'Network of neighboring parcels showing primary and secondary responsibility rates for wildfire risk mitigation',
      caption: 'A network of neighboring parcels, colored by how much responsibility for wildfire mitigation each one shares with its neighbors. Kim, Raine, Radke, &amp; Gonz&aacute;lez (2025), under review at <em>Landscape and Urban Planning</em>.',
    },
  },
};

function openHomeAreaPanel(key) {
  const area = HOME_AREAS[key];
  if (!area || typeof openPanel !== 'function') return;
  openPanel(null, area.title, area.description, { tags: area.tags, figure: area.figure });
}

document.addEventListener('DOMContentLoaded', () => {
  const panelClose = document.getElementById('panelClose');
  const overlay = document.getElementById('sidePanelOverlay');
  const close = () => { if (typeof closePanel === 'function') closePanel(); };
  if (panelClose) panelClose.addEventListener('click', close);
  if (overlay) overlay.addEventListener('click', close);
});
