import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Headbar from "./Headbar";
import { useState, useMemo } from "react";
import { BarChart2, Bus, MapPin, QrCode, Ticket, Users } from "lucide-react";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const location = useLocation();

  const nav = [
    { id: "dashboard", label: "Dashboard", icon: BarChart2, path: "/dashboard" },
    { id: "routes", label: "Routes", icon: MapPin, path: "/routes" },
    { id: "fleet", label: "Fleet", icon: Bus, path: "/fleet" },
    { id: "bookings", label: "Bookings", icon: Ticket, path: "/bookings" },
    { id: "scanner", label: "Scanner", icon: QrCode, path: "/scanner" },
    { id: "users", label: "Users", icon: Users, path: "/users" },
  ];

  // 🔥 derive active menu from URL
  const activeMenu = useMemo(() => {
    return nav.find((item) => location.pathname.startsWith(item.path));
  }, [location.pathname]);

  return (
    <div className="flex w-full h-screen overflow-hidden">
      {/* Mobile Backdrop */}
      {sidebarOpen && window.innerWidth <= 768 && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`
        fixed md:static inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <Sidebar nav={nav} isOpen={sidebarOpen} onClose={() => window.innerWidth <= 768 && setSidebarOpen(false)} />
      </div>

      <main className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Headbar
          onCollapse={() => setSidebarOpen(!sidebarOpen)}
          activeMenu={activeMenu}
        />

        <div className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}