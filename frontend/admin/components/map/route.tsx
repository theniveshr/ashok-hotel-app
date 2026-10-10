'use client';

import React, { useEffect } from 'react';
import { useMap } from './map-view';

export interface MapRouteProps {
  id?: string;
  coordinates: Array<[number, number]>; // [[lng, lat], [lng, lat], ...]
  color?: string;
  width?: number;
  isDashed?: boolean;
  opacity?: number;
}

export function MapRoute({
  id = 'delivery-route',
  coordinates,
  color = '#3B82F6',
  width = 5,
  isDashed = false,
  opacity = 0.85,
}: MapRouteProps) {
  const { mapInstance, isLoaded } = useMap();

  useEffect(() => {
    if (!mapInstance || !isLoaded || coordinates.length < 2) return;

    const sourceId = `source-${id}`;
    const layerId = `layer-${id}`;
    const glowLayerId = `layer-glow-${id}`;

    const geojsonData = {
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'LineString' as const,
        coordinates,
      },
    };

    try {
      if (mapInstance.getSource(sourceId)) {
        mapInstance.getSource(sourceId).setData(geojsonData);
      } else {
        mapInstance.addSource(sourceId, {
          type: 'geojson',
          data: geojsonData,
        });

        // Add soft glowing line behind
        mapInstance.addLayer({
          id: glowLayerId,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': color,
            'line-width': width * 2.2,
            'line-opacity': 0.3,
            'line-blur': 4,
          },
        });

        // Add core crisp route line
        mapInstance.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': color,
            'line-width': width,
            'line-opacity': opacity,
            ...(isDashed ? { 'line-dasharray': [2, 1] } : {}),
          },
        });
      }
    } catch {}

    return () => {
      try {
        if (mapInstance.getLayer(layerId)) mapInstance.removeLayer(layerId);
        if (mapInstance.getLayer(glowLayerId)) mapInstance.removeLayer(glowLayerId);
        if (mapInstance.getSource(sourceId)) mapInstance.removeSource(sourceId);
      } catch {}
    };
  }, [mapInstance, isLoaded, coordinates, color, width, isDashed, opacity, id]);

  return null;
}
