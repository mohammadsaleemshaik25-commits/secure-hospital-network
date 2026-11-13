// TCP SPA module
// Exports init(root) and destroy() for the TCP Transport Simulation page.

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
  const setStatus = msg => { const el = root.querySelector('#status'); if (el) el.textContent = msg; };
  const validatePort = v => Number.isInteger(v) && v >= 1 && v <= 65535;
  const validateProb = v => v === '' || (!isNaN(v) && +v >= 0 && +v <= 1);
  const validateRetries = v => v === '' || (Number.isInteger(+v) && +v >= 0);

  // Connection
  const connectBtn = root.querySelector('#connectBtn');
  const handlerConnect = async () => {
    const src = root.querySelector('#srcPort').value.trim();
    const dst = root.querySelector('#dstPort').value.trim();
    const loss = root.querySelector('#connLoss').value.trim();
    if (!validatePort(+src) || !validatePort(+dst)) { setStatus('Ports must be integers 1‑65535'); return; }
    if (!validateProb(loss)) { setStatus('Loss probability must be between 0 and 1'); return; }
    const payload = { srcPort: +src, dstPort: +dst };
    if (loss !== '') payload.lossProbability = +loss;
    connectBtn.disabled = true;
    try {
      const data = await apiPost('/api/transport/tcp/connect', payload);
      root.querySelector('#connId').textContent = esc(data.connectionId);
      root.querySelector('#connState').textContent = esc(data.state);
      root.querySelector('#clientSeq').textContent = esc(data.clientSeq);
      root.querySelector('#serverSeq').textContent = esc(data.serverSeq);
      root.querySelector('#handshakeLog').innerHTML = (data.eventLog || []).map(l => `<div>${esc(l)}</div>`).join('');
      // Show sections
      root.querySelector('#sendSection').style.display = 'block';
      root.querySelector('#statusSection').style.display = 'block';
      root.querySelector('#closeSection').style.display = 'block';
    } catch (e) { setStatus(e.message); }
    connectBtn.disabled = false;
  };
  attach(connectBtn, 'click', handlerConnect);

  // Send data
  const sendBtn = root.querySelector('#sendBtn');
  const handlerSend = async () => {
    const connId = root.querySelector('#connId').textContent;
    const payload = root.querySelector('#payload').value;
    const loss = root.querySelector('#sendLoss').value.trim();
    const retries = root.querySelector('#maxRetries').value.trim();
    if (!payload) { setStatus('Payload required'); return; }
    if (!validateProb(loss)) { setStatus('Loss probability must be 0‑1'); return; }
    if (!validateRetries(retries)) { setStatus('Max retries must be a non‑negative integer'); return; }
    const body = { connectionId: connId, payload };
    if (loss !== '') body.lossProbability = +loss;
    if (retries !== '') body.maxRetries = +retries;
    sendBtn.disabled = true;
    try {
      const data = await apiPost('/api/transport/tcp/send', body);
      root.querySelector('#ackNum').textContent = esc(data.ackNumber);
      root.querySelector('#retrans').textContent = esc(data.retransmissionRequired);
      root.querySelector('#bytesSent').textContent = esc(data.totalBytesSent);
    } catch (e) { setStatus(e.message); }
    sendBtn.disabled = false;
  };
  attach(sendBtn, 'click', handlerSend);

  // Status
  const statusBtn = root.querySelector('#statusBtn');
  const handlerStatus = async () => {
    const connId = root.querySelector('#connId').textContent;
    statusBtn.disabled = true;
    try {
      const data = await apiGet(`/api/transport/tcp/status/${encodeURIComponent(connId)}`);
      root.querySelector('#curState').textContent = esc(data.state);
      root.querySelector('#bytesSentStat').textContent = esc(data.sentBytes);
      root.querySelector('#bytesRecvStat').textContent = esc(data.receivedBytes);
      root.querySelector('#lostPackets').textContent = esc(data.lostPackets);
      root.querySelector('#retransmissions').textContent = esc(data.retransmissions);
    } catch (e) { setStatus(e.message); }
    statusBtn.disabled = false;
  };
  attach(statusBtn, 'click', handlerStatus);

  // Close connection
  const closeBtn = root.querySelector('#closeBtn');
  const handlerClose = async () => {
    const connId = root.querySelector('#connId').textContent;
    closeBtn.disabled = true;
    try {
      const data = await apiPost('/api/transport/tcp/close', { connectionId: connId });
      root.querySelector('#finalState').textContent = esc(data.finalState);
      // Hide sections
      root.querySelector('#sendSection').style.display = 'none';
      root.querySelector('#statusSection').style.display = 'none';
      root.querySelector('#closeSection').style.display = 'none';
    } catch (e) { setStatus(e.message); }
    closeBtn.disabled = false;
  };
  attach(closeBtn, 'click', handlerClose);
}

export function destroy() {
  listeners.forEach(fn => fn());
  listeners.length = 0;
  storedRoot = null;
}

