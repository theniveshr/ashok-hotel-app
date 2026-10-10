'use client';

import React, { useEffect, useRef, useState, createContext, useContext } from 'react';

// Mapcn Context for Child Components
interface MapContextType {
  mapInstance: any | null;
  isLoaded: boolean;
}

const MapContext = createContext<MapContextType>({
  mapInstance: null,
  isLoaded: false,
});

export const useMap = () => useContext(MapContext);

export interface MapViewProps {
  center?: [number, number]; // [lng, lat]
  zoom?: number;
  pitch?: number;
  bearing?: number;
  theme?: 'dark' | 'light';
  className?: string;
  children?: React.ReactNode;
  bounds?: [[number, number], [number, number]]; // [[minLng, minLat], [maxLng, maxLat]]
}

export function MapView({
  center = [78.6548, 9.8436], // Default Kalaiyarkoil [lng, lat]
  zoom = 14,
  pitch = 30,
  bearing = 0,
  theme = 'dark',
  className = 'w-full h-full min-h-[380px] rounded-2xl overflow-hidden shadow-2xl relative',
  children,
  bounds,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [useFallbackSvg, setUseFallbackSvg] = useState(false);

  useEffect(() => {
    let map: any = null;
    let isCancelled = false;

    const initMap = async () => {
      if (!containerRef.current) return;

      try {
        // Dynamically load MapLibre GL
        const maplibregl = await import('maplibre-gl');
        if (isCancelled) return;

        // Ensure stylesheet is present
        if (!document.getElementById('maplibre-css')) {
          const link = document.createElement('link');
          link.id = 'maplibre-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css';
          document.head.appendChild(link);
        }

        const mapStyle =
          theme === 'dark'
            ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
            : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

        map = new maplibregl.Map({
          container: containerRef.current,
          style: mapStyle,
          center,
          zoom,
          pitch,
          bearing,
          attributionControl: false,
        });

        map.on('load', () => {
          if (!isCancelled) {
            setMapInstance(map);
            setIsLoaded(true);

            if (bounds) {
              map.fitBounds(bounds, { padding: 60, maxZoom: 16 });
            }
          }
        });

        map.on('error', () => {
          // If WebGL fails in environment, toggle fallback vector renderer
          setUseFallbackSvg(true);
        });
      } catch (e) {
        setUseFallbackSvg(true);
      }
    };

    initMap();

    return () => {
      isCancelled = true;
      if (map) {
        try {
          map.remove();
        } catch {}
      }
    };
  }, [theme]);

  // Handle bounds update
  useEffect(() => {
    if (mapInstance && isLoaded && bounds) {
      try {
        mapInstance.fitBounds(bounds, { padding: 60, maxZoom: 16, duration: 1000 });
      } catch {}
    }
  }, [bounds, mapInstance, isLoaded]);

  // Handle center update
  useEffect(() => {
    if (mapInstance && isLoaded && center) {
      try {
        mapInstance.flyTo({ center, duration: 1200 });
      } catch {}
    }
  }, [center?.[0], center?.[1], mapInstance, isLoaded]);

  return (
    <MapContext.Provider value={{ mapInstance, isLoaded }}>
      <div className={className}>
        <div ref={containerRef} className="w-full h-full absolute inset-0 bg-[#0B0F17]" />

        {/* Fallback Vector Canvas for environments without WebGL */}
        {useFallbackSvg && (
          <div className="w-full h-full absolute inset-0 bg-gradient-to-br from-[#0B0F17] via-[#0F172A] to-[#1E293B] flex items-center justify-center p-4">
            <svg className="w-full h-full opacity-30 absolute inset-0 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.75" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              {/* Stylized road network */}
              <path d="M 50 180 Q 200 150 400 240 T 750 200" fill="none" stroke="#3B82F6" strokeWidth="4" strokeDasharray="8 6" opacity="0.6" />
              <path d="M 120 50 Q 240 220 380 340 T 700 320" fill="none" stroke="#38BDF8" strokeWidth="3" opacity="0.4" />
            </svg>
          </div>
        )}

        {/* Mapcn Layer Elements */}
        {children}

        {/* mapcn.dev Watermark Badge */}
        <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[10px] text-gray-400 font-medium select-none pointer-events-none">
          <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
          <span>mapcn.dev • MapLibre GL</span>
        </div>
      </div>
    </MapContext.Provider>
  );
}
