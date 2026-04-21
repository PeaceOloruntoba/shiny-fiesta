import { useState, useEffect } from "react";
import { 
  Ticket, 
  Search,
  CheckCircle,
  LogOut,
} from "lucide-react";
import { useBookings, type Booking } from "../stores/bookings";
import { useRoutes } from "../stores/routes";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import ConfirmationModal from "../components/ui/ConfirmationModal";

const statusCfg: Record<string, { bg: string; color: string; label: string }> = {
    confirmed: { bg: "bg-green-50", color: "text-green-600", label: "Confirmed" },
    used:      { bg: "bg-blue-50", color: "text-blue-600", label: "Used" },
    cancelled: { bg: "bg-red-50", color: "text-red-600", label: "Cancelled" },
};

export default function Bookings() {
  const { bookings, loading, fetchBookings, updateBookingStatus } = useBookings();
  const { fetchRoutes } = useRoutes();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "confirmed" | "used" | "cancelled">("all");
  
  const [isStatusConfirmOpen, setIsStatusConfirmOpen] = useState(false);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<{ id: string, status: Booking["status"] } | null>(null);

  useEffect(() => {
    fetchBookings();
    fetchRoutes();
  }, [fetchBookings, fetchRoutes]);

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.id.toLowerCase().includes(search.toLowerCase()) || 
                          b.user_id.toLowerCase().includes(search.toLowerCase()) ||
                          b.user_name?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || b.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleStatusChange = (id: string, status: Booking["status"]) => {
    setPendingStatusUpdate({ id, status });
    setIsStatusConfirmOpen(true);
  };

  const confirmStatusUpdate = async () => {
    if (pendingStatusUpdate) {
      await updateBookingStatus(pendingStatusUpdate.id, pendingStatusUpdate.status);
      setPendingStatusUpdate(null);
    }
    setIsStatusConfirmOpen(false);
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 uppercase tracking-widest">Booking Management</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{bookings.length} total records found</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" className="h-10 px-4 text-xs font-bold uppercase tracking-widest">
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
          <Input 
            placeholder="Search by ticket, name or email..." 
            leftIcon={<Search size={16} className="text-gray-400" />} 
            value={search}
            className="border-none bg-transparent h-10 text-sm"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto no-scrollbar">
          {["all", "confirmed", "used", "cancelled"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all whitespace-nowrap ${
                filter === f 
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                  : "text-gray-400 hover:bg-gray-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                {["Ticket", "Customer", "Route & Schedule", "Seats", "Fare", "Status", "Actions"].map((h) => (
                  <th key={h} className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredBookings.map((b) => {
                const sc = statusCfg[b.status] || { bg: "bg-gray-50", color: "text-gray-500", label: b.status };
                return (
                  <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                          <Ticket size={14} />
                        </div>
                        <span className="font-mono text-[10px] font-bold text-gray-400">#{b.id.slice(0, 8)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="min-w-[150px]">
                        <div className="text-xs font-bold text-gray-900">{b.user_name || "Guest User"}</div>
                        <div className="text-[10px] text-gray-400 font-medium">{b.user_email}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="min-w-[180px]">
                        <p className="text-xs font-bold text-gray-900">
                          {b.origin} → {b.destination}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase">{b.departure_time}</span>
                          <span className="text-[9px] font-bold text-gray-400 uppercase">{new Date(b.booking_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1 min-w-[80px]">
                        {b.seats.map(s => (
                          <span key={s} className="w-5 h-5 flex items-center justify-center bg-gray-50 rounded text-[9px] font-bold text-gray-500 border border-gray-100">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-xs font-bold text-gray-900">₦{b.total_fare}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`${sc.bg} ${sc.color} text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-tighter`}>
                        {sc.label}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {b.status === "confirmed" && (
                          <>
                            <button 
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              onClick={() => handleStatusChange(b.id, "used")}
                              title="Mark Used"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button 
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              onClick={() => handleStatusChange(b.id, "cancelled")}
                              title="Cancel"
                            >
                              <LogOut size={16} className="rotate-90" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal 
        isOpen={isStatusConfirmOpen}
        onClose={() => setIsStatusConfirmOpen(false)}
        onConfirm={confirmStatusUpdate}
        title={`Mark Booking as ${pendingStatusUpdate?.status?.toUpperCase()}?`}
        description={`Are you sure you want to change the status of this booking to ${pendingStatusUpdate?.status}? This action may be irreversible.`}
        confirmText="Yes, Update"
        variant={pendingStatusUpdate?.status === "cancelled" ? "danger" : "proceed"}
        isLoading={loading}
      />
    </div>
  );
}
