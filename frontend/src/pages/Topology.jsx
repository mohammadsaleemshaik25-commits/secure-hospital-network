import React, { useEffect, useState } from 'react';
import {
  Network,
  RefreshCw,
  AlertCircle,
  Copy,
  Check,
  Server,
  CheckCircle2,
} from 'lucide-react';
import api from '../services/api';
import PageContainer from '../components/ui/PageContainer';

export default function Topology() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedIp, setCopiedIp] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  const loadTopology = async (isManual = false) => {
    if (isManual) setLoading(true);
    setError('');
    try {
      const res = await api.get('/departments');
      const list = Array.isArray(res.data) ? res.data : [];
      setDepartments(list);
      if (list.length > 0 && !selectedNode) {
        setSelectedNode(list[0]);
      }
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to fetch topology data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    api.get('/departments')
      .then((res) => {
        if (ignore) return;
        const list = Array.isArray(res.data) ? res.data : [];
        setDepartments(list);
        if (list.length > 0) setSelectedNode(list[0]);
        setLoading(false);
      })
      .catch((e) => {
        if (ignore) return;
        setError(e.response?.data?.message || e.message || 'Failed to fetch topology data');
        setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const copyToClipboard = (ip) => {
    navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
    setTimeout(() => setCopiedIp(null), 2000);
  };

  // Node coordinate generator for the 8 hospital departments around Core Router
  // Core Router center at (480, 260). ViewBox: 0 0 960 520
  const getNodeCoordinates = (index, totalNodes) => {
    const cx = 480;
    const cy = 260;
    const rx = 385;
    const ry = 195;
    const angle = (index / totalNodes) * 2 * Math.PI - Math.PI / 2;
    const x = cx + rx * Math.cos(angle);
    const y = cy + ry * Math.sin(angle);
    return { x, y };
  };

  return (
    <PageContainer
      title="Hospital Network Architecture & Topology"
      badge="VLAN Segments"
      description="Visual star topology interconnecting clinical VLAN subnets through the Hospital Core Gateway Router."
      actions={
        <button
          onClick={() => loadTopology(true)}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-[#202D43] hover:bg-[#283852] text-[#F1F5F9] border border-[#344258] transition-all disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-[#8B7CF6]' : ''} />
          Refresh Topology
        </button>
      }
    >
      {/* Topology Diagram Container */}
      <div className="bg-[#18243A] border border-[#344258] rounded-xl p-4 sm:p-6 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#344258]">
          <div>
            <h2 className="text-base font-semibold text-[#F1F5F9] flex items-center gap-2">
              <Network size={18} className="text-[#8B7CF6]" />
              Physical & Logical Subnet Star Architecture
            </h2>
            <p className="text-xs text-[#A8B5C9] mt-0.5">
              Click any department node to inspect subnet boundaries and gateway routes.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#A8B5C9]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
              Online Link
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8B7CF6]" />
              Core Backbone
            </span>
          </div>
        </div>

        {/* SVG Interactive Topology Canvas */}
        <div className="relative w-full my-4 overflow-x-auto">
          <div className="min-w-[700px] max-w-full mx-auto">
            <svg
              viewBox="0 0 960 520"
              className="w-full h-auto select-none"
              style={{ maxHeight: '520px' }}
            >
              <defs>
                {/* Core Router Gradient */}
                <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#8B7CF6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#8B7CF6" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Central Router Area Ambient Glow */}
              <circle cx="480" cy="260" r="130" fill="url(#coreGlow)" />

              {/* Connection Lines from Core to each Department */}
              {departments.map((dept, idx) => {
                const { x, y } = getNodeCoordinates(idx, departments.length || 8);
                const isSelected = selectedNode?.id === dept.id;
                const isOnline = dept.status === 'ONLINE';

                return (
                  <g key={`link-${dept.id || idx}`}>
                    {/* Background Static Connection Line */}
                    <line
                      x1="480"
                      y1="260"
                      x2={x}
                      y2={y}
                      stroke={isSelected ? '#8B7CF6' : '#344258'}
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                    />
                    {/* Animated Royal Indigo Packet Flow */}
                    {isOnline && (
                      <line
                        x1="480"
                        y1="260"
                        x2={x}
                        y2={y}
                        stroke={isSelected ? '#A99CFB' : '#8B7CF6'}
                        strokeWidth={isSelected ? '2' : '1.5'}
                        strokeDasharray="6, 8"
                        className="animate-dash-flow"
                      />
                    )}
                  </g>
                );
              })}

              {/* Central Core Router Node (Larger & Clearer) */}
              <g transform="translate(480, 260)">
                <circle
                  r="52"
                  fill="#18243A"
                  stroke="#8B7CF6"
                  strokeWidth="3.5"
                  className="filter drop-shadow-[0_0_14px_rgba(139,124,246,0.35)]"
                />
                <circle
                  r="58"
                  fill="none"
                  stroke="#8B7CF6"
                  strokeWidth="1"
                  strokeDasharray="3, 4"
                  className="animate-dash-flow opacity-50"
                />
                <text
                  y="-10"
                  textAnchor="middle"
                  fill="#F1F5F9"
                  fontSize="11"
                  fontWeight="bold"
                  letterSpacing="0.04em"
                >
                  CORE ROUTER
                </text>
                <text
                  y="8"
                  textAnchor="middle"
                  fill="#A99CFB"
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  192.168.1.1
                </text>
                <text
                  y="24"
                  textAnchor="middle"
                  fill="#A8B5C9"
                  fontSize="8.5"
                >
                  Backbone Gateway
                </text>
              </g>

              {/* Department Satellite Nodes */}
              {departments.map((dept, idx) => {
                const { x, y } = getNodeCoordinates(idx, departments.length || 8);
                const isSelected = selectedNode?.id === dept.id;
                const isOnline = dept.status === 'ONLINE';

                return (
                  <g
                    key={`node-${dept.id || idx}`}
                    transform={`translate(${x}, ${y})`}
                    onClick={() => setSelectedNode(dept)}
                    className="cursor-pointer transition-transform hover:scale-105"
                  >
                    {/* Outer selection ring */}
                    {isSelected && (
                      <circle
                        r="44"
                        fill="none"
                        stroke="#8B7CF6"
                        strokeWidth="2"
                        strokeDasharray="4, 4"
                        className="animate-dash-flow"
                      />
                    )}
                    {/* Node circle */}
                    <circle
                      r="36"
                      fill="#202D43"
                      stroke={isSelected ? '#8B7CF6' : '#344258'}
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                      className="transition-colors"
                    />
                    {/* Online / Offline status dot (Emerald for active) */}
                    <circle
                      cx="23"
                      cy="-23"
                      r="5.5"
                      fill={isOnline ? '#10B981' : '#EF6464'}
                      stroke="#18243A"
                      strokeWidth="2"
                    />

                    {/* Department Name */}
                    <text
                      y="-4"
                      textAnchor="middle"
                      fill="#F1F5F9"
                      fontSize="10.5"
                      fontWeight="600"
                    >
                      {dept.name}
                    </text>
                    {/* IP Address */}
                    <text
                      y="11"
                      textAnchor="middle"
                      fill="#A99CFB"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      {dept.ipAddress}
                    </text>
                    {/* Gateway */}
                    <text
                      y="23"
                      textAnchor="middle"
                      fill="#A8B5C9"
                      fontSize="8"
                    >
                      GW: {dept.gateway}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Selected Node Quick Inspection Card */}
        {selectedNode && (
          <div className="mt-2 p-4 rounded-xl bg-[#202D43] border border-[#8B7CF6]/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#8B7CF6]/10 border border-[#8B7CF6]/30 flex items-center justify-center text-[#8B7CF6] shrink-0">
                <Server size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#F1F5F9]">{selectedNode.name}</h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#18243A] text-[#A8B5C9]">
                    VLAN Node #{selectedNode.id}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#10B981]">
                    <CheckCircle2 size={12} /> {selectedNode.status}
                  </span>
                </div>
                <p className="text-xs text-[#A8B5C9] mt-0.5">
                  Subnet: <span className="font-mono text-[#A99CFB]">{selectedNode.networkAddress}</span> &bull; Mask: <span className="font-mono text-[#F1F5F9]">{selectedNode.subnetMask}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="px-3 py-1.5 rounded-lg bg-[#18243A] border border-[#344258] font-mono">
                <span className="text-[#A8B5C9]">Host IP: </span>
                <strong className="text-[#A99CFB]">{selectedNode.ipAddress}</strong>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-[#18243A] border border-[#344258] font-mono">
                <span className="text-[#A8B5C9]">Default GW: </span>
                <strong className="text-[#F1F5F9]">{selectedNode.gateway}</strong>
              </div>
              <button
                onClick={() => copyToClipboard(selectedNode.ipAddress)}
                className="px-3 py-1.5 rounded-lg bg-[#8B7CF6]/10 hover:bg-[#8B7CF6]/20 border border-[#8B7CF6]/30 text-[#A99CFB] font-medium transition-colors flex items-center gap-1.5"
              >
                {copiedIp === selectedNode.ipAddress ? <Check size={13} className="text-[#10B981]" /> : <Copy size={13} />}
                {copiedIp === selectedNode.ipAddress ? 'Copied' : 'Copy IP'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-[#EF6464]/10 border border-[#EF6464]/30 rounded-xl p-4 flex items-start gap-3 text-[#EF6464]">
          <AlertCircle size={20} className="shrink-0 mt-0.5 text-[#EF6464]" />
          <div className="flex-1 text-sm">
            <p className="font-semibold text-[#F1F5F9]">Failed to load network topology</p>
            <p className="text-[#A8B5C9] text-xs mt-0.5">{error}</p>
          </div>
          <button
            onClick={() => loadTopology(true)}
            className="px-3 py-1 rounded bg-[#EF6464]/20 hover:bg-[#EF6464]/30 text-[#F1F5F9] text-xs font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-[#18243A] border border-[#344258] rounded-xl p-8 flex flex-col items-center justify-center text-center">
          <RefreshCw size={28} className="animate-spin text-[#8B7CF6] mb-3" />
          <p className="text-sm font-medium text-[#F1F5F9]">Rendering Star Topology...</p>
          <p className="text-xs text-[#A8B5C9] mt-1">Connecting to /api/departments</p>
        </div>
      )}

      {/* Department Cards Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {departments.map((d) => {
            const isOnline = d.status === 'ONLINE';
            const isSelected = selectedNode?.id === d.id;

            return (
              <div
                key={d.id}
                onClick={() => setSelectedNode(d)}
                className={`bg-[#18243A] border rounded-xl p-4 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-[#8B7CF6] shadow-[0_0_12px_rgba(139,124,246,0.25)]'
                    : 'border-[#344258] hover:border-[#8B7CF6]/50'
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#344258]/60">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-[#10B981]' : 'bg-[#EF6464]'}`} />
                    <h4 className="text-sm font-semibold text-[#F1F5F9]">{d.name}</h4>
                  </div>
                  <span className="text-[10px] font-mono text-[#A8B5C9]">#{d.id}</span>
                </div>

                <div className="mt-3 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#A8B5C9]">Host IP:</span>
                    <span className="text-[#A99CFB]">{d.ipAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A8B5C9]">Gateway:</span>
                    <span className="text-[#F1F5F9]">{d.gateway}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A8B5C9]">Subnet:</span>
                    <span className="text-[#A8B5C9]">{d.networkAddress}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
