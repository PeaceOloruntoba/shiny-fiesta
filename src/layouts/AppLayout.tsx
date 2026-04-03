import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Headbar from "./Headbar";
import { useState, useMemo } from "react";
import { BarChart2, Bus, MapPin, QrCode, Ticket } from "lucide-react";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const nav = [
    { id: "dashboard", label: "Dashboard", icon: BarChart2, path: "/dashboard" },
    { id: "routes", label: "Routes", icon: MapPin, path: "/routes" },
    { id: "fleet", label: "Fleet", icon: Bus, path: "/fleet" },
    { id: "bookings", label: "Bookings", icon: Ticket, path: "/bookings" },
    { id: "scanner", label: "Scanner", icon: QrCode, path: "/scanner" },
  ];

  // 🔥 derive active menu from URL
  const activeMenu = useMemo(() => {
    return nav.find((item) => location.pathname.startsWith(item.path));
  }, [location.pathname]);

  return (
    <div className="flex w-screen h-screen">
      <Sidebar nav={nav} isOpen={sidebarOpen} />

      <main className="flex flex-col flex-1 overflow-hidden">
        <Headbar
          onCollapse={() => setSidebarOpen(!sidebarOpen)}
          activeMenu={activeMenu}
        />

        <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}