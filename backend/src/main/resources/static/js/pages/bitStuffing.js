// Bit Stuffing page module
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
const binaryCheck = str => /^[01]+$/.test(str);

export async function init(root) {
  if (storedRoot) await destroy();
  storedRoot = root;

  const encodeBtn = storedRoot.querySelector('#bitEncodeBtn');
  const decodeBtn = storedRoot.querySelector('#bitDecodeBtn');
  const encodeInput = storedRoot.querySelector('#bitEncodeInput');
  const decodeInput = storedRoot.querySelector('#bitDecodeInput');
  const encodeResult = storedRoot.querySelector('#bitEncodeResult');
  const decodeResult = storedRoot.querySelector('#bitDecodeResult');

  if (!encodeBtn || !decodeBtn) { console.warn('BitStuffing init: missing buttons'); return; }

  attach(encodeBtn, 'click', async () => {
    clearMsg();
    const data = encodeInput.value.trim();
    if (!data) { setMsg('Binary input required'); return; }
    if (!binaryCheck(data)) { setMsg('Input must contain only 0 and 1'); return; }
    showLoading(encodeResult);
    try {
      const res = await apiPost('/api/framing/bit-stuffing/encode', {data});
      encodeResult.innerHTML = `Result: <code>${res.result}</code> `;
      const btn = document.createElement('button');
      btn.textContent = 'Copy';
      attach(btn, 'click', () => copy(res.result));
      encodeResult.appendChild(btn);
    } catch (e) {
      setMsg(e.body?.message || 'Encode error');
      encodeResult.textContent = '';
    }
  });

  attach(decodeBtn, 'click', async () => {
    clearMsg();
    const data = decodeInput.value.trim();
    if (!data) { setMsg('Encoded binary required'); return; }
    if (!binaryCheck(data)) { setMsg('Input must contain only 0 and 1'); return; }
    showLoading(decodeResult);
    try {
      const res = await apiPost('/api/framing/bit-stuffing/decode', {data});
      decodeResult.innerHTML = `Result: <code>${res.result}</code> `;
      const btn = document.createElement('button');
      btn.textContent = 'Copy';
      attach(btn, 'click', () => copy(res.result));
      decodeResult.appendChild(btn);
    } catch (e) {
      setMsg(e.body?.message || 'Decode error');
      decodeResult.textContent = '';
    }
  });
}

export async function destroy() {
  if (!storedRoot) return;
  removeAllListeners();
  storedRoot = null;
}

