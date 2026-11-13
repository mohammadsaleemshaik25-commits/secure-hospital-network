import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';
import PageContainer from '../components/ui/PageContainer';

export default function NotFound() {
  return (
    <PageContainer title="404 - Endpoint Not Found">
      <div className="bg-[#18243A] border border-[#344258] rounded-xl p-8 sm:p-12 text-center max-w-xl mx-auto space-y-5 shadow-lg">
        <div className="w-16 h-16 rounded-2xl bg-[#D6A85F]/10 border border-[#D6A85F]/30 flex items-center justify-center mx-auto text-[#D6A85F]">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#F1F5F9]">
          Endpoint or Node Not Found
        </h2>
        <p className="text-sm text-[#A8B5C9]">
          The requested network routing path does not correspond to an active service on the hospital dashboard.
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#8B7CF6] hover:bg-[#7C6AE6] text-white font-semibold text-sm transition-colors shadow-sm"
          >
            <Home size={16} />
            Return to Network Overview
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
