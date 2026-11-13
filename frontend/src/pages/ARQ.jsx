import React, { useState } from 'react';
import {
  RefreshCw,
  Play,
  RotateCcw,
  AlertCircle,
  Layers,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  XCircle,
  Clock,
  Send,
} from 'lucide-react';
import api from '../services/api';
import PageContainer from '../components/ui/PageContainer';

export default function ARQ() {
  const [mode, setMode] = useState('sliding-window'); // 'sliding-window' or 'go-back-n'
  const [totalFrames, setTotalFrames] = useState('8');
  const [windowSize, setWindowSize] = useState('4');
  const [seqBits, setSeqBits] = useState('3');
  const [lostFrames, setLostFrames] = useState('2, 5'); // for go-back-n
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [response, setResponse] = useState(null);

  const loadPreset = () => {
    if (mode === 'sliding-window') {
      setTotalFrames('8');
      setWindowSize('4');
      setSeqBits('3');
    } else {
      setTotalFrames('8');
      setWindowSize('4');
      setSeqBits('3');
      setLostFrames('2, 5');
    }
    setError('');
  };

  const submit = async () => {
    const tf = Number(totalFrames);
    const ws = Number(windowSize);
    const sb = Number(seqBits);

    if (isNaN(tf) || tf <= 0) {
      setError('Total frames must be a positive integer.');
      return;
    }
    if (isNaN(ws) || ws <= 0) {
      setError('Window size must be a positive integer.');
      return;
    }
    if (isNaN(sb) || sb <= 0) {
      setError('Sequence number bits must be a positive integer.');
      return;
    }

    setLoading(true);
    setError('');
    setResponse(null);

    try {
      if (mode === 'sliding-window') {
        const body = {
          totalFrames: tf,
          windowSize: ws,
          sequenceNumberBits: sb,
        };
        const res = await api.post('/arq/sliding-window/simulate', body);
        setResponse(res.data);
      } else {
        const lost = lostFrames
          ? lostFrames
              .split(',')
              .map((s) => s.trim())
              .filter((s) => s !== '' && !isNaN(Number(s)))
              .map(Number)
          : [];

        const body = {
          totalFrames: tf,
          windowSize: ws,
          sequenceNumberBits: sb,
          lostFrameIndexes: lost,
        };
        const res = await api.post('/arq/go-back-n/simulate', body);
        setResponse(res.data);
      }
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'ARQ simulation failed');
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setTotalFrames('');
    setWindowSize('');
    setSeqBits('');
    setLostFrames('');
    setResponse(null);
    setError('');
  };

  const getEventBadge = (type) => {
    const upper = (type || '').toUpperCase();
    if (upper.includes('SEND')) {
      return {
        bg: 'bg-[#8B7CF6]/10 border-[#8B7CF6]/40 text-[#A99CFB]',
        icon: <Send size={13} />,
        label: 'SEND',
      };
    }
    if (upper.includes('ACK')) {
      return {
        bg: 'bg-[#10B981]/10 border-[#10B981]/40 text-[#10B981]',
        icon: <CheckCircle2 size={13} />,
        label: 'ACK',
      };
    }
    if (upper.includes('LOSS') || upper.includes('DROP')) {
      return {
        bg: 'bg-[#EF6464]/10 border-[#EF6464]/40 text-[#EF6464]',
        icon: <XCircle size={13} />,
        label: 'LOSS',
      };
    }
    if (upper.includes('RETRANSMIT') || upper.includes('TIMEOUT')) {
      return {
        bg: 'bg-[#D6A85F]/10 border-[#D6A85F]/40 text-[#D6A85F]',
        icon: <Clock size={13} />,
        label: 'RETRANSMIT',
      };
    }
    return {
      bg: 'bg-[#202D43] border-[#344258] text-[#F1F5F9]',
      icon: <Layers size={13} />,
      label: upper || 'EVENT',
    };
  };

  return (
    <PageContainer
      title="ARQ Protocol Transmission Simulation"
      badge="Flow & Error Control"
      description="Visual packet sequence simulation for Sliding Window and Go-Back-N protocols with window slides and ACK/retransmission events."
      actions={
        <button
          onClick={clearAll}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-[#202D43] hover:bg-[#283852] text-[#F1F5F9] border border-[#344258] transition-colors"
        >
          <RotateCcw size={14} />
          Reset
        </button>
      }
    >
      {/* Educational Guide */}
      <div className="bg-[#18243A] border border-[#344258] rounded-xl p-5 shadow-sm space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#A8B5C9] flex items-center gap-2">
          <Layers size={16} className="text-[#8B7CF6]" />
          Sequence Space & Window Constraints
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-[#202D43] border border-[#8B7CF6]/40 text-center">
            <span className="text-[#A99CFB] font-bold block text-sm">2ᵐ Sequence Space</span>
            <span className="text-[11px] text-[#A8B5C9]">Modulo sequence number range [0 .. 2ᵐ-1]</span>
          </div>
          <div className="p-3 rounded-lg bg-[#202D43] border border-[#D6A85F]/40 text-center">
            <span className="text-[#D6A85F] font-bold block text-sm">Ws ≤ 2ᵐ - 1</span>
            <span className="text-[11px] text-[#A8B5C9]">Go-Back-N sender window limit</span>
          </div>
          <div className="p-3 rounded-lg bg-[#202D43] border border-[#10B981]/40 text-center">
            <span className="text-[#10B981] font-bold block text-sm">Cumulative ACKs</span>
            <span className="text-[11px] text-[#A8B5C9]">Receiver confirms all frames up to ACK#</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Simulation Configuration Panel */}
        <div className="bg-[#18243A] border border-[#344258] rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#344258]">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-[#8B7CF6]" />
              <h2 className="text-sm font-semibold text-[#F1F5F9]">Protocol Simulation Parameters</h2>
            </div>
            <button
              type="button"
              onClick={loadPreset}
              className="text-xs text-[#A99CFB] hover:underline font-medium"
            >
              Load Presets
            </button>
          </div>

          {/* Mode Selector */}
          <div>
            <label className="block text-xs font-medium text-[#A8B5C9] mb-1.5">
              ARQ Protocol Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode('sliding-window')}
                className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                  mode === 'sliding-window'
                    ? 'bg-[#8B7CF6]/10 border-[#8B7CF6] text-[#A99CFB]'
                    : 'bg-[#202D43] border-[#344258] text-[#A8B5C9] hover:text-[#F1F5F9]'
                }`}
              >
                Sliding Window
              </button>
              <button
                type="button"
                onClick={() => setMode('go-back-n')}
                className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                  mode === 'go-back-n'
                    ? 'bg-[#8B7CF6]/10 border-[#8B7CF6] text-[#A99CFB]'
                    : 'bg-[#202D43] border-[#344258] text-[#A8B5C9] hover:text-[#F1F5F9]'
                }`}
              >
                Go-Back-N ARQ
              </button>
            </div>
          </div>

          {/* Numerical Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#A8B5C9] mb-1.5">
                Total Frames
              </label>
              <input
                type="number"
                min="1"
                value={totalFrames}
                onChange={(e) => setTotalFrames(e.target.value)}
                placeholder="e.g. 8"
                className="w-full rounded-lg bg-[#202D43] border border-[#344258] px-3 py-2 text-xs sm:text-sm font-mono text-[#F1F5F9] focus:ring-2 focus:ring-[#8B7CF6] focus:outline-none"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#A8B5C9] mb-1.5">
                Window Size (Ws)
              </label>
              <input
                type="number"
                min="1"
                value={windowSize}
                onChange={(e) => setWindowSize(e.target.value)}
                placeholder="e.g. 4"
                className="w-full rounded-lg bg-[#202D43] border border-[#344258] px-3 py-2 text-xs sm:text-sm font-mono text-[#F1F5F9] focus:ring-2 focus:ring-[#8B7CF6] focus:outline-none"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#A8B5C9] mb-1.5">
                Seq Bits (m)
              </label>
              <input
                type="number"
                min="1"
                value={seqBits}
                onChange={(e) => setSeqBits(e.target.value)}
                placeholder="e.g. 3"
                className="w-full rounded-lg bg-[#202D43] border border-[#344258] px-3 py-2 text-xs sm:text-sm font-mono text-[#F1F5F9] focus:ring-2 focus:ring-[#8B7CF6] focus:outline-none"
                disabled={loading}
              />
            </div>
          </div>

          {/* Lost Frames (Go-Back-N only) */}
          {mode === 'go-back-n' && (
            <div>
              <label className="block text-xs font-medium text-[#A8B5C9] mb-1.5">
                Simulated Lost Frame Indexes (comma-separated, 0-indexed)
              </label>
              <input
                type="text"
                value={lostFrames}
                onChange={(e) => setLostFrames(e.target.value)}
                placeholder="e.g. 2, 5"
                className="w-full rounded-lg bg-[#202D43] border border-[#344258] px-3 py-2 text-xs sm:text-sm font-mono text-[#F1F5F9] focus:ring-2 focus:ring-[#8B7CF6] focus:outline-none"
                disabled={loading}
              />
              <span className="text-[11px] text-[#A8B5C9] mt-1 block">
                Sender will trigger Go-Back-N window retransmission when ACK for these frames is lost.
              </span>
            </div>
          )}

          {/* Run Action */}
          <button
            onClick={submit}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#8B7CF6] hover:bg-[#7C6AE6] text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-50"
          >
            <Play size={16} />
            {loading ? 'Simulating ARQ Transmission...' : 'Run ARQ Simulation'}
          </button>

          {error && (
            <div className="p-3 rounded-lg bg-[#EF6464]/10 border border-[#EF6464]/30 text-[#EF6464] text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-[#EF6464]" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Output Diagnostics Panel */}
        <div className="bg-[#18243A] border border-[#344258] rounded-xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#344258]">
              <h2 className="text-sm font-semibold text-[#F1F5F9]">Transmission Event Ladder & Metrics</h2>
              {response && (
                <span className="text-xs font-mono text-[#10B981] flex items-center gap-1">
                  <CheckCircle2 size={13} /> {response.completed ? 'Delivered' : 'Simulation Finished'}
                </span>
              )}
            </div>

            {loading && (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <RefreshCw size={26} className="animate-spin text-[#8B7CF6] mb-2" />
                <span className="text-xs text-[#A8B5C9]">Simulating window slider & timeouts...</span>
              </div>
            )}

            {!loading && !response && (
              <div className="py-12 text-center text-[#A8B5C9] text-xs">
                No active simulation result. Configure window parameters and click Run.
              </div>
            )}

            {!loading && response && (
              <div className="space-y-4">
                {/* Summary Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-[#202D43] border border-[#344258]">
                    <span className="text-[#A8B5C9] block">Frames Sent:</span>
                    <strong className="text-base font-bold text-[#F1F5F9]">
                      {response.totalTransmissions ?? '—'}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#202D43] border border-[#344258]">
                    <span className="text-[#A8B5C9] block">Delivered:</span>
                    <strong className="text-base font-bold text-[#10B981]">
                      {response.framesDelivered ?? response.totalFrames ?? '—'}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#202D43] border border-[#344258]">
                    <span className="text-[#A8B5C9] block">Retransmit:</span>
                    <strong className="text-base font-bold text-[#D6A85F]">
                      {response.totalRetransmissions ?? '0'}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#202D43] border border-[#344258]">
                    <span className="text-[#A8B5C9] block">Seq Space:</span>
                    <strong className="text-base font-bold text-[#A99CFB]">
                      {response.sequenceNumberSpace ?? (response.sequenceNumberBits ? Math.pow(2, response.sequenceNumberBits) : '—')}
                    </strong>
                  </div>
                </div>

                {/* Event Log Ladder / Packet Transmission Visualization */}
                <div>
                  <div className="text-xs font-semibold text-[#A8B5C9] mb-2 flex items-center justify-between">
                    <span>Packet Sequence Ladder (Sender &rarr; Receiver):</span>
                    <span className="font-mono text-[11px] text-[#A99CFB]">
                      {response.eventLog ? response.eventLog.length : 0} events
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#202D43] border border-[#344258] max-h-72 overflow-y-auto space-y-2">
                    {Array.isArray(response.eventLog) && response.eventLog.length > 0 ? (
                      response.eventLog.map((item, idx) => {
                        const badge = getEventBadge(item.eventType);
                        const isAck = (item.eventType || '').toUpperCase().includes('ACK');

                        return (
                          <div
                            key={idx}
                            className="p-2 rounded-lg bg-[#18243A] border border-[#344258]/60 flex items-center justify-between text-xs font-mono"
                          >
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded border flex items-center gap-1 text-[11px] font-bold ${badge.bg}`}>
                                {badge.icon}
                                {badge.label}
                              </span>
                              <span className="text-[#F1F5F9]">
                                {item.description || (item.frameIndex !== null ? `Frame #${item.frameIndex}` : 'Protocol Event')}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-[#A8B5C9] text-[11px]">
                              {item.sequenceNumber !== null && (
                                <span className="bg-[#202D43] px-1.5 py-0.5 rounded text-[#A99CFB]">
                                  Seq:{item.sequenceNumber}
                                </span>
                              )}
                              {item.ackNumber !== null && (
                                <span className="bg-[#202D43] px-1.5 py-0.5 rounded text-[#10B981]">
                                  Ack:{item.ackNumber}
                                </span>
                              )}
                              {isAck ? (
                                <ArrowLeft size={13} className="text-[#10B981]" />
                              ) : (
                                <ArrowRight size={13} className="text-[#8B7CF6]" />
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <pre className="text-xs text-[#A8B5C9] whitespace-pre-wrap">
                        {JSON.stringify(response, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
