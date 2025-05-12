import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Leaflet components to avoid SSR issues
const DistortableMap = dynamic(() => Promise.resolve(MapComponent), {
  ssr: false
});

function MapComponent() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const imageOverlayRef = useRef<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    // Initialize map only on client side
    if (typeof window !== 'undefined' && mapRef.current && !mapInstanceRef.current) {
      // Import Leaflet dynamically
      const L = require('leaflet');
      require('leaflet-distortableimage');

      // Initialize map
      mapInstanceRef.current = L.map(mapRef.current).setView([51.505, -0.09], 13);

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);

      // Clean up on unmount
      return () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    }
  }, []);

  // Handle file selection
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    
    // Create object URL for the image
    const imageUrl = URL.createObjectURL(file);
    
    // Remove existing overlay if any
    if (imageOverlayRef.current) {
      imageOverlayRef.current.remove();
    }

    // Get map bounds and create initial corners
    const bounds = mapInstanceRef.current.getBounds();
    const center = bounds.getCenter();
    const zoom = mapInstanceRef.current.getZoom();
    
    // Calculate corners for initial placement
    const cornerOffset = 0.01; // Adjust based on zoom level
    const corners = [
      [center.lat + cornerOffset, center.lng - cornerOffset],
      [center.lat + cornerOffset, center.lng + cornerOffset],
      [center.lat - cornerOffset, center.lng - cornerOffset],
      [center.lat - cornerOffset, center.lng + cornerOffset]
    ];

    // Create new distortable image overlay
    const L = require('leaflet');
    imageOverlayRef.current = L.distortableImageOverlay(imageUrl, {
      corners: corners,
      mode: 'distort',
      actions: [
        L.DragAction,
        L.ScaleAction,
        L.DistortAction,
        L.RotateAction,
        L.FreeRotateAction,
        L.LockAction,
        L.OpacityAction,
        L.BorderAction,
        L.ExportAction,
        L.DeleteAction
      ]
    }).addTo(mapInstanceRef.current);

    // Clean up object URL when component unmounts
    return () => {
      URL.revokeObjectURL(imageUrl);
    };
  };

  return (
    <div className="map-container" style={{ position: 'relative', height: '600px', width: '100%' }}>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          zIndex: 1000,
          backgroundColor: 'white',
          padding: '5px',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}
      />
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}

export default DistortableMap;