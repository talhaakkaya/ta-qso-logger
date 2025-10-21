'use client';

import React, { useRef, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface LeafletMapProps {
  latitude: number;
  longitude: number;
  onLocationChange?: (lat: number, lon: number) => void;
  height?: string;
  zoom?: number;
}

const LeafletMap: React.FC<LeafletMapProps> = ({
  latitude,
  longitude,
  onLocationChange,
  height = '400px',
  zoom = 10
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    // Don't initialize if container doesn't exist
    if (!mapRef.current) return;

    // Clean up existing map instance if it exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    }

    // Create new map instance
    const map = L.map(mapRef.current).setView([latitude, longitude], zoom);
    mapInstanceRef.current = map;

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add draggable marker
    const marker = L.marker([latitude, longitude], {
      draggable: true
    }).addTo(map);
    markerRef.current = marker;

    // Handle marker drag end
    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      if (onLocationChange) {
        onLocationChange(pos.lat, pos.lng);
      }
    });

    // FIX: Force map to recalculate size after a brief delay
    // This ensures the map renders correctly when inside modals
    const resizeTimeout = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 100);

    // Cleanup function - properly destroy map instance
    return () => {
      clearTimeout(resizeTimeout);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [latitude, longitude, zoom, onLocationChange]);

  return (
    <div
      ref={mapRef}
      style={{ height, width: '100%' }}
    />
  );
};

export default LeafletMap;
