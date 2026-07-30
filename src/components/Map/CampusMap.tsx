import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Plant } from '../../types';
import { Leaf, ShieldCheck, ShieldAlert, Sparkles, MapPin, Info } from 'lucide-react';

// Campus Center & Bounding Box Polygon
export const CAMPUS_BOUNDS = {
  center: [18.5526, 73.8262] as [number, number],
  zoom: 16,
  polygon: [
    [18.5562, 73.8235],
    [18.5575, 73.8290],
    [18.5530, 73.8320],
    [18.5485, 73.8295],
    [18.5490, 73.8220],
  ] as [number, number][]
};

interface CampusMapProps {
  plants: Plant[];
  onSelectPlant: (plant: Plant) => void;
  isSelectingLocation?: boolean;
  selectedCoordinates?: [number, number] | null;
  onCoordinatesSelected?: (lat: number, lng: number) => void;
  selectedZoneFilter?: string;
}

// Custom Leaflet Marker Icon Generator
const createCustomMarker = (verified: boolean, isSelected: boolean = false) => {
  const bgColor = verified ? '#22c55e' : '#f59e0b';
  const shadowColor = verified ? 'rgba(34, 197, 94, 0.5)' : 'rgba(245, 158, 11, 0.5)';
  const borderStyle = isSelected ? 'border-2 border-white scale-125 z-50' : 'border border-slate-900/60';

  return L.divIcon({
    className: 'custom-plant-pin',
    html: `
      <div style="
        background: ${bgColor};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 15px ${shadowColor};
        transition: all 0.2s ease;
      " class="${borderStyle}">
        <div style="transform: rotate(45deg); color: #0b130e; font-weight: bold; font-size: 14px;">
          🌿
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Component to handle map clicks for coordinate selection
const LocationPickerHandler: React.FC<{
  onSelect: (lat: number, lng: number) => void;
}> = ({ onSelect }) => {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// Component to auto-center map when coordinates change
const ChangeView: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

export const CampusMap: React.FC<CampusMapProps> = ({
  plants,
  onSelectPlant,
  isSelectingLocation = false,
  selectedCoordinates,
  onCoordinatesSelected,
  selectedZoneFilter
}) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>(CAMPUS_BOUNDS.center);

  const filteredPlants = selectedZoneFilter && selectedZoneFilter !== 'all'
    ? plants.filter(p => p.zone === selectedZoneFilter)
    : plants;

  return (
    <div className="relative w-full h-[550px] sm:h-[620px] rounded-2xl overflow-hidden border border-campus-border shadow-2xl bg-campus-card">
      
      {/* Map Control Info Overlay */}
      <div className="absolute top-4 left-4 z-[400] bg-campus-bg/85 backdrop-blur-md px-4 py-2.5 rounded-xl border border-campus-border text-xs flex items-center space-x-3 shadow-lg">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-flora-500 shadow-glow-emerald" />
          <span className="text-slate-200 font-semibold">Verified ({plants.filter(p => p.verified).length})</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-glow-amber" />
          <span className="text-slate-300 font-semibold">Pending ({plants.filter(p => !p.verified).length})</span>
        </div>
      </div>

      {isSelectingLocation && (
        <div className="absolute top-4 right-4 z-[400] bg-flora-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-2 shadow-xl animate-pulse">
          <MapPin className="w-4 h-4 stroke-[3]" />
          <span>Click anywhere on campus map to set pin location</span>
        </div>
      )}

      <MapContainer
        center={mapCenter}
        zoom={CAMPUS_BOUNDS.zoom}
        scrollWheelZoom={true}
        className="w-full h-full z-10"
      >
        <ChangeView center={mapCenter} zoom={CAMPUS_BOUNDS.zoom} />

        {/* Map Tiles (OpenStreetMap CartoDB Dark/Voyager style) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Campus Boundary Polygon */}
        <Polygon
          positions={CAMPUS_BOUNDS.polygon}
          pathOptions={{
            color: '#22c55e',
            fillColor: '#16a34a',
            fillOpacity: 0.12,
            weight: 2,
            dashArray: '6, 6'
          }}
        />

        {/* Location Selector Click Handler */}
        {isSelectingLocation && onCoordinatesSelected && (
          <LocationPickerHandler onSelect={onCoordinatesSelected} />
        )}

        {/* Selected Location Pin Marker for Form Submission */}
        {selectedCoordinates && (
          <Marker
            position={selectedCoordinates}
            icon={L.divIcon({
              className: 'selected-pin',
              html: `<div style="background:#2cf29d; width:20px; height:20px; border-radius:50%; border:3px solid white; box-shadow:0 0 15px #2cf29d;" class="animate-bounce"></div>`,
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            })}
          />
        )}

        {/* Plant Markers */}
        {filteredPlants.map((plant) => (
          <Marker
            key={plant.id}
            position={[plant.latitude, plant.longitude]}
            icon={createCustomMarker(plant.verified)}
          >
            <Popup className="custom-leaflet-popup">
              <div className="w-64 p-1 bg-slate-900 text-slate-100 rounded-xl overflow-hidden">
                <div className="relative h-32 w-full rounded-lg overflow-hidden mb-2">
                  <img
                    src={plant.photo_url}
                    alt={plant.species_name}
                    className="w-full h-full object-cover"
                  />
                  <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-950 flex items-center space-x-1 ${
                    plant.verified ? 'bg-flora-400' : 'bg-amber-400'
                  }`}>
                    {plant.verified ? <ShieldCheck className="w-3 h-3 inline" /> : <ShieldAlert className="w-3 h-3 inline" />}
                    <span>{plant.verified ? 'Verified' : 'Pending'}</span>
                  </span>
                </div>

                <div className="px-1">
                  <h4 className="font-bold text-sm text-white italic">{plant.species_name}</h4>
                  <p className="text-xs text-flora-400 font-medium">{plant.common_name}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{plant.family} • Zone: {plant.zone}</p>
                  
                  <button
                    onClick={() => onSelectPlant(plant)}
                    className="mt-3 w-full py-1.5 rounded-lg bg-flora-600 hover:bg-flora-500 text-slate-950 font-bold text-xs transition-all flex items-center justify-center space-x-1"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>View Species Profile</span>
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

      </MapContainer>

    </div>
  );
};
