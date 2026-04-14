import { Navigate } from "react-router-dom";
import { useAuth } from "../stores/auth";
import { toast } from "sonner";

export default function AppSafe() {
  const { token, user } = useAuth();

  if (!token) {
    toast.error("Please log in to access the dashboard.");
    return <Navigate to="/login" />;
  }
  if (user && user.role !== "admin") {
    toast.error("You do not have permission to access the dashboard.");
    return <Navigate to="/login" />;
  }
  if (user && user.role === "admin") {
    toast.success("Welcome back, admin!");
    return <Navigate to="/dashboard" />;
  }
  toast.error("An unexpected error occurred. Please log in again.");
  return <Navigate to="/login" />;
}
