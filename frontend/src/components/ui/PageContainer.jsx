import React from 'react';

export default function PageContainer({ title, description, badge, actions, children }) {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#344258]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F1F5F9]">{title}</h1>
            {badge && (
              <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#8B7CF6]/10 text-[#A99CFB] border border-[#8B7CF6]/30">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="mt-1 text-sm text-[#A8B5C9]">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Main Page Content */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}
