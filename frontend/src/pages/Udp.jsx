import React, { useState } from 'react';
import {
  Zap,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  BarChart2,
} from 'lucide-react';
import api from '../services/api';
import PageContainer from '../components/ui/PageContainer';

export default function Udp() {
  const [srcPort, setSrcPort] = useState('5000');
  const [dstPort, setDstPort] = useState('5005');
  const [payload, setPayload] = useState('');
  const [lossProb, setLossProb] = useState('0.15');
  const [clientId, setClientId] = useState('icu-telemetry-node');
  const [response, setResponse] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState('');

  const sendPacket = async () => {
    const sp = Number(srcPort);
    const dp = Number(dstPort);
    if (!srcPort || isNaN(sp) || !dstPort || isNaN(dp)) {
      setError('Source and Destination port numbers are required.');
      return;
    }
    if (!payload.trim()) {
      setError('UDP payload message is required.');
      return;
    }

    const lp = lossProb ? Number(lossProb) : undefined;
    if (lp !== undefined && (isNaN(lp) || lp < 0 || lp > 1)) {
      setError('Loss probability must be between 0 and 1.');
      return;
    }

    setLoading(true);
    setError('');
    setResponse(null);

    try {
      const res = await api.post('/transport/udp/send', {
        srcPort: sp,
        dstPort: dp,
        payload: payload.trim(),
        lossProbability: lp,
        clientId: clientId.trim() || undefined,
      });
      setResponse(res.data);
      if (clientId.trim()) {
        fetchStats(clientId.trim());
      }
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'UDP datagram transmission failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (idToQuery) => {
    const cid = idToQuery || clientId;
    if (!cid.trim()) {
      setError('Client ID is required to query UDP statistics.');
      return;
    }
    setStatsLoading(true);
    try {
      const res = await api.get(`/transport/udp/stats/${cid.trim()}`);
      setStats(res.data);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to fetch UDP statistics');
    } finally {
      setStatsLoading(false);
    }
  };

  const clearAll = () => {
    setPayload('');
    setResponse(null);
    setStats(null);
    setError('');
  };

  const totalPackets = (stats?.sentPackets ?? stats?.sent) || 0;
  const deliveredPackets = (stats?.deliveredPackets ?? stats?.delivered) || 0;
  const deliveryRate = totalPackets > 0 ? Math.round((deliveredPackets / totalPackets) * 100) : 100;

  return (
    <PageContainer
      title="Telemetry UDP Transport Protocol Engine"
      badge="Connectionless Streaming"
      description="Real-time, zero-handshake datagram transmission for streaming ECG telemetry with simulated channel packet loss."
      actions={
        <button
          onClick={clearAll}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-[#202D43] hover:bg-[#283852] text-[#F1F5F9] border border-[#344258] transition-colors"
        >
          <RotateCcw size={14} />
          Reset Datagram
        </button>
      }
    >
      {/* Educational Guide */}
      <div className="bg-[#18243A] border border-[#344258] rounded-xl p-5 shadow-sm space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#A8B5C9] flex items-center gap-2">
          <Zap size={16} className="text-[#8B7CF6]" />
          UDP Telemetry Flow Specifications
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-[#202D43] border border-[#8B7CF6]/40 text-center">
            <span className="text-[#A99CFB] font-bold block text-sm">Zero Handshake</span>
            <span className="text-[11px] text-[#A8B5C9]">Immediate datagram dispatch with minimal latency</span>
          </div>
          <div className="p-3 rounded-lg bg-[#202D43] border border-[#D6A85F]/40 text-center">
            <span className="text-[#D6A85F] font-bold block text-sm">Unacknowledged</span>
            <span className="text-[11px] text-[#A8B5C9]">No ACK or retransmission overhead</span>
          </div>
          <div className="p-3 rounded-lg bg-[#202D43] border border-[#10B981]/40 text-center">
            <span className="text-[#10B981] font-bold block text-sm">High Throughput</span>
            <span className="text-[11px] text-[#A8B5C9]">Designed for continuous patient vitals telemetry</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* UDP Controls Panel */}
        <div className="bg-[#18243A] border border-[#344258] rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="pb-3 border-b border-[#344258]">
            <h2 className="text-sm font-semibold text-[#F1F5F9]">Datagram Header Parameters</h2>
            <p className="text-xs text-[#A8B5C9]">Configure telemetry sender/receiver ports and simulated channel loss</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#A8B5C9] mb-1.5">Source Port</label>
              <input
                type="number"
                value={srcPort}
                onChange={(e) => setSrcPort(e.target.value)}
                className="w-full rounded-lg bg-[#202D43] border border-[#344258] px-3 py-2 text-xs sm:text-sm font-mono text-[#F1F5F9] focus:ring-2 focus:ring-[#8B7CF6] focus:outline-none"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#A8B5C9] mb-1.5">Destination Port</label>
              <input
                type="number"
                value={dstPort}
                onChange={(e) => setDstPort(e.target.value)}
                className="w-full rounded-lg bg-[#202D43] border border-[#344258] px-3 py-2 text-xs sm:text-sm font-mono text-[#F1F5F9] focus:ring-2 focus:ring-[#8B7CF6] focus:outline-none"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#A8B5C9] mb-1.5">Loss Probability</label>
              <input
                type="text"
                value={lossProb}
                onChange={(e) => setLossProb(e.target.value)}
                placeholder="0.0 - 1.0"
                className="w-full rounded-lg bg-[#202D43] border border-[#344258] px-3 py-2 text-xs sm:text-sm font-mono text-[#F1F5F9] focus:ring-2 focus:ring-[#8B7CF6] focus:outline-none"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#A8B5C9] mb-1.5">Client ID (Tracking)</label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="Client tag for metrics"
                className="w-full rounded-lg bg-[#202D43] border border-[#344258] px-3 py-2 text-xs sm:text-sm font-mono text-[#F1F5F9] focus:ring-2 focus:ring-[#8B7CF6] focus:outline-none"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-[#A8B5C9]">Telemetry Payload</label>
              <button
                type="button"
                onClick={() => setPayload('ECG_STREAM: HR=76bpm, QRS=88ms, ST_ELEV=0.02mV')}
                className="text-xs text-[#A99CFB] hover:underline font-medium"
              >
                Sample ECG Stream
              </button>
            </div>
            <textarea
              rows={3}
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              placeholder="Enter UDP telemetry payload..."
              className="w-full rounded-lg bg-[#202D43] border border-[#344258] p-3 text-xs sm:text-sm font-mono text-[#F1F5F9] placeholder-[#A8B5C9]/60 focus:ring-2 focus:ring-[#8B7CF6] focus:outline-none"
              disabled={loading}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <button
              onClick={sendPacket}
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#8B7CF6] hover:bg-[#7C6AE6] text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-50"
            >
              <Zap size={16} />
              {loading ? 'Transmitting Datagram...' : 'Dispatch UDP Datagram'}
            </button>
            <button
              onClick={() => fetchStats()}
              disabled={statsLoading || !clientId.trim()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#202D43] hover:bg-[#283852] text-[#A99CFB] border border-[#8B7CF6]/40 font-medium text-sm transition-colors disabled:opacity-50"
            >
              <BarChart2 size={16} />
              {statsLoading ? 'Loading...' : 'Get Metrics'}
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-[#EF6464]/10 border border-[#EF6464]/30 text-[#EF6464] text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-[#EF6464]" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Datagram Output & Statistics Panel */}
        <div className="bg-[#18243A] border border-[#344258] rounded-xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#344258]">
              <h2 className="text-sm font-semibold text-[#F1F5F9]">Datagram Delivery & Telemetry Stats</h2>
            </div>

            {/* Last Packet Delivery Result */}
            {response && (
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  response.delivered
                    ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]'
                    : 'bg-[#EF6464]/10 border-[#EF6464]/30 text-[#EF6464]'
                }`}
              >
                <div className="flex items-center gap-3">
                  {response.delivered ? (
                    <CheckCircle2 size={24} className="text-[#10B981] shrink-0" />
                  ) : (
                    <XCircle size={24} className="text-[#EF6464] shrink-0" />
                  )}
                  <div>
                    <h3 className="text-sm font-bold">
                      {response.delivered ? 'Datagram Delivered' : 'Datagram Dropped / Lost'}
                    </h3>
                    <p className="text-xs opacity-90 mt-0.5">
                      Packet ID: <span className="font-mono font-semibold">{response.packetId ?? 'N/A'}</span>
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#0B1220] font-bold">
                  {response.delivered ? 'DELIVERED' : 'DROPPED'}
                </span>
              </div>
            )}

            {/* Aggregated Client Statistics */}
            {stats && (
              <div className="space-y-3">
                <div className="text-xs font-semibold text-[#A8B5C9] flex items-center justify-between">
                  <span>Aggregate Metrics for &ldquo;{clientId}&rdquo;:</span>
                  <span className="text-[#A99CFB] font-mono">Delivery Rate: {deliveryRate}%</span>
                </div>

                <div className="w-full bg-[#0B1220] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#10B981] h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${deliveryRate}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2.5 text-xs">
                  <div className="p-3 rounded-lg bg-[#202D43] border border-[#344258]">
                    <span className="text-[#A8B5C9] block">Packets Sent:</span>
                    <strong className="text-lg font-bold text-[#F1F5F9]">
                      {stats.sentPackets ?? stats.sent ?? '—'}
                    </strong>
                  </div>
                  <div className="p-3 rounded-lg bg-[#202D43] border border-[#344258]">
                    <span className="text-[#A8B5C9] block">Delivered:</span>
                    <strong className="text-lg font-bold text-[#10B981]">
                      {stats.deliveredPackets ?? stats.delivered ?? '—'}
                    </strong>
                  </div>
                  <div className="p-3 rounded-lg bg-[#202D43] border border-[#344258]">
                    <span className="text-[#A8B5C9] block">Lost:</span>
                    <strong className="text-lg font-bold text-[#EF6464]">
                      {stats.lostPackets ?? stats.lost ?? '—'}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* Raw JSON inspection */}
            {(response || stats) && (
              <div>
                <div className="text-xs font-semibold text-[#A8B5C9] mb-1.5">
                  Raw Diagnostic Response:
                </div>
                <pre className="p-3 rounded-lg bg-[#202D43] border border-[#344258] font-mono text-xs text-[#A8B5C9] overflow-x-auto max-h-40 overflow-y-auto">
                  {JSON.stringify({ lastResponse: response, stats }, null, 2)}
                </pre>
              </div>
            )}

            {!response && !stats && (
              <div className="py-16 text-center text-[#A8B5C9] text-xs">
                No datagrams sent yet. Click &ldquo;Dispatch UDP Datagram&rdquo; to test real-time delivery.
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
