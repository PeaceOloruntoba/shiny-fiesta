import { create } from "zustand";
import { toast } from "sonner";
import { api } from "../utils/api";

export type DashboardStats = {
    totalRevenue: number;
    activeBookings: number;
    tripsCompleted: number;
    routesOperating: number;
};

export type WeeklyStat = {
    day: string;
    bookings: number;
    revenue: number;
};

export type RouteDistribution = {
    name: string;
    value: number;
};

type DashboardState = {
    stats: DashboardStats | null;
    weeklyStats: WeeklyStat[];
    routeDistribution: RouteDistribution[];
    loading: boolean;

    // Actions
    fetchDashboardData: () => Promise<void>;
};

export const useDashboard = create<DashboardState>()((set) => ({
    stats: null,
    weeklyStats: [],
    routeDistribution: [],
    loading: false,

    fetchDashboardData: async () => {
        set({ loading: true });
        try {
            const res = await api.get("/admin/dashboard");
            const { stats, weeklyStats, routeDistribution } = res.data.data;
            set({ 
                stats, 
                weeklyStats, 
                routeDistribution, 
                loading: false 
            });
        } catch (error: any) {
            toast.error("Failed to fetch dashboard data");
            set({ loading: false });
        }
    },
}));
