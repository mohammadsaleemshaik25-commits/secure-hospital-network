import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ShieldCheck, X } from 'lucide-react';
import { navItems } from './navConfig';
import NavItem from '../ui/NavItem';

export default function MobileDrawer({ open, setOpen }) {
  const location = useLocation();

  // Auto-close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname, setOpen]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer content */}
      <div className="relative w-72 max-w-[85vw] bg-[#0E1729] border-r border-[#344258] h-full flex flex-col z-10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-[#344258]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#8B7CF6]/10 border border-[#8B7CF6]/30 flex items-center justify-center">
              <ShieldCheck className="text-[#8B7CF6]" size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[#F1F5F9]">HospitalNet</span>
              <span className="text-[10px] text-[#A99CFB] font-semibold uppercase">Mobile Nav</span>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg text-[#A8B5C9] hover:text-[#F1F5F9] hover:bg-[#202D43]"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Links */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
          {navItems.map((item, idx) => {
            if (item.section) {
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
                onClick={() => setOpen(false)}
                className="block no-underline"
              >
                {({ isActive }) => (
                  <NavItem
                    icon={item.icon}
                    label={item.label}
                    active={isActive}
                    collapsed={false}
                  />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-3 border-t border-[#344258] text-xs text-[#A8B5C9]">
          Secure Hospital Network &bull; Spring Boot 8083
        </div>
      </div>
    </div>
  );
}
