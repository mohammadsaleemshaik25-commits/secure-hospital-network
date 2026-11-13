import React from 'react';

export default function StatusIndicator({ online, details }) {
  const isChecking = online === null;
  const isOnline = online === true;

  const dotClass = isChecking
    ? 'bg-[#D6A85F] animate-pulse'
    : isOnline
    ? 'bg-[#10B981]'
    : 'bg-[#EF6464]';

  const textClass = isChecking
    ? 'text-[#D6A85F]'
    : isOnline
    ? 'text-[#10B981]'
    : 'text-[#EF6464]';

  const label = isChecking
    ? 'Connecting...'
    : isOnline
    ? (details || 'System Operational')
    : 'Backend Offline';

  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#18243A] border border-[#344258] text-xs font-medium shadow-sm"
      title={`Spring Boot Backend on port 8083: ${label}`}
    >
      <span className="relative flex h-2 w-2">
        {isOnline && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dotClass}`}></span>
      </span>
      <span className={`font-medium ${textClass}`}>{label}</span>
    </div>
  );
}
