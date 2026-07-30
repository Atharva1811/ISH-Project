import React, { useState, useMemo } from 'react';
import { Plant, CampusZone } from '../../types';
import { PlantCard } from './PlantCard';
import { Search, Filter, Layers, CheckCircle2, AlertCircle } from 'lucide-react';

interface PlantGridProps {
  plants: Plant[];
  onSelectPlant: (plant: Plant) => void;
  onOpenQR: (plant: Plant) => void;
  selectedZoneFilter: string;
  setSelectedZoneFilter: (zone: string) => void;
}

const ZONES: (CampusZone | 'all')[] = [
  'all',
  'North Quad',
  'South Lawn',
  'Botanical Garden',
  'Science Complex',
  'Central Park',
  'East Lake'
];

export const PlantGrid: React.FC<PlantGridProps> = ({
  plants,
  onSelectPlant,
  onOpenQR,
  selectedZoneFilter,
  setSelectedZoneFilter
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [familyFilter, setFamilyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'unverified'>('all');

  // Extract unique families from plant list
  const uniqueFamilies = useMemo(() => {
    const families = Array.from(new Set(plants.map(p => p.family).filter(Boolean)));
    return ['all', ...families.sort()];
  }, [plants]);

  // Filtered plant list
  const filteredPlants = useMemo(() => {
    return plants.filter(plant => {
      // Search query filter
      const matchesSearch = 
        !searchQuery ||
        plant.species_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plant.common_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plant.family.toLowerCase().includes(searchQuery.toLowerCase());

      // Zone filter
      const matchesZone = selectedZoneFilter === 'all' || plant.zone === selectedZoneFilter;

      // Family filter
      const matchesFamily = familyFilter === 'all' || plant.family === familyFilter;

      // Verification status filter
      const matchesStatus = 
        statusFilter === 'all' ||
        (statusFilter === 'verified' && plant.verified) ||
        (statusFilter === 'unverified' && !plant.verified);

      return matchesSearch && matchesZone && matchesFamily && matchesStatus;
    });
  }, [plants, searchQuery, selectedZoneFilter, familyFilter, statusFilter]);

  return (
    <div className="space-y-6">
      
      {/* Search & Filter Control Bar */}
      <div className="bg-campus-card border border-campus-border p-4 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search species, common name, family..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-white placeholder-slate-400 focus:outline-none focus:border-flora-500 transition-all"
          />
        </div>

        {/* Filters Grid */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          
          {/* Zone Selector */}
          <div className="flex items-center space-x-1.5 text-xs bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
            <Filter className="w-3.5 h-3.5 text-flora-400" />
            <select
              value={selectedZoneFilter}
              onChange={(e) => setSelectedZoneFilter(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Campus Zones</option>
              {ZONES.filter(z => z !== 'all').map(z => (
                <option key={z} value={z} className="bg-slate-900">{z}</option>
              ))}
            </select>
          </div>

          {/* Family Selector */}
          <div className="flex items-center space-x-1.5 text-xs bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
            <Layers className="w-3.5 h-3.5 text-flora-400" />
            <select
              value={familyFilter}
              onChange={(e) => setFamilyFilter(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Botanical Families</option>
              {uniqueFamilies.filter(f => f !== 'all').map(f => (
                <option key={f} value={f} className="bg-slate-900">{f}</option>
              ))}
            </select>
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                statusFilter === 'all' ? 'bg-flora-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('verified')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center space-x-1 ${
                statusFilter === 'verified' ? 'bg-flora-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Verified</span>
            </button>
            <button
              onClick={() => setStatusFilter('unverified')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center space-x-1 ${
                statusFilter === 'unverified' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <AlertCircle className="w-3 h-3" />
              <span>Pending</span>
            </button>
          </div>

        </div>

      </div>

      {/* Grid Display */}
      {filteredPlants.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlants.map(plant => (
            <PlantCard
              key={plant.id}
              plant={plant}
              onSelect={onSelectPlant}
              onOpenQR={onOpenQR}
            />
          ))}
        </div>
      ) : (
        <div className="bg-campus-card border border-campus-border rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-white text-base mb-1">No plant species match your search filters</h4>
          <p className="text-xs text-slate-400">Try adjusting your search query, zone selection, or family filter.</p>
        </div>
      )}

    </div>
  );
};
