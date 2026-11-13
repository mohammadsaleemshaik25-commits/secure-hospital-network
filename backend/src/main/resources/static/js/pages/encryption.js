// Encryption (AES) page module
// Implements SPA lifecycle with init(root) and destroy()

let storedRoot = null;
const listeners = [];

/** Attach listener and track it for later removal */
function attach(el, type, handler) {
  el.addEventListener(type, handler);
  listeners.push({el, type, handler});
}

function removeAllListeners() {
  listeners.forEach(({el, type, handler}) => el.removeEventListener(type, handler));
  listeners.length = 0;
}

/** API helper – mirrors js/api.js */
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

  // Encrypt controls
  const plainInput = storedRoot.querySelector('#plainInput');
  const encryptBtn = storedRoot.querySelector('#encryptBtn');
  const encryptResult = storedRoot.querySelector('#encryptResult');
  const ivInput = storedRoot.querySelector('#ivInput');
  const cipherInput = storedRoot.querySelector('#cipherInput');

  // Decrypt controls
  const decryptBtn = storedRoot.querySelector('#decryptBtn');
  const decryptResult = storedRoot.querySelector('#decryptResult');

  if (!encryptBtn || !decryptBtn) {
    console.warn('Encryption init: missing expected buttons');
    return;
  }

  // Encrypt handler
  attach(encryptBtn, 'click', async () => {
    clearMsg();
    const plaintext = plainInput?.value;
    if (!plaintext) { setMsg('Plaintext required'); return; }
    showLoading(encryptResult);
    try {
      const data = await apiPost('/api/encryption/encrypt', {plaintext});
      // Clear previous output
      encryptResult.textContent = '';

      // IV section
      const ivDiv = document.createElement('div');
      const ivCode = document.createElement('code');
      ivCode.textContent = data.iv;
      const ivBtn = document.createElement('button');
      ivBtn.textContent = 'Copy';
      attach(ivBtn, 'click', () => copy(data.iv));
      ivDiv.append('IV: ', ivCode, ' ', ivBtn);
      encryptResult.appendChild(ivDiv);

      // Ciphertext section
      const ctDiv = document.createElement('div');
      const ctCode = document.createElement('code');
      ctCode.textContent = data.ciphertext;
      const ctBtn = document.createElement('button');
      ctBtn.textContent = 'Copy';
      attach(ctBtn, 'click', () => copy(data.ciphertext));
      ctDiv.append('Ciphertext: ', ctCode, ' ', ctBtn);
      encryptResult.appendChild(ctDiv);

      // Populate input fields for convenience
      if (ivInput) ivInput.value = data.iv;
      if (cipherInput) cipherInput.value = data.ciphertext;
    } catch (e) {
      setMsg(e.body?.message || 'Encryption failed');
      encryptResult.textContent = '';
    }
  });

  // Decrypt handler
  attach(decryptBtn, 'click', async () => {
    clearMsg();
    const iv = storedRoot.querySelector('#ivInput')?.value;
    const ciphertext = storedRoot.querySelector('#cipherInput')?.value;
    if (!iv || !ciphertext) { setMsg('Both IV and ciphertext are required'); return; }
    showLoading(decryptResult);
    try {
      const data = await apiPost('/api/encryption/decrypt', {iv, ciphertext});
      decryptResult.textContent = '';
      const ptDiv = document.createElement('div');
      const ptCode = document.createElement('code');
      ptCode.textContent = data.plaintext;
      const ptBtn = document.createElement('button');
      ptBtn.textContent = 'Copy';
      attach(ptBtn, 'click', () => copy(data.plaintext));
      ptDiv.append('Plaintext: ', ptCode, ' ', ptBtn);
      decryptResult.appendChild(ptDiv);
    } catch (e) {
      setMsg(e.body?.message || 'Decryption failed');
      decryptResult.textContent = '';
    }
  });
}

export async function destroy() {
  if (!storedRoot) return; // idempotent
  removeAllListeners();
  storedRoot = null;
}

