import React, { useState } from 'react';
import { ChevronUp, ChevronDown, List, Layers, Info } from 'lucide-react';

interface BottomSheetProps {
  children: React.ReactNode;
  title?: string;
  summaryText?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  children,
  title = 'Regional Overview',
  summaryText,
}) => {
  // Mobile sheet states: 'peek' (collapsed), 'expanded' (full)
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-30 transition-transform duration-300 ease-out md:hidden flex flex-col bg-white rounded-t-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.15)] border-t border-slate-200 ${
        isExpanded ? 'h-[75vh]' : 'h-16'
      }`}
    >
      {/* Drag handle / Header bar */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full pt-2.5 pb-2 px-4 flex flex-col items-center justify-center shrink-0 cursor-pointer focus:outline-none select-none"
      >
        <div className="w-10 h-1.5 rounded-full bg-slate-300 mb-1.5" />
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-800">{title}</span>
            {summaryText && (
              <span className="text-[11px] text-slate-500 font-medium truncate max-w-[180px]">
                &bull; {summaryText}
              </span>
            )}
          </div>
          <div className="flex items-center text-xs font-semibold text-cyan-700 space-x-1">
            <span>{isExpanded ? 'Collapse' : 'Swipe up'}</span>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4 animate-bounce" />
            )}
          </div>
        </div>
      </button>

      {/* Sheet Scrollable Body */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
};
