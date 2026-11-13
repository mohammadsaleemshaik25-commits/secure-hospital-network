// CRC page module
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
function showLoading(el) { if (el) el.textContent = 'Loading...'; }
function copy(text) { navigator.clipboard.writeText(text).catch(() => {}); }

export async function init(root) {
  if (storedRoot) await destroy();
  storedRoot = root;

  // Calculation controls
  const algoSelect = storedRoot.querySelector('#crcAlgoSelect');
  const calcInput = storedRoot.querySelector('#crcCalcInput');
  const calcBtn = storedRoot.querySelector('#crcCalcBtn');
  const calcResult = storedRoot.querySelector('#crcCalcResult');

  // Verification controls
  const verifyAlgoSelect = storedRoot.querySelector('#crcVerifyAlgoSelect');
  const verifyData = storedRoot.querySelector('#crcVerData');
  const verifyValue = storedRoot.querySelector('#crcVerValue');
  const verifyBtn = storedRoot.querySelector('#crcVerifyBtn');
  const verifyResult = storedRoot.querySelector('#crcVerifyResult');

  if (!calcBtn || !verifyBtn) { console.warn('CRC init: missing expected buttons'); return; }

  // Calculation handler
  attach(calcBtn, 'click', async () => {
    clearMsg();
    const algo = algoSelect?.value;
    const data = calcInput?.value;
    if (!data) { setMsg('Input data required'); return; }
    showLoading(calcResult);
    const endpoint = algo === 'crc16' ? '/api/crc/crc16/calculate' : '/api/crc/crc32/calculate';
    try {
      const res = await apiPost(endpoint, {data});
      calcResult.innerHTML = `CRC: <code>${res.crc}</code> `;
      const btn = document.createElement('button');
      btn.textContent = 'Copy';
      attach(btn, 'click', () => copy(res.crc));
      calcResult.appendChild(btn);
    } catch (e) {
      setMsg(e.body?.message || 'Calculation error');
      calcResult.textContent = '';
    }
  });

  // Verification handler
  attach(verifyBtn, 'click', async () => {
    clearMsg();
    const algo = verifyAlgoSelect?.value;
    const data = verifyData?.value;
    const crc = verifyValue?.value;
    if (!data || !crc) { setMsg('Both data and CRC value are required'); return; }
    showLoading(verifyResult);
    const endpoint = algo === 'crc16' ? '/api/crc/crc16/verify' : '/api/crc/crc32/verify';
    try {
      const res = await apiPost(endpoint, {data, crc});
      const status = res.valid ? 'VALID' : 'INVALID';
      verifyResult.innerHTML = `<strong>${status}</strong>: <code>${res.message}</code>`;
    } catch (e) {
      setMsg(e.body?.message || 'Verification error');
      verifyResult.textContent = '';
    }
  });
}

export async function destroy() {
  if (!storedRoot) return;
  removeAllListeners();
  storedRoot = null;
}

