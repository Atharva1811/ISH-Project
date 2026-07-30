import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plant } from '../types';
import { mockStore, supabase, isLiveSupabaseConfigured } from '../lib/supabase';
import { isValidUUID } from '../lib/sanitizer';
import { QRCodeSVG } from 'qrcode.react';
import { Leaf, ShieldCheck, MapPin, QrCode, ArrowLeft, AlertOctagon, Sparkles, Calendar, ExternalLink } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';

export const PlantProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [invalidUUIDError, setInvalidUUIDError] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    if (!id || !isValidUUID(id)) {
      setInvalidUUIDError(true);
      setLoading(false);
      return;
    }

    const fetchPublicPlant = async () => {
      setLoading(true);
      try {
        if (isLiveSupabaseConfigured()) {
          // Query the privacy-preserving public_plants view!
          const { data, error } = await supabase
            .from('public_plants')
            .select('*')
            .eq('id', id)
            .single();

          if (error || !data) {
            setNotFound(true);
          } else {
            setPlant(data as Plant);
          }
        } else {
          // Mock store privacy lookup
          const mockData = mockStore.getPublicPlant(id);
          if (!mockData) {
            setNotFound(true);
          } else {
            setPlant(mockData);
          }
        }
      } catch (err) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicPlant();
  }, [id]);

  if (invalidUUIDError) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 bg-campus-card border border-red-800 rounded-3xl text-center shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-red-950/80 text-red-400 flex items-center justify-center mx-auto mb-4">
          <AlertOctagon className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-white mb-2">Invalid Plant Identifier Format</h2>
        <p className="text-xs text-slate-400 mb-6">
          Security validation check failed. The requested URL parameter is not a valid UUID format.
        </p>
        <Link to="/" className="px-5 py-2.5 rounded-xl bg-flora-600 text-slate-950 font-bold text-xs inline-flex items-center space-x-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Campus Explorer</span>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto my-16 text-center text-slate-400 text-sm font-semibold">
        Loading species profile from database...
      </div>
    );
  }

  if (notFound || !plant) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 bg-campus-card border border-campus-border rounded-3xl text-center shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-4">
          <Leaf className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-white mb-2">Species Record Not Found</h2>
        <p className="text-xs text-slate-400 mb-6">
          This plant record may be unverified or does not exist. (Unverified submissions are hidden from public views per RLS rules).
        </p>
        <Link to="/" className="px-5 py-2.5 rounded-xl bg-flora-600 text-slate-950 font-bold text-xs inline-flex items-center space-x-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Campus Explorer</span>
        </Link>
      </div>
    );
  }

  const currentUrl = window.location.href;

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-8">
      
      {/* Back button */}
      <div>
        <Link to="/" className="inline-flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Campus Map</span>
        </Link>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-campus-card border border-campus-border rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-2">
        
        <div className="relative h-80 md:h-full bg-slate-950">
          <img
            src={plant.photo_url}
            alt={plant.species_name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-flora-500 text-slate-950 flex items-center space-x-1 shadow-lg">
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              <span>Public Verified Record</span>
            </span>
          </div>
        </div>

        <div className="p-8 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center space-x-2 text-xs font-extrabold text-flora-400 uppercase tracking-widest mb-1">
              <span>{plant.family}</span>
              <span>•</span>
              <span className="flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-0.5 inline" />
                {plant.zone}
              </span>
            </div>

            <h1 className="text-3xl font-black text-white italic tracking-tight mb-1">
              {plant.species_name}
            </h1>
            <p className="text-base font-bold text-slate-300 mb-4">{plant.common_name}</p>

            <div className="grid grid-cols-2 gap-3 mb-6 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">AI Match Confidence</span>
                <span className="text-base font-extrabold text-flora-400 flex items-center space-x-1">
                  <Sparkles className="w-4 h-4 inline" />
                  <span>{plant.confidence_score}%</span>
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Catalog Date</span>
                <span className="text-xs font-semibold text-slate-200 flex items-center space-x-1 mt-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 inline" />
                  <span>{new Date(plant.created_at).toLocaleDateString()}</span>
                </span>
              </div>
            </div>

            {plant.notes && (
              <div className="mb-4">
                <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Botanist Observations</span>
                <p className="text-xs text-slate-300 bg-slate-950/40 p-3 rounded-xl border border-slate-800 italic">
                  "{plant.notes}"
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => setShowQRModal(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center space-x-2 transition-all"
            >
              <QrCode className="w-4 h-4 text-flora-400" />
              <span>Physical QR Tag</span>
            </button>
          </div>

        </div>

      </div>

      {/* Mini Location Map */}
      <div className="bg-campus-card border border-campus-border p-6 rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-flora-400" />
          <h3 className="font-extrabold text-base text-white">Campus Location Geotag</h3>
        </div>

        <div className="h-64 rounded-2xl overflow-hidden border border-slate-800">
          <MapContainer
            center={[plant.latitude, plant.longitude]}
            zoom={17}
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker
              position={[plant.latitude, plant.longitude]}
              icon={L.divIcon({
                className: 'profile-pin',
                html: `<div style="background:#22c55e; width:28px; height:28px; border-radius:50%; border:3px solid white; box-shadow:0 0 15px #22c55e;" class="flex items-center justify-center">🌿</div>`,
                iconSize: [28, 28],
                iconAnchor: [14, 14]
              })}
            />
          </MapContainer>
        </div>
      </div>

      {/* QR Code Printable Modal Sub-Overlay */}
      {showQRModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-campus-card border border-campus-border rounded-3xl p-8 max-w-sm w-full text-center relative shadow-2xl">
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ×
            </button>

            <div className="w-12 h-12 rounded-2xl bg-flora-500/20 text-flora-400 flex items-center justify-center mx-auto mb-3">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-white mb-1">Campus Physical QR Tag</h3>
            <p className="text-xs text-slate-400 mb-6">Scan with phone camera to view species profile</p>

            <div className="bg-white p-6 rounded-2xl inline-block shadow-xl mb-6">
              <QRCodeSVG
                value={currentUrl}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="text-xs font-bold text-white italic mb-4">{plant.species_name}</div>

            <button
              onClick={() => window.print()}
              className="w-full py-2.5 rounded-xl bg-flora-600 hover:bg-flora-500 text-slate-950 font-bold text-xs transition-all shadow-glow-emerald"
            >
              Print Physical Marker Tag
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
