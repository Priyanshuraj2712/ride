import React from 'react';
import './mockmap.css';

export default function MockMap({ pickupCoords, destCoords }){
  // Use fixed center (Delhi NCR area) and zoom to fit markers
  const center = { lat: 28.6139, lng: 77.2090 }; // Delhi center
  const bounds = {
    minLat: 28.5,
    maxLat: 28.7,
    minLng: 77.0,
    maxLng: 77.3
  };

  // Calculate pin position as percentage within bounds
  const getPosition = (coord) => {
    if (!coord) return null;
    const left = ((coord.lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
    const top = ((bounds.maxLat - coord.lat) / (bounds.maxLat - bounds.minLat)) * 100;
    return { 
      left: Math.max(5, Math.min(95, left)), 
      top: Math.max(5, Math.min(95, top)) 
    };
  };

  const pickupPos = getPosition(pickupCoords);
  const destPos = getPosition(destCoords);

  return (
    <div className="mock-map">
      <div className="map-area">
        {/* Neighborhood street grid background */}
        <div className="map-background">
          <svg className="street-grid" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
            {/* Main roads (horizontal) */}
            <line x1="0" y1="20" x2="100" y2="20" className="street-main" />
            <line x1="0" y1="40" x2="100" y2="40" className="street-main" />
            <line x1="0" y1="60" x2="100" y2="60" className="street-main" />
            <line x1="0" y1="80" x2="100" y2="80" className="street-main" />
            
            {/* Main roads (vertical) */}
            <line x1="20" y1="0" x2="20" y2="100" className="street-main" />
            <line x1="40" y1="0" x2="40" y2="100" className="street-main" />
            <line x1="60" y1="0" x2="60" y2="100" className="street-main" />
            <line x1="80" y1="0" x2="80" y2="100" className="street-main" />

            {/* Secondary roads (horizontal) */}
            <line x1="0" y1="10" x2="100" y2="10" className="street-secondary" />
            <line x1="0" y1="30" x2="100" y2="30" className="street-secondary" />
            <line x1="0" y1="50" x2="100" y2="50" className="street-secondary" />
            <line x1="0" y1="70" x2="100" y2="70" className="street-secondary" />
            <line x1="0" y1="90" x2="100" y2="90" className="street-secondary" />
            
            {/* Secondary roads (vertical) */}
            <line x1="10" y1="0" x2="10" y2="100" className="street-secondary" />
            <line x1="30" y1="0" x2="30" y2="100" className="street-secondary" />
            <line x1="50" y1="0" x2="50" y2="100" className="street-secondary" />
            <line x1="70" y1="0" x2="70" y2="100" className="street-secondary" />
            <line x1="90" y1="0" x2="90" y2="100" className="street-secondary" />

            {/* Minor roads (horizontal) */}
            <line x1="0" y1="5" x2="100" y2="5" className="street-minor" />
            <line x1="0" y1="15" x2="100" y2="15" className="street-minor" />
            <line x1="0" y1="25" x2="100" y2="25" className="street-minor" />
            <line x1="0" y1="35" x2="100" y2="35" className="street-minor" />
            <line x1="0" y1="45" x2="100" y2="45" className="street-minor" />
            <line x1="0" y1="55" x2="100" y2="55" className="street-minor" />
            <line x1="0" y1="65" x2="100" y2="65" className="street-minor" />
            <line x1="0" y1="75" x2="100" y2="75" className="street-minor" />
            <line x1="0" y1="85" x2="100" y2="85" className="street-minor" />
            <line x1="0" y1="95" x2="100" y2="95" className="street-minor" />

            {/* Minor roads (vertical) */}
            <line x1="5" y1="0" x2="5" y2="100" className="street-minor" />
            <line x1="15" y1="0" x2="15" y2="100" className="street-minor" />
            <line x1="25" y1="0" x2="25" y2="100" className="street-minor" />
            <line x1="35" y1="0" x2="35" y2="100" className="street-minor" />
            <line x1="45" y1="0" x2="45" y2="100" className="street-minor" />
            <line x1="55" y1="0" x2="55" y2="100" className="street-minor" />
            <line x1="65" y1="0" x2="65" y2="100" className="street-minor" />
            <line x1="75" y1="0" x2="75" y2="100" className="street-minor" />
            <line x1="85" y1="0" x2="85" y2="100" className="street-minor" />
            <line x1="95" y1="0" x2="95" y2="100" className="street-minor" />
          </svg>
        </div>

        {/* Pins */}
        {pickupPos && (
          <div 
            className="pin pickup" 
            title="Pickup" 
            style={{ left: `${pickupPos.left}%`, top: `${pickupPos.top}%` }}
          >
            <div className="pin-inner">📍</div>
          </div>
        )}
        
        {destPos && (
          <div 
            className="pin dest" 
            title="Destination" 
            style={{ left: `${destPos.left}%`, top: `${destPos.top}%` }}
          >
            <div className="pin-inner">🎯</div>
          </div>
        )}

        {/* Connection line between pins */}
        {pickupPos && destPos && (
          <svg className="connection-line" preserveAspectRatio="none">
            <line 
              x1={`${pickupPos.left}%`} 
              y1={`${pickupPos.top}%`} 
              x2={`${destPos.left}%`} 
              y2={`${destPos.top}%`} 
            />
          </svg>
        )}

        {/* Empty state message */}
        {!pickupCoords && !destCoords && (
          <div className="map-empty-state">
            <div className="empty-icon">🗺️</div>
            <div className="empty-text">Select pickup and destination to see route</div>
          </div>
        )}

        {/* Info box */}
        {(pickupCoords || destCoords) && (
          <div className="map-info">
            <div className="info-item pickup-info">
              {pickupCoords ? `📍 Pickup selected` : '📍 Select pickup'}
            </div>
            <div className="info-item dest-info">
              {destCoords ? `🎯 Destination set` : '🎯 Select destination'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
