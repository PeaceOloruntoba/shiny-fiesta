import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  TrendingUp,
  Ticket,
  CheckCircle,
  MapPin,
} from "lucide-react";
import { useBookings } from "../stores/bookings";
import { useRoutes } from "../stores/routes";
import { useEffect } from "react";

const WEEKLY_STATS = [
  { day: "Mon", bookings: 42, revenue: 5800 },
  { day: "Tue", bookings: 38, revenue: 5100 },
  { day: "Wed", bookings: 55, revenue: 7200 },
  { day: "Thu", bookings: 61, revenue: 8400 },
  { day: "Fri", bookings: 78, revenue: 10200 },
  { day: "Sat", bookings: 29, revenue: 3900 },
  { day: "Sun", bookings: 18, revenue: 2400 },
];

const ROUTE_PIE = [
  { name: "R001", value: 38, color: "#10b981" },
  { name: "R002", value: 24, color: "#3b82f6" },
  { name: "R003", value: 22, color: "#f59e0b" },
  { name: "R004", value: 16, color: "#8b5cf6" },
];

const statusCfg: Record<string, { bg: string; color: string; label: string }> = {
    confirmed: { bg: "bg-green-50", color: "text-green-600", label: "Confirmed" },
    used:      { bg: "bg-blue-50", color: "text-blue-600", label: "Used" },
    cancelled: { bg: "bg-red-50", color: "text-red-600", label: "Cancelled" },
};

export default function Dashboard() {
  const { bookings, fetchBookings } = useBookings();
  const { routes, fetchRoutes } = useRoutes();

  useEffect(() => {
    fetchBookings();
    fetchRoutes();
  }, [fetchBookings, fetchRoutes]);

  const totalRevenue = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + b.fare, 0);

  const active = bookings.filter((b) => b.status === "confirmed").length;
  const used = bookings.filter((b) => b.status === "used").length;

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: `₦${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Active Bookings", value: active, icon: Ticket, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Trips Completed", value: used, icon: CheckCircle, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Routes Operating", value: routes.length, icon: MapPin, color: "text-purple-600", bg: "bg-purple-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
              </div>
              <div className={`${bg} w-11 h-11 rounded-xl flex items-center justify-center`}>
                <Icon size={22} className={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-6">Weekly Bookings</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WEEKLY_STATS}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="bookings" fill="#10b981" radius={[6, 6, 0, 0]} name="Bookings" barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-6">Route Distribution</h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={ROUTE_PIE} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={4}>
                  {ROUTE_PIE.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 justify-center mt-6">
            {ROUTE_PIE.map((r) => (
              <div key={r.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: r.color }} />
                <span className="text-[11px] font-medium text-gray-500">{r.name} {r.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent bookings table */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm overflow-hidden">
        <h3 className="text-sm font-bold text-gray-900 mb-6">Recent Bookings</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50">
                {["Ticket", "Route", "Date", "Dep", "Fare", "Status"].map((h) => (
                  <th key={h} className="pb-4 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bookings.slice(0, 6).map((b) => {
                const rt = routes.find((r) => r.id === b.routeId);
                const sc = statusCfg[b.status] || { bg: "bg-gray-50", color: "text-gray-500", label: b.status };
                return (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 font-mono text-xs text-gray-500">{b.id}</td>
                    <td className="py-4 px-4 text-sm font-medium text-gray-900">
                      {rt ? `${rt.from.split(" ")[0]} → ${rt.to.split(" ")[0]}` : "Unknown"}
                    </td>
                    <td className="py-4 px-4 text-xs text-gray-500">{b.date}</td>
                    <td className="py-4 px-4 text-xs font-mono text-gray-500">{b.departure}</td>
                    <td className="py-4 px-4 text-sm font-bold text-emerald-600">₦{b.fare}</td>
                    <td className="py-4 px-4">
                      <span className={`${sc.bg} ${sc.color} text-[10px] font-bold px-2.5 py-1 rounded-full uppercase`}>
                        {sc.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
