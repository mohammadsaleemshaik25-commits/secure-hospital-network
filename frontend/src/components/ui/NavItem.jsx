import React from 'react';

export default function NavItem({ icon: Icon, label, active, collapsed }) {
  return (
    <div
      className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
        active
          ? 'bg-[#202D43] text-[#A99CFB] shadow-sm border border-[#8B7CF6]/40'
          : 'text-[#A8B5C9] hover:text-[#F1F5F9] hover:bg-[#18243A]'
      } ${collapsed ? 'justify-center px-2' : ''}`}
      title={collapsed ? label : undefined}
    >
      <Icon
        size={19}
        className={`shrink-0 transition-colors ${
          active ? 'text-[#8B7CF6]' : 'text-[#A8B5C9] group-hover:text-[#F1F5F9]'
        }`}
      />
      {!collapsed && <span className="truncate">{label}</span>}
    </div>
  );
}
