import React from 'react';
import { ExternalLink, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-slate-900 text-slate-400 text-xs py-5 px-4 sm:px-6 border-t border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div>
          <div className="flex items-center justify-center sm:justify-start space-x-1.5 font-medium text-slate-300">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Official Government Data Integration</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Data source: National Environment Agency (NEA) and Meteorological Service Singapore (MSS) via{' '}
            <a
              href="https://data.gov.sg"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline inline-flex items-center"
            >
              data.gov.sg <ExternalLink className="w-2.5 h-2.5 ml-0.5 inline" />
            </a>
            . Licensed under the{' '}
            <a
              href="https://beta.data.gov.sg/open-data-licence"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline inline-flex items-center"
            >
              Singapore Open Data Licence <ExternalLink className="w-2.5 h-2.5 ml-0.5 inline" />
            </a>
            .
          </p>
        </div>

        <div className="text-[11px] text-slate-400 text-center sm:text-right">
          <div>Basemap: OneMap &copy; Singapore Land Authority</div>
          <div>Fallback tiles: OpenStreetMap contributors</div>
        </div>
      </div>
    </footer>
  );
};
