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
import { useDashboard } from "../stores/dashboard";
import { useEffect } from "react";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];

const statusCfg: Record<string, { bg: string; color: string; label: string }> = {
    confirmed: { bg: "bg-green-50", color: "text-green-600", label: "Confirmed" },
    used:      { bg: "bg-blue-50", color: "text-blue-600", label: "Used" },
    cancelled: { bg: "bg-red-50", color: "text-red-600", label: "Cancelled" },
};

export default function Dashboard() {
  const { bookings, fetchBookings } = useBookings();
  const { stats, weeklyStats, routeDistribution, fetchDashboardData, loading } = useDashboard();

  useEffect(() => {
    fetchBookings();
    fetchDashboardData();
  }, [fetchBookings, fetchDashboardData]);

  const kpis = [
    { label: "Total Revenue", value: `₦${(stats?.totalRevenue || 0).toLocaleString()}`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Active Bookings", value: stats?.activeBookings || 0, icon: Ticket, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Trips Completed", value: stats?.tripsCompleted || 0, icon: CheckCircle, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Routes Operating", value: stats?.routesOperating || 0, icon: MapPin, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-3">
              <div className={`${bg} w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center shrink-0`}>
                <Icon size={20} className={color} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider truncate mb-1">{label}</p>
                <p className="text-lg md:text-2xl font-bold text-gray-900 truncate">{loading ? "..." : value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Weekly Performance</h3>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Bookings</span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 600 }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="bookings" fill="#10b981" radius={[8, 8, 0, 0]} name="Bookings" barSize={window.innerWidth < 768 ? 20 : 40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-8">Route Distribution</h3>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={routeDistribution} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={60} 
                  outerRadius={90} 
                  dataKey="value" 
                  paddingAngle={6}
                >
                  {routeDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip 
                   formatter={(value: any) => [`${value} bookings`, 'Volume']}
                   contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 600 }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-8">
            {routeDistribution.slice(0, 4).map((r, index) => (
              <div key={r.name} className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: COLORS[index % COLORS.length] }} />
                <span className="text-[10px] font-bold text-gray-500 truncate">{r.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent bookings table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Recent Bookings</h3>
          <button className="text-[10px] font-bold text-emerald-600 uppercase hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                {["Ticket", "Route", "Customer", "Status"].map((h) => (
                  <th key={h} className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bookings.slice(0, 5).map((b) => {
                const sc = statusCfg[b.status] || { bg: "bg-gray-50", color: "text-gray-500", label: b.status };
                return (
                  <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 font-mono text-[10px] font-bold text-gray-400">#{b.id.slice(0, 8)}</td>
                    <td className="py-4 px-6">
                      <div className="text-xs font-bold text-gray-900">{b.origin}</div>
                      <div className="text-[10px] text-gray-400 font-medium">to {b.destination}</div>
                    </td>
                    <td className="py-4 px-6">
                        <div className="text-xs font-bold text-gray-900">{b.user_name}</div>
                        <div className="text-[10px] text-gray-400 font-medium">{new Date(b.booking_date).toLocaleDateString()}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`${sc.bg} ${sc.color} text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-tighter`}>
                        {sc.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {bookings.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Ticket size={32} className="text-gray-200 mb-2" />
                      <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">No recent activity</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}