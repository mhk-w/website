// Institutions I currently work and collaborate with, shown as pins on
// the About page's world map (js/collaborations-map.js). Coordinates are
// true approximate [lat, lon] pairs, projected equirectangularly onto
// WORLD_MAP_PATH's 1000x500 viewBox. Several of these sit only a few
// pixels apart at world-map scale (the Bay Area cluster, Barcelona vs.
// Lleida) — that's what the map's zoom/pan controls are for, rather than
// faking the coordinates apart.
//
// Pins intentionally show the location + institution only, not
// individual collaborators' names.

const ME = {
  location: 'Stanford, California',
  collaborators: [
    { name: 'Stanford University', association: 'Postdoctoral Scholar, Urban Resilience Initiative' },
  ],
  lat: 37.4275, lon: -122.1697,
};

const COLLABORATORS = [
  {
    location: 'Berkeley, California',
    collaborators: [
      { name: 'UC Berkeley', association: 'PhD, Environmental Planning (HumNet Lab)' },
    ],
    lat: 37.8719, lon: -122.2585,
  },
  {
    location: 'Sacramento, California',
    collaborators: [
      { name: 'Caltrans', association: 'Post-fire debris flow risk research partner' },
    ],
    lat: 38.5816, lon: -121.4944,
  },
  {
    location: 'Santa Barbara, California',
    collaborators: [
      { name: 'UC Santa Barbara', association: 'Remote sensing and wildfire risk collaboration' },
    ],
    lat: 34.4140, lon: -119.8489,
  },
  {
    location: 'Austin, Texas',
    collaborators: [
      { name: 'UT Austin', association: 'Wildfire risk modeling collaboration' },
    ],
    lat: 30.2849, lon: -97.7341,
  },
  {
    location: 'Washington',
    collaborators: [
      { name: 'XyloPlan', association: 'Wildfire risk planning collaboration' },
    ],
    lat: 47.6062, lon: -122.3321,
  },
  {
    location: 'Seoul, South Korea',
    collaborators: [
      { name: 'Seoul National University', association: 'BS & MS, Civil and Environmental Engineering (SPINS Lab)' },
      { name: 'Seoul National University', association: 'Remote sensing and environmental GIS collaboration' },
    ],
    lat: 37.4601, lon: 126.9520,
  },
  {
    location: 'Barcelona, Spain',
    collaborators: [
      { name: 'Catalan Fire Service', association: 'Field collaboration on fire suppression networks' },
    ],
    lat: 41.3851, lon: 2.1734,
  },
  {
    location: 'Lleida, Spain',
    collaborators: [
      { name: 'University of Lleida', association: 'Fire behavior research collaboration' },
    ],
    lat: 41.6176, lon: 0.6200,
  },
];
