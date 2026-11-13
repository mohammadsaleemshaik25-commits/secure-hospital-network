// UDP SPA module
// Exports init(root) and destroy() for the UDP Transport Simulation page.

import { apiPost, apiGet } from './api.js';

let storedRoot = null;
const listeners = [];
const attach = (el, type, handler) => {
  el.addEventListener(type, handler);
  listeners.push(() => el.removeEventListener(type, handler));
};

const esc = str => String(str).replace(/[&<>\'\"]/g, m => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[m] || m));

export function init(root) {
  storedRoot = root;
  const setStatus = msg => { const el = root.querySelector('#udpStatus'); if (el) el.textContent = msg; };
  const validateProb = v => v === '' || (!isNaN(v) && +v >= 0 && +v <= 1);
  const validatePort = v => Number.isInteger(v) && v >= 1 && v <= 65535;

  // Send Datagram
  const sendBtn = root.querySelector('#udpSendBtn');
  const handlerSend = async () => {
    const clientId = root.querySelector('#clientId').value.trim();
    const payload = root.querySelector('#udpPayload').value;
    const loss = root.querySelector('#udpLoss').value.trim();
    const srcPort = root.querySelector('#srcPort').value.trim();
    const dstPort = root.querySelector('#dstPort').value.trim();
    if (!clientId) { setStatus('Client ID required'); return; }
    if (!payload) { setStatus('Payload required'); return; }
    if (!validateProb(loss)) { setStatus('Loss probability must be between 0 and 1'); return; }
    if (!validatePort(+srcPort)) { setStatus('Source port must be between 1 and 65535'); return; }
    if (!validatePort(+dstPort)) { setStatus('Destination port must be between 1 and 65535'); return; }
    const body = { clientId, payload };
    if (loss !== '') body.lossProbability = +loss;
    body.srcPort = +srcPort;
    body.dstPort = +dstPort;
    sendBtn.disabled = true;
    try {
      const data = await apiPost('/api/transport/udp/send', body);
      root.querySelector('#udpPacketId').textContent = esc(data.packetId);
      root.querySelector('#udpDelivered').textContent = esc(data.delivered ? 'Delivered' : 'Not Delivered');
    } catch (e) { setStatus(e.message); }
    sendBtn.disabled = false;
  };
  attach(sendBtn, 'click', handlerSend);

  // Stats
  const statsBtn = root.querySelector('#udpStatsBtn');
  const handlerStats = async () => {
    const clientId = root.querySelector('#statsClientId').value.trim();
    if (!clientId) { setStatus('Client ID required for stats'); return; }
    statsBtn.disabled = true;
    try {
      const data = await apiGet(`/api/transport/udp/stats/${encodeURIComponent(clientId)}`);
      root.querySelector('#statsClientIdDisplay').textContent = esc(data.clientId);
      root.querySelector('#statsSentPackets').textContent = esc(data.sentPackets);
      root.querySelector('#statsDeliveredPackets').textContent = esc(data.deliveredPackets);
      root.querySelector('#statsLostPackets').textContent = esc(data.lostPackets);
    } catch (e) { setStatus(e.message); }
    statsBtn.disabled = false;
  };
  attach(statsBtn, 'click', handlerStats);
}

export function destroy() {
  listeners.forEach(fn => fn());
  listeners.length = 0;
  storedRoot = null;
}

