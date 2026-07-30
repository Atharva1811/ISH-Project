import React, { useMemo } from 'react';
import { Plant } from '../../types';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { BarChart3, PieChart as PieIcon, ShieldCheck, TreePine, Award } from 'lucide-react';

interface BiodiversityChartsProps {
  plants: Plant[];
}

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316'];

export const BiodiversityCharts: React.FC<BiodiversityChartsProps> = ({ plants }) => {

  // Data processing: Plants per Zone
  const zoneData = useMemo(() => {
    const counts: Record<string, number> = {};
    plants.forEach(p => {
      counts[p.zone] = (counts[p.zone] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [plants]);

  // Data processing: Plants per Family
  const familyData = useMemo(() => {
    const counts: Record<string, number> = {};
    plants.forEach(p => {
      counts[p.family] = (counts[p.family] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [plants]);

  const verifiedCount = plants.filter(p => p.verified).length;
  const unverifiedCount = plants.length - verifiedCount;

  return (
    <div className="space-y-6">
      
      {/* Top Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-campus-card border border-campus-border p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Plant Records</span>
            <span className="text-3xl font-extrabold text-white">{plants.length}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-flora-500/20 text-flora-400 flex items-center justify-center">
            <TreePine className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-campus-card border border-campus-border p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Verified Species</span>
            <span className="text-3xl font-extrabold text-flora-400">{verifiedCount}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-flora-500/20 text-flora-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-campus-card border border-campus-border p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Botanical Families</span>
            <span className="text-3xl font-extrabold text-amber-400">{familyData.length}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <PieIcon className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-campus-card border border-campus-border p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Campus Zones</span>
            <span className="text-3xl font-extrabold text-blue-400">{zoneData.length}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Zone Density Bar Chart */}
        <div className="bg-campus-card border border-campus-border p-6 rounded-3xl shadow-xl">
          <div className="flex items-center space-x-2 mb-6">
            <BarChart3 className="w-5 h-5 text-flora-400" />
            <h3 className="font-extrabold text-base text-white">Species Density by Campus Zone</h3>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zoneData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                />
                <Bar dataKey="count" fill="#22c55e" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Family Breakdown Pie Chart */}
        <div className="bg-campus-card border border-campus-border p-6 rounded-3xl shadow-xl">
          <div className="flex items-center space-x-2 mb-6">
            <PieIcon className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-base text-white">Botanical Family Distribution</h3>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={familyData}
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {familyData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
