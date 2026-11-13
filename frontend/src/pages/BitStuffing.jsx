import React, { useState } from 'react';
import {
  Binary,
  ArrowRight,
  RotateCcw,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import api from '../services/api';
import PageContainer from '../components/ui/PageContainer';

export default function BitStuffing() {
  const [data, setData] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const validateBinary = (str) => /^[01\s]+$/.test(str.trim());

  const encode = async () => {
    const trimmed = data.trim().replace(/\s+/g, '');
    if (!trimmed) {
      setError('Binary bitstream is required (e.g., 01111110).');
      return;
    }
    if (!validateBinary(trimmed)) {
      setError('Bit stuffing requires valid binary digits (only 0 and 1).');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/framing/bit-stuffing/encode', { data: trimmed });
      setResult({
        type: 'Bit-Stuffed Frame',
        value: res.data.result,
        mode: 'encode',
        original: trimmed,
      });
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Bit stuffing encoding failed');
    } finally {
      setLoading(false);
    }
  };

  const decode = async () => {
    const trimmed = data.trim().replace(/\s+/g, '');
    if (!trimmed) {
      setError('Binary framed stream is required.');
      return;
    }
    if (!validateBinary(trimmed)) {
      setError('Bit destuffing requires valid binary digits (only 0 and 1).');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/framing/bit-stuffing/decode', { data: trimmed });
      setResult({
        type: 'Destuffed Bitstream',
        value: res.data.result,
        mode: 'decode',
        original: trimmed,
      });
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Bit destuffing decoding failed');
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setData('');
    setResult(null);
    setError('');
  };

  const copyResult = () => {
    if (result?.value) {
      navigator.clipboard.writeText(result.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const setSample = (sampleText) => {
    setData(sampleText);
    setError('');
  };

  // Helper to visually render bits with consecutive 1s or stuffed 0s highlighted
  const renderStuffedBitsVisual = (bitstring) => {
    if (!bitstring) return null;
    return (
      <div className="flex flex-wrap gap-1 font-mono text-sm leading-relaxed tracking-wider select-all">
        {bitstring.split('').map((bit, idx) => {
          const isStuffed = bit === '0' && idx >= 5 && bitstring.slice(Math.max(0, idx - 5), idx) === '11111';
          return (
            <span
              key={idx}
              className={`px-1 rounded ${
                isStuffed
                  ? 'bg-[#10B981]/20 text-[#10B981] font-bold border border-[#10B981]/50'
                  : bit === '1'
                  ? 'text-[#A99CFB]'
                  : 'text-[#A8B5C9]'
              }`}
              title={isStuffed ? `Bit #${idx}: Stuffed '0' inserted after five 1s` : `Bit #${idx}`}
            >
              {bit}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <PageContainer
      title="Bit Stuffing (HDLC Synchronous Framing)"
      badge="Bit-Level Framing"
      description="Zero-bit insertion after five contiguous 1s (0111110) to distinguish payload from the 01111110 flag delimiter."
      actions={
        <button
          onClick={clearAll}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-[#202D43] hover:bg-[#283852] text-[#F1F5F9] border border-[#344258] transition-colors"
        >
          <RotateCcw size={14} />
          Clear
        </button>
      }
    >
      {/* HDLC Educational Guide */}
      <div className="bg-[#18243A] border border-[#344258] rounded-xl p-5 shadow-sm space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#A8B5C9] flex items-center gap-2">
          <Binary size={16} className="text-[#8B7CF6]" />
          HDLC Bit Pattern Specifications
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-[#202D43] border border-[#8B7CF6]/40 text-center">
            <span className="text-[#A99CFB] font-bold block text-sm">01111110</span>
            <span className="text-[11px] text-[#A8B5C9]">Flag Delimiter (6 Ones)</span>
          </div>
          <div className="p-3 rounded-lg bg-[#202D43] border border-[#D6A85F]/40 text-center">
            <span className="text-[#D6A85F] font-bold block text-sm">11111 → 111110</span>
            <span className="text-[11px] text-[#A8B5C9]">5 Ones → Insert Zero Bit</span>
          </div>
          <div className="p-3 rounded-lg bg-[#202D43] border border-[#10B981]/40 text-center">
            <span className="text-[#10B981] font-bold block text-sm">Destuffing</span>
            <span className="text-[11px] text-[#A8B5C9]">Receiver strips 0 after five 1s</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="bg-[#18243A] border border-[#344258] rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#344258]">
            <div className="flex items-center gap-2">
              <Binary size={18} className="text-[#8B7CF6]" />
              <h2 className="text-sm font-semibold text-[#F1F5F9]">Binary Bitstream Input</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#A8B5C9]">Quick Samples:</span>
              <button
                type="button"
                onClick={() => setSample('01111110111110')}
                className="text-xs text-[#A99CFB] hover:underline"
              >
                Consecutive 1s
              </button>
              <span className="text-[#A8B5C9]">&bull;</span>
              <button
                type="button"
                onClick={() => setSample('111111111111')}
                className="text-xs text-[#A99CFB] hover:underline"
              >
                All 1s
              </button>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-medium text-[#A8B5C9]">
                Binary Stream (0s and 1s only)
              </label>
              <span className="text-[11px] font-mono text-[#A8B5C9]">
                {data.replace(/\s+/g, '').length} bits
              </span>
            </div>
            <textarea
              rows={5}
              value={data}
              onChange={(e) => setData(e.target.value)}
              placeholder="Enter binary bitstream (e.g., 01111110111110)..."
              className="w-full rounded-lg bg-[#202D43] border border-[#344258] p-3 text-xs sm:text-sm font-mono text-[#F1F5F9] placeholder-[#A8B5C9]/60 focus:ring-2 focus:ring-[#8B7CF6] focus:outline-none transition-all"
              disabled={loading}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={encode}
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#8B7CF6] hover:bg-[#7C6AE6] text-white font-semibold text-xs sm:text-sm transition-colors shadow-sm disabled:opacity-50"
            >
              <ArrowRight size={16} />
              Encode (Stuff 0 Bits)
            </button>
            <button
              onClick={decode}
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#202D43] hover:bg-[#283852] text-[#A99CFB] border border-[#8B7CF6]/40 font-semibold text-xs sm:text-sm transition-colors shadow-sm disabled:opacity-50"
            >
              <ArrowRight size={16} />
              Decode (Destuff Bits)
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-[#EF6464]/10 border border-[#EF6464]/30 text-[#EF6464] text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-[#EF6464]" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Output Panel with Bitstream Breakdown */}
        <div className="bg-[#18243A] border border-[#344258] rounded-xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#344258]">
              <h2 className="text-sm font-semibold text-[#F1F5F9]">Bitstream Framing Output</h2>
              {result && (
                <button
                  onClick={copyResult}
                  className="hover:text-[#F1F5F9] text-[#A8B5C9] flex items-center gap-1 text-xs"
                >
                  {copied ? <Check size={14} className="text-[#10B981]" /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              )}
            </div>

            {loading && (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-6 h-6 border-2 border-[#8B7CF6] border-t-transparent rounded-full animate-spin mb-2" />
                <span className="text-xs text-[#A8B5C9]">Processing bit-level framing...</span>
              </div>
            )}

            {!loading && !result && (
              <div className="py-12 text-center text-[#A8B5C9] text-xs">
                No active operation. Input binary digits on the left and select Encode or Decode.
              </div>
            )}

            {!loading && result && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#A99CFB] flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-[#10B981]" /> {result.type}
                  </span>
                  <span className="font-mono text-[#A8B5C9]">
                    {result.original.length} bits &rarr; {result.value.length} bits
                  </span>
                </div>

                {/* Visual Bit Representation */}
                <div className="p-3.5 rounded-lg bg-[#202D43] border border-[#344258] space-y-2">
                  <span className="text-[10px] uppercase font-semibold text-[#A8B5C9] block">
                    Rendered Bit Stream (Stuffed 0s Highlighted in Emerald):
                  </span>
                  {renderStuffedBitsVisual(result.value)}
                </div>

                {/* Raw Stream */}
                <div className="p-3 rounded-lg bg-[#202D43]/60 border border-[#344258] text-xs text-[#A8B5C9] space-y-1">
                  <div className="flex justify-between">
                    <span>Operation Mode:</span>
                    <strong className="text-[#10B981]">{result.mode.toUpperCase()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Stuffed Bits Inserted / Stripped:</span>
                    <strong className="text-[#A99CFB]">
                      {Math.abs(result.value.length - result.original.length)} bits
                    </strong>
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
