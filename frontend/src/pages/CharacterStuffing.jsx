import React, { useState } from 'react';
import {
  FileCode,
  ArrowRight,
  RotateCcw,
  Copy,
  Check,
  AlertCircle,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import api from '../services/api';
import PageContainer from '../components/ui/PageContainer';

export default function CharacterStuffing() {
  const [data, setData] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const encode = async () => {
    if (!data.trim()) {
      setError('Please provide data to encode into a character-stuffed frame.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/framing/character-stuffing/encode', { data });
      setResult({
        type: 'Encoded Frame',
        value: res.data.result,
        mode: 'encode',
        original: data,
      });
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Character stuffing encoding failed');
    } finally {
      setLoading(false);
    }
  };

  const decode = async () => {
    if (!data.trim()) {
      setError('Please provide a framed string to decode.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/framing/character-stuffing/decode', { data });
      setResult({
        type: 'Decoded Payload',
        value: res.data.result,
        mode: 'decode',
        original: data,
      });
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Character destuffing decoding failed');
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

  return (
    <PageContainer
      title="Character Stuffing (Byte-Oriented Framing)"
      badge="Data Link Protocol"
      description="Frame demarcation using ASCII DLE STX header and DLE ETX trailer delimiters with internal DLE byte escaping."
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
      {/* Educational Framing Guide */}
      <div className="bg-[#18243A] border border-[#344258] rounded-xl p-5 shadow-sm space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#A8B5C9] flex items-center gap-2">
          <Layers size={16} className="text-[#8B7CF6]" />
          Frame Structure & Escape Mechanism
        </h2>

        {/* Visual Frame Anatomy */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-[#202D43] border border-[#8B7CF6]/40 text-center">
            <span className="text-[#A99CFB] font-bold block text-sm">DLE STX</span>
            <span className="text-[11px] text-[#A8B5C9]">Frame Header Delimiter</span>
          </div>
          <div className="p-3 rounded-lg bg-[#202D43] border border-[#D6A85F]/40 text-center">
            <span className="text-[#D6A85F] font-bold block text-sm">DLE → DLE DLE</span>
            <span className="text-[11px] text-[#A8B5C9]">Escaped Payload Bytes</span>
          </div>
          <div className="p-3 rounded-lg bg-[#202D43] border border-[#8B7CF6]/40 text-center">
            <span className="text-[#A99CFB] font-bold block text-sm">DLE ETX</span>
            <span className="text-[11px] text-[#A8B5C9]">Frame Trailer Delimiter</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="bg-[#18243A] border border-[#344258] rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#344258]">
            <div className="flex items-center gap-2">
              <FileCode size={18} className="text-[#8B7CF6]" />
              <h2 className="text-sm font-semibold text-[#F1F5F9]">Transmission Data Input</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#A8B5C9]">Quick Samples:</span>
              <button
                type="button"
                onClick={() => setSample('PATIENT_DATA_DLE_TEST')}
                className="text-xs text-[#A99CFB] hover:underline"
              >
                With DLE
              </button>
              <span className="text-[#A8B5C9]">&bull;</span>
              <button
                type="button"
                onClick={() => setSample('EMERGENCY_ICU_ALERT')}
                className="text-xs text-[#A99CFB] hover:underline"
              >
                Standard
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A8B5C9] mb-1.5">
              Input String or Framed Stream
            </label>
            <textarea
              rows={5}
              value={data}
              onChange={(e) => setData(e.target.value)}
              placeholder="Enter message to frame or framed text to decode..."
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
              Encode (Stuff & Frame)
            </button>
            <button
              onClick={decode}
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#202D43] hover:bg-[#283852] text-[#A99CFB] border border-[#8B7CF6]/40 font-semibold text-xs sm:text-sm transition-colors shadow-sm disabled:opacity-50"
            >
              <ArrowRight size={16} />
              Decode (Unstuff Payload)
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-[#EF6464]/10 border border-[#EF6464]/30 text-[#EF6464] text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-[#EF6464]" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Output Panel with Transformation Breakdown */}
        <div className="bg-[#18243A] border border-[#344258] rounded-xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#344258]">
              <h2 className="text-sm font-semibold text-[#F1F5F9]">Framing Pipeline Output</h2>
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
                <span className="text-xs text-[#A8B5C9]">Processing framing operation...</span>
              </div>
            )}

            {!loading && !result && (
              <div className="py-12 text-center text-[#A8B5C9] text-xs">
                No active operation. Enter a payload on the left and select Encode or Decode.
              </div>
            )}

            {!loading && result && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#A99CFB] flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-[#10B981]" /> {result.type}
                  </span>
                  <span className="font-mono text-[#A8B5C9]">{result.value.length} characters</span>
                </div>

                {/* Visual Transformation Ladder */}
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded bg-[#202D43] border border-[#344258] space-y-1">
                    <span className="text-[10px] uppercase font-semibold text-[#A8B5C9]">1. Original Input:</span>
                    <p className="font-mono text-[#F1F5F9] break-all">{result.original}</p>
                  </div>

                  <div className="flex justify-center">
                    <ArrowRight size={14} className="text-[#8B7CF6] rotate-90" />
                  </div>

                  <div className="p-3 rounded bg-[#202D43] border border-[#8B7CF6]/40 space-y-1">
                    <span className="text-[10px] uppercase font-semibold text-[#A99CFB]">
                      2. {result.mode === 'encode' ? 'Framed Stream Output (with DLE delimiters):' : 'Destuffed Clinical Data:'}
                    </span>
                    <p className="font-mono text-sm text-[#8B7CF6] break-all select-all font-bold">
                      {result.value}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#202D43]/60 border border-[#344258] text-xs text-[#A8B5C9] flex justify-between items-center">
                  <span>Transformation: <strong className="text-[#10B981]">{result.mode.toUpperCase()}</strong></span>
                  <span className="font-mono text-[11px] text-[#A99CFB]">Delta: {result.value.length - result.original.length} chars</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
