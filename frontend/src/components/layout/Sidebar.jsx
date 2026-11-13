import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { navItems } from './navConfig';
import NavItem from '../ui/NavItem';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`hidden md:flex flex-col bg-[#0E1729] border-r border-[#344258] transition-all duration-300 ease-in-out shrink-0 select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-[#344258]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-[#8B7CF6]/10 border border-[#8B7CF6]/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="text-[#8B7CF6]" size={22} />
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="text-sm font-bold tracking-tight text-[#F1F5F9] leading-tight">
                HospitalNet
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-[#A99CFB] uppercase">
                Secure Ops
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-[#A8B5C9] hover:text-[#F1F5F9] hover:bg-[#202D43] transition-colors focus:outline-none"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {navItems.map((item, idx) => {
          if (item.section) {
            if (collapsed) return <div key={idx} className="my-2 border-t border-[#344258]" />;
            return (
              <div
                key={idx}
                className="px-3 pt-3 pb-1 text-[11px] font-semibold tracking-wider text-[#A8B5C9]/70 uppercase"
              >
                {item.section}
              </div>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className="block no-underline"
            >
              {({ isActive }) => (
                <NavItem
                  icon={item.icon}
                  label={item.label}
                  active={isActive}
                  collapsed={collapsed}
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* System Footer Info */}
      <div className="p-3 border-t border-[#344258] text-xs text-[#A8B5C9] flex items-center justify-between">
        {!collapsed ? (
          <>
            <span className="truncate font-mono text-[11px]">Port 8083 &bull; AES-256</span>
            <span className="w-2 h-2 rounded-full bg-[#10B981]" title="System Ready" />
          </>
        ) : (
          <div className="w-full flex justify-center">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" title="System Ready" />
          </div>
        )}
      </div>
    </aside>
  );
}
