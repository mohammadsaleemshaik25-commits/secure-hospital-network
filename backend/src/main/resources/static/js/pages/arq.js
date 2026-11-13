// ARQ Overview page module
// Implements SPA lifecycle with init(root) and destroy()

let storedRoot = null;
const listeners = [];
let simulation = null;
let cursor = 0;
let intervalId = null;

/** Helper to attach a listener and track it */
function attach(el, type, handler) {
  el.addEventListener(type, handler);
  listeners.push({ el, type, handler });
}

function removeAllListeners() {
  listeners.forEach(({ el, type, handler }) => el.removeEventListener(type, handler));
  listeners.length = 0;
}

function apiPost(url, data) {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json().then(j => ({ status: r.status, body: j })));
}

function setMsg(txt) { const el = storedRoot?.querySelector('#msg'); if (el) el.textContent = txt; }
function clearMsg() { setMsg(''); }
function showLoading() { const el = storedRoot?.querySelector('#msg'); if (el) { el.textContent = '⏳ Running simulation…'; el.style.color = 'inherit'; } }
function showError(e) { const el = storedRoot?.querySelector('#msg'); if (el) { el.textContent = '❌ ' + e; el.style.color = 'red'; } }

function updateSeqSpace() {
  const swBits = storedRoot?.querySelector('#sw-bits')?.value;
  const gbBits = storedRoot?.querySelector('#gb-bits')?.value;
  const swDiv = storedRoot?.querySelector('#sw-seqspace');
  const gbDiv = storedRoot?.querySelector('#gb-seqspace');
  if (swDiv) swDiv.textContent = 'Sequence‑number space: ' + Math.pow(2, swBits);
  if (gbDiv) gbDiv.textContent = 'Sequence‑number space: ' + Math.pow(2, gbBits);
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

function parseLost() {
  const txt = storedRoot?.querySelector('#lostIndexes')?.value.trim();
  if (!txt) return [];
  return txt.split(',').map(s => Number(s.trim()));
}

function clearAll() {
  const msg = storedRoot?.querySelector('#msg'); if (msg) msg.textContent = '';
  const stats = storedRoot?.querySelector('#stats'); if (stats) stats.innerHTML = '';
  const log = storedRoot?.querySelector('#log'); if (log) log.innerHTML = '';
  const visual = storedRoot?.querySelector('#visual'); if (visual) visual.innerHTML = '';
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
    if (!map[i]) map[i] = { state: '', retrans: false };
    switch (e.eventType) {
      case 'SEND': map[i].state = 'sent'; if (e.retransmission) map[i].retrans = true; break;
      case 'LOSS': map[i].state = 'lost'; break;
      case 'RECEIVE': map[i].state = 'received'; break;
      case 'ACK':
        for (let j = 0; j < e.ackNumber; j++) if (map[j]) map[j].state = 'ack';
        break;
      case 'DISCARD': map[i].state = 'discard'; break;
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
  const activeTab = storedRoot?.querySelector('.tab.active')?.dataset.tab;
  const payload = {};
  if (activeTab === 'sliding') {
    payload.totalFrames = Number(storedRoot?.querySelector('#sw-total')?.value);
    payload.windowSize = Number(storedRoot?.querySelector('#sw-window')?.value);
    payload.sequenceNumberBits = Number(storedRoot?.querySelector('#sw-bits')?.value);
  } else {
    payload.totalFrames = Number(storedRoot?.querySelector('#gb-total')?.value);
    payload.windowSize = Number(storedRoot?.querySelector('#gb-window')?.value);
    payload.sequenceNumberBits = Number(storedRoot?.querySelector('#gb-bits')?.value);
    const lost = storedRoot?.querySelector('#gb-lost')?.value.trim();
    payload.lostFrameIndexes = lost ? lost.split(',').map(s => Number(s.trim())) : [];
  }
  const url = activeTab === 'sliding' ? '/api/arq/sliding-window/simulate' : '/api/arq/go-back-n/simulate';
  showLoading();
  try {
    const resp = await apiPost(url, payload);
    simulation = resp;
    cursor = 0;
    renderStats(resp);
    renderLog(resp);
    renderVisual(resp);
    setMsg('✅ Simulation completed');
  } catch (e) {
    showError(e.body?.message || e.message);
  }
}

function step() {
  if (!simulation) return;
  if (cursor < simulation.eventLog.length - 1) {
    cursor++;
    renderLog({ eventLog: simulation.eventLog.slice(0, cursor + 1) }); // update log up to cursor
    renderVisual({ ...simulation, totalFrames: simulation.totalFrames }); // re-render full visual based on cursor
  }
  if (cursor === simulation.eventLog.length - 1) {
    clearInterval(intervalId);
    intervalId = null;
    const pauseBtn = storedRoot?.querySelector('#pauseBtn');
    const resumeBtn = storedRoot?.querySelector('#resumeBtn');
    if (pauseBtn) pauseBtn.disabled = true;
    if (resumeBtn) resumeBtn.disabled = true;
  }
}

function prevStep() {
  if (!simulation) return;
  if (cursor > 0) {
    cursor--;
    renderLog({ eventLog: simulation.eventLog.slice(0, cursor + 1) });
    renderVisual({ ...simulation, totalFrames: simulation.totalFrames });
  }
}

function setSpeed() {
  const speed = Number(storedRoot?.querySelector('#speed')?.value);
  const delay = 1000 / speed;
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = setInterval(step, delay);
  }
}

export async function init(root) {
  if (storedRoot) await destroy();
  storedRoot = root;

  // Tab handling
  const tabs = storedRoot?.querySelectorAll('.tab');
  tabs?.forEach(t => {
    attach(t, 'click', () => {
      tabs.forEach(x => x.classList.remove('active'));
      const panels = storedRoot?.querySelectorAll('.panel');
      panels?.forEach(p => p.classList.remove('active'));
      t.classList.add('active');
      const panel = storedRoot?.querySelector('#panel-' + t.dataset.tab);
      if (panel) panel.classList.add('active');
    });
  });

  // Sequence‑space updates
  const swBitsEl = storedRoot?.querySelector('#sw-bits');
  const gbBitsEl = storedRoot?.querySelector('#gb-bits');
  if (swBitsEl) attach(swBitsEl, 'input', updateSeqSpace);
  if (gbBitsEl) attach(gbBitsEl, 'input', updateSeqSpace);
  updateSeqSpace();

  // Button bindings (shared for both tabs)
  const startBtn = storedRoot?.querySelector('#startBtn');
  const pauseBtn = storedRoot?.querySelector('#pauseBtn');
  const resumeBtn = storedRoot?.querySelector('#resumeBtn');
  const nextBtn = storedRoot?.querySelector('#nextBtn');
  const prevBtn = storedRoot?.querySelector('#prevBtn');
  const resetBtn = storedRoot?.querySelector('#resetBtn');
  const speedInput = storedRoot?.querySelector('#speed');

  if (startBtn) attach(startBtn, 'click', async () => {
    clearAll();
    const err = validate();
    if (err) { showError(err); return; }
    await startSimulation();
  });
  if (pauseBtn) attach(pauseBtn, 'click', () => {
    if (intervalId) { clearInterval(intervalId); intervalId = null; }
    if (pauseBtn) pauseBtn.disabled = true;
    if (resumeBtn) resumeBtn.disabled = false;
  });
  if (resumeBtn) attach(resumeBtn, 'click', () => {
    if (!intervalId) {
      const speed = Number(storedRoot?.querySelector('#speed')?.value);
      intervalId = setInterval(step, 1000 / speed);
      if (pauseBtn) pauseBtn.disabled = false;
      if (resumeBtn) resumeBtn.disabled = true;
    }
  });
  if (nextBtn) attach(nextBtn, 'click', step);
  if (prevBtn) attach(prevBtn, 'click', prevStep);
  if (resetBtn) attach(resetBtn, 'click', () => {
    simulation = null;
    cursor = 0;
    if (intervalId) { clearInterval(intervalId); intervalId = null; }
    clearAll();
    const btns = [startBtn, pauseBtn, resumeBtn, prevBtn, nextBtn, resetBtn];
    if (startBtn) startBtn.disabled = false;
    if (pauseBtn) pauseBtn.disabled = true;
    if (resumeBtn) resumeBtn.disabled = true;
    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;
    if (resetBtn) resetBtn.disabled = true;
  });
  if (speedInput) attach(speedInput, 'input', setSpeed);
}

export async function destroy() {
  if (!storedRoot) return;
  removeAllListeners();
  if (intervalId) { clearInterval(intervalId); intervalId = null; }
  storedRoot = null;
}
