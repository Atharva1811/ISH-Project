import React, { useState } from 'react';
import { Plant, UserRole } from '../../types';
import { ShieldCheck, ShieldAlert, CheckCircle2, Trash2, Shield, User, AlertTriangle, Sparkles } from 'lucide-react';

interface ModerationPanelProps {
  plants: Plant[];
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  onVerifyPlant: (id: string, status: boolean) => void;
  onDeletePlant: (id: string) => void;
}

export const ModerationPanel: React.FC<ModerationPanelProps> = ({
  plants,
  userRole,
  setUserRole,
  onVerifyPlant,
  onDeletePlant
}) => {
  const [filter, setFilter] = useState<'unverified' | 'all'>('unverified');
  const [actionError, setActionError] = useState<string | null>(null);

  const displayedPlants = filter === 'unverified'
    ? plants.filter(p => !p.verified)
    : plants;

  const handleVerify = (id: string, newStatus: boolean) => {
    setActionError(null);
    try {
      onVerifyPlant(id, newStatus);
    } catch (err: any) {
      setActionError(err.message || 'RLS Enforcement Error');
    }
  };

  const handleDelete = (id: string) => {
    setActionError(null);
    try {
      onDeletePlant(id);
    } catch (err: any) {
      setActionError(err.message || 'RLS Enforcement Error');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Role Switcher & RLS Testing Notice Banner */}
      <div className="bg-campus-card border border-campus-border p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-base text-white">Row Level Security (RLS) Moderation Testbench</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Toggle active role to simulate SQL policy enforcement. Only users with `role = 'admin'` in Postgres can modify `verified` status or delete rows.
          </p>
        </div>

        <div className="flex items-center bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shrink-0">
          <button
            onClick={() => setUserRole('user')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              userRole === 'user'
                ? 'bg-flora-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Regular User Role</span>
          </button>
          
          <button
            onClick={() => setUserRole('admin')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              userRole === 'admin'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Role</span>
          </button>
        </div>
      </div>

      {actionError && (
        <div className="p-4 bg-red-950/80 border border-red-800 rounded-2xl text-red-200 text-xs flex items-center space-x-3 shadow-xl">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <div>
            <span className="font-bold block">PostgreSQL RLS Policy Violation Intercepted!</span>
            <span>{actionError}</span>
          </div>
        </div>
      )}

      {/* Control Tabs */}
      <div className="flex items-center justify-between border-b border-campus-border pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilter('unverified')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'unverified' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pending Review ({plants.filter(p => !p.verified).length})
          </button>

          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'all' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Submissions ({plants.length})
          </button>
        </div>
      </div>

      {/* Moderation Items List */}
      {displayedPlants.length > 0 ? (
        <div className="space-y-4">
          {displayedPlants.map(plant => (
            <div
              key={plant.id}
              className="bg-campus-card border border-campus-border hover:border-slate-700 p-5 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 transition-all"
            >
              <div className="flex items-center space-x-4 w-full md:w-auto">
                <img
                  src={plant.photo_url}
                  alt={plant.species_name}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-700 shrink-0"
                />

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-sm text-white italic">{plant.species_name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      plant.verified ? 'bg-flora-500/20 text-flora-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {plant.verified ? 'Verified' : 'Pending'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-medium">{plant.common_name} • {plant.family}</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Zone: <span className="text-flora-400">{plant.zone}</span> • AI Score: {plant.confidence_score}%
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
                <button
                  onClick={() => handleVerify(plant.id, !plant.verified)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md ${
                    plant.verified
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'bg-flora-600 hover:bg-flora-500 text-slate-950 shadow-glow-emerald'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{plant.verified ? 'Mark Unverified' : 'Approve & Verify'}</span>
                </button>

                <button
                  onClick={() => handleDelete(plant.id)}
                  className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/80 transition-all"
                  title="Delete Record (Admin RLS)"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="bg-campus-card border border-campus-border rounded-2xl p-12 text-center text-slate-400 text-xs font-medium">
          No pending plant submissions requiring moderation review.
        </div>
      )}

    </div>
  );
};
