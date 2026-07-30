import React from 'react';
import { Plant, UserRole } from '../types';
import { CampusMap } from '../components/Map/CampusMap';
import { PlantGrid } from '../components/Plant/PlantGrid';
import { Sparkles, MapPin, ShieldCheck, TreePine } from 'lucide-react';

interface HomePageProps {
  plants: Plant[];
  onSelectPlant: (plant: Plant) => void;
  onOpenQR: (plant: Plant) => void;
  onOpenSubmitModal: () => void;
  userRole: UserRole;
  selectedZoneFilter: string;
  setSelectedZoneFilter: (zone: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  plants,
  onSelectPlant,
  onOpenQR,
  onOpenSubmitModal,
  userRole,
  selectedZoneFilter,
  setSelectedZoneFilter
}) => {
  return (
    <div className="space-y-8 pb-12">
      
      {/* Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-campus-card via-slate-900 to-campus-card border border-campus-border p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-flora-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-flora-500/15 border border-flora-500/30 text-flora-300 text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Plant Biodiversity Mapping</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-3">
            Explore & Map Campus Flora in <span className="text-transparent bg-clip-text bg-gradient-to-r from-flora-400 to-emerald-300">Real Time</span>
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed mb-6">
            Snap a plant photo for instant PlantNet AI identification, geotag species across campus zones, generate print-ready physical QR tags, and explore biodiversity distributions. Protected by PostgreSQL Row Level Security (RLS).
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={onOpenSubmitModal}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-flora-500 to-emerald-600 text-slate-950 font-extrabold text-sm shadow-glow-emerald hover:opacity-95 transition-all flex items-center space-x-2"
            >
              <TreePine className="w-4 h-4 stroke-[2.5]" />
              <span>Map New Plant Species</span>
            </button>

            <div className="flex items-center space-x-4 text-xs font-semibold text-slate-400">
              <span className="flex items-center"><MapPin className="w-4 h-4 text-flora-400 mr-1" /> 6 Campus Zones</span>
              <span className="flex items-center"><ShieldCheck className="w-4 h-4 text-amber-400 mr-1" /> RLS Protected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Map Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-flora-400" />
            <h2 className="text-xl font-black text-white tracking-tight">Interactive Campus Map</h2>
          </div>
          <span className="text-xs text-slate-400">Displaying {plants.length} mapped plant pins</span>
        </div>

        <CampusMap
          plants={plants}
          onSelectPlant={onSelectPlant}
          selectedZoneFilter={selectedZoneFilter}
        />
      </section>

      {/* Filterable Plant Showcase Grid */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-white tracking-tight">Campus Botanical Catalog</h2>
        </div>

        <PlantGrid
          plants={plants}
          onSelectPlant={onSelectPlant}
          onOpenQR={onOpenQR}
          selectedZoneFilter={selectedZoneFilter}
          setSelectedZoneFilter={setSelectedZoneFilter}
        />
      </section>

    </div>
  );
};
