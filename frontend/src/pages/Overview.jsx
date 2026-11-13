import React, { useEffect, useState } from 'react';
import {
  Activity,
  Server,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Shield,
  Search,
  Radio,
  GitFork,
  ArrowUpRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import PageContainer from '../components/ui/PageContainer';

export default function Overview() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const loadDepartments = async (isManual = false) => {
    if (isManual) setLoading(true);
    setError('');
    try {
      const res = await api.get('/departments');
      setDepartments(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    api.get('/departments')
      .then((res) => {
        if (ignore) return;
        setDepartments(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch((e) => {
        if (ignore) return;
        setError(e.response?.data?.message || e.message || 'Failed to fetch departments');
        setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const total = departments.length;
  const online = departments.filter((d) => d.status === 'ONLINE').length;
  const offline = departments.filter((d) => d.status === 'OFFLINE').length;
  const healthPercent = total > 0 ? Math.round((online / total) * 100) : 0;

  const filteredDepartments = departments.filter((d) => {
    const q = searchQuery.toLowerCase();
    return (
      d.name?.toLowerCase().includes(q) ||
      d.ipAddress?.toLowerCase().includes(q) ||
      d.gateway?.toLowerCase().includes(q) ||
      d.networkAddress?.toLowerCase().includes(q)
    );
  });

  return (
    <PageContainer
      title="Hospital Network Operations Center"
      badge="Spring Boot Active"
      description="Real-time telemetry, department node availability, and protocol engine health across the clinical intranet."
      actions={
        <button
          onClick={() => loadDepartments(true)}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-[#202D43] hover:bg-[#283852] text-[#F1F5F9] border border-[#344258] transition-all disabled:opacity-50 shadow-sm"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-[#8B7CF6]' : ''} />
          Refresh Nodes
        </button>
      }
    >
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Departments */}
        <div className="bg-[#18243A] border border-[#344258] rounded-xl p-5 shadow-sm hover:border-[#8B7CF6]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#A8B5C9]">
              Configured Nodes
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#8B7CF6]/10 border border-[#8B7CF6]/30 flex items-center justify-center text-[#8B7CF6]">
              <Server size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-[#F1F5F9]">
              {loading ? '—' : total}
            </span>
            <span className="text-xs text-[#A8B5C9]">Departments</span>
          </div>
          <div className="mt-2 text-[11px] text-[#A8B5C9]">
            Subnet range: <span className="font-mono text-[#A99CFB]">192.168.10.0/24</span> - <span className="font-mono text-[#A99CFB]">80.0/24</span>
          </div>
        </div>

        {/* Online Nodes */}
        <div className="bg-[#18243A] border border-[#344258] rounded-xl p-5 shadow-sm hover:border-[#10B981]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#A8B5C9]">
              Active & Healthy
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-[#10B981]">
              {loading ? '—' : online}
            </span>
            <span className="text-xs text-[#10B981] font-medium">Online</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#A8B5C9]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
            </span>
            <span>Broadcasting ICMP heartbeats</span>
          </div>
        </div>

        {/* Network Availability Index */}
        <div className="bg-[#18243A] border border-[#344258] rounded-xl p-5 shadow-sm hover:border-[#8B7CF6]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#A8B5C9]">
              Network Health
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#8B7CF6]/10 border border-[#8B7CF6]/30 flex items-center justify-center text-[#8B7CF6]">
              <Activity size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-[#8B7CF6]">
              {loading ? '—' : `${healthPercent}%`}
            </span>
            <span className="text-xs text-[#A8B5C9]">
              {offline > 0 ? `${offline} offline` : 'Operational'}
            </span>
          </div>
          {/* Progress Bar */}
          <div className="mt-3 w-full bg-[#0B1220] rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#8B7CF6] h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${healthPercent}%` }}
            />
          </div>
        </div>

        {/* Security Engine */}
        <div className="bg-[#18243A] border border-[#344258] rounded-xl p-5 shadow-sm hover:border-[#8B7CF6]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#A8B5C9]">
              Cryptographic Guard
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#8B7CF6]/10 border border-[#8B7CF6]/30 flex items-center justify-center text-[#8B7CF6]">
              <Shield size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-lg font-bold tracking-tight text-[#A99CFB]">
              AES-256-GCM
            </span>
            <span className="text-xs text-[#A8B5C9]">128-bit Tag</span>
          </div>
          <div className="mt-2 text-[11px] text-[#A8B5C9]">
            Authenticated payload encryption enabled
          </div>
        </div>
      </div>

      {/* Protocol Activity & Capabilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/topology"
          className="p-4 rounded-xl bg-[#18243A] border border-[#344258] hover:border-[#8B7CF6]/50 transition-all group block no-underline"
        >
          <div className="flex items-center justify-between text-[#A8B5C9] group-hover:text-[#8B7CF6] transition-colors mb-2">
            <Server size={18} />
            <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="text-sm font-semibold text-[#F1F5F9] group-hover:text-[#A99CFB] transition-colors">
            Core Router Topology
          </div>
          <p className="text-xs text-[#A8B5C9] mt-1">
            Star topology linking 8 clinical subnets to 192.168.1.1 gateway.
          </p>
        </Link>

        <Link
          to="/encryption"
          className="p-4 rounded-xl bg-[#18243A] border border-[#344258] hover:border-[#8B7CF6]/50 transition-all group block no-underline"
        >
          <div className="flex items-center justify-between text-[#A8B5C9] group-hover:text-[#8B7CF6] transition-colors mb-2">
            <Shield size={18} />
            <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="text-sm font-semibold text-[#F1F5F9] group-hover:text-[#A99CFB] transition-colors">
            AES-256 Encryption
          </div>
          <p className="text-xs text-[#A8B5C9] mt-1">
            Galois/Counter Mode for confidential EHR medical record transfer.
          </p>
        </Link>

        <Link
          to="/transport/tcp"
          className="p-4 rounded-xl bg-[#18243A] border border-[#344258] hover:border-[#8B7CF6]/50 transition-all group block no-underline"
        >
          <div className="flex items-center justify-between text-[#A8B5C9] group-hover:text-[#8B7CF6] transition-colors mb-2">
            <Radio size={18} />
            <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="text-sm font-semibold text-[#F1F5F9] group-hover:text-[#A99CFB] transition-colors">
            Reliable TCP Transport
          </div>
          <p className="text-xs text-[#A8B5C9] mt-1">
            3-Way Handshake with loss emulation and automated retransmissions.
          </p>
        </Link>

        <Link
          to="/routing"
          className="p-4 rounded-xl bg-[#18243A] border border-[#344258] hover:border-[#8B7CF6]/50 transition-all group block no-underline"
        >
          <div className="flex items-center justify-between text-[#A8B5C9] group-hover:text-[#8B7CF6] transition-colors mb-2">
            <GitFork size={18} />
            <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="text-sm font-semibold text-[#F1F5F9] group-hover:text-[#A99CFB] transition-colors">
            Dynamic Routing
          </div>
          <p className="text-xs text-[#A8B5C9] mt-1">
            Dijkstra Shortest Path and Distance Vector matrix calculations.
          </p>
        </Link>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-[#EF6464]/10 border border-[#EF6464]/30 rounded-xl p-4 flex items-start gap-3 text-[#EF6464]">
          <AlertCircle size={20} className="shrink-0 mt-0.5 text-[#EF6464]" />
          <div className="flex-1 text-sm">
            <p className="font-semibold text-[#F1F5F9]">Failed to load department data</p>
            <p className="text-[#A8B5C9] text-xs mt-0.5">{error}</p>
          </div>
          <button
            onClick={() => loadDepartments(true)}
            className="px-3 py-1 rounded bg-[#EF6464]/20 hover:bg-[#EF6464]/30 text-[#F1F5F9] text-xs font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="bg-[#18243A] border border-[#344258] rounded-xl p-8 space-y-4">
          <div className="flex items-center justify-center gap-3">
            <RefreshCw size={24} className="animate-spin text-[#8B7CF6]" />
            <span className="text-sm font-medium text-[#F1F5F9]">Querying Department Nodes...</span>
          </div>
          <div className="space-y-2 max-w-md mx-auto pt-2">
            <div className="h-3 bg-[#202D43] rounded animate-pulse" />
            <div className="h-3 bg-[#202D43]/60 rounded animate-pulse w-5/6 mx-auto" />
          </div>
        </div>
      )}

      {/* Department Table with Search Filter */}
      {!loading && !error && (
        <div className="bg-[#18243A] border border-[#344258] rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 sm:p-5 border-b border-[#344258] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-[#F1F5F9]">
                Live Hospital Department Nodes
              </h2>
              <p className="text-xs text-[#A8B5C9] mt-0.5">
                Subnet mappings, gateways, and operational status queried from Spring Boot backend.
              </p>
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8B5C9]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search department, IP..."
                className="w-full rounded-lg bg-[#202D43] border border-[#344258] pl-9 pr-3 py-1.5 text-xs text-[#F1F5F9] placeholder-[#A8B5C9]/60 focus:ring-2 focus:ring-[#8B7CF6] focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#0B1220]/60 text-xs uppercase font-semibold text-[#A8B5C9] border-b border-[#344258]">
                <tr>
                  <th className="py-3 px-4">Node ID</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Host IP</th>
                  <th className="py-3 px-4">Default Gateway</th>
                  <th className="py-3 px-4">Subnet Mask</th>
                  <th className="py-3 px-4">Network Segment</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#344258]">
                {filteredDepartments.map((d) => {
                  const isOnline = d.status === 'ONLINE';
                  return (
                    <tr
                      key={d.id}
                      className="hover:bg-[#202D43]/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-xs text-[#A8B5C9]">#{d.id}</td>
                      <td className="py-3 px-4 font-medium text-[#F1F5F9] flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${isOnline ? 'bg-[#10B981]' : 'bg-[#EF6464]'}`} />
                        {d.name}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-[#A99CFB] font-medium">{d.ipAddress}</td>
                      <td className="py-3 px-4 font-mono text-xs text-[#A8B5C9]">{d.gateway}</td>
                      <td className="py-3 px-4 font-mono text-xs text-[#A8B5C9]">{d.subnetMask}</td>
                      <td className="py-3 px-4 font-mono text-xs text-[#A8B5C9]">{d.networkAddress}</td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isOnline
                              ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30'
                              : 'bg-[#EF6464]/10 text-[#EF6464] border border-[#EF6464]/30'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isOnline ? 'bg-[#10B981]' : 'bg-[#EF6464]'
                            }`}
                          />
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {filteredDepartments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-sm text-[#A8B5C9]">
                      {searchQuery ? `No departments matching "${searchQuery}"` : 'No department records returned.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
