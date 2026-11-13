import {
  Activity,
  Network,
  ShieldCheck,
  FileCode,
  Binary,
  Hash,
  RefreshCw,
  GitFork,
  Radio,
  Zap,
} from 'lucide-react';

export const navItems = [
  { section: 'DASHBOARD' },
  { to: '/', label: 'Overview', icon: Activity },
  { to: '/topology', label: 'Network Topology', icon: Network },
  { section: 'DATA LINK & SECURITY' },
  { to: '/encryption', label: 'AES Encryption', icon: ShieldCheck },
  { to: '/framing/character-stuffing', label: 'Character Stuffing', icon: FileCode },
  { to: '/framing/bit-stuffing', label: 'Bit Stuffing', icon: Binary },
  { to: '/crc', label: 'CRC Checksum', icon: Hash },
  { section: 'NETWORK & TRANSPORT' },
  { to: '/arq', label: 'ARQ Protocols', icon: RefreshCw },
  { to: '/routing', label: 'Routing Algorithms', icon: GitFork },
  { to: '/transport/tcp', label: 'TCP Protocol', icon: Radio },
  { to: '/transport/udp', label: 'UDP Protocol', icon: Zap },
];

