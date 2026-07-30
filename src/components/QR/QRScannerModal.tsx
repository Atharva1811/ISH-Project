import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, AlertCircle, Sparkles } from 'lucide-react';
import { isValidUUID } from '../../lib/sanitizer';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToPlant: (plantId: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onNavigateToPlant
}) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const qrRegionId = 'qr-reader-region';
    const html5Qrcode = new Html5Qrcode(qrRegionId);
    scannerRef.current = html5Qrcode;

    const startScanner = async () => {
      try {
        setIsScanning(true);
        setErrorMsg(null);

        await html5Qrcode.start(
          { facingMode: 'environment' }, // Rear camera preferred
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          (decodedText) => {
            // Successfully scanned QR code text!
            // Example scanned URL: https://site.com/#/plant/f47ac10b-58cc-4372-a567-0e02b2c3d479
            try {
              const urlParts = decodedText.split('/plant/');
              if (urlParts.length > 1) {
                const potentialUUID = urlParts[1].split('?')[0].split('#')[0];
                if (isValidUUID(potentialUUID)) {
                  html5Qrcode.stop().catch(() => {});
                  onNavigateToPlant(potentialUUID);
                  onClose();
                  return;
                }
              }
              // Direct UUID text case
              if (isValidUUID(decodedText.trim())) {
                html5Qrcode.stop().catch(() => {});
                onNavigateToPlant(decodedText.trim());
                onClose();
                return;
              }

              setErrorMsg('Scanned QR code is not a valid CampusFlora plant marker.');
            } catch (err) {
              setErrorMsg('Invalid QR code format.');
            }
          },
          () => {
            // Scan frame ignore
          }
        );
      } catch (err: any) {
        setErrorMsg('Camera permission denied or camera unavailable. You can manually enter a plant ID.');
        setIsScanning(false);
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-campus-card border border-campus-border rounded-3xl shadow-2xl overflow-hidden p-6 text-center">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-flora-500/20 text-flora-400 flex items-center justify-center mx-auto mb-3">
          <Camera className="w-6 h-6" />
        </div>
        
        <h3 className="font-extrabold text-lg text-white mb-1">Scan Plant Physical Tag</h3>
        <p className="text-xs text-slate-400 mb-4">Point your camera at a CampusFlora QR code tag</p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-800 rounded-xl text-red-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* HTML5 QR Code Scanner Video Region */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-flora-500/50 bg-slate-950 min-h-[260px]">
          <div id="qr-reader-region" className="w-full h-full" />
        </div>

        <p className="text-[11px] text-slate-500 mt-4 italic">
          Scanned plant IDs are validated against strict UUID schemas before querying.
        </p>

      </div>
    </div>
  );
};
