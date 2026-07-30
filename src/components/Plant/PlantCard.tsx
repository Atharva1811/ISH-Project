import React from 'react';
import { Plant } from '../../types';
import { ShieldCheck, ShieldAlert, MapPin, QrCode, Sparkles } from 'lucide-react';

interface PlantCardProps {
  plant: Plant;
  onSelect: (plant: Plant) => void;
  onOpenQR: (plant: Plant) => void;
}

export const PlantCard: React.FC<PlantCardProps> = ({ plant, onSelect, onOpenQR }) => {
  return (
    <div className="group bg-campus-card hover:bg-slate-900/90 border border-campus-border hover:border-flora-500/50 rounded-2xl overflow-hidden transition-all duration-300 shadow-xl flex flex-col">
      
      {/* Plant Image Header */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-950">
        <img
          src={plant.photo_url}
          alt={plant.species_name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

        {/* Verification Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center space-x-1 shadow-md ${
            plant.verified 
              ? 'bg-flora-500/90 text-slate-950 backdrop-blur-sm' 
              : 'bg-amber-500/90 text-slate-950 backdrop-blur-sm'
          }`}>
            {plant.verified ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Verified</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Pending Review</span>
              </>
            )}
          </span>
        </div>

        {/* Quick QR Code Trigger */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenQR(plant);
          }}
          className="absolute top-3 right-3 p-2 rounded-xl bg-slate-950/70 hover:bg-flora-600 text-white backdrop-blur-md border border-slate-700 transition-all shadow-lg"
          title="Generate QR Code"
        >
          <QrCode className="w-4 h-4" />
        </button>

        {/* Confidence Badge */}
        {plant.confidence_score && (
          <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded-lg border border-slate-700 text-[11px] font-bold text-flora-400 flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-flora-400" />
            <span>{plant.confidence_score}% AI Score</span>
          </div>
        )}
      </div>

      {/* Body Metadata */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            <span>{plant.family}</span>
            <span>•</span>
            <span className="text-flora-400 flex items-center">
              <MapPin className="w-3 h-3 inline mr-0.5" />
              {plant.zone}
            </span>
          </div>

          <h3 className="font-extrabold text-base text-white italic tracking-tight group-hover:text-flora-300 transition-colors">
            {plant.species_name}
          </h3>
          <p className="text-xs text-slate-300 font-medium mb-2">{plant.common_name}</p>

          {plant.notes && (
            <p className="text-xs text-slate-400 line-clamp-2 italic bg-slate-950/40 p-2 rounded-lg border border-slate-800/80 mb-3">
              "{plant.notes}"
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-medium">
            Added {new Date(plant.created_at).toLocaleDateString()}
          </span>

          <button
            onClick={() => onSelect(plant)}
            className="text-xs font-bold text-flora-400 hover:text-flora-300 flex items-center space-x-1 transition-colors"
          >
            <span>Species Profile</span>
            <span>→</span>
          </button>
        </div>
      </div>

    </div>
  );
};
