// Distance Vector SPA module
// Exports init(root) and destroy() for the Distance‑Vector Routing page.

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
      const data = await apiPost('/api/routing/distance-vector', payload);
      const tables = data.routingTables || [];
      let html = '';
      tables.forEach(table => {
        html += `<h4>Node ${table.nodeId} Routing Table</h4>`;
        html += '<table style="width:100%; border-collapse:collapse; margin-bottom:1rem;">';
        html += '<thead><tr><th>Destination</th><th>Next Hop</th><th>Cost</th></tr></thead><tbody>';
        (table.entries || []).forEach(entry => {
          const costDisplay = entry.totalCost === -1 ? '∞' : entry.totalCost;
          html += `<tr><td>${entry.destination}</td><td>${entry.nextHop ?? ''}</td><td>${costDisplay}</td></tr>`;
        });
        html += '</tbody></table>';
      });
      output.innerHTML = html;
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

