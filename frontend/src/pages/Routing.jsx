import React, { useState, useEffect, useMemo } from 'react';
import {
  GitFork,
  Play,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Route,
  ArrowRight,
  Network,
  RefreshCw,
} from 'lucide-react';
import api from '../services/api';
import PageContainer from '../components/ui/PageContainer';

// Fallback department configurations matching backend DataInitializer for instant or offline display
const FALLBACK_DEPARTMENTS = [
  { id: 1, name: 'Reception', ipAddress: '192.168.10.10', gateway: '192.168.10.1', networkAddress: '192.168.10.0/24' },
  { id: 2, name: 'Emergency', ipAddress: '192.168.20.10', gateway: '192.168.20.1', networkAddress: '192.168.20.0/24' },
  { id: 3, name: 'ICU', ipAddress: '192.168.30.10', gateway: '192.168.30.1', networkAddress: '192.168.30.0/24' },
  { id: 4, name: 'Pharmacy', ipAddress: '192.168.40.10', gateway: '192.168.40.1', networkAddress: '192.168.40.0/24' },
  { id: 5, name: 'Laboratory', ipAddress: '192.168.50.10', gateway: '192.168.50.1', networkAddress: '192.168.50.0/24' },
  { id: 6, name: "Doctors' Rooms", ipAddress: '192.168.60.10', gateway: '192.168.60.1', networkAddress: '192.168.60.0/24' },
  { id: 7, name: 'Medical Server', ipAddress: '192.168.70.10', gateway: '192.168.70.1', networkAddress: '192.168.70.0/24' },
  { id: 8, name: 'Administration', ipAddress: '192.168.80.10', gateway: '192.168.80.1', networkAddress: '192.168.80.0/24' },
];

/**
 * Builds the canonical hospital star topology:
 * The 8 clinical departments connect directly to the central Core Router gateway.
 */
function buildHospitalGraph(deptList) {
  const depts = Array.isArray(deptList) && deptList.length > 0 ? deptList : FALLBACK_DEPARTMENTS;

  const nodes = [
    { id: 'CORE', name: 'Core Router (192.168.1.1)' },
    ...depts.map((d) => ({
      id: String(d.id),
      name: d.name,
    })),
  ];

  const edges = [];
  depts.forEach((d) => {
    const deptId = String(d.id);
    // Bidirectional 1-hop links to the central hospital gateway
    edges.push({ source: deptId, target: 'CORE', weight: 1 });
    edges.push({ source: 'CORE', target: deptId, weight: 1 });
  });

  return { nodes, edges, depts };
}

export default function Routing() {
  const initialGraph = buildHospitalGraph(FALLBACK_DEPARTMENTS);

  const [mode, setMode] = useState('dijkstra'); // 'dijkstra' or 'distance-vector'
  const [departments, setDepartments] = useState(FALLBACK_DEPARTMENTS);
  const [nodesJson, setNodesJson] = useState(JSON.stringify(initialGraph.nodes, null, 2));
  const [edgesJson, setEdgesJson] = useState(JSON.stringify(initialGraph.edges, null, 2));
  const [sourceId, setSourceId] = useState('1'); // Reception
  const [targetId, setTargetId] = useState('2'); // Emergency
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deptLoading, setDeptLoading] = useState(false);
  const [error, setError] = useState('');
  const [deptError, setDeptError] = useState('');

  // Fetch the 8 actual departments from /api/departments and initialize the graph
  const loadHospitalTopology = async () => {
    setDeptLoading(true);
    setDeptError('');
    setError('');
    try {
      const res = await api.get('/departments');
      const list = Array.isArray(res.data) && res.data.length > 0 ? res.data : FALLBACK_DEPARTMENTS;
      setDepartments(list);
      const graph = buildHospitalGraph(list);
      setNodesJson(JSON.stringify(graph.nodes, null, 2));
      setEdgesJson(JSON.stringify(graph.edges, null, 2));
      setSourceId(String(list[0]?.id || '1'));
      setTargetId(String(list[1]?.id || '2'));
      setResult(null);
    } catch (e) {
      const errMsg = e.response?.data?.message || e.message || 'Failed to fetch departments from backend';
      setDeptError(errMsg);
      // Fallback to offline actual 8 departments rather than generic routers
      const graph = buildHospitalGraph(FALLBACK_DEPARTMENTS);
      setDepartments(FALLBACK_DEPARTMENTS);
      setNodesJson(JSON.stringify(graph.nodes, null, 2));
      setEdgesJson(JSON.stringify(graph.edges, null, 2));
      setSourceId('1');
      setTargetId('2');
    } finally {
      setDeptLoading(false);
    }
  };

  useEffect(() => {
    loadHospitalTopology();
  }, []);

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

  const parsedNodes = useMemo(() => {
    try {
      const parsed = JSON.parse(nodesJson);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [nodesJson]);

  const parsedEdges = useMemo(() => {
    try {
      const parsed = JSON.parse(edgesJson);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [edgesJson]);

  // Map of node ID to friendly department or router name
  const nodeNameMap = useMemo(() => {
    const map = {
      CORE: 'Core Router (192.168.1.1)',
    };
    departments.forEach((d) => {
      map[String(d.id)] = d.name;
    });
    parsedNodes.forEach((n) => {
      if (n.id && n.name && !map[String(n.id)]) {
        map[String(n.id)] = n.name;
      }
    });
    return map;
  }, [departments, parsedNodes]);

  // Node position map for SVG visualization (ViewBox: 0 0 540 320)
  const nodePositions = useMemo(() => {
    const positions = {};
    const cx = 270;
    const cy = 160;
    const rx = 210;
    const ry = 110;

    const coreNodes = parsedNodes.filter((n) => String(n.id).toUpperCase() === 'CORE');
    const nonCoreNodes = parsedNodes.filter((n) => String(n.id).toUpperCase() !== 'CORE');

    // Central Core Router
    if (coreNodes.length > 0) {
      positions[String(coreNodes[0].id)] = { x: cx, y: cy, isCore: true };
    }

    // Outer satellite department nodes
    const total = nonCoreNodes.length || 1;
    nonCoreNodes.forEach((node, idx) => {
      const angle = (idx / total) * 2 * Math.PI - Math.PI / 2;
      positions[String(node.id)] = {
        x: Math.round(cx + rx * Math.cos(angle)),
        y: Math.round(cy + ry * Math.sin(angle)),
        isCore: false,
      };
    });

    return positions;
  }, [parsedNodes]);

  // Unique undirected edges for rendering clean lines in SVG without overlaps
  const uniqueEdges = useMemo(() => {
    const seen = new Set();
    const resultList = [];
    parsedEdges.forEach((edge) => {
      const s = String(edge.source || edge.sourceId || '');
      const t = String(edge.target || edge.targetId || '');
      if (!s || !t) return;
      const key = s < t ? `${s}--${t}` : `${t}--${s}`;
      if (!seen.has(key)) {
        seen.add(key);
        resultList.push({
          source: s,
          target: t,
          weight: edge.weight ?? 1,
        });
      }
    });
    return resultList;
  }, [parsedEdges]);

  // Available selectable nodes for Dijkstra source/target
  const selectableNodes = useMemo(() => {
    return parsedNodes.map((n) => {
      const id = String(n.id);
      const name = n.name || nodeNameMap[id] || `Department ${id}`;
      return { id, name };
    });
  }, [parsedNodes, nodeNameMap]);

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
        setError('Both Source Department and Destination Department are required for Dijkstra.');
        return;
      }
    }

    setLoading(true);
    setResult(null);

    try {
      // Map nodes and edges cleanly to verified backend DTO specifications
      const cleanNodes = nodes.map((n) => ({ id: String(n.id) }));
      const cleanEdges = edges.map((e) => ({
        source: String(e.source || e.sourceId),
        target: String(e.target || e.targetId),
        weight: Number(e.weight),
      }));

      if (mode === 'dijkstra') {
        const payload = {
          nodes: cleanNodes,
          edges: cleanEdges,
          sourceId: sourceId.trim(),
          targetId: targetId.trim(),
        };
        const res = await api.post('/routing/dijkstra', payload);
        setResult({ type: 'Dijkstra Shortest Path', data: res.data });
      } else {
        const payload = {
          nodes: cleanNodes,
          edges: cleanEdges,
        };
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
    const path = result.data.path.map(String);
    const s = String(src);
    const t = String(tgt);
    for (let i = 0; i < path.length - 1; i++) {
      if (
        (path[i] === s && path[i + 1] === t) ||
        (path[i] === t && path[i + 1] === s)
      ) {
        return true;
      }
    }
    return false;
  };

  const isDijkstraUnreachable =
    mode === 'dijkstra' &&
    result &&
    (result.data?.totalCost === -1 || (Array.isArray(result.data?.path) && result.data.path.length === 0));

  return (
    <PageContainer
      title="Dynamic Routing Protocols & Algorithms"
      badge="Network Layer"
      description="Visual execution of Link-State Dijkstra Shortest Path First (OSPF) and Distance Vector Bellman-Ford (RIP) across the 8 hospital departments and central Core Router."
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={loadHospitalTopology}
            disabled={deptLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-[#202D43] hover:bg-[#283852] text-[#F1F5F9] border border-[#344258] transition-colors disabled:opacity-50"
            title="Reload official hospital departments and star topology from backend"
          >
            <RefreshCw size={14} className={deptLoading ? 'animate-spin text-[#8B7CF6]' : ''} />
            Load Hospital Network
          </button>
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-[#202D43] hover:bg-[#283852] text-[#A8B5C9] hover:text-[#F1F5F9] border border-[#344258] transition-colors"
          >
            <RotateCcw size={14} />
            Reset Graph
          </button>
        </div>
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
            <p className="text-[11px] text-[#A8B5C9]">
              Evaluates full topology graph weights to calculate minimum-cost path between source and target department subnets.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-[#202D43] border border-[#8B7CF6]/40 space-y-1">
            <span className="text-[#A99CFB] font-bold block">Distance Vector Routing (RIP / Bellman-Ford)</span>
            <p className="text-[11px] text-[#A8B5C9]">
              Iterative neighbor-vector exchange establishing Next-Hop and cumulative cost across clinical subnets and the central gateway.
            </p>
          </div>
        </div>
      </div>

      {deptError && (
        <div className="p-3 rounded-lg bg-[#D6A85F]/10 border border-[#D6A85F]/30 text-[#D6A85F] text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{deptError}. Loaded built-in clinical department topology.</span>
          </div>
          <button
            onClick={loadHospitalTopology}
            className="text-xs underline hover:text-[#F1F5F9] font-medium"
          >
            Retry
          </button>
        </div>
      )}

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
              onClick={loadHospitalTopology}
              disabled={deptLoading}
              className="text-xs text-[#A99CFB] hover:underline font-medium flex items-center gap-1.5"
            >
              <RefreshCw size={12} className={deptLoading ? 'animate-spin' : ''} />
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
                Departments/Nodes JSON <span className="font-mono text-[10px]">[{`{ id, name }`}]</span>
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

          {/* Dijkstra Endpoints: Department Selectors */}
          {mode === 'dijkstra' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-[#A8B5C9] mb-1.5">
                  Source Department
                </label>
                <select
                  value={sourceId}
                  onChange={(e) => setSourceId(e.target.value)}
                  className="w-full rounded-lg bg-[#202D43] border border-[#344258] px-3 py-2 text-xs sm:text-sm font-mono text-[#F1F5F9] focus:ring-2 focus:ring-[#8B7CF6] focus:outline-none"
                  disabled={loading}
                >
                  {selectableNodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name ? `${n.name} (ID: ${n.id})` : `Node ${n.id}`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#A8B5C9] mb-1.5">
                  Destination Department
                </label>
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full rounded-lg bg-[#202D43] border border-[#344258] px-3 py-2 text-xs sm:text-sm font-mono text-[#F1F5F9] focus:ring-2 focus:ring-[#8B7CF6] focus:outline-none"
                  disabled={loading}
                >
                  {selectableNodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name ? `${n.name} (ID: ${n.id})` : `Node ${n.id}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Compute Button */}
          <button
            onClick={runAlgorithm}
            disabled={loading || parsedNodes.length === 0}
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
              {result && !isDijkstraUnreachable && (
                <span className="text-xs font-mono text-[#10B981] flex items-center gap-1">
                  <CheckCircle2 size={13} /> Converged
                </span>
              )}
            </div>

            {/* Interactive Hospital Department Graph SVG */}
            <div className="p-3 rounded-xl bg-[#202D43] border border-[#344258] overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[11px] font-semibold text-[#A8B5C9] uppercase tracking-wider">
                  Hospital Topology Visualization:
                </div>
                <div className="text-[10px] text-[#A8B5C9] font-mono">
                  {parsedNodes.length} Nodes • {uniqueEdges.length} Links
                </div>
              </div>

              <svg viewBox="0 0 540 320" className="w-full h-auto max-h-64 select-none">
                {/* Edges */}
                {uniqueEdges.map((edge, idx) => {
                  const src = nodePositions[edge.source];
                  const tgt = nodePositions[edge.target];
                  if (!src || !tgt) return null;

                  const inPath = isEdgeInPath(edge.source, edge.target);

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
                      {/* Edge weight badge */}
                      <circle
                        cx={(src.x + tgt.x) / 2}
                        cy={(src.y + tgt.y) / 2}
                        r="8"
                        fill="#18243A"
                        stroke={inPath ? '#8B7CF6' : '#344258'}
                        strokeWidth="1.5"
                      />
                      <text
                        x={(src.x + tgt.x) / 2}
                        y={(src.y + tgt.y) / 2 + 3}
                        textAnchor="middle"
                        fill={inPath ? '#A99CFB' : '#A8B5C9'}
                        fontSize="8.5"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {edge.weight}
                      </text>
                    </g>
                  );
                })}

                {/* Nodes */}
                {parsedNodes.map((node) => {
                  const id = String(node.id);
                  const pos = nodePositions[id];
                  if (!pos) return null;

                  const isCore = pos.isCore || id.toUpperCase() === 'CORE';
                  const isInPath = Array.isArray(result?.data?.path) && result.data.path.map(String).includes(id);
                  const isSource = mode === 'dijkstra' && sourceId === id;
                  const isTarget = mode === 'dijkstra' && targetId === id;
                  const displayName = node.name || nodeNameMap[id] || `Dept ${id}`;

                  // Truncate long names for node SVG label
                  const shortLabel = isCore
                    ? 'Core Router'
                    : displayName.length > 14
                    ? `${displayName.slice(0, 13)}…`
                    : displayName;

                  return (
                    <g key={`graph-node-${id}`} transform={`translate(${pos.x}, ${pos.y})`}>
                      {/* Outer pulse ring for source or target */}
                      {(isSource || isTarget) && (
                        <circle
                          r={isCore ? '30' : '22'}
                          fill="none"
                          stroke={isSource ? '#10B981' : '#8B7CF6'}
                          strokeWidth="1.5"
                          strokeDasharray="3, 3"
                          className="animate-dash-flow opacity-70"
                        />
                      )}

                      {/* Main node circle */}
                      <circle
                        r={isCore ? '24' : '17'}
                        fill={isInPath ? '#18243A' : '#202D43'}
                        stroke={
                          isInPath
                            ? '#8B7CF6'
                            : isSource
                            ? '#10B981'
                            : isTarget
                            ? '#A99CFB'
                            : '#344258'
                        }
                        strokeWidth={isInPath || isSource || isTarget ? '2.5' : '1.5'}
                        className="transition-all"
                      />

                      {/* Node Identifier */}
                      <text
                        y={isCore ? '-2' : '4'}
                        textAnchor="middle"
                        fill={isInPath ? '#A99CFB' : '#F1F5F9'}
                        fontSize={isCore ? '8.5' : '9.5'}
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {id}
                      </text>

                      {/* Sub-label inside Core Router */}
                      {isCore && (
                        <text
                          y="9"
                          textAnchor="middle"
                          fill="#A8B5C9"
                          fontSize="7"
                          fontWeight="normal"
                          fontFamily="sans-serif"
                        >
                          Gateway
                        </text>
                      )}

                      {/* Department Name Label outside circle */}
                      <text
                        y={pos.y > 160 ? 25 : -23}
                        textAnchor="middle"
                        fill={isInPath ? '#A99CFB' : '#A8B5C9'}
                        fontSize="8.5"
                        fontWeight="600"
                        className="pointer-events-none select-none"
                      >
                        {shortLabel}
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
                No route calculation executed. Choose source & destination departments and click Calculate.
              </div>
            )}

            {!loading && result && (
              <div className="space-y-4">
                {/* Dijkstra Result */}
                {mode === 'dijkstra' && result.data && (
                  <div>
                    {isDijkstraUnreachable ? (
                      <div className="p-4 rounded-xl bg-[#202D43] border border-[#D6A85F]/40 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-[#D6A85F]">
                          <AlertCircle size={15} />
                          <span>Destination Unreachable</span>
                        </div>
                        <p className="text-xs text-[#A8B5C9]">
                          No valid route exists between{' '}
                          <strong className="text-[#F1F5F9]">{nodeNameMap[sourceId] || `Node ${sourceId}`}</strong>{' '}
                          and{' '}
                          <strong className="text-[#F1F5F9]">{nodeNameMap[targetId] || `Node ${targetId}`}</strong> in
                          the current topology graph.
                        </p>
                        <div className="pt-2 border-t border-[#344258] text-xs flex justify-between">
                          <span className="text-[#A8B5C9]">Total Metric Cost:</span>
                          <span className="font-mono font-bold text-[#D6A85F]">∞ (Unreachable / -1)</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-[#202D43] border border-[#8B7CF6]/40 space-y-3">
                        <div className="flex items-center justify-between text-xs text-[#A8B5C9]">
                          <span>Optimal Route Sequence:</span>
                          <span className="text-[#A99CFB] font-semibold flex items-center gap-1">
                            <Route size={13} /> Minimum Weight Path
                          </span>
                        </div>

                        {/* Path Steps with Department Names */}
                        {Array.isArray(result.data.path) ? (
                          <div className="flex flex-wrap items-center gap-2 py-1">
                            {result.data.path.map((node, i) => {
                              const nodeId = String(node);
                              const deptName = nodeNameMap[nodeId] || `Node ${nodeId}`;
                              return (
                                <React.Fragment key={i}>
                                  <span className="px-3 py-1.5 rounded-lg bg-[#18243A] border border-[#8B7CF6]/40 font-mono text-xs font-bold text-[#A99CFB] flex items-center gap-1.5">
                                    <span>{deptName}</span>
                                    <span className="text-[10px] text-[#A8B5C9] font-normal">[{nodeId}]</span>
                                  </span>
                                  {i < result.data.path.length - 1 && (
                                    <ArrowRight size={14} className="text-[#8B7CF6]" />
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="font-mono text-xs text-[#A99CFB]">
                            {String(result.data.path || 'Calculated')}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-[#344258] text-xs">
                          <span className="text-[#A8B5C9]">Total Hop Metric Cost:</span>
                          <span className="font-mono font-bold text-lg text-[#10B981]">
                            {result.data.totalCost ?? result.data.cost ?? '—'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Distance Vector Formatted Tables */}
                {mode === 'distance-vector' && result.data?.routingTables && (
                  <div className="space-y-3">
                    <span className="text-xs font-semibold text-[#A8B5C9] block">
                      Converged Distance Vector Routing Tables (Bellman-Ford):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto">
                      {result.data.routingTables.map((table, tIdx) => {
                        const tableId = String(table.nodeId);
                        const tableNodeName = nodeNameMap[tableId] || `Node ${tableId}`;

                        return (
                          <div
                            key={tIdx}
                            className="p-3 rounded-lg bg-[#202D43] border border-[#344258] space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-[#A99CFB] truncate">
                                {tableNodeName}
                              </span>
                              <span className="text-[10px] font-mono text-[#A8B5C9]">
                                ID: {tableId}
                              </span>
                            </div>
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
                                  table.entries.map((entry, eIdx) => {
                                    const destId = String(entry.destination);
                                    const destName = nodeNameMap[destId] || destId;
                                    const nextHopId = entry.nextHop ? String(entry.nextHop) : null;
                                    const nextHopName = nextHopId ? nodeNameMap[nextHopId] || nextHopId : 'DIRECT';
                                    const isUnreachable = entry.totalCost === -1 || entry.totalCost >= 1000000;

                                    return (
                                      <tr key={eIdx}>
                                        <td className="py-1 truncate max-w-[90px]" title={destName}>
                                          {destName}
                                        </td>
                                        <td className="py-1 text-[#A99CFB] truncate max-w-[80px]" title={nextHopName}>
                                          {nextHopName}
                                        </td>
                                        <td className="py-1 text-right">
                                          {isUnreachable ? (
                                            <span className="text-[#D6A85F]">∞</span>
                                          ) : (
                                            <span className="text-[#10B981]">{entry.totalCost}</span>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                              </tbody>
                            </table>
                          </div>
                        );
                      })}
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
