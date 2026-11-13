import React, { useState, useEffect, useRef } from 'react';
import {
  Radio,
  Send,
  PowerOff,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Activity,
} from 'lucide-react';
import api from '../services/api';
import PageContainer from '../components/ui/PageContainer';

export default function Tcp() {
  const [connectionId, setConnectionId] = useState('');
  const [connectionState, setConnectionState] = useState('DISCONNECTED');
  const [handshakeStep, setHandshakeStep] = useState(0); // 0=none, 1=SYN, 2=SYN-ACK, 3=ESTABLISHED
  const [srcPort, setSrcPort] = useState('8080');
  const [dstPort, setDstPort] = useState('8083');
  const [lossProb, setLossProb] = useState('0.1');
  const [message, setMessage] = useState('');
  const [log, setLog] = useState([]);
  const [lastMetrics, setLastMetrics] = useState(null);
  const [statusStats, setStatusStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lastLoggedState = useRef('DISCONNECTED');

  const addLog = (entry) => {
    const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
    setLog((prev) => [`[${time}] ${entry}`, ...prev]);
  };

  const connect = async () => {
    const sp = Number(srcPort);
    const dp = Number(dstPort);
    if (!srcPort || isNaN(sp) || !dstPort || isNaN(dp)) {
      setError('Source and Destination port numbers are required.');
      return;
    }
    const lp = lossProb ? Number(lossProb) : undefined;
    if (lp !== undefined && (isNaN(lp) || lp < 0 || lp > 1)) {
      setError('Loss probability must be a decimal between 0 and 1.');
      return;
    }

    setLoading(true);
    setError('');
    setHandshakeStep(1);

    try {
      const payload = {
        srcPort: sp,
        dstPort: dp,
        lossProbability: lp,
      };
      const res = await api.post('/transport/tcp/connect', payload);
      const connId = res.data.connectionId;
      setConnectionId(connId);
      setConnectionState(res.data.state || 'ESTABLISHED');
      setHandshakeStep(3); // 3-way handshake established
      lastLoggedState.current = res.data.state || 'ESTABLISHED';

      addLog(`[STEP 1] SYN sent (Client seq: ${res.data.clientSeq ?? 100})`);
      addLog(`[STEP 2] SYN-ACK received (Server seq: ${res.data.serverSeq ?? 300}, ack: ${(res.data.clientSeq ?? 100) + 1})`);
      addLog(`[STEP 3] ACK confirmed. Connection ${connId} ESTABLISHED.`);
    } catch (e) {
      setHandshakeStep(0);
      setError(e.response?.data?.message || e.message || 'TCP 3-way handshake failed');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!connectionId) {
      setError('Active TCP connection required. Click Connect first.');
      return;
    }
    if (!message.trim()) {
      setError('Message payload is required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const lp = lossProb ? Number(lossProb) : undefined;
      const payload = {
        connectionId,
        payload: message.trim(),
        lossProbability: lp,
        maxRetries: 3,
      };
      const res = await api.post('/transport/tcp/send', payload);
      const { ackNumber, retransmissionRequired, totalBytesSent } = res.data || {};

      setLastMetrics({ ackNumber, retransmissionRequired, totalBytesSent });

      addLog(`DATA TRANSMISSION: "${message.trim()}"`);
      if (retransmissionRequired) {
        addLog(`[LOSS DETECTED] Retransmission timer triggered. Segment resent.`);
      }
      addLog(`CUMULATIVE ACK: ackNum=${ackNumber ?? 'N/A'}, bytes=${totalBytesSent ?? 'N/A'}`);
      setMessage('');
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'TCP send failed');
    } finally {
      setLoading(false);
    }
  };

  const closeConnection = async () => {
    if (!connectionId) return;
    setLoading(true);
    setError('');

    try {
      await api.post('/transport/tcp/close', { connectionId });
      addLog(`FIN-ACK Teardown Completed. Connection ${connectionId} closed.`);
      setConnectionId('');
      setConnectionState('CLOSED');
      setHandshakeStep(0);
      lastLoggedState.current = 'CLOSED';
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'TCP teardown failed');
    } finally {
      setLoading(false);
    }
  };

  // Status polling – only log on actual state transitions
  useEffect(() => {
    if (!connectionId) return undefined;
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/transport/tcp/status/${connectionId}`);
        if (res.data) {
          if (res.data.state !== undefined) {
            setConnectionState(res.data.state);
            if (res.data.state !== lastLoggedState.current) {
              addLog(`State changed -> ${res.data.state}`);
              lastLoggedState.current = res.data.state;
            }
          }
          setStatusStats(res.data);
        }
      } catch {
        // quiet poll fail
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [connectionId]);

  const clearLogOnly = () => {
    setLog([]);
    setError('');
  };

  return (
    <PageContainer
      title="Reliable TCP Transport Protocol Engine"
      badge="Connection-Oriented"
      description="Visual 3-Way Handshake (SYN → SYN-ACK → ACK), reliable sequence transmission, channel loss retries, and FIN teardown."
      actions={
        <button
          onClick={clearLogOnly}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-[#202D43] hover:bg-[#283852] text-[#F1F5F9] border border-[#344258] transition-colors"
        >
          <Trash2 size={14} />
          Clear Log
        </button>
      }
    >
      {/* 3-Way Handshake Educational Visual Flow */}
      <div className="bg-[#18243A] border border-[#344258] rounded-xl p-5 shadow-sm space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#A8B5C9] flex items-center gap-2">
          <Activity size={16} className="text-[#8B7CF6]" />
          TCP 3-Way Handshake Protocol Sequence
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
          {/* Step 1 */}
          <div
            className={`p-3.5 rounded-xl border transition-all ${
              handshakeStep >= 1
                ? 'bg-[#202D43] border-[#8B7CF6] shadow-[0_0_10px_rgba(139,124,246,0.2)]'
                : 'bg-[#202D43]/60 border-[#344258]'
            }`}
          >
            <div className="flex items-center justify-between text-[#A99CFB] font-bold mb-1">
              <span>Step 1: SYN</span>
              <ArrowRight size={14} />
            </div>
            <p className="text-[11px] text-[#A8B5C9]">Client initiates sequence synchronization</p>
          </div>

          {/* Step 2 */}
          <div
            className={`p-3.5 rounded-xl border transition-all ${
              handshakeStep >= 2
                ? 'bg-[#202D43] border-[#8B7CF6] shadow-[0_0_10px_rgba(139,124,246,0.2)]'
                : 'bg-[#202D43]/60 border-[#344258]'
            }`}
          >
            <div className="flex items-center justify-between text-[#A99CFB] font-bold mb-1">
              <ArrowLeft size={14} />
              <span>Step 2: SYN-ACK</span>
            </div>
            <p className="text-[11px] text-[#A8B5C9]">Server responds with sequence + ACK</p>
          </div>

          {/* Step 3 */}
          <div
            className={`p-3.5 rounded-xl border transition-all ${
              handshakeStep === 3
                ? 'bg-[#202D43] border-[#10B981] shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : 'bg-[#202D43]/60 border-[#344258]'
            }`}
          >
            <div className="flex items-center justify-between text-[#10B981] font-bold mb-1">
              <span>Step 3: ACK</span>
              <CheckCircle2 size={14} />
            </div>
            <p className="text-[11px] text-[#A8B5C9]">Connection ESTABLISHED and active</p>
          </div>
        </div>
      </div>

      {/* Connection State Metric Banner */}
      <div className="bg-[#18243A] border border-[#344258] rounded-xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#8B7CF6]/10 border border-[#8B7CF6]/30 flex items-center justify-center text-[#8B7CF6]">
            <Radio size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#A8B5C9]">Socket Status:</span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  connectionId
                    ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30'
                    : 'bg-[#202D43] text-[#A8B5C9]'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${connectionId ? 'bg-[#10B981] animate-pulse' : 'bg-slate-500'}`} />
                {connectionId ? connectionState : 'DISCONNECTED'}
              </span>
            </div>
            <div className="text-xs font-mono text-[#F1F5F9] mt-0.5">
              Connection ID: <strong className="text-[#A99CFB]">{connectionId || 'None (Unestablished)'}</strong>
            </div>
          </div>
        </div>

        {/* Live Metrics */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          {lastMetrics && (
            <>
              <div className="px-3 py-1.5 rounded-lg bg-[#202D43] border border-[#344258]">
                <span className="text-[#A8B5C9]">ACK Num: </span>
                <strong className="text-[#A99CFB]">{lastMetrics.ackNumber ?? '—'}</strong>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-[#202D43] border border-[#344258]">
                <span className="text-[#A8B5C9]">Retransmit: </span>
                <strong className={lastMetrics.retransmissionRequired ? 'text-[#D6A85F]' : 'text-[#10B981]'}>
                  {lastMetrics.retransmissionRequired ? 'Triggered' : 'None'}
                </strong>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-[#202D43] border border-[#344258]">
                <span className="text-[#A8B5C9]">Total Sent: </span>
                <strong className="text-[#F1F5F9]">{lastMetrics.totalBytesSent ?? '—'} B</strong>
              </div>
            </>
          )}

          {statusStats && (
            <div className="px-3 py-1.5 rounded-lg bg-[#202D43] border border-[#344258]">
              <span className="text-[#A8B5C9]">Lost: </span>
              <strong className="text-[#EF6464]">{statusStats.lostPackets ?? 0}</strong>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TCP Socket Controls */}
        <div className="bg-[#18243A] border border-[#344258] rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="pb-3 border-b border-[#344258]">
            <h2 className="text-sm font-semibold text-[#F1F5F9]">Socket Connection Parameters</h2>
            <p className="text-xs text-[#A8B5C9]">Configure virtual TCP endpoint ports and simulated channel loss</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#A8B5C9] mb-1.5">Source Port</label>
              <input
                type="number"
                value={srcPort}
                onChange={(e) => setSrcPort(e.target.value)}
                disabled={loading || Boolean(connectionId)}
                className="w-full rounded-lg bg-[#202D43] border border-[#344258] px-3 py-2 text-xs sm:text-sm font-mono text-[#F1F5F9] focus:ring-2 focus:ring-[#8B7CF6] focus:outline-none disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#A8B5C9] mb-1.5">Destination Port</label>
              <input
                type="number"
                value={dstPort}
                onChange={(e) => setDstPort(e.target.value)}
                disabled={loading || Boolean(connectionId)}
                className="w-full rounded-lg bg-[#202D43] border border-[#344258] px-3 py-2 text-xs sm:text-sm font-mono text-[#F1F5F9] focus:ring-2 focus:ring-[#8B7CF6] focus:outline-none disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#A8B5C9] mb-1.5">Loss Probability</label>
              <input
                type="text"
                value={lossProb}
                onChange={(e) => setLossProb(e.target.value)}
                placeholder="0.0 - 1.0"
                disabled={loading}
                className="w-full rounded-lg bg-[#202D43] border border-[#344258] px-3 py-2 text-xs sm:text-sm font-mono text-[#F1F5F9] focus:ring-2 focus:ring-[#8B7CF6] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3">
            {!connectionId ? (
              <button
                onClick={connect}
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#8B7CF6] hover:bg-[#7C6AE6] text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-50"
              >
                <Radio size={16} />
                {loading ? 'Performing 3-Way Handshake...' : 'Establish TCP Connection'}
              </button>
            ) : (
              <button
                onClick={closeConnection}
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#EF6464] hover:bg-[#D95353] text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-50"
              >
                <PowerOff size={16} />
                {loading ? 'Closing Connection...' : 'Close TCP Connection (FIN)'}
              </button>
            )}
          </div>

          {/* Send Payload Section */}
          <div className="pt-3 border-t border-[#344258] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[#A8B5C9]">Transmission Payload</label>
              <button
                type="button"
                onClick={() => setMessage('ICU_VENTILATOR_TELEMETRY: PRESSURE=18cmH2O')}
                disabled={!connectionId}
                className="text-xs text-[#A99CFB] hover:underline disabled:opacity-50 font-medium"
              >
                Sample Telemetry
              </button>
            </div>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={connectionId ? 'Enter message payload to transmit...' : 'Connect socket to transmit messages'}
              disabled={loading || !connectionId}
              className="w-full rounded-lg bg-[#202D43] border border-[#344258] p-3 text-xs sm:text-sm font-mono text-[#F1F5F9] placeholder-[#A8B5C9]/60 focus:ring-2 focus:ring-[#8B7CF6] focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !connectionId}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#202D43] hover:bg-[#283852] text-[#A99CFB] border border-[#8B7CF6]/40 font-semibold text-sm transition-colors shadow-sm disabled:opacity-50"
            >
              <Send size={16} />
              {loading ? 'Transmitting Segment...' : 'Send TCP Segment'}
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-[#EF6464]/10 border border-[#EF6464]/30 text-[#EF6464] text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-[#EF6464]" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Activity & Protocol Log Panel */}
        <div className="bg-[#18243A] border border-[#344258] rounded-xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#344258]">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-[#8B7CF6]" />
                <h2 className="text-sm font-semibold text-[#F1F5F9]">TCP Activity Log & State Trace</h2>
              </div>
              <span className="text-xs font-mono text-[#A8B5C9]">{log.length} events</span>
            </div>

            <div className="p-3.5 rounded-lg bg-[#202D43] border border-[#344258] font-mono text-xs text-[#A8B5C9] max-h-96 overflow-y-auto space-y-1.5">
              {log.length === 0 ? (
                <div className="text-center py-16 text-[#A8B5C9]">
                  Socket idle. Connect to begin capturing transmission events and ACKs.
                </div>
              ) : (
                log.map((entry, idx) => (
                  <div
                    key={idx}
                    className={`leading-relaxed break-all ${
                      entry.includes('DATA TRANSMISSION:')
                        ? 'text-[#A99CFB]'
                        : entry.includes('CUMULATIVE ACK:')
                        ? 'text-[#10B981]'
                        : entry.includes('LOSS DETECTED')
                        ? 'text-[#D6A85F] font-bold'
                        : entry.includes('ESTABLISHED')
                        ? 'text-[#10B981] font-bold'
                        : 'text-[#F1F5F9]'
                    }`}
                  >
                    {entry}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
