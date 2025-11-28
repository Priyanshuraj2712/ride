import React from 'react';
import './mockmap.css';

export default function MockMap({ pickupCoords, destCoords }){
  // Calculate pin positions based on lat/lng bounds
  // Simple approach: map coords to percentages within a bounding box
  
  const getPosition = (coord) => {
    if (!coord) return null;
    // Simple mapping: for demo, use a fixed bounds and map to 0-100%
    // In production, use actual map bounds or a real map library
    const bounds = {
      minLat: 38.8,
      maxLat: 40.8,
      minLng: -74.0,
      maxLng: -73.0
    };
    
    const left = ((coord.lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
    const top = ((bounds.maxLat - coord.lat) / (bounds.maxLat - bounds.minLat)) * 100;
    
    return { left: Math.max(0, Math.min(100, left)), top: Math.max(0, Math.min(100, top)) };
  };
  
  const pickupPos = getPosition(pickupCoords);
  const destPos = getPosition(destCoords);

  return (
    <div className="mock-map">
      <div className="map-area">
        {pickupPos && (
          <div className="pin pickup" title="Pickup" style={{ left: `${pickupPos.left}%`, top: `${pickupPos.top}%` }}></div>
        )}
        {destPos && (
          <div className="pin dest" title="Destination" style={{ left: `${destPos.left}%`, top: `${destPos.top}%` }}></div>
        )}
        {!pickupCoords && !destCoords && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999', fontSize: '14px' }}>
            Select pickup and destination to see map
          </div>
        )}
      </div>
    </div>
  );
}
