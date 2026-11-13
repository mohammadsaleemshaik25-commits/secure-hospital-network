import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Overview from './pages/Overview';
import Topology from './pages/Topology';
import Encryption from './pages/Encryption';
import CharacterStuffing from './pages/CharacterStuffing';
import BitStuffing from './pages/BitStuffing';
import CRC from './pages/CRC';
import ARQ from './pages/ARQ';
import Routing from './pages/Routing';
import Tcp from './pages/Tcp';
import Udp from './pages/Udp';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Overview />} />
          <Route path="/topology" element={<Topology />} />
          <Route path="/encryption" element={<Encryption />} />
          <Route path="/framing/character-stuffing" element={<CharacterStuffing />} />
          <Route path="/framing/bit-stuffing" element={<BitStuffing />} />
          <Route path="/crc" element={<CRC />} />
          <Route path="/arq" element={<ARQ />} />
          <Route path="/routing" element={<Routing />} />
          <Route path="/transport/tcp" element={<Tcp />} />
          <Route path="/transport/udp" element={<Udp />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
