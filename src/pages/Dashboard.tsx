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

type BookingStatus = "confirmed" | "used" | "cancelled";

interface Booking {
  id: string;
  userId: string;
  routeId: string;
  departure: string;
  date: string;
  seats: number[];
  status: BookingStatus;
  fare: number;
  timestamp: string;
}

interface Route {
  id: string;
  from: string;
  to: string;
}

const ROUTES: Route[] = [
  { id: "R001", from: "Uniport", to: "Choba" },
  { id: "R002", from: "Uniport", to: "Aluu" },
  { id: "R003", from: "Uniport", to: "Rumuokoro" },
  { id: "R004", from: "Uniport", to: "Eliozu" },
];

const BOOKINGS: Booking[] = [
  { id: "TKT-001", userId: "STU001", routeId: "R001", departure: "08:30", date: "2026-04-03", seats: [5, 6], status: "confirmed", fare: 300, timestamp: "2026-04-02" },
  { id: "TKT-002", userId: "STU002", routeId: "R002", departure: "09:00", date: "2026-04-04", seats: [12], status: "confirmed", fare: 80, timestamp: "2026-04-03" },
  { id: "TKT-003", userId: "STU003", routeId: "R003", departure: "10:30", date: "2026-04-03", seats: [3], status: "used", fare: 100, timestamp: "2026-04-01" },
  { id: "TKT-004", userId: "STU004", routeId: "R001", departure: "14:00", date: "2026-04-05", seats: [8], status: "cancelled", fare: 150, timestamp: "2026-04-02" },
  { id: "TKT-005", userId: "STU005", routeId: "R004", departure: "15:00", date: "2026-04-03", seats: [2, 4], status: "confirmed", fare: 120, timestamp: "2026-04-03" },
  { id: "TKT-006", userId: "STU006", routeId: "R002", departure: "11:00", date: "2026-04-03", seats: [7], status: "used", fare: 80, timestamp: "2026-04-03" },
  { id: "TKT-007", userId: "STU007", routeId: "R003", departure: "13:00", date: "2026-04-06", seats: [1], status: "confirmed", fare: 100, timestamp: "2026-04-04" },
  { id: "TKT-008", userId: "STU008", routeId: "R004", departure: "16:00", date: "2026-04-06", seats: [9], status: "used", fare: 120, timestamp: "2026-04-05" },
];

const WEEKLY_STATS = [
  { day: "Mon", bookings: 12 },
  { day: "Tue", bookings: 19 },
  { day: "Wed", bookings: 8 },
  { day: "Thu", bookings: 15 },
  { day: "Fri", bookings: 22 },
  { day: "Sat", bookings: 17 },
  { day: "Sun", bookings: 10 },
];

const ROUTE_PIE = [
  { name: "Choba", value: 35, color: "#10b981" },
  { name: "Aluu", value: 25, color: "#3b82f6" },
  { name: "Rumuokoro", value: 20, color: "#f59e0b" },
  { name: "Eliozu", value: 20, color: "#8b5cf6" },
];

const statusStyles = {
  confirmed: "bg-blue-100 text-blue-600",
  used: "bg-amber-100 text-amber-600",
  cancelled: "bg-gray-100 text-gray-500",
};

export default function Dashboard() {
  const totalRevenue = BOOKINGS
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + b.fare, 0);

  const active = BOOKINGS.filter((b) => b.status === "confirmed").length;
  const used = BOOKINGS.filter((b) => b.status === "used").length;

  return (
    <div className="space-y-6">
      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: "Total Revenue",
            value: `₦${totalRevenue.toLocaleString()}`,
            icon: TrendingUp,
            color: "text-emerald-600",
            bg: "bg-emerald-100",
          },
          {
            label: "Active Bookings",
            value: active,
            icon: Ticket,
            color: "text-blue-600",
            bg: "bg-blue-100",
          },
          {
            label: "Trips Completed",
            value: used,
            icon: CheckCircle,
            color: "text-amber-600",
            bg: "bg-amber-100",
          },
          {
            label: "Routes",
            value: ROUTES.length,
            icon: MapPin,
            color: "text-purple-600",
            bg: "bg-purple-100",
          },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-xl p-5 border">
            <div className="flex justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-2">{item.label}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {item.value}
                </p>
              </div>
              <div
                className={`w-11 h-11 rounded-lg flex items-center justify-center ${item.bg}`}
              >
                <item.icon className={item.color} size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid xl:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border xl:col-span-2">
          <h3 className="text-sm font-semibold mb-4">Weekly Bookings</h3>

          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={WEEKLY_STATS}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="bookings" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-5 rounded-xl border">
          <h3 className="text-sm font-semibold mb-4">
            Route Distribution
          </h3>

          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={ROUTE_PIE} dataKey="value" innerRadius={50} outerRadius={80}>
                {ROUTE_PIE.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border p-5">
        <h3 className="text-sm font-semibold mb-4">Recent Bookings</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-xs border-b">
                <th className="text-left py-2">Ticket</th>
                <th className="text-left py-2">Route</th>
                <th className="text-left py-2">Date</th>
                <th className="text-left py-2">Departure</th>
                <th className="text-left py-2">Fare</th>
                <th className="text-left py-2">Status</th>
              </tr>
            </thead>

            <tbody>
              {BOOKINGS.slice(0, 6).map((b) => {
                const route = ROUTES.find((r) => r.id === b.routeId);

                return (
                  <tr key={b.id} className="border-b last:border-0">
                    <td className="py-3 font-mono text-xs">{b.id}</td>
                    <td>
                      {route?.from} → {route?.to}
                    </td>
                    <td>{b.date}</td>
                    <td className="font-mono text-xs">{b.departure}</td>
                    <td className="font-bold text-emerald-600">
                      ₦{b.fare}
                    </td>
                    <td>
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-semibold ${statusStyles[b.status]}`}
                      >
                        {b.status}
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