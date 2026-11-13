// Dijkstra SPA module
// Exports init(root) and destroy() for the Dijkstra Shortest‑Path page.

import { apiPost } from './api.js';

let storedRoot = null;
const listeners = [];
const attach = (el, type, handler) => {
  el.addEventListener(type, handler);
  listeners.push(() => el.removeEventListener(type, handler));
};

export async function init(root) {
  storedRoot = root;
  const txtArea = root.querySelector('#request');
  const runBtn = root.querySelector('#runBtn');
  const output = root.querySelector('#output');

  const handler = async () => {
    const txt = txtArea.value;
    let payload;
    try {
      payload = JSON.parse(txt);
    } catch (e) {
      output.textContent = 'Invalid JSON: ' + e.message;
      return;
    }
    try {
      const data = await apiPost('/api/routing/dijkstra', payload);
      const lines = [];
      if (Array.isArray(data.path)) {
        lines.push('Path: ' + data.path.join(' → '));
      }
      lines.push('Total cost: ' + data.totalCost);
      output.textContent = lines.join('\n');
    } catch (err) {
      output.textContent = err.message || 'Request failed';
    }
  };

  attach(runBtn, 'click', handler);
}

export function destroy() {
  listeners.forEach(fn => fn());
  listeners.length = 0;
  storedRoot = null;
}

