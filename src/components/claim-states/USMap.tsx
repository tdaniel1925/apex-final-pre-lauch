'use client';

// ============================================================
// Interactive US Map Component
// SVG-based clickable map with state highlighting
// ============================================================

import { useState } from 'react';
import { US_STATES_PATHS } from '@/lib/us-map-data';

interface StateData {
  code: string;
  name: string;
  owner?: {
    name: string;
    photo_url?: string;
  };
  gvp: number;
  status: 'unclaimed' | 'claimed' | 'elite' | 'legacy';
  isFirstEver?: boolean;
  dateClaimed?: string;
}

interface USMapProps {
  states: StateData[];
  onStateClick: (stateCode: string) => void;
  onStateHover?: (stateCode: string | null) => void;
}

export default function USMap({ states, onStateClick, onStateHover }: USMapProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  // Get color for state based on status
  const getStateColor = (stateCode: string): string => {
    const stateData = states.find(s => s.code === stateCode);
    if (!stateData) return '#E5E7EB'; // Gray for unclaimed

    switch (stateData.status) {
      case 'unclaimed':
        return '#E5E7EB'; // Light gray
      case 'claimed':
        return '#2B4C7E'; // Brand blue
      case 'elite':
        return '#F59E0B'; // Gold
      case 'legacy':
        return '#8B5CF6'; // Purple
      default:
        return '#E5E7EB';
    }
  };

  // Handle state interaction
  const handleStateClick = (stateCode: string) => {
    onStateClick(stateCode);
  };

  const handleStateHover = (stateCode: string | null) => {
    setHoveredState(stateCode);
    if (onStateHover) {
      onStateHover(stateCode);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <svg
        viewBox="0 0 960 560"
        className="w-full h-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Render all 50 states */}
        {US_STATES_PATHS.map((statePath) => {
          const stateColor = getStateColor(statePath.code);
          const isHovered = hoveredState === statePath.code;

          return (
            <g key={statePath.code}>
              <path
                d={statePath.path}
                fill={stateColor}
                stroke="#ffffff"
                strokeWidth="1.5"
                className="cursor-pointer transition-all duration-200"
                style={{
                  opacity: isHovered ? 0.8 : 1,
                  filter: isHovered ? 'brightness(1.1)' : 'none',
                }}
                onClick={() => handleStateClick(statePath.code)}
                onMouseEnter={() => handleStateHover(statePath.code)}
                onMouseLeave={() => handleStateHover(null)}
              />
              <text
                x={statePath.labelX}
                y={statePath.labelY}
                fontSize="10"
                fill="white"
                fontWeight="600"
                textAnchor="middle"
                pointerEvents="none"
                className="select-none"
              >
                {statePath.code}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#E5E7EB] border border-slate-300 rounded"></div>
          <span className="text-slate-600">Unclaimed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#2B4C7E] border border-slate-300 rounded"></div>
          <span className="text-slate-600">Claimed (500+ GVP)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#F59E0B] border border-slate-300 rounded"></div>
          <span className="text-slate-600">Elite (1000+ GVP)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#8B5CF6] border border-slate-300 rounded"></div>
          <span className="text-slate-600">Legacy (5000+ GVP)</span>
        </div>
      </div>
    </div>
  );
}
