// Character Stuffing page module
// Implements SPA lifecycle with init(root) and destroy()

let storedRoot = null; // root element for this page instance
const listeners = [];

/** Helper to attach listener and track it */
function attach(el, type, handler) {
  el.addEventListener(type, handler);
  listeners.push({el, type, handler});
}

/** Remove all attached listeners */
function removeAllListeners() {
  listeners.forEach(({el, type, handler}) => el.removeEventListener(type, handler));
  listeners.length = 0;
}

/** API helper – mirrors js/api.js's apiPost */
function apiPost(url, data) {
  return fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  })
    .then(r => r.json().then(j => ({status: r.status, body: j})));
}

/** UI helpers scoped to storedRoot */
function setMsg(txt) {
  const el = storedRoot?.querySelector('#msg');
  if (el) el.textContent = txt;
}
function clearMsg() { setMsg(''); }
function showLoading(el) { if (el) el.textContent = 'Loading...'; }
function copy(text) { navigator.clipboard.writeText(text).catch(() => {}); }

/** Exported lifecycle functions */
export async function init(root) {
  // If a previous instance leaked, clean it first
  if (storedRoot) await destroy();
  storedRoot = root;

  // No global copy helper needed

  // Grab elements within the root
  const encodeBtn = storedRoot.querySelector('#charEncodeBtn');
  const decodeBtn = storedRoot.querySelector('#charDecodeBtn');
  const encodeInput = storedRoot.querySelector('#charEncodeInput');
  const decodeInput = storedRoot.querySelector('#charDecodeInput');
  const encodeResult = storedRoot.querySelector('#charEncodeResult');
  const decodeResult = storedRoot.querySelector('#charDecodeResult');

  if (!encodeBtn || !decodeBtn) {
    console.warn('CharacterStuffing init: missing expected buttons');
    return;
  }

  // Encode handler
  attach(encodeBtn, 'click', async (e) => {
    e.preventDefault();
    clearMsg();
    const data = encodeInput.value;
    if (!data) { setMsg('Input data required'); return; }
    showLoading(encodeResult);
    try {
      const res = await apiPost('/api/framing/character-stuffing/encode', {data});
      // Render result and attach copy button without inline onclick
      encodeResult.innerHTML = `Result: <code>${res.result}</code> `;
      const encCopyBtn = document.createElement('button');
      encCopyBtn.textContent = 'Copy';
      attach(encCopyBtn, 'click', () => copy(res.result));
      encodeResult.appendChild(encCopyBtn);
    } catch (err) {
      setMsg(err.body?.message || 'Encode error');
      encodeResult.textContent = '';
    }
  });

  // Decode handler
  attach(decodeBtn, 'click', async (e) => {
    e.preventDefault();
    clearMsg();
    const data = decodeInput.value;
    if (!data) { setMsg('Encoded data required'); return; }
    showLoading(decodeResult);
    try {
      const res = await apiPost('/api/framing/character-stuffing/decode', {data});
      // Render result and attach copy button without inline onclick
      decodeResult.innerHTML = `Result: <code>${res.result}</code> `;
      const decCopyBtn = document.createElement('button');
      decCopyBtn.textContent = 'Copy';
      attach(decCopyBtn, 'click', () => copy(res.result));
      decodeResult.appendChild(decCopyBtn);
    } catch (err) {
      setMsg(err.body?.message || 'Decode error');
      decodeResult.textContent = '';
    }
  });
}

export async function destroy() {
  if (!storedRoot) return; // idempotent
  removeAllListeners();
  // No global helper cleanup needed
  storedRoot = null;
}

