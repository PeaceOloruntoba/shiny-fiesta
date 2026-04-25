import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import RRoutes from "./pages/RRoutes";
import Fleet from "./pages/Fleet";
import Bookings from "./pages/Bookings";
import Scanner from "./pages/Scanner";
import Users from "./pages/Users";
import AppLayout from "./layouts/AppLayout";
import Login from "./pages/Login";
import { Toaster } from "sonner";
import ProtectedRoute from "./components/ProtectedRoute";
import AppSafe from "./components/AppSafe";

export default function App() {
  return (
    <div>
      <>
        <Toaster richColors position="top-right" />
        <Router>
          <Routes>
            <Route path="/" element={<AppSafe />} />
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/routes" element={<RRoutes />} />
                <Route path="/fleet" element={<Fleet />} />
                <Route path="/bookings" element={<Bookings />} />
                <Route path="/scanner" element={<Scanner />} />
                <Route path="/users" element={<Users />} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </>
    </div>
  )
}
