import React, { useEffect, useState } from 'react';
import { Menu, Activity } from 'lucide-react';
import api from '../../services/api';
import StatusIndicator from '../ui/StatusIndicator';

export default function Header({ title, onMenuClick }) {
  const [online, setOnline] = useState(null);
  const [deptStats, setDeptStats] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const check = () => {
      api.get('/departments')
        .then((res) => {
          if (!isMounted) return;
          if (Array.isArray(res.data)) {
            const total = res.data.length;
            const onlineCount = res.data.filter((d) => d.status === 'ONLINE').length;
            setDeptStats(`${onlineCount}/${total} Depts Online`);
            setOnline(true);
          } else {
            setOnline(true);
            setDeptStats('Backend Online');
          }
        })
        .catch(() => {
          if (!isMounted) return;
          setOnline(false);
          setDeptStats('Backend Disconnected');
        });
    };

    check();
    const interval = setInterval(check, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="h-16 bg-[#18243A] border-b border-[#344258] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-1 text-[#A8B5C9] hover:text-[#F1F5F9] hover:bg-[#202D43] rounded-lg transition-colors focus:outline-none"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        {/* Current Page Title */}
        <div className="flex items-center gap-2.5">
          <Activity size={18} className="text-[#8B7CF6] hidden sm:block" />
          <h1 className="text-base sm:text-lg font-semibold text-[#F1F5F9] tracking-tight">
            {title}
          </h1>
        </div>
      </div>

      {/* Backend Status */}
      <div className="flex items-center gap-3">
        <StatusIndicator online={online} details={deptStats} />
      </div>
    </header>
  );
}
