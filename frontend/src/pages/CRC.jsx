import React, { useState } from 'react';
import {
  Hash,
  RotateCcw,
  Copy,
  Check,
  AlertCircle,
  Calculator,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import api from '../services/api';
import PageContainer from '../components/ui/PageContainer';

export default function CRC() {
  const [crcType, setCrcType] = useState('crc16'); // 'crc16' or 'crc32'
  const [action, setAction] = useState('calculate'); // 'calculate' or 'verify'
  const [data, setData] = useState('');
  const [crc, setCrc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [response, setResponse] = useState(null);
  const [lastSubmittedData, setLastSubmittedData] = useState('');
  const [copied, setCopied] = useState(false);

  const submit = async () => {
    if (!data.trim()) {
      setError('Message data is required for CRC processing.');
      return;
    }
    if (action === 'verify' && !crc.trim()) {
      setError('CRC checksum value is required for verification.');
      return;
    }

    setLoading(true);
    setError('');
    setResponse(null);
    setLastSubmittedData(data);

    const base = `/crc/${crcType}`;
    const endpoint = action === 'calculate' ? `${base}/calculate` : `${base}/verify`;
    const body = action === 'calculate' ? { data } : { data, crc: crc.trim() };

    try {
      const res = await api.post(endpoint, body);
      setResponse(res.data);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'CRC calculation or verification failed');
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setData('');
    setCrc('');
    setResponse(null);
    setLastSubmittedData('');
    setError('');
  };

  const copyValue = (val) => {
    navigator.clipboard.writeText(String(val));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PageContainer
      title="CRC Error Detection (Cyclic Redundancy Check)"
      badge="Frame Integrity"
      description="Compute and verify polynomial-based CRC-16 and CRC-32 checksums for hospital transmission frames."
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
      {/* Educational Polynomial Guide */}
      <div className="bg-[#18243A] border border-[#344258] rounded-xl p-5 shadow-sm space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#A8B5C9] flex items-center gap-2">
          <Hash size={16} className="text-[#8B7CF6]" />
          Standard Generator Polynomial Specifications
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-[#202D43] border border-[#8B7CF6]/40 space-y-1">
            <span className="text-[#A99CFB] font-bold block">CRC-16 / IBM-ANSI (0x8005)</span>
            <p className="text-[11px] text-[#A8B5C9]">Generator: x¹⁶ + x¹⁵ + x² + 1 (16-bit remainder for telemetry)</p>
          </div>
          <div className="p-3 rounded-lg bg-[#202D43] border border-[#8B7CF6]/40 space-y-1">
            <span className="text-[#A99CFB] font-bold block">CRC-32 / IEEE 802.3 (0x04C11DB7)</span>
            <p className="text-[11px] text-[#A8B5C9]">Generator: Ethernet standard 32-bit polynomial for clinical PACS</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Configuration Panel */}
        <div className="bg-[#18243A] border border-[#344258] rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#344258]">
            <div className="flex items-center gap-2">
              <Calculator size={18} className="text-[#8B7CF6]" />
              <h2 className="text-sm font-semibold text-[#F1F5F9]">CRC Configuration</h2>
            </div>
          </div>

          {/* Algorithm & Mode Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#A8B5C9] mb-1.5">
                Polynomial Standard
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCrcType('crc16')}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                    crcType === 'crc16'
                      ? 'bg-[#8B7CF6]/10 border-[#8B7CF6] text-[#A99CFB]'
                      : 'bg-[#202D43] border-[#344258] text-[#A8B5C9] hover:text-[#F1F5F9]'
                  }`}
                >
                  CRC-16 (16-bit)
                </button>
                <button
                  type="button"
                  onClick={() => setCrcType('crc32')}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                    crcType === 'crc32'
                      ? 'bg-[#8B7CF6]/10 border-[#8B7CF6] text-[#A99CFB]'
                      : 'bg-[#202D43] border-[#344258] text-[#A8B5C9] hover:text-[#F1F5F9]'
                  }`}
                >
                  CRC-32 (32-bit)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A8B5C9] mb-1.5">
                Operation Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAction('calculate')}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                    action === 'calculate'
                      ? 'bg-[#8B7CF6]/10 border-[#8B7CF6] text-[#A99CFB]'
                      : 'bg-[#202D43] border-[#344258] text-[#A8B5C9] hover:text-[#F1F5F9]'
                  }`}
                >
                  Calculate
                </button>
                <button
                  type="button"
                  onClick={() => setAction('verify')}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                    action === 'verify'
                      ? 'bg-[#10B981]/10 border-[#10B981] text-[#10B981]'
                      : 'bg-[#202D43] border-[#344258] text-[#A8B5C9] hover:text-[#F1F5F9]'
                  }`}
                >
                  Verify
                </button>
              </div>
            </div>
          </div>

          {/* Message Payload Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-[#A8B5C9]">
                Message Data (String or Telemetry)
              </label>
              <button
                type="button"
                onClick={() => setData('HEART_RATE_MONITOR_SPO2_98_BPM_72')}
                className="text-xs text-[#A99CFB] hover:underline"
              >
                Sample Telemetry
              </button>
            </div>
            <textarea
              rows={4}
              value={data}
              onChange={(e) => setData(e.target.value)}
              placeholder="Enter clinical data stream for CRC calculation..."
              className="w-full rounded-lg bg-[#202D43] border border-[#344258] p-3 text-xs sm:text-sm font-mono text-[#F1F5F9] placeholder-[#A8B5C9]/60 focus:ring-2 focus:ring-[#8B7CF6] focus:outline-none transition-all"
              disabled={loading}
            />
          </div>

          {/* Verification CRC Value Input */}
          {action === 'verify' && (
            <div>
              <label className="block text-xs font-medium text-[#A8B5C9] mb-1.5">
                Expected CRC Value to Verify against
              </label>
              <input
                type="text"
                value={crc}
                onChange={(e) => setCrc(e.target.value)}
                placeholder="Enter CRC hexadecimal or decimal value"
                className="w-full rounded-lg bg-[#202D43] border border-[#344258] px-3 py-2 text-xs sm:text-sm font-mono text-[#F1F5F9] placeholder-[#A8B5C9]/60 focus:ring-2 focus:ring-[#8B7CF6] focus:outline-none transition-all"
                disabled={loading}
              />
            </div>
          )}

          {/* Submit Action */}
          <button
            onClick={submit}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#8B7CF6] hover:bg-[#7C6AE6] text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-50"
          >
            <Calculator size={16} />
            {loading
              ? 'Computing Checksum...'
              : action === 'calculate'
              ? `Compute ${crcType.toUpperCase()} Checksum`
              : `Verify ${crcType.toUpperCase()} Integrity`}
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
              <h2 className="text-sm font-semibold text-[#F1F5F9]">Integrity Verification Panel</h2>
            </div>

            {loading && (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-6 h-6 border-2 border-[#8B7CF6] border-t-transparent rounded-full animate-spin mb-2" />
                <span className="text-xs text-[#A8B5C9]">Performing polynomial division...</span>
              </div>
            )}

            {!loading && !response && (
              <div className="py-12 text-center text-[#A8B5C9] text-xs">
                No calculation result yet. Configure parameters and execute operation.
              </div>
            )}

            {!loading && response && (
              <div className="space-y-4">
                {/* Result Status Banner */}
                {action === 'verify' && (
                  <div
                    className={`p-4 rounded-xl border flex items-center gap-3 ${
                      response.valid !== false
                        ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]'
                        : 'bg-[#EF6464]/10 border-[#EF6464]/30 text-[#EF6464]'
                    }`}
                  >
                    {response.valid !== false ? (
                      <ShieldCheck size={28} className="text-[#10B981] shrink-0" />
                    ) : (
                      <ShieldAlert size={28} className="text-[#EF6464] shrink-0" />
                    )}
                    <div>
                      <h3 className="text-sm font-bold">
                        {response.valid !== false ? 'Frame Integrity Verified — Zero Errors' : 'Frame Corrupted — Checksum Mismatch'}
                      </h3>
                      <p className="text-xs opacity-90 mt-0.5">
                        {response.valid !== false
                          ? 'Remainder is zero. The received frame is identical to the transmitted original.'
                          : 'Non-zero remainder. Transmission bit flip or corrupted frame detected.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Calculation Output Card */}
                {action === 'calculate' && (
                  <div className="p-4 rounded-xl bg-[#202D43] border border-[#344258] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#A8B5C9]">Computed Checksum:</span>
                      <button
                        onClick={() => copyValue(response.crc ?? response.checksum ?? '')}
                        className="hover:text-[#F1F5F9] text-[#A8B5C9] flex items-center gap-1 text-xs"
                      >
                        {copied ? <Check size={12} className="text-[#10B981]" /> : <Copy size={12} />}
                        {copied ? 'Copied' : 'Copy CRC'}
                      </button>
                    </div>
                    <div className="text-2xl font-mono font-bold text-[#8B7CF6] break-all select-all">
                      {String(response.crc ?? response.checksum ?? 'N/A')}
                    </div>
                  </div>
                )}

                {/* Message Context */}
                <div className="p-3 rounded-lg bg-[#202D43] border border-[#344258] text-xs space-y-1 font-mono">
                  <span className="text-[10px] uppercase font-semibold text-[#A8B5C9]">Original Message Payload:</span>
                  <p className="text-[#F1F5F9] break-all">{lastSubmittedData}</p>
                </div>

                {/* Raw Diagnostic JSON */}
                <div>
                  <div className="text-xs font-semibold text-[#A8B5C9] mb-1.5">
                    Backend Response Object:
                  </div>
                  <pre className="p-3 rounded-lg bg-[#202D43] border border-[#344258] font-mono text-xs text-[#A8B5C9] overflow-x-auto">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
