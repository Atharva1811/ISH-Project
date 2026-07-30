import React from 'react';
import { Plant } from '../types';
import { BiodiversityCharts } from '../components/Analytics/BiodiversityCharts';
import { BarChart3, Sparkles } from 'lucide-react';

interface AnalyticsPageProps {
  plants: Plant[];
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ plants }) => {
  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-flora-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">Campus Biodiversity Analytics</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Real-time statistics on botanical family composition and zone density.</p>
        </div>
      </div>

      <BiodiversityCharts plants={plants} />
    </div>
  );
};
