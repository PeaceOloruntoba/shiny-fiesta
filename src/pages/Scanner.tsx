import { useState } from "react";
import { 
  QrCode, 
  XCircle,
  Calendar,
  Clock,
  User as UserIcon,
  MapPin
} from "lucide-react";
import { useScanner } from "../stores/scanner";
import { useRoutes } from "../stores/routes";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

const statusCfg: Record<string, { bg: string; color: string; label: string }> = {
    confirmed: { bg: "bg-green-50", color: "text-green-600", label: "Valid" },
    used:      { bg: "bg-blue-50", color: "text-blue-600", label: "Already Used" },
    cancelled: { bg: "bg-red-50", color: "text-red-600", label: "Cancelled" },
};

export default function Scanner() {
  const { scanning, result, scan, validate, reset } = useScanner();
  const { routes } = useRoutes();
  const [ticketId, setTicketId] = useState("");

  const handleScan = async () => {
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

        {/* Viewfinder simulation */}
        <div className="relative w-full aspect-video bg-gray-900 rounded-2xl mb-8 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          
          {/* Scanner frame */}
          <div className="relative w-48 h-48 border-2 border-green-500/30 rounded-3xl flex items-center justify-center">
            {/* Corners */}
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-green-500 rounded-tl-xl" />
            <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-green-500 rounded-tr-xl" />
            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-green-500 rounded-bl-xl" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-green-500 rounded-br-xl" />
            
            {/* Scanning line animation */}
            {scanning && (
              <div className="absolute inset-x-4 top-0 h-1 bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.8)] animate-scan-line" />
            )}
            
            <QrCode size={64} className={`transition-opacity duration-300 ${scanning ? 'opacity-100' : 'opacity-20'} text-green-500`} />
          </div>
          
          <div className="absolute bottom-6 text-xs font-bold text-green-500/80 uppercase tracking-widest">
            {scanning ? "Processing..." : "Ready to scan"}
          </div>
        </div>

        <div className="flex gap-3">
          <Input 
            placeholder="Enter ticket ID (e.g. TKT-001)" 
            className="font-mono"
            value={ticketId}
            onChange={(e) => setTicketId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleScan()}
          />
          <Button 
            variant="primary" 
            onClick={handleScan} 
            isLoading={scanning}
            className="px-8"
          >
            Scan
          </Button>
        </div>
        <p className="text-[10px] text-gray-400 mt-4">Try: TKT-001, TKT-002, TKT-003, TKT-005</p>
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
                {result.userId}
              </div>
            </div>
            <div className={`px-4 py-2 rounded-xl text-xs font-bold uppercase ${statusCfg[result.status].bg} ${statusCfg[result.status].color}`}>
              {result.status === 'confirmed' ? '✓ Valid Ticket' : statusCfg[result.status].label}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              { label: "Route", value: routes.find(r => r.id === result.routeId)?.from.split(" ")[0] + " → " + routes.find(r => r.id === result.routeId)?.to.split(" ")[0], icon: MapPin },
              { label: "Date", value: result.date, icon: Calendar },
              { label: "Schedule", value: result.departure, icon: Clock },
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
      `}</style>
    </div>
  );
}
