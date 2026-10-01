import { initTheme } from './modules/theme.js';
import { initMap } from './modules/map.js';
import { initCounters } from './modules/counters.js';
import { initProjects } from './modules/projects.js';
import { initGlitter } from './modules/glitter.js';

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMap();
  initCounters();
  initProjects();
  initGlitter();
});