import React, { useState } from 'react';
import { Plant, CampusZone, PlantNetPrediction } from '../../types';
import { identifyPlantImage } from '../../lib/plantnet';
import { sanitizeText } from '../../lib/sanitizer';
import { X, Upload, Sparkles, MapPin, CheckCircle2, AlertCircle, Loader2, Camera, ShieldCheck } from 'lucide-react';
import { CAMPUS_BOUNDS } from '../Map/CampusMap';

interface PlantSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newPlant: Omit<Plant, 'id' | 'created_at' | 'verified'>) => void;
}

const ZONES: CampusZone[] = [
  'North Quad',
  'South Lawn',
  'Botanical Garden',
  'Science Complex',
  'Central Park',
  'East Lake'
];

export const PlantSubmitModal: React.FC<PlantSubmitModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // AI Predictions state
  const [predictions, setPredictions] = useState<PlantNetPrediction[]>([]);
  const [selectedPrediction, setSelectedPrediction] = useState<PlantNetPrediction | null>(null);

  // Form Fields
  const [speciesName, setSpeciesName] = useState('');
  const [commonName, setCommonName] = useState('');
  const [family, setFamily] = useState('');
  const [latitude, setLatitude] = useState<number>(CAMPUS_BOUNDS.center[0]);
  const [longitude, setLongitude] = useState<number>(CAMPUS_BOUNDS.center[1]);
  const [zone, setZone] = useState<CampusZone>('Botanical Garden');
  const [notes, setNotes] = useState('');
  const [confidenceScore, setConfidenceScore] = useState<number>(95.0);

  if (!isOpen) return null;

  // File Upload Handler with Security Validation
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Security Check 1: File Mime Type
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validMimeTypes.includes(file.type.toLowerCase())) {
      setErrorMsg('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
      return;
    }

    // Security Check 2: Max File Size (5MB)
    const MAX_SIZE_BYTES = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      setErrorMsg('File size exceeds 5MB limit. Please select a compressed plant photo.');
      return;
    }

    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    // Automatically trigger AI Identification step
    triggerAIIdentification(file);
  };

  // Execute PlantNet AI Proxy Call
  const triggerAIIdentification = async (file: File) => {
    setIsIdentifying(true);
    setErrorMsg(null);
    try {
      const results = await identifyPlantImage(file);
      setPredictions(results);
      if (results.length > 0) {
        const top = results[0];
        setSelectedPrediction(top);
        setSpeciesName(top.speciesName);
        setCommonName(top.commonName);
        setFamily(top.family);
        setConfidenceScore(top.score);
      }
      setStep(2); // Advance to AI Review & Taxonomy step
    } catch (err: any) {
      setErrorMsg(err.message || 'PlantNet AI identification failed. You can still enter details manually.');
      setStep(2);
    } finally {
      setIsIdentifying(false);
    }
  };

  const handleSelectCandidate = (candidate: PlantNetPrediction) => {
    setSelectedPrediction(candidate);
    setSpeciesName(candidate.speciesName);
    setCommonName(candidate.commonName);
    setFamily(candidate.family);
    setConfidenceScore(candidate.score);
  };

  const handleUseCurrentGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
        },
        () => {
          setErrorMsg('GPS location access denied. Defaulting to campus central coordinates.');
        }
      );
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Client-side Postgres check constraint validation
    if (!speciesName || speciesName.length < 2) {
      setErrorMsg('Species name must be at least 2 characters long.');
      return;
    }
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      setErrorMsg('Invalid geographical coordinates.');
      return;
    }

    // Sanitize user text inputs to prevent XSS
    const sanitizedNotes = sanitizeText(notes);
    const sanitizedCommonName = sanitizeText(commonName);
    const sanitizedSpeciesName = sanitizeText(speciesName);

    onSubmit({
      species_name: sanitizedSpeciesName,
      common_name: sanitizedCommonName,
      family: sanitizeText(family),
      photo_url: imagePreview || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1200&auto=format&fit=crop',
      latitude,
      longitude,
      zone,
      confidence_score: confidenceScore,
      notes: sanitizedNotes,
      description: `Mapped on campus ground. AI score: ${confidenceScore}%`
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-campus-card border border-campus-border rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-campus-border flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-flora-500/20 text-flora-400 flex items-center justify-center font-bold">
              🌿
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Identify & Map Plant</h3>
              <p className="text-[11px] text-slate-400">Step {step} of 3 • PlantNet AI Proxy & Geotagging</p>
            </div>
          </div>
          
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-red-950/60 border border-red-800 rounded-xl text-red-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="p-6">
          
          {/* STEP 1: Photo Upload */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-slate-700 hover:border-flora-500/80 rounded-2xl p-8 text-center bg-slate-950/50 transition-colors">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                  id="plant-photo-input"
                />
                <label htmlFor="plant-photo-input" className="cursor-pointer flex flex-col items-center">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="h-48 rounded-xl object-cover mb-4 border border-slate-700" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-flora-500/10 text-flora-400 flex items-center justify-center mb-3">
                      <Camera className="w-8 h-8" />
                    </div>
                  )}
                  <span className="font-bold text-sm text-white">Click to upload plant photo or capture</span>
                  <span className="text-xs text-slate-400 mt-1">Supports JPG, PNG, WebP (Max 5MB)</span>
                </label>
              </div>

              {isIdentifying && (
                <div className="flex items-center justify-center space-x-3 py-6 text-flora-400">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-xs font-bold">Querying PlantNet AI via Supabase Edge Function...</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: AI Identification Candidates */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-sm text-white flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-flora-400" />
                  <span>AI Identification Candidates</span>
                </h4>
                <span className="text-[11px] text-flora-400 font-semibold bg-flora-500/10 px-2.5 py-1 rounded-full border border-flora-500/20">
                  Select match or edit
                </span>
              </div>

              {predictions.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {predictions.map((cand, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectCandidate(cand)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        selectedPrediction?.speciesName === cand.speciesName
                          ? 'bg-flora-950/60 border-flora-500 text-white shadow-glow-emerald'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <p className="font-bold text-xs italic">{cand.speciesName}</p>
                        <p className="text-[11px] text-slate-400">{cand.commonName} • {cand.family}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-flora-500/20 text-flora-400 font-bold text-xs">
                        {cand.score}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No predictions returned. Enter plant taxonomy details manually below.</p>
              )}

              {/* Taxonomy Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Species Name (Scientific)</label>
                  <input
                    type="text"
                    value={speciesName}
                    onChange={(e) => setSpeciesName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-flora-500"
                    placeholder="e.g. Delonix regia"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Common Name</label>
                  <input
                    type="text"
                    value={commonName}
                    onChange={(e) => setCommonName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-flora-500"
                    placeholder="e.g. Gulmohar / Royal Poinciana"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Botanical Family</label>
                  <input
                    type="text"
                    value={family}
                    onChange={(e) => setFamily(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-flora-500"
                    placeholder="e.g. Fabaceae"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 rounded-xl bg-flora-600 hover:bg-flora-500 text-slate-950 font-bold text-xs shadow-glow-emerald transition-all"
                >
                  Next: Campus Location →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Campus Geotagging & Submission */}
          {step === 3 && (
            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Campus Zone</label>
                  <select
                    value={zone}
                    onChange={(e) => setZone(e.target.value as CampusZone)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-flora-500"
                  >
                    {ZONES.map(z => (
                      <option key={z} value={z}>{z}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Auto GPS Geotag</label>
                  <button
                    type="button"
                    onClick={handleUseCurrentGPS}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 flex items-center justify-center space-x-1.5"
                  >
                    <MapPin className="w-3.5 h-3.5 text-flora-400" />
                    <span>Get GPS Location</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-flora-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-flora-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Observation Notes (Sanitized)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-medium text-white placeholder-slate-400 focus:outline-none focus:border-flora-500"
                  placeholder="e.g. Healthy mature tree near administration wing..."
                />
              </div>

              <div className="p-3 bg-amber-950/40 border border-amber-800/80 rounded-xl text-[11px] text-amber-300 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Submitted records remain unverified until reviewed by an administrator (enforced by RLS).</span>
              </div>

              <div className="pt-3 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ← Back
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-flora-500 to-emerald-600 text-slate-950 font-extrabold text-xs shadow-glow-emerald hover:opacity-95 transition-all"
                >
                  Submit to Database
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
