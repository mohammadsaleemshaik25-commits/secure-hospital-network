import React, { useState } from 'react';
import {
  GitFork,
  Play,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Route,
  ArrowRight,
  Network,
} from 'lucide-react';
import api from '../services/api';
import PageContainer from '../components/ui/PageContainer';

// Default topology using verified backend EdgeDto fields: source, target, weight
const DEFAULT_HOSPITAL_NODES = [
  { id: 'R1', name: 'Core Backbone Switch' },
  { id: 'R2', name: 'ICU Subnet Gateway' },
  { id: 'R3', name: 'Emergency Ward Switch' },
  { id: 'R4', name: 'Radiology PACS Gateway' },
  { id: 'R5', name: 'Cardiology Telemetry Router' },
];

const DEFAULT_HOSPITAL_EDGES = [
  { source: 'R1', target: 'R2', weight: 4 },
  { source: 'R1', target: 'R3', weight: 2 },
  { source: 'R2', target: 'R4', weight: 5 },
  { source: 'R3', target: 'R2', weight: 1 },
  { source: 'R3', target: 'R4', weight: 8 },
  { source: 'R3', target: 'R5', weight: 10 },
  { source: 'R4', target: 'R5', weight: 2 },
];

// Router graph node coordinates for SVG visualization (ViewBox: 0 0 500 300)
const NODE_POSITIONS = {
  R1: { x: 70, y: 150, label: 'R1 (Core)' },
  R2: { x: 230, y: 70, label: 'R2 (ICU)' },
  R3: { x: 230, y: 230, label: 'R3 (ER)' },
  R4: { x: 370, y: 80, label: 'R4 (PACS)' },
  R5: { x: 440, y: 210, label: 'R5 (Cardio)' },
};

export default function Routing() {
  const [mode, setMode] = useState('dijkstra'); // 'dijkstra' or 'distance-vector'
  const [nodesJson, setNodesJson] = useState(JSON.stringify(DEFAULT_HOSPITAL_NODES, null, 2));
  const [edgesJson, setEdgesJson] = useState(JSON.stringify(DEFAULT_HOSPITAL_EDGES, null, 2));
  const [sourceId, setSourceId] = useState('R1');
  const [targetId, setTargetId] = useState('R5');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadSampleTopology = () => {
    setNodesJson(JSON.stringify(DEFAULT_HOSPITAL_NODES, null, 2));
    setEdgesJson(JSON.stringify(DEFAULT_HOSPITAL_EDGES, null, 2));
    setSourceId('R1');
    setTargetId('R5');
    setError('');
  };

  const parseJson = (text, name) => {
    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) {
        throw new Error(`${name} must be a JSON array`);
      }
      return parsed;
    } catch (err) {
      throw new Error(`Invalid JSON for ${name}: ${err.message}`);
    }
  };

  const runAlgorithm = async () => {
    setError('');
    let nodes;
    let edges;

    try {
      nodes = parseJson(nodesJson, 'Nodes');
      edges = parseJson(edgesJson, 'Edges');
    } catch (parseErr) {
      setError(parseErr.message);
      return;
    }

    if (mode === 'dijkstra') {
      if (!sourceId.trim() || !targetId.trim()) {
        setError('Both Source Node ID and Target Node ID are required for Dijkstra.');
        return;
      }
    }

    setLoading(true);
    setResult(null);

    try {
      if (mode === 'dijkstra') {
        const payload = {
          nodes,
          edges,
          sourceId: sourceId.trim(),
          targetId: targetId.trim(),
        };
        const res = await api.post('/routing/dijkstra', payload);
        setResult({ type: 'Dijkstra Shortest Path', data: res.data });
      } else {
        const payload = { nodes, edges };
        const res = await api.post('/routing/distance-vector', payload);
        setResult({ type: 'Distance Vector Routing Tables', data: res.data });
      }
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Routing algorithm calculation failed');
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setNodesJson('[]');
    setEdgesJson('[]');
    setSourceId('');
    setTargetId('');
    setResult(null);
    setError('');
  };

  // Helper to determine if an edge (source -> target) is in the Dijkstra shortest path
  const isEdgeInPath = (src, tgt) => {
    if (!result?.data?.path || !Array.isArray(result.data.path)) return false;
    const path = result.data.path;
    for (let i = 0; i < path.length - 1; i++) {
      if (
        (path[i] === src && path[i + 1] === tgt) ||
        (path[i] === tgt && path[i + 1] === src)
      ) {
        return true;
      }
    }
    return false;
  };

  let parsedEdges = [];
  try {
    parsedEdges = JSON.parse(edgesJson);
  } catch {
    parsedEdges = [];
  }

  return (
    <PageContainer
      title="Dynamic Routing Protocols & Algorithms"
      badge="Network Layer"
      description="Visual execution of Link-State Dijkstra Shortest Path First (OSPF) and Distance Vector Bellman-Ford (RIP) across hospital routers."
      actions={
        <button
          onClick={clearAll}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-[#202D43] hover:bg-[#283852] text-[#F1F5F9] border border-[#344258] transition-colors"
        >
          <RotateCcw size={14} />
          Reset Graph
        </button>
      }
    >
      {/* Educational Guide */}
      <div className="bg-[#18243A] border border-[#344258] rounded-xl p-5 shadow-sm space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#A8B5C9] flex items-center gap-2">
          <GitFork size={16} className="text-[#8B7CF6]" />
          Routing Protocol Comparison
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-[#202D43] border border-[#8B7CF6]/40 space-y-1">
            <span className="text-[#A99CFB] font-bold block">Dijkstra Shortest Path First (OSPF)</span>
            <p className="text-[11px] text-[#A8B5C9]">Evaluates full topology graph weights to calculate minimum-cost path between source & target nodes.</p>
          </div>
          <div className="p-3 rounded-lg bg-[#202D43] border border-[#8B7CF6]/40 space-y-1">
            <span className="text-[#A99CFB] font-bold block">Distance Vector Routing (RIP / Bellman-Ford)</span>
            <p className="text-[11px] text-[#A8B5C9]">Iterative neighbor-vector exchange establishing Next-Hop and cumulative cost to all reachable destinations.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topology Editor & Algorithm Setup */}
        <div className="bg-[#18243A] border border-[#344258] rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#344258]">
            <div className="flex items-center gap-2">
              <Network size={18} className="text-[#8B7CF6]" />
              <h2 className="text-sm font-semibold text-[#F1F5F9]">Graph & Algorithm Setup</h2>
            </div>
            <button
              type="button"
              onClick={loadSampleTopology}
              className="text-xs text-[#A99CFB] hover:underline font-medium"
            >
              Load Hospital Network
            </button>
          </div>

          {/* Mode Selector */}
          <div>
            <label className="block text-xs font-medium text-[#A8B5C9] mb-1.5">
              Algorithm Choice
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode('dijkstra')}
                className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                  mode === 'dijkstra'
                    ? 'bg-[#8B7CF6]/10 border-[#8B7CF6] text-[#A99CFB]'
                    : 'bg-[#202D43] border-[#344258] text-[#A8B5C9] hover:text-[#F1F5F9]'
                }`}
              >
                Dijkstra Shortest Path
              </button>
              <button
                type="button"
                onClick={() => setMode('distance-vector')}
                className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                  mode === 'distance-vector'
                    ? 'bg-[#8B7CF6]/10 border-[#8B7CF6] text-[#A99CFB]'
                    : 'bg-[#202D43] border-[#344258] text-[#A8B5C9] hover:text-[#F1F5F9]'
                }`}
              >
                Distance Vector Tables
              </button>
            </div>
          </div>

          {/* Nodes & Edges JSON (EdgeDto: source, target, weight) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#A8B5C9] mb-1.5">
                Routers/Nodes JSON <span className="font-mono text-[10px]">[{`{ id, name }`}]</span>
              </label>
              <textarea
                rows={5}
                value={nodesJson}
                onChange={(e) => setNodesJson(e.target.value)}
                className="w-full rounded-lg bg-[#202D43] border border-[#344258] p-2.5 text-xs font-mono text-[#F1F5F9] placeholder-[#A8B5C9]/60 focus:ring-2 focus:ring-[#8B7CF6] focus:outline-none"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#A8B5C9] mb-1.5">
                Links/Edges JSON <span className="font-mono text-[10px]">[{`{ source, target, weight }`}]</span>
              </label>
              <textarea
                rows={5}
                value={edgesJson}
                onChange={(e) => setEdgesJson(e.target.value)}
                className="w-full rounded-lg bg-[#202D43] border border-[#344258] p-2.5 text-xs font-mono text-[#F1F5F9] placeholder-[#A8B5C9]/60 focus:ring-2 focus:ring-[#8B7CF6] focus:outline-none"
                disabled={loading}
              />
            </div>
          </div>

          {/* Dijkstra Endpoints */}
          {mode === 'dijkstra' && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-[#A8B5C9] mb-1.5">
                  Source Router ID
                </label>
                <input
                  type="text"
                  value={sourceId}
                  onChange={(e) => setSourceId(e.target.value)}
                  placeholder="e.g. R1"
                  className="w-full rounded-lg bg-[#202D43] border border-[#344258] px-3 py-2 text-xs sm:text-sm font-mono text-[#F1F5F9] focus:ring-2 focus:ring-[#8B7CF6] focus:outline-none"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#A8B5C9] mb-1.5">
                  Target Router ID
                </label>
                <input
                  type="text"
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  placeholder="e.g. R5"
                  className="w-full rounded-lg bg-[#202D43] border border-[#344258] px-3 py-2 text-xs sm:text-sm font-mono text-[#F1F5F9] focus:ring-2 focus:ring-[#8B7CF6] focus:outline-none"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Compute Button */}
          <button
            onClick={runAlgorithm}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#8B7CF6] hover:bg-[#7C6AE6] text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-50"
          >
            <Play size={16} />
            {loading
              ? 'Computing Optimal Routes...'
              : mode === 'dijkstra'
              ? 'Calculate Shortest Path (Dijkstra)'
              : 'Compute Distance Vector Tables'}
          </button>

          {error && (
            <div className="p-3 rounded-lg bg-[#EF6464]/10 border border-[#EF6464]/30 text-[#EF6464] text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-[#EF6464]" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Algorithm Output Diagnostics & Interactive Graph */}
        <div className="bg-[#18243A] border border-[#344258] rounded-xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#344258]">
              <h2 className="text-sm font-semibold text-[#F1F5F9]">Topology Graph & Route Results</h2>
              {result && (
                <span className="text-xs font-mono text-[#10B981] flex items-center gap-1">
                  <CheckCircle2 size={13} /> Converged
                </span>
              )}
            </div>

            {/* Interactive Router Topology Graph SVG */}
            <div className="p-3 rounded-xl bg-[#202D43] border border-[#344258] overflow-hidden">
              <div className="text-[11px] font-semibold text-[#A8B5C9] uppercase tracking-wider mb-2">
                Router Graph Visualization:
              </div>
              <svg viewBox="0 0 500 300" className="w-full h-auto max-h-56 select-none">
                {/* Edges */}
                {Array.isArray(parsedEdges) &&
                  parsedEdges.map((edge, idx) => {
                    const src = NODE_POSITIONS[edge.source || edge.sourceId];
                    const tgt = NODE_POSITIONS[edge.target || edge.targetId];
                    if (!src || !tgt) return null;

                    const inPath = isEdgeInPath(edge.source || edge.sourceId, edge.target || edge.targetId);

                    return (
                      <g key={`graph-edge-${idx}`}>
                        <line
                          x1={src.x}
                          y1={src.y}
                          x2={tgt.x}
                          y2={tgt.y}
                          stroke={inPath ? '#8B7CF6' : '#344258'}
                          strokeWidth={inPath ? '3' : '1.5'}
                          className={inPath ? 'animate-dash-flow' : ''}
                          strokeDasharray={inPath ? '6, 4' : 'none'}
                        />
                        {/* Edge weight label */}
                        <circle
                          cx={(src.x + tgt.x) / 2}
                          cy={(src.y + tgt.y) / 2}
                          r="9"
                          fill="#18243A"
                          stroke={inPath ? '#8B7CF6' : '#344258'}
                        />
                        <text
                          x={(src.x + tgt.x) / 2}
                          y={(src.y + tgt.y) / 2 + 3}
                          textAnchor="middle"
                          fill={inPath ? '#A99CFB' : '#A8B5C9'}
                          fontSize="9"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {edge.weight}
                        </text>
                      </g>
                    );
                  })}

                {/* Nodes */}
                {Object.entries(NODE_POSITIONS).map(([id, pos]) => {
                  const isInPath = Array.isArray(result?.data?.path) && result.data.path.includes(id);

                  return (
                    <g key={`graph-node-${id}`} transform={`translate(${pos.x}, ${pos.y})`}>
                      <circle
                        r="18"
                        fill="#18243A"
                        stroke={isInPath ? '#8B7CF6' : '#344258'}
                        strokeWidth={isInPath ? '3' : '2'}
                      />
                      <text
                        y="4"
                        textAnchor="middle"
                        fill={isInPath ? '#A99CFB' : '#F1F5F9'}
                        fontSize="10"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {id}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {loading && (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <div className="w-6 h-6 border-2 border-[#8B7CF6] border-t-transparent rounded-full animate-spin mb-2" />
                <span className="text-xs text-[#A8B5C9]">Computing shortest path vectors...</span>
              </div>
            )}

            {!loading && !result && (
              <div className="py-6 text-center text-[#A8B5C9] text-xs">
                No route calculation executed. Choose an algorithm and click Calculate.
              </div>
            )}

            {!loading && result && (
              <div className="space-y-4">
                {/* Dijkstra Formatted Path Result */}
                {mode === 'dijkstra' && result.data && (
                  <div className="p-4 rounded-xl bg-[#202D43] border border-[#8B7CF6]/40 space-y-3">
                    <div className="flex items-center justify-between text-xs text-[#A8B5C9]">
                      <span>Optimal Path Sequence:</span>
                      <span className="text-[#A99CFB] font-semibold flex items-center gap-1">
                        <Route size={13} /> Minimum Weight Path
                      </span>
                    </div>

                    {/* Path Steps */}
                    {Array.isArray(result.data.path) ? (
                      <div className="flex flex-wrap items-center gap-2 py-1">
                        {result.data.path.map((node, i) => (
                          <React.Fragment key={i}>
                            <span className="px-3 py-1.5 rounded-lg bg-[#18243A] border border-[#8B7CF6]/40 font-mono text-xs font-bold text-[#A99CFB]">
                              {String(node)}
                            </span>
                            {i < result.data.path.length - 1 && (
                              <ArrowRight size={14} className="text-[#8B7CF6]" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    ) : (
                      <div className="font-mono text-xs text-[#A99CFB]">
                        {String(result.data.path || 'Calculated')}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-[#344258] text-xs">
                      <span className="text-[#A8B5C9]">Total Metric Cost:</span>
                      <span className="font-mono font-bold text-lg text-[#10B981]">
                        {result.data.totalCost ?? result.data.cost ?? '—'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Distance Vector Formatted Tables */}
                {mode === 'distance-vector' && result.data?.routingTables && (
                  <div className="space-y-3">
                    <span className="text-xs font-semibold text-[#A8B5C9] block">
                      Converged Distance Vector Routing Tables:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto">
                      {result.data.routingTables.map((table, tIdx) => (
                        <div key={tIdx} className="p-3 rounded-lg bg-[#202D43] border border-[#344258] space-y-1.5">
                          <span className="text-xs font-bold text-[#A99CFB] block">
                            Router {table.nodeId}
                          </span>
                          <table className="w-full text-left text-[11px] font-mono">
                            <thead className="text-[#A8B5C9] border-b border-[#344258]">
                              <tr>
                                <th>Dest</th>
                                <th>Next Hop</th>
                                <th className="text-right">Cost</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#344258]/40 text-[#F1F5F9]">
                              {Array.isArray(table.entries) &&
                                table.entries.map((entry, eIdx) => (
                                  <tr key={eIdx}>
                                    <td className="py-1">{entry.destination}</td>
                                    <td className="py-1 text-[#A99CFB]">{entry.nextHop || 'DIRECT'}</td>
                                    <td className="py-1 text-right text-[#10B981]">{entry.totalCost}</td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
