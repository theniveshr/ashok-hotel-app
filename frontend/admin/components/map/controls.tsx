'use client';

import React from 'react';
import { useMap } from './map-view';

export interface MapControlsProps {
  onRecenter?: () => void;
  onFitBounds?: () => void;
  showPitchToggle?: boolean;
}

export function MapControls({ onRecenter, onFitBounds, showPitchToggle = true }: MapControlsProps) {
  const { mapInstance, isLoaded } = useMap();

  const handleZoomIn = () => {
    if (mapInstance && isLoaded) {
      mapInstance.zoomIn({ duration: 300 });
    }
  };

  const handleZoomOut = () => {
    if (mapInstance && isLoaded) {
      mapInstance.zoomOut({ duration: 300 });
    }
  };

  const handleTogglePitch = () => {
    if (mapInstance && isLoaded) {
      const currentPitch = mapInstance.getPitch();
      mapInstance.easeTo({ pitch: currentPitch > 20 ? 0 : 50, duration: 600 });
    }
  };

  return (
    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
      <button
        onClick={handleZoomIn}
        className="h-9 w-9 rounded-xl bg-black/80 hover:bg-black text-white border border-white/20 shadow-lg flex items-center justify-center font-bold text-lg backdrop-blur-md transition-all active:scale-95"
        title="Zoom In"
      >
        +
      </button>
      <button
        onClick={handleZoomOut}
        className="h-9 w-9 rounded-xl bg-black/80 hover:bg-black text-white border border-white/20 shadow-lg flex items-center justify-center font-bold text-lg backdrop-blur-md transition-all active:scale-95"
        title="Zoom Out"
      >
        −
      </button>

      {onRecenter && (
        <button
          onClick={onRecenter}
          className="h-9 w-9 rounded-xl bg-[#10B981]/90 hover:bg-[#10B981] text-black border border-white/20 shadow-lg flex items-center justify-center font-bold text-sm backdrop-blur-md transition-all active:scale-95"
          title="Recenter on Driver"
        >
          🎯
        </button>
      )}

      {onFitBounds && (
        <button
          onClick={onFitBounds}
          className="h-9 w-9 rounded-xl bg-[#3B82F6]/90 hover:bg-[#3B82F6] text-black border border-white/20 shadow-lg flex items-center justify-center font-bold text-sm backdrop-blur-md transition-all active:scale-95"
          title="Fit Full Route"
        >
          
        </button>
      )}

      {showPitchToggle && (
        <button
          onClick={handleTogglePitch}
          className="h-9 w-9 rounded-xl bg-black/80 hover:bg-black text-[#38BDF8] border border-white/20 shadow-lg flex items-center justify-center font-bold text-xs backdrop-blur-md transition-all active:scale-95"
          title="Toggle 3D View"
        >
          3D
        </button>
      )}
    </div>
  );
}
