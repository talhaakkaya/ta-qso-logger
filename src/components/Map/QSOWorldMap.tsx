'use client';

import React, { useRef, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { QSORecord } from '@/types';
import { gridSquareToCoordinates } from '@/utils/gridSquareUtils';

interface QSOWorldMapProps {
  qsoRecords: QSORecord[];
  height?: string;
}

// Mode to color mapping
const getModeColor = (mode: string): string => {
  const modeUpper = mode.toUpperCase();

  // FM - Red
  if (modeUpper === 'FM') {
    return '#dc3545'; // Red
  }

  // SSB modes - Blue
  if (modeUpper === 'SSB' || modeUpper === 'LSB' || modeUpper === 'USB') {
    return '#0d6efd'; // Blue
  }

  // Digital modes - Green
  if (modeUpper === 'FT8' || modeUpper === 'FT4' || modeUpper === 'PSK31' ||
      modeUpper === 'RTTY' || modeUpper === 'DMR' || modeUpper === 'D-STAR' ||
      modeUpper === 'C4FM') {
    return '#198754'; // Green
  }

  // CW - Yellow
  if (modeUpper === 'CW') {
    return '#ffc107'; // Yellow
  }

  // AM - Orange
  if (modeUpper === 'AM') {
    return '#fd7e14'; // Orange
  }

  return '#6c757d'; // Gray for other/unknown
};

const QSOWorldMap: React.FC<QSOWorldMapProps> = ({
  qsoRecords,
  height = '600px'
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clean up existing map instance if it exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Filter records that have valid grid squares
    const recordsWithLocation = qsoRecords.filter(record => {
      if (!record.qth || record.qth.trim().length < 4) return false;
      const coords = gridSquareToCoordinates(record.qth);
      return coords !== null;
    });

    if (recordsWithLocation.length === 0) {
      // No records with locations, show empty world map
      const map = L.map(mapRef.current).setView([20, 0], 2);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      return;
    }

    // Create map instance
    const map = L.map(mapRef.current);
    mapInstanceRef.current = map;

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Group records by grid square to handle duplicates
    const gridSquareGroups = new Map<string, QSORecord[]>();
    recordsWithLocation.forEach(record => {
      const gridSquare = record.qth.toUpperCase();
      if (!gridSquareGroups.has(gridSquare)) {
        gridSquareGroups.set(gridSquare, []);
      }
      gridSquareGroups.get(gridSquare)!.push(record);
    });

    // Create markers and track bounds
    const bounds: L.LatLngTuple[] = [];

    gridSquareGroups.forEach((records, gridSquare) => {
      const baseCoords = gridSquareToCoordinates(gridSquare);
      if (!baseCoords) return;

      const { lat: baseLat, lon: baseLon } = baseCoords;

      // If multiple records at same location, spread them in a circle
      records.forEach((record, index) => {
        let lat = baseLat;
        let lon = baseLon;

        if (records.length > 1) {
          // Offset radius: ~50 meters (0.00045 degrees ≈ 50m at equator)
          const offsetRadius = 0.00045;
          // Distribute markers evenly in a circle
          const angle = (2 * Math.PI * index) / records.length;
          lat += offsetRadius * Math.cos(angle);
          lon += offsetRadius * Math.sin(angle);
        }

        bounds.push([lat, lon]);

        const color = getModeColor(record.mode || '');

        // Create custom colored marker icon using SVG pin with callsign label
        const markerIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="display: flex; flex-direction: column; align-items: center;">
              <div style="
                background-color: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 11px;
                font-weight: bold;
                white-space: nowrap;
                margin-bottom: 2px;
                text-shadow: 0 0 2px black;
              ">${record.callsign}</div>
              <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.5 0C5.596 0 0 5.596 0 12.5c0 1.996.471 3.882 1.299 5.562L12.5 41l11.201-22.938C24.529 16.382 25 14.496 25 12.5 25 5.596 19.404 0 12.5 0z"
                      fill="${color}"
                      stroke="white"
                      stroke-width="2"/>
                <circle cx="12.5" cy="12.5" r="4" fill="white"/>
              </svg>
            </div>
          `,
          iconSize: [25, 60],
          iconAnchor: [12.5, 60],
          popupAnchor: [0, -60],
        });

        const marker = L.marker([lat, lon], { icon: markerIcon }).addTo(map);

        // Add popup with callsign and frequency
        const freqText = record.freq ? `${parseFloat(record.freq.toString()).toFixed(3)} MHz` : 'N/A';
        marker.bindPopup(`
          <div style="text-align: center;">
            <span style="font-size: 12px; color: #666;">${freqText}</span>
          </div>
        `);
      });
    });

    // Fit map to show all markers
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [qsoRecords]);

  return (
    <div
      ref={mapRef}
      style={{ height, width: '100%' }}
    />
  );
};

export default QSOWorldMap;
