import React from 'react';
import { ChevronRight, HeartPulse, Info } from 'lucide-react';
import { RegionId, RegionSummaryInfo } from '../types/weather';

interface RegionTableProps {
  regions: RegionSummaryInfo[];
  selectedRegionId: RegionId | null;
  onSelectRegion: (id: RegionId) => void;
}

export const RegionTable: React.FC<RegionTableProps> = ({
  regions,
  selectedRegionId,
  onSelectRegion,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Regional Air Quality Breakdown</h2>
          <p className="text-xs text-slate-500">Tap any region to inspect detailed pollutant sub-indices</p>
        </div>
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          5 NEA Regions
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
            <tr>
              <th scope="col" className="px-3.5 py-2.5">Region</th>
              <th scope="col" className="px-3 py-2.5 text-center">24-hr PSI</th>
              <th scope="col" className="px-3 py-2.5 text-center">1-hr PM2.5</th>
              <th scope="col" className="px-3.5 py-2.5">Advisory</th>
              <th scope="col" className="px-2 py-2.5 text-right sr-only">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-normal">
            {regions.map((region) => {
              const isSelected = selectedRegionId === region.id;
              return (
                <tr
                  key={region.id}
                  onClick={() => onSelectRegion(region.id)}
                  className={`cursor-pointer transition-colors duration-150 ${
                    isSelected
                      ? 'bg-blue-50/80 font-medium'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Region Name */}
                  <td className="px-3.5 py-3 whitespace-nowrap">
                    <div className="font-semibold text-slate-900 text-sm">{region.name}</div>
                    <div className="text-[10px] text-slate-400 capitalize">Singapore {region.name}</div>
                  </td>

                  {/* 24-hr PSI with Badge */}
                  <td className="px-3 py-3 text-center whitespace-nowrap">
                    <div className="inline-flex flex-col items-center">
                      <span
                        className="px-2.5 py-1 rounded-md text-white font-bold text-xs shadow-xs"
                        style={{ backgroundColor: region.psiBand.color }}
                      >
                        {region.psi24}
                      </span>
                      <span className="text-[10px] font-medium text-slate-500 mt-0.5">
                        {region.psiBand.band}
                      </span>
                    </div>
                  </td>

                  {/* 1-hr PM2.5 with Badge */}
                  <td className="px-3 py-3 text-center whitespace-nowrap">
                    <div className="inline-flex flex-col items-center">
                      <span
                        className="px-2 py-0.5 rounded text-white font-semibold text-xs shadow-xs"
                        style={{ backgroundColor: region.pm25Band.color }}
                      >
                        {region.pm25_1hr} <span className="text-[9px] font-normal opacity-90">µg/m³</span>
                      </span>
                      <span className="text-[10px] font-medium text-slate-500 mt-0.5">
                        {region.pm25Band.shortBand}
                      </span>
                    </div>
                  </td>

                  {/* Advisory Summary */}
                  <td className="px-3.5 py-3 text-slate-700">
                    <div className="line-clamp-2 text-xs leading-snug">
                      {region.psiBand.generalAdvice}
                    </div>
                  </td>

                  {/* Arrow Action */}
                  <td className="px-2 py-3 text-right">
                    <ChevronRight className="w-4 h-4 text-slate-400 inline" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
