import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "sonner";

export type Route = {
    id: string;
    from: string;
    to: string;
    duration: string;
    distance: string;
    fare: number;
    departures: string[];
    color: string;
    busId: string;
};

type RoutesState = {
    routes: Route[];
    loading: boolean;

    // Actions
    fetchRoutes: () => Promise<void>;
    addRoute: (route: Omit<Route, "id">) => Promise<void>;
    updateRoute: (id: string, route: Partial<Route>) => Promise<void>;
    deleteRoute: (id: string) => Promise<void>;
};

const MOCK_ROUTES: Route[] = [
    { id: "R001", from: "Main Campus",    to: "City Center",       duration: "25 min", distance: "8.5 km", fare: 150, departures: ["07:00","08:30","10:00","12:00","14:00","16:30","18:00"], color: "#10b981", busId: "B001" },
    { id: "R002", from: "Library Block",  to: "Sports Complex",    duration: "12 min", distance: "3.2 km", fare: 80,  departures: ["07:30","09:00","11:00","13:00","15:30","17:00"],         color: "#3b82f6", busId: "B002" },
    { id: "R003", from: "Student Hostel", to: "Faculty of Science",duration: "18 min", distance: "5.1 km", fare: 100, departures: ["06:30","08:00","10:30","13:30","16:00","18:30"],         color: "#f59e0b", busId: "B003" },
    { id: "R004", from: "Technology Hub", to: "Admin Block",       duration: "8 min",  distance: "2.1 km", fare: 60,  departures: ["08:00","10:00","12:30","15:00","17:30"],                 color: "#8b5cf6", busId: "B004" },
];

export const useRoutes = create<RoutesState>()(
    persist(
        (set) => ({
            routes: MOCK_ROUTES,
            loading: false,

            fetchRoutes: async () => {
                set({ loading: true });
                await new Promise((resolve) => setTimeout(resolve, 1000));
                set({ loading: false });
            },

            addRoute: async (route) => {
                set({ loading: true });
                await new Promise((resolve) => setTimeout(resolve, 1000));
                const newRoute = { ...route, id: `R00${Math.floor(Math.random() * 1000)}` };
                set((state) => ({ routes: [newRoute, ...state.routes], loading: false }));
                toast.success("Route added successfully");
            },

            updateRoute: async (id, updatedRoute) => {
                set({ loading: true });
                await new Promise((resolve) => setTimeout(resolve, 1000));
                set((state) => ({
                    routes: state.routes.map((r) => (r.id === id ? { ...r, ...updatedRoute } : r)),
                    loading: false,
                }));
                toast.success("Route updated successfully");
            },

            deleteRoute: async (id) => {
                set({ loading: true });
                await new Promise((resolve) => setTimeout(resolve, 1000));
                set((state) => ({
                    routes: state.routes.filter((r) => r.id !== id),
                    loading: false,
                }));
                toast.success("Route deleted successfully");
            },
        }),
        {
            name: "routes-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
