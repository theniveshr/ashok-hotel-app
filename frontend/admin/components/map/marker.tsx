'use client';

import React, { useEffect, useRef } from 'react';
import { useMap } from './map-view';

export interface MapMarkerProps {
  coordinate: [number, number]; // [lng, lat]
  type: 'RESTAURANT' | 'CUSTOMER' | 'DRIVER';
  title?: string;
  subtitle?: string;
  heading?: number; // Heading angle in degrees for driver
  isPulsing?: boolean;
  onClick?: () => void;
}

export function MapMarker({
  coordinate,
  type,
  title,
  subtitle,
  heading = 0,
  isPulsing = true,
  onClick,
}: MapMarkerProps) {
  const { mapInstance, isLoaded } = useMap();
  const markerRef = useRef<any | null>(null);
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapInstance || !isLoaded) return;

    let maplibregl: any;
    let marker: any;

    const createMarker = async () => {
      try {
        maplibregl = await import('maplibre-gl');
        const el = document.createElement('div');
        el.className = 'mapcn-marker cursor-pointer group relative';
        elementRef.current = el;

        if (onClick) {
          el.addEventListener('click', onClick);
        }

        // Render Marker Icon UI
        let iconHtml = '';
        if (type === 'RESTAURANT') {
          iconHtml = `
            <div class="relative flex items-center justify-center">
              <div class="absolute -inset-2 rounded-full bg-[#3B82F6]/25 animate-ping"></div>
              <div class="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#B27D00] border-2 border-white flex items-center justify-center text-lg shadow-xl font-bold">
                
              </div>
              <div class="absolute -bottom-8 px-2 py-0.5 rounded bg-black/85 text-[11px] font-bold text-white whitespace-nowrap border border-[#3B82F6]/40 shadow-lg pointer-events-none">
                ${title || 'Ashok Raj Restaurant'}
              </div>
            </div>
          `;
        } else if (type === 'CUSTOMER') {
          iconHtml = `
            <div class="relative flex items-center justify-center">
              <div class="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#EF4444] to-[#B91C1C] border-2 border-white flex items-center justify-center text-lg shadow-xl font-bold">
                📍
              </div>
              <div class="absolute -bottom-8 px-2 py-0.5 rounded bg-black/85 text-[11px] font-bold text-white whitespace-nowrap border border-red-500/40 shadow-lg pointer-events-none">
                ${title || 'Customer Destination'}
              </div>
            </div>
          `;
        } else if (type === 'DRIVER') {
          iconHtml = `
            <div class="relative flex items-center justify-center" style="transform: rotate(${heading}deg);">
              ${isPulsing ? '<div class="absolute -inset-3 rounded-full bg-[#10B981]/30 animate-ping"></div>' : ''}
              <div class="h-11 w-11 rounded-full bg-gradient-to-br from-[#10B981] to-[#047857] border-2 border-white flex items-center justify-center text-xl shadow-2xl font-bold transition-transform">
                
              </div>
              <div class="absolute -bottom-8 px-2 py-0.5 rounded bg-black/85 text-[11px] font-bold text-[#A7F3D0] whitespace-nowrap border border-[#10B981]/40 shadow-lg pointer-events-none" style="transform: rotate(${-heading}deg);">
                ${title || 'Murugan (On the way)'}
              </div>
            </div>
          `;
        }

        el.innerHTML = iconHtml;

        marker = new maplibregl.Marker({ element: el })
          .setLngLat(coordinate)
          .addTo(mapInstance);

        markerRef.current = marker;
      } catch {}
    };

    createMarker();

    return () => {
      if (markerRef.current) {
        try {
          markerRef.current.remove();
        } catch {}
      }
    };
  }, [mapInstance, isLoaded, type, title]);

  // Update position on coordinate change
  useEffect(() => {
    if (markerRef.current && coordinate) {
      try {
        markerRef.current.setLngLat(coordinate);
      } catch {}
    }
  }, [coordinate?.[0], coordinate?.[1]]);

  return null;
}
