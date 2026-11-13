import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileDrawer from './MobileDrawer';

const routeTitles = {
  '/': 'Hospital Network Overview',
  '/topology': 'Department Topology & Addressing',
  '/encryption': 'AES-256 Record Encryption',
  '/framing/character-stuffing': 'Character Stuffing Framing',
  '/framing/bit-stuffing': 'Bit Stuffing Framing',
  '/crc': 'CRC Checksum Verification',
  '/arq': 'ARQ Protocol Simulation',
  '/routing': 'Dynamic Routing Algorithms',
  '/transport/tcp': 'Reliable TCP Transport',
  '/transport/udp': 'Telemetry UDP Transport',
};

export default function AppLayout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const title = routeTitles[location.pathname] || 'Hospital Network System';

  return (
    <div className="flex h-screen bg-[#0B1220] text-[#F1F5F9] overflow-hidden">
      {/* Desktop Sidebar (hidden on mobile) */}
      <Sidebar />

      {/* Mobile Drawer (visible only when opened on mobile) */}
      <MobileDrawer open={mobileOpen} setOpen={setMobileOpen} />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header title={title} onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto pb-12">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
