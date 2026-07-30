import React from 'react';
import { Plant, UserRole } from '../types';
import { ModerationPanel } from '../components/Admin/ModerationPanel';
import { ShieldCheck } from 'lucide-react';

interface AdminPageProps {
  plants: Plant[];
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  onVerifyPlant: (id: string, status: boolean) => void;
  onDeletePlant: (id: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  plants,
  userRole,
  setUserRole,
  onVerifyPlant,
  onDeletePlant
}) => {
  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">Admin & RLS Security Portal</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Review unverified species submissions and test PostgreSQL Row Level Security (RLS) policies.</p>
        </div>
      </div>

      <ModerationPanel
        plants={plants}
        userRole={userRole}
        setUserRole={setUserRole}
        onVerifyPlant={onVerifyPlant}
        onDeletePlant={onDeletePlant}
      />
    </div>
  );
};
