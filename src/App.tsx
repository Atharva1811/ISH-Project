import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Plant, UserRole } from './types';
import { mockStore, supabase, isLiveSupabaseConfigured } from './lib/supabase';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { PlantProfilePage } from './pages/PlantProfilePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AdminPage } from './pages/AdminPage';
import { PlantSubmitModal } from './components/Plant/PlantSubmitModal';
import { PlantDetailModal } from './components/Plant/PlantDetailModal';
import { QRScannerModal } from './components/QR/QRScannerModal';
import { AuthModal } from './components/Auth/AuthModal';

function AppContent() {
  const [activeTab, setActiveTab] = useState<'map' | 'analytics' | 'admin'>('map');
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  // Data State
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedZoneFilter, setSelectedZoneFilter] = useState('all');

  // Modals
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedPlantDetail, setSelectedPlantDetail] = useState<Plant | null>(null);

  const navigate = useNavigate();

  // Load plants on mount or when userRole changes (simulating RLS filtering!)
  useEffect(() => {
    fetchPlants();
  }, [userRole]);

  // Sync Supabase Auth user on mount
  useEffect(() => {
    if (isLiveSupabaseConfigured()) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user?.email) {
          setUserEmail(session.user.email);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUserEmail(session?.user?.email || null);
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const fetchPlants = async () => {
    if (isLiveSupabaseConfigured()) {
      const { data, error } = await supabase.from('plants').select('*');
      if (!error && data) {
        setPlants(data as Plant[]);
      } else {
        setPlants(mockStore.getPlants(userRole));
      }
    } else {
      setPlants(mockStore.getPlants(userRole));
    }
  };

  const handleCreatePlant = (newPlant: Omit<Plant, 'id' | 'created_at' | 'verified'>) => {
    if (isLiveSupabaseConfigured()) {
      supabase.from('plants').insert([newPlant]).then(() => {
        fetchPlants();
      });
    } else {
      mockStore.addPlant(newPlant);
      setPlants(mockStore.getPlants(userRole));
    }
  };

  const handleVerifyPlant = (id: string, verifiedStatus: boolean) => {
    if (isLiveSupabaseConfigured()) {
      supabase.from('plants').update({ verified: verifiedStatus }).eq('id', id).then(() => {
        fetchPlants();
      });
    } else {
      mockStore.verifyPlant(id, verifiedStatus, userRole);
      setPlants(mockStore.getPlants(userRole));
    }
  };

  const handleDeletePlant = (id: string) => {
    if (isLiveSupabaseConfigured()) {
      supabase.from('plants').delete().eq('id', id).then(() => {
        fetchPlants();
      });
    } else {
      mockStore.deletePlant(id, userRole);
      setPlants(mockStore.getPlants(userRole));
    }
  };

  const handleNavigateToPlantFromQR = (plantId: string) => {
    navigate(`/plant/${plantId}`);
  };

  return (
    <div className="min-h-screen bg-campus-bg text-slate-100 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'map') navigate('/');
          if (tab === 'analytics') navigate('/analytics');
          if (tab === 'admin') navigate('/admin');
        }}
        userRole={userRole}
        setUserRole={setUserRole}
        onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
        onOpenQRScanner={() => setIsQRScannerOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        userEmail={userEmail}
        onSignOut={() => {
          if (isLiveSupabaseConfigured()) supabase.auth.signOut();
          setUserEmail(null);
        }}
      />

      {/* Main Page Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                plants={plants}
                onSelectPlant={(plant) => setSelectedPlantDetail(plant)}
                onOpenQR={(plant) => setSelectedPlantDetail(plant)}
                onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
                userRole={userRole}
                selectedZoneFilter={selectedZoneFilter}
                setSelectedZoneFilter={setSelectedZoneFilter}
              />
            }
          />
          <Route path="/plant/:id" element={<PlantProfilePage />} />
          <Route path="/analytics" element={<AnalyticsPage plants={plants} />} />
          <Route
            path="/admin"
            element={
              <AdminPage
                plants={plants}
                userRole={userRole}
                setUserRole={setUserRole}
                onVerifyPlant={handleVerifyPlant}
                onDeletePlant={handleDeletePlant}
              />
            }
          />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-campus-card/90 border-t border-campus-border py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-white">Campus<span className="text-flora-400">Flora</span></span>
            <span>•</span>
            <span>AI Campus Biodiversity Platform</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-flora-400 font-semibold">PostgreSQL RLS Protected</span>
            <span>•</span>
            <span>Supabase Edge Function Proxy</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PlantSubmitModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSubmit={handleCreatePlant}
      />

      <PlantDetailModal
        plant={selectedPlantDetail}
        onClose={() => setSelectedPlantDetail(null)}
      />

      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onNavigateToPlant={handleNavigateToPlantFromQR}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(email) => setUserEmail(email)}
      />

    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
