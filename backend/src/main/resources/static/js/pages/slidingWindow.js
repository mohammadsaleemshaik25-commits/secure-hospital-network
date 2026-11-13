// Sliding Window page module
// Implements SPA lifecycle with init(root) and destroy()

let storedRoot = null;
const listeners = [];

/** Attach listener and track it */
function attach(el, type, handler) {
  el.addEventListener(type, handler);
  listeners.push({el, type, handler});
}

function removeAllListeners() {
  listeners.forEach(({el, type, handler}) => el.removeEventListener(type, handler));
  listeners.length = 0;
}

function apiPost(url, data) {
  return fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  }).then(r => r.json().then(j => ({status: r.status, body: j})));
}

function setMsg(txt) { const el = storedRoot?.querySelector('#msg'); if (el) el.textContent = txt; }
function clearMsg() { setMsg(''); }
function showLoading() { const el = storedRoot?.querySelector('#msg'); if (el) { el.textContent = '⏳ Running simulation…'; el.style.color = 'inherit'; } }
function showError(e) { const el = storedRoot?.querySelector('#msg'); if (el) { el.textContent = '❌ ' + e; el.style.color = 'red'; } }

function clearAll() {
  const msg = storedRoot?.querySelector('#msg'); if (msg) msg.textContent = '';
  const stats = storedRoot?.querySelector('#stats'); if (stats) stats.innerHTML = '';
  const log = storedRoot?.querySelector('#log'); if (log) log.innerHTML = '';
  const visual = storedRoot?.querySelector('#visual'); if (visual) visual.innerHTML = '';
}

function validate() {
  const total = Number(storedRoot?.querySelector('#totalFrames')?.value);
  const windowSize = Number(storedRoot?.querySelector('#windowSize')?.value);
  const bits = Number(storedRoot?.querySelector('#seqBits')?.value);
  if (!(total > 0 && windowSize > 0 && bits > 0)) return 'All values must be positive integers.';
  const seqSpace = Math.pow(2, bits);
  if (windowSize > seqSpace) return `Window size cannot exceed sequence‑number space (${seqSpace}).`;
  return null;
}

function renderStats(r) {
  const statsDiv = storedRoot?.querySelector('#stats');
  if (!statsDiv) return;
  statsDiv.innerHTML = `
    <strong>Statistics</strong><br/>
    Protocol: ${r.protocol}<br/>
    Total frames: ${r.totalFrames}<br/>
    Window size: ${r.windowSize}<br/>
    Sequence‑number bits: ${r.sequenceNumberBits}<br/>
    Sequence‑number space: ${r.sequenceNumberSpace}<br/>
    Total transmissions: ${r.totalTransmissions}<br/>
    Total retransmissions: ${r.totalRetransmissions}<br/>
    Frames delivered: ${r.framesDelivered}<br/>
    Completed: ${r.completed}
  `;
}

function renderLog(r) {
  const logDiv = storedRoot?.querySelector('#log');
  if (!logDiv) return;
  const lines = r.eventLog.map(e => {
    const parts = [e.eventType];
    if (e.frameIndex !== null) parts.push('F' + e.frameIndex);
    if (e.sequenceNumber !== null) parts.push('Seq' + e.sequenceNumber);
    if (e.ackNumber !== null) parts.push('ACK' + e.ackNumber);
    if (e.retransmission) parts.push('[retrans]');
    parts.push('- ' + e.description);
    return parts.join(' ');
  }).join('\n');
  logDiv.textContent = lines;
}

function renderVisual(r) {
  const visualDiv = storedRoot?.querySelector('#visual');
  if (!visualDiv) return;
  const map = {};
  r.eventLog.forEach(e => {
    const i = e.frameIndex;
    if (i === null) return;
    if (!map[i]) map[i] = {state: '', retrans: false};
    switch (e.eventType) {
      case 'SEND':   map[i].state = 'sent'; if (e.retransmission) map[i].retrans = true; break;
      case 'LOSS':   map[i].state = 'lost'; break;
      case 'RECEIVE':map[i].state = 'received'; break;
      case 'ACK':    for (let j = 0; j < e.ackNumber; j++) if (map[j]) map[j].state = 'ack'; break;
      case 'DISCARD':map[i].state = 'discard'; break;
    }
  });
  visualDiv.innerHTML = '';
  for (let i = 0; i < r.totalFrames; i++) {
    const div = document.createElement('div');
    div.className = 'frame';
    const info = map[i] || {};
    if (info.state) div.classList.add(info.state);
    if (info.retrans) div.classList.add('retrans');
    div.textContent = i;
    visualDiv.appendChild(div);
  }
}

async function startSimulation() {
  const payload = {
    totalFrames: Number(storedRoot?.querySelector('#totalFrames')?.value),
    windowSize: Number(storedRoot?.querySelector('#windowSize')?.value),
    sequenceNumberBits: Number(storedRoot?.querySelector('#seqBits')?.value)
  };
  showLoading();
  try {
    const resp = await apiPost('/api/arq/sliding-window/simulate', payload);
    renderStats(resp);
    renderLog(resp);
    renderVisual(resp);
    const msgEl = storedRoot?.querySelector('#msg');
    if (msgEl) msgEl.textContent = '✅ Simulation completed';
  } catch (e) {
    showError(e.body?.message || e.message);
  }
}

export async function init(root) {
  if (storedRoot) await destroy();
  storedRoot = root;

  const btn = storedRoot?.querySelector('#simulateBtn');
  if (btn) attach(btn, 'click', async () => {
    clearAll();
    const err = validate();
    if (err) { showError(err); return; }
    await startSimulation();
  });
}

export async function destroy() {
  if (!storedRoot) return;
  removeAllListeners();
  storedRoot = null;
}

