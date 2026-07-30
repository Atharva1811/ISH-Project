import React, { useState } from 'react';
import { Plant } from '../../types';
import { QRCodeSVG } from 'qrcode.react';
import { X, ShieldCheck, ShieldAlert, MapPin, QrCode, Copy, Check, ExternalLink, Calendar, Sparkles } from 'lucide-react';

interface PlantDetailModalProps {
  plant: Plant | null;
  onClose: () => void;
}

export const PlantDetailModal: React.FC<PlantDetailModalProps> = ({ plant, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  if (!plant) return null;

  // Construct safe public profile link using HashRouter (#/plant/:id)
  const origin = window.location.origin + window.location.pathname;
  const publicProfileUrl = `${origin}#/plant/${plant.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicProfileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-campus-card border border-campus-border rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-950/70 text-slate-300 hover:text-white border border-slate-700 transition-all backdrop-blur-md"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Image & QR Overlay */}
          <div className="relative h-64 md:h-full min-h-[300px] bg-slate-950">
            <img
              src={plant.photo_url}
              alt={plant.species_name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

            <div className="absolute top-4 left-4">
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center space-x-1 shadow-lg ${
                plant.verified ? 'bg-flora-500 text-slate-950' : 'bg-amber-500 text-slate-950'
              }`}>
                {plant.verified ? <ShieldCheck className="w-4 h-4 stroke-[2.5]" /> : <ShieldAlert className="w-4 h-4 stroke-[2.5]" />}
                <span>{plant.verified ? 'Verified Species' : 'Pending Verification'}</span>
              </span>
            </div>

            <button
              onClick={() => setShowQRModal(true)}
              className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-200 hover:text-white flex items-center space-x-2 transition-all shadow-xl"
            >
              <QrCode className="w-4 h-4 text-flora-400" />
              <span>Show Print QR Tag</span>
            </button>
          </div>

          {/* Details Content */}
          <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center space-x-2 text-xs font-extrabold text-flora-400 uppercase tracking-widest mb-1">
                <span>{plant.family}</span>
                <span>•</span>
                <span className="flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-0.5 inline" />
                  {plant.zone}
                </span>
              </div>

              <h2 className="text-2xl font-black text-white italic tracking-tight mb-1">
                {plant.species_name}
              </h2>
              <p className="text-sm font-bold text-slate-300 mb-4">{plant.common_name}</p>

              {/* Stats pill */}
              <div className="grid grid-cols-2 gap-3 mb-4 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">AI Match Score</span>
                  <span className="text-sm font-extrabold text-flora-400 flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 inline" />
                    <span>{plant.confidence_score}%</span>
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Mapped Date</span>
                  <span className="text-xs font-semibold text-slate-200 flex items-center space-x-1 mt-0.5">
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

              {plant.description && (
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Botanical Summary</span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {plant.description}
                  </p>
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                onClick={handleCopyLink}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all flex items-center justify-center space-x-2"
              >
                {copied ? <Check className="w-4 h-4 text-flora-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Link Copied!' : 'Copy Share Link'}</span>
              </button>

              <a
                href={publicProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-4 rounded-xl bg-flora-600 hover:bg-flora-500 text-slate-950 font-extrabold text-xs shadow-glow-emerald transition-all flex items-center space-x-1.5"
              >
                <span>Public Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

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
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-flora-500/20 text-flora-400 flex items-center justify-center mx-auto mb-3">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-white mb-1">Campus Physical QR Tag</h3>
              <p className="text-xs text-slate-400 mb-6">Scan with phone camera to view species profile</p>

              <div className="bg-white p-6 rounded-2xl inline-block shadow-xl mb-6">
                <QRCodeSVG
                  value={publicProfileUrl}
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
    </div>
  );
};
