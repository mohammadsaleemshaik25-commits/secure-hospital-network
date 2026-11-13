import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Unlock,
  RotateCcw,
  Copy,
  Check,
  AlertCircle,
  ArrowDown,
  ArrowRight,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import api from '../services/api';
import PageContainer from '../components/ui/PageContainer';

const SAMPLE_PATIENT_RECORD = JSON.stringify(
  {
    patientId: 'PT-98214',
    name: 'Eleanor Vance',
    bloodType: 'O-Positive',
    allergies: ['Penicillin'],
    diagnosis: 'Acute Cardiac Arrhythmia',
    ward: 'Cardiology ICU Bed-04',
  },
  null,
  2
);

export default function Encryption() {
  // Encryption state
  const [plaintextToEncrypt, setPlaintextToEncrypt] = useState('');
  const [encryptLoading, setEncryptLoading] = useState(false);
  const [encryptError, setEncryptError] = useState('');
  const [encryptedResult, setEncryptedResult] = useState(null);

  // Decryption state
  const [decryptIv, setDecryptIv] = useState('');
  const [decryptCiphertext, setDecryptCiphertext] = useState('');
  const [decryptLoading, setDecryptLoading] = useState(false);
  const [decryptError, setDecryptError] = useState('');
  const [decryptedPlaintext, setDecryptedPlaintext] = useState('');

  // Copy feedback state
  const [copiedKey, setCopiedKey] = useState(null);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleEncrypt = async () => {
    if (!plaintextToEncrypt.trim()) {
      setEncryptError('Plaintext clinical record is required for encryption.');
      return;
    }
    setEncryptLoading(true);
    setEncryptError('');
    setEncryptedResult(null);
    try {
      const res = await api.post('/encryption/encrypt', { plaintext: plaintextToEncrypt });
      setEncryptedResult(res.data);
    } catch (e) {
      setEncryptError(e.response?.data?.message || e.message || 'Encryption operation failed');
    } finally {
      setEncryptLoading(false);
    }
  };

  const handleTransferToDecrypt = () => {
    if (encryptedResult) {
      setDecryptIv(encryptedResult.iv || '');
      setDecryptCiphertext(encryptedResult.ciphertext || '');
      setDecryptError('');
      setDecryptedPlaintext('');
    }
  };

  const handleDecrypt = async () => {
    if (!decryptIv.trim() || !decryptCiphertext.trim()) {
      setDecryptError('Both Initialization Vector (IV) and Ciphertext are required for decryption.');
      return;
    }
    setDecryptLoading(true);
    setDecryptError('');
    setDecryptedPlaintext('');
    try {
      const res = await api.post('/encryption/decrypt', {
        iv: decryptIv.trim(),
        ciphertext: decryptCiphertext.trim(),
      });
      setDecryptedPlaintext(res.data.plaintext || '');
    } catch (e) {
      setDecryptError(e.response?.data?.message || e.message || 'Decryption operation failed');
    } finally {
      setDecryptLoading(false);
    }
  };

  const handleClearAll = () => {
    setPlaintextToEncrypt('');
    setEncryptedResult(null);
    setEncryptError('');
    setDecryptIv('');
    setDecryptCiphertext('');
    setDecryptedPlaintext('');
    setDecryptError('');
  };

  return (
    <PageContainer
      title="AES-256-GCM Record Cryptography"
      badge="Authenticated Encryption"
      description="Cryptographic pipeline protecting Electronic Health Records (EHR) using Galois/Counter Mode with 128-bit authentication tags."
      actions={
        <button
          onClick={handleClearAll}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-[#202D43] hover:bg-[#283852] text-[#F1F5F9] border border-[#344258] transition-colors"
        >
          <RotateCcw size={14} />
          Reset Pipeline
        </button>
      }
    >
      {/* Visual Encryption / Decryption Pipeline Flow */}
      <div className="bg-[#18243A] border border-[#344258] rounded-xl p-5 shadow-sm space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#A8B5C9] flex items-center gap-2">
          <Shield size={16} className="text-[#8B7CF6]" />
          Cryptographic Data Flow Architecture
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Encryption Flow Diagram */}
          <div className="p-3.5 rounded-xl bg-[#202D43] border border-[#344258] space-y-2">
            <span className="text-[11px] font-semibold text-[#A99CFB] uppercase tracking-wider">
              Encryption Flow (Sender)
            </span>
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
              <span className="px-2.5 py-1 rounded bg-[#18243A] text-[#F1F5F9] border border-[#344258]">
                Plaintext EHR
              </span>
              <ArrowRight size={14} className="text-[#8B7CF6] animate-pulse" />
              <span className="px-2.5 py-1 rounded bg-[#8B7CF6]/10 text-[#A99CFB] border border-[#8B7CF6]/30">
                AES-256-GCM (IV + Key)
              </span>
              <ArrowRight size={14} className="text-[#8B7CF6] animate-pulse" />
              <span className="px-2.5 py-1 rounded bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30">
                Ciphertext + Auth Tag
              </span>
            </div>
          </div>

          {/* Decryption Flow Diagram */}
          <div className="p-3.5 rounded-xl bg-[#202D43] border border-[#344258] space-y-2">
            <span className="text-[11px] font-semibold text-[#10B981] uppercase tracking-wider">
              Decryption Flow (Receiver)
            </span>
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
              <span className="px-2.5 py-1 rounded bg-[#18243A] text-[#F1F5F9] border border-[#344258]">
                Ciphertext + IV
              </span>
              <ArrowRight size={14} className="text-[#10B981] animate-pulse" />
              <span className="px-2.5 py-1 rounded bg-[#D6A85F]/10 text-[#D6A85F] border border-[#D6A85F]/30">
                Tag Authentication
              </span>
              <ArrowRight size={14} className="text-[#10B981] animate-pulse" />
              <span className="px-2.5 py-1 rounded bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30">
                Decrypted Plaintext
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ENCRYPTION PANEL */}
        <div className="bg-[#18243A] border border-[#344258] rounded-xl p-5 sm:p-6 flex flex-col justify-between shadow-sm space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#344258]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#8B7CF6]/10 border border-[#8B7CF6]/30 flex items-center justify-center text-[#8B7CF6]">
                  <Lock size={17} />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-[#F1F5F9]">Encrypt Hospital Record</h2>
                  <p className="text-xs text-[#A8B5C9]">Input patient EHR to generate authenticated ciphertext</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPlaintextToEncrypt(SAMPLE_PATIENT_RECORD)}
                className="text-xs text-[#A99CFB] hover:underline font-medium"
              >
                Sample Record
              </button>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium text-[#A8B5C9]">
                  Plaintext Medical Data
                </label>
                <span className="text-[11px] font-mono text-[#A8B5C9]">
                  {plaintextToEncrypt.length} characters
                </span>
              </div>
              <textarea
                rows={5}
                value={plaintextToEncrypt}
                onChange={(e) => setPlaintextToEncrypt(e.target.value)}
                placeholder="Enter sensitive patient EHR or diagnostic data..."
                className="w-full rounded-lg bg-[#202D43] border border-[#344258] p-3 text-xs sm:text-sm font-mono text-[#F1F5F9] placeholder-[#A8B5C9]/60 focus:ring-2 focus:ring-[#8B7CF6] focus:outline-none transition-all"
                disabled={encryptLoading}
              />
            </div>

            <button
              onClick={handleEncrypt}
              disabled={encryptLoading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#8B7CF6] hover:bg-[#7C6AE6] text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-50"
            >
              <Lock size={16} />
              {encryptLoading ? 'Encrypting via AES-256-GCM...' : 'Encrypt Patient Record'}
            </button>

            {encryptError && (
              <div className="p-3 rounded-lg bg-[#EF6464]/10 border border-[#EF6464]/30 text-[#EF6464] text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0 text-[#EF6464]" />
                <span>{encryptError}</span>
              </div>
            )}
          </div>

          {/* Encrypted Output */}
          {encryptedResult && (
            <div className="mt-4 pt-4 border-t border-[#344258] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#10B981] flex items-center gap-1.5">
                  <ShieldCheck size={14} /> Ciphertext Generated
                </span>
                <button
                  onClick={handleTransferToDecrypt}
                  className="inline-flex items-center gap-1 text-xs text-[#A99CFB] hover:underline font-medium"
                  title="Copy output directly into Decryption form below"
                >
                  <ArrowDown size={12} /> Use for Decryption
                </button>
              </div>

              {/* IV */}
              <div>
                <div className="flex items-center justify-between text-[11px] text-[#A8B5C9] mb-1">
                  <span>Initialization Vector (12-byte IV Base64):</span>
                  <button
                    onClick={() => copyToClipboard(encryptedResult.iv, 'enc-iv')}
                    className="hover:text-[#F1F5F9] text-[#A8B5C9] flex items-center gap-1 text-[11px]"
                  >
                    {copiedKey === 'enc-iv' ? <Check size={11} className="text-[#10B981]" /> : <Copy size={11} />}
                    {copiedKey === 'enc-iv' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="p-2.5 rounded bg-[#202D43] border border-[#344258] font-mono text-xs text-[#A99CFB] break-all select-all">
                  {encryptedResult.iv}
                </div>
              </div>

              {/* Ciphertext */}
              <div>
                <div className="flex items-center justify-between text-[11px] text-[#A8B5C9] mb-1">
                  <span>Encrypted Payload (with GCM 128-bit Auth Tag):</span>
                  <button
                    onClick={() => copyToClipboard(encryptedResult.ciphertext, 'enc-cipher')}
                    className="hover:text-[#F1F5F9] text-[#A8B5C9] flex items-center gap-1 text-[11px]"
                  >
                    {copiedKey === 'enc-cipher' ? <Check size={11} className="text-[#10B981]" /> : <Copy size={11} />}
                    {copiedKey === 'enc-cipher' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="p-2.5 rounded bg-[#202D43] border border-[#344258] font-mono text-xs text-[#F1F5F9] break-all max-h-32 overflow-y-auto select-all">
                  {encryptedResult.ciphertext}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* DECRYPTION PANEL */}
        <div className="bg-[#18243A] border border-[#344258] rounded-xl p-5 sm:p-6 flex flex-col justify-between shadow-sm space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#344258]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#8B7CF6]/10 border border-[#8B7CF6]/30 flex items-center justify-center text-[#8B7CF6]">
                  <Unlock size={17} />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-[#F1F5F9]">Decrypt Hospital Record</h2>
                  <p className="text-xs text-[#A8B5C9]">Validate GCM auth tag and decrypt ciphertext</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A8B5C9] mb-1.5">
                Initialization Vector (IV)
              </label>
              <input
                type="text"
                value={decryptIv}
                onChange={(e) => setDecryptIv(e.target.value)}
                placeholder="Paste IV Base64 string"
                className="w-full rounded-lg bg-[#202D43] border border-[#344258] px-3 py-2 text-xs sm:text-sm font-mono text-[#F1F5F9] placeholder-[#A8B5C9]/60 focus:ring-2 focus:ring-[#8B7CF6] focus:outline-none transition-all"
                disabled={decryptLoading}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A8B5C9] mb-1.5">
                Ciphertext
              </label>
              <textarea
                rows={3}
                value={decryptCiphertext}
                onChange={(e) => setDecryptCiphertext(e.target.value)}
                placeholder="Paste encrypted ciphertext string"
                className="w-full rounded-lg bg-[#202D43] border border-[#344258] p-3 text-xs sm:text-sm font-mono text-[#F1F5F9] placeholder-[#A8B5C9]/60 focus:ring-2 focus:ring-[#8B7CF6] focus:outline-none transition-all"
                disabled={decryptLoading}
              />
            </div>

            <button
              onClick={handleDecrypt}
              disabled={decryptLoading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#202D43] hover:bg-[#283852] text-[#A99CFB] border border-[#8B7CF6]/40 font-semibold text-sm transition-colors shadow-sm disabled:opacity-50"
            >
              <Unlock size={16} />
              {decryptLoading ? 'Verifying Tag & Decrypting...' : 'Decrypt Record'}
            </button>

            {decryptError && (
              <div className="p-3 rounded-lg bg-[#EF6464]/10 border border-[#EF6464]/30 text-[#EF6464] text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0 text-[#EF6464]" />
                <span>{decryptError}</span>
              </div>
            )}
          </div>

          {/* Decrypted Output */}
          {decryptedPlaintext && (
            <div className="mt-4 pt-4 border-t border-[#344258] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#10B981] flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> Authenticated Plaintext Decrypted
                </span>
                <button
                  onClick={() => copyToClipboard(decryptedPlaintext, 'dec-plain')}
                  className="hover:text-[#F1F5F9] text-[#A8B5C9] flex items-center gap-1 text-[11px]"
                >
                  {copiedKey === 'dec-plain' ? <Check size={11} className="text-[#10B981]" /> : <Copy size={11} />}
                  {copiedKey === 'dec-plain' ? 'Copied' : 'Copy Plaintext'}
                </button>
              </div>

              <pre className="p-3.5 rounded-lg bg-[#202D43] border border-[#10B981]/40 font-mono text-xs text-[#10B981] whitespace-pre-wrap break-all max-h-48 overflow-y-auto">
                {decryptedPlaintext}
              </pre>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
