// Framing page module
// Implements init(root) and destroy() with safe lifecycle handling.

let storedRoot = null; // The root element passed to init
const listeners = [];

/** Helper: attach an event listener and track it for later removal */
function attach(button, type, handler) {
  button.addEventListener(type, handler);
  listeners.push({button, type, handler});
}

/** Store original inline onclick attribute and remove it */
function storeAndRemoveOnclick(button) {
  const original = button.getAttribute('onclick');
  if (original) {
    button.setAttribute('data-original-onclick', original);
    button.removeAttribute('onclick');
  }
}

/** Restore original onclick attributes for elements within the stored root */
function restoreOnclicks() {
  if (!storedRoot) return;
  const elems = storedRoot.querySelectorAll('[data-original-onclick]');
  elems.forEach(el => {
    const orig = el.getAttribute('data-original-onclick');
    if (orig) {
      el.setAttribute('onclick', orig);
    }
    el.removeAttribute('data-original-onclick');
  });
}

/** Remove all listeners that were attached via attach() */
function removeListeners() {
  listeners.forEach(({button, type, handler}) => {
    button.removeEventListener(type, handler);
  });
  listeners.length = 0;
}

/** Thin wrapper around fetch for POST JSON */
function apiPost(url, data) {
  return fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  })
    .then(r => r.json().then(j => ({status: r.status, body: j })));
}

/** Utility to show a message in the #msg element */
function showMsg(txt) {
  const msgEl = storedRoot?.querySelector('#msg');
  if (msgEl) msgEl.textContent = txt;
}

/** Character‑stuffing handlers */
function encodeChar() {
  const data = storedRoot.querySelector('#charInput').value;
  apiPost('/api/framing/character-stuffing/encode', {data})
    .then(res => {
      if (res.status === 200) {
        storedRoot.querySelector('#charResult').textContent = res.body.result;
        showMsg('');
      } else {
        showMsg(res.body.message || 'Error');
      }
    })
    .catch(() => showMsg('Network error'));
}

function decodeChar() {
  const data = storedRoot.querySelector('#charInput').value;
  apiPost('/api/framing/character-stuffing/decode', {data})
    .then(res => {
      if (res.status === 200) {
        storedRoot.querySelector('#charResult').textContent = res.body.result;
        showMsg('');
      } else {
        showMsg(res.body.message || 'Error');
      }
    })
    .catch(() => showMsg('Network error'));
}

function clearChar() {
  storedRoot.querySelector('#charInput').value = '';
  storedRoot.querySelector('#charResult').textContent = '';
  showMsg('');
}

/** Bit‑stuffing handlers */
function encodeBit() {
  const data = storedRoot.querySelector('#bitInput').value;
  apiPost('/api/framing/bit-stuffing/encode', {data})
    .then(res => {
      if (res.status === 200) {
        storedRoot.querySelector('#bitResult').textContent = res.body.result;
        showMsg('');
      } else {
        showMsg(res.body.message || 'Error');
      }
    })
    .catch(() => showMsg('Network error'));
}

function decodeBit() {
  const data = storedRoot.querySelector('#bitInput').value;
  apiPost('/api/framing/bit-stuffing/decode', {data})
    .then(res => {
      if (res.status === 200) {
        storedRoot.querySelector('#bitResult').textContent = res.body.result;
        showMsg('');
      } else {
        showMsg(res.body.message || 'Error');
      }
    })
    .catch(() => showMsg('Network error'));
}

function clearBit() {
  storedRoot.querySelector('#bitInput').value = '';
  storedRoot.querySelector('#bitResult').textContent = '';
  showMsg('');
}

/** Exported lifecycle functions */
export function init(root) {
  // If init is called while a previous instance is still alive, clean it up first.
  if (storedRoot) destroy();
  storedRoot = root;

  // Preserve and strip inline onclick attributes so they don't fire outside this module.
  const inlineButtons = storedRoot.querySelectorAll('button[onclick]');
  inlineButtons.forEach(storeAndRemoveOnclick);

  // Buttons appear in a fixed order: Char Encode, Char Decode, Char Clear, Bit Encode, Bit Decode, Bit Clear
  const allButtons = storedRoot.querySelectorAll('button');
  if (allButtons.length < 6) {
    console.warn('Framing init: expected at least 6 buttons, found', allButtons.length);
    return;
  }
  const [encCharBtn, decCharBtn, clrCharBtn, encBitBtn, decBitBtn, clrBitBtn] = allButtons;

  attach(encCharBtn, 'click', e => { e.preventDefault(); encodeChar(); });
  attach(decCharBtn, 'click', e => { e.preventDefault(); decodeChar(); });
  attach(clrCharBtn, 'click', e => { e.preventDefault(); clearChar(); });
  attach(encBitBtn, 'click', e => { e.preventDefault(); encodeBit(); });
  attach(decBitBtn, 'click', e => { e.preventDefault(); decodeBit(); });
  attach(clrBitBtn, 'click', e => { e.preventDefault(); clearBit(); });
}

export function destroy() {
  if (!storedRoot) return; // idempotent
  removeListeners();
  restoreOnclicks();
  storedRoot = null;
}

