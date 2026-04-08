import { useState, useEffect } from "react";
import { 
  Ticket, 
  Search,
  Calendar,
  Clock,
  User as UserIcon,
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Booking Management</h2>
          <p className="text-sm text-gray-500">{bookings.length} total bookings</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <Input 
            placeholder="Search by ticket ID, user ID or name..." 
            leftIcon={<Search size={18} />} 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          {["all", "confirmed", "used", "cancelled"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                filter === f 
                  ? "bg-green-500 text-white shadow-md shadow-green-200" 
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                {["Ticket", "Customer", "Route", "Schedule", "Seats", "Fare", "Status", ""].map((h) => (
                  <th key={h} className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBookings.map((b) => {
                const sc = statusCfg[b.status] || { bg: "bg-gray-50", color: "text-gray-500", label: b.status };
                return (
                  <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Ticket size={16} className="text-gray-500" />
                        </div>
                        <span className="font-mono text-xs font-bold text-gray-700">{b.id}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <UserIcon size={14} className="text-gray-400" />
                        <div>
                          <div className="text-sm font-semibold text-gray-700">{b.user_name || "Guest"}</div>
                          <div className="text-[10px] text-gray-400">{b.user_email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm font-medium text-gray-900">
                        {b.origin} → {b.destination}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Calendar size={12} />
                          {new Date(b.booking_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-mono text-gray-400">
                          <Clock size={12} />
                          {b.departure_time}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1">
                        {b.seats.map(s => (
                          <span key={s} className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-bold text-gray-600">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-bold text-emerald-600">₦{b.total_fare}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`${sc.bg} ${sc.color} text-[10px] font-bold px-2.5 py-1 rounded-full uppercase`}>
                        {sc.label}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-end gap-2">
                        {b.status === "confirmed" && (
                          <>
                            <Button 
                              variant="secondary" 
                              className="h-8 px-3 text-[10px]" 
                              onClick={() => handleStatusChange(b.id, "used")}
                            >
                              Mark Used
                            </Button>
                            <Button 
                              variant="danger" 
                              className="h-8 px-3 text-[10px]" 
                              onClick={() => handleStatusChange(b.id, "cancelled")}
                            >
                              Cancel
                            </Button>
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
