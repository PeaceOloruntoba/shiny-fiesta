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
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{loading ? "..." : value}</p>
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
          <h3 className="text-sm font-bold text-gray-900 mb-6">Weekly Performance</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyStats}>
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
                <Pie 
                  data={routeDistribution} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={55} 
                  outerRadius={80} 
                  dataKey="value" 
                  paddingAngle={4}
                >
                  {routeDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   formatter={(value: any) => [`${value} bookings`, 'Volume']}
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 justify-center mt-6">
            {routeDistribution.slice(0, 4).map((r, index) => (
              <div key={r.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: COLORS[index % COLORS.length] }} />
                <span className="text-[11px] font-medium text-gray-500 truncate max-w-[100px]">{r.name}</span>
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
                {["Ticket", "Route", "Customer", "Date", "Status"].map((h) => (
                  <th key={h} className="pb-4 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bookings.slice(0, 8).map((b) => {
                const sc = statusCfg[b.status] || { bg: "bg-gray-50", color: "text-gray-500", label: b.status };
                return (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 font-mono text-xs text-gray-500">{b.id}</td>
                    <td className="py-4 px-4 text-sm font-medium text-gray-900">
                      {b.origin} → {b.destination}
                    </td>
                    <td className="py-4 px-4">
                        <div className="text-sm font-medium text-gray-900">{b.user_name}</div>
                        <div className="text-[10px] text-gray-400">{b.user_email}</div>
                    </td>
                    <td className="py-4 px-4 text-xs text-gray-500">
                        {new Date(b.booking_date).toLocaleDateString()}
                        <div className="text-[10px] text-gray-400 font-mono">{b.departure_time}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`${sc.bg} ${sc.color} text-[10px] font-bold px-2.5 py-1 rounded-full uppercase`}>
                        {sc.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {bookings.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400 text-sm">No recent bookings found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
