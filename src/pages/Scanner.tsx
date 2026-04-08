import { useState, useEffect, useRef } from "react";
import { 
  QrCode, 
  XCircle,
  Calendar,
  Clock,
  User as UserIcon,
  MapPin,
  Camera,
  RefreshCw
} from "lucide-react";
import { useScanner } from "../stores/scanner";
// import { useRoutes } from "../stores/routes";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { Html5Qrcode } from "html5-qrcode";

const statusCfg: Record<string, { bg: string; color: string; label: string }> = {
    confirmed: { bg: "bg-green-50", color: "text-green-600", label: "Valid" },
    used:      { bg: "bg-blue-50", color: "text-blue-600", label: "Already Used" },
    cancelled: { bg: "bg-red-50", color: "text-red-600", label: "Cancelled" },
};

export default function Scanner() {
  const { scanning, result, scan, validate, reset } = useScanner();
  // const { routes } = useRoutes();
  const [ticketId, setTicketId] = useState("");
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const qrCodeRegionId = "html5qr-code-full-region";
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    // Start scanner on mount
    startScanner();

    return () => {
      // Stop scanner on unmount
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(err => console.error("Error stopping scanner", err));
      }
    };
  }, []);

  const startScanner = async () => {
    try {
      setCameraError(null);
      const html5QrCode = new Html5Qrcode(qrCodeRegionId);
      scannerRef.current = html5QrCode;

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };

      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          // Success callback
          handleQRCodeScanned(decodedText);
        },
        (errorMessage) => {
          console.log(errorMessage)
          // This is a continuous scan, so we don't necessarily want to log every failure
          // unless it's a critical error.
        }
      );
      setHasPermission(true);
    } catch (err: any) {
      console.error("Camera access error:", err);
      if (err.name === "NotAllowedError" || err === "NotAllowedError") {
        setHasPermission(false);
      } else {
        setCameraError(err.message || "Failed to start camera");
      }
    }
  };

  const handleQRCodeScanned = async (decodedText: string) => {
    setTicketId(decodedText);
    await scan(decodedText);
  };

  const handleManualScan = async () => {
    if (ticketId) {
      await scan(ticketId);
    }
  };

  const handleValidate = async () => {
    if (result && typeof result !== "string") {
      await validate(result.id);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center">
        <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <QrCode size={32} className="text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Ticket Scanner</h2>
        <p className="text-sm text-gray-500 mb-8">Scan QR or enter ticket ID to validate boarding</p>

        {/* Viewfinder Area */}
        <div className="relative w-full aspect-video bg-gray-900 rounded-2xl mb-8 flex items-center justify-center overflow-hidden border border-slate-800 shadow-inner">
          {hasPermission === false ? (
            <div className="text-center p-6 space-y-4">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                <XCircle size={32} className="text-red-500" />
              </div>
              <div className="space-y-2">
                <p className="text-white font-bold text-lg">Camera Permission Denied</p>
                <p className="text-slate-400 text-sm max-w-xs mx-auto">Please enable camera access in your browser settings to use the scanner.</p>
              </div>
              <Button variant="secondary" onClick={startScanner}><RefreshCw size={16} /></Button>
            </div>
          ) : cameraError ? (
            <div className="text-center p-6 space-y-4">
              <p className="text-red-500 font-bold">{cameraError}</p>
              <Button variant="secondary" onClick={startScanner}><RefreshCw size={16} /></Button>
            </div>
          ) : (
            <>
              {/* This is where the camera feed will be rendered */}
              <div id={qrCodeRegionId} className="w-full h-full"></div>
              
              {!hasPermission && hasPermission !== false && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white p-6 text-center z-10">
                   <Camera size={48} className="text-emerald-500 mb-4 animate-pulse" />
                   <p className="font-bold text-lg">Requesting Camera Access...</p>
                   <p className="text-slate-400 text-sm mt-2">Please allow camera permissions when prompted by your browser.</p>
                </div>
              )}

              {/* Scanner HUD Overlay */}
              <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                <div className="relative w-full h-full flex items-center justify-center">
                   <div className="w-48 h-48 border-2 border-green-500/30 rounded-3xl flex items-center justify-center relative">
                      <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-green-500 rounded-tl-xl" />
                      <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-green-500 rounded-tr-xl" />
                      <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-green-500 rounded-bl-xl" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-green-500 rounded-br-xl" />
                      
                      {scanning && (
                        <div className="absolute inset-x-4 top-0 h-1 bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.8)] animate-scan-line" />
                      )}
                   </div>
                </div>
                <div className="absolute bottom-6 left-0 right-0 text-center">
                  <span className="text-xs font-bold text-green-500/80 uppercase tracking-widest px-3 py-1 bg-black/40 rounded-full backdrop-blur-sm">
                    {scanning ? "Processing..." : "Ready to scan"}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3">
          <Input 
            placeholder="Enter ticket ID manually (e.g. TKT-001)" 
            className="font-mono"
            value={ticketId}
            onChange={(e) => setTicketId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleManualScan()}
          />
          <Button 
            variant="primary" 
            onClick={handleManualScan} 
            isLoading={scanning}
            className="px-8"
          >
            Check
          </Button>
        </div>
      </div>

      {/* Result Card */}
      {result === "not_found" && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <XCircle size={24} className="text-red-600" />
          </div>
          <div>
            <h4 className="font-bold text-red-900">Ticket Not Found</h4>
            <p className="text-sm text-red-600">No ticket matches the ID "{ticketId}"</p>
          </div>
          <Button variant="secondary" className="ml-auto" onClick={reset}>Clear</Button>
        </div>
      )}

      {result && typeof result !== "string" && (
        <div className={`bg-white rounded-3xl p-6 border-2 transition-colors duration-300 animate-in fade-in slide-in-from-top-4 ${
          result.status === 'confirmed' ? 'border-green-500' : 
          result.status === 'used' ? 'border-blue-500' : 'border-red-500'
        }`}>
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="font-mono text-lg font-bold text-gray-900 mb-1">{result.id}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <UserIcon size={14} />
                {result.user_name}
              </div>
            </div>
            <div className={`px-4 py-2 rounded-xl text-xs font-bold uppercase ${statusCfg[result.status].bg} ${statusCfg[result.status].color}`}>
              {result.status === 'confirmed' ? '✓ Valid Ticket' : statusCfg[result.status].label}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              { label: "Route", value: `${result.origin} → ${result.destination}`, icon: MapPin },
              { label: "Date", value: new Date(result.booking_date).toLocaleDateString(), icon: Calendar },
              { label: "Schedule", value: result.departure_time, icon: Clock },
              { label: "Seats", value: result.seats.join(", "), icon: QrCode },
            ].map((item) => (
              <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{item.label}</p>
                <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                  <item.icon size={14} className="text-gray-400" />
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {result.status === 'confirmed' ? (
            <Button variant="primary" className="w-full h-14 text-lg" onClick={handleValidate}>
              Validate & Allow Boarding
            </Button>
          ) : (
            <div className={`w-full p-4 rounded-xl text-center font-bold ${statusCfg[result.status].bg} ${statusCfg[result.status].color}`}>
              {result.status === 'used' ? 'DENY BOARDING — ALREADY USED' : 'DENY BOARDING — CANCELLED'}
            </div>
          )}
          
          <Button variant="secondary" className="w-full mt-3" onClick={reset}>Scan Another</Button>
        </div>
      )}

      <style>{`
        @keyframes scan-line {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .animate-scan-line {
          animation: scan-line 2s linear infinite;
        }
        /* Custom styling for html5-qrcode video element */
        #html5qr-code-full-region video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          border-radius: 1rem;
        }
        #html5qr-code-full-region {
          border: none !important;
        }
      `}</style>
    </div>
  );
}
