// routing.js – SPA module for Routing Overview page
// Exports init(mainEl) and destroy() for the SPA router

export async function init(mainEl) {
  // The page already contains its own SVG and buttons – no extra init needed.
  // Just keep a reference to any event listeners for cleanup.
  const runDijkstraBtn = document.getElementById('runDijkstra');
  const runDVBtn = document.getElementById('runDV');

  // Attach click handlers that trigger visualisation functions from routingViz.js (loaded globally)
  if (runDijkstraBtn) runDijkstraBtn.addEventListener('click', window.runDijkstra);
  if (runDVBtn) runDVBtn.addEventListener('click', window.runDistanceVector);

  // Store for later removal
  window._routingCleanup = () => {
    if (runDijkstraBtn) runDijkstraBtn.removeEventListener('click', window.runDijkstra);
    if (runDVBtn) runDVBtn.removeEventListener('click', window.runDistanceVector);
  };
}

export async function destroy() {
  if (window._routingCleanup) {
    window._routingCleanup();
    delete window._routingCleanup;
  }
}

