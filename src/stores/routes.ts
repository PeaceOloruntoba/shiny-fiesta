import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "sonner";
import { api } from "../utils/api";

export type Route = {
    id: string;
    origin: string;
    destination: string;
    duration: string;
    distance: string;
    fare: number;
    departures: string[];
    color: string;
    bus_id: string;
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

export const useRoutes = create<RoutesState>()(
    persist(
        (set) => ({
            routes: [],
            loading: false,

            fetchRoutes: async () => {
                set({ loading: true });
                try {
                    const res = await api.get("/routes");
                    set({ routes: res.data.data, loading: false });
                } catch (error: any) {
                    toast.error("Failed to fetch routes", {
                        description: error.response?.data?.message || "An error occurred",
                    });
                    set({ loading: false });
                }
            },

            addRoute: async (route) => {
                set({ loading: true });
                try {
                    const res = await api.post("/routes", route);
                    set((state) => ({ routes: [res.data.data, ...state.routes], loading: false }));
                    toast.success("Route added successfully");
                } catch (error: any) {
                    toast.error("Failed to add route", {
                        description: error.response?.data?.message || "An error occurred",
                    });
                    set({ loading: false });
                }
            },

            updateRoute: async (id, updatedRoute) => {
                set({ loading: true });
                try {
                    const res = await api.put(`/routes/${id}`, updatedRoute);
                    set((state) => ({
                        routes: state.routes.map((r) => (r.id === id ? res.data.data : r)),
                        loading: false,
                    }));
                    toast.success("Route updated successfully");
                } catch (error: any) {
                    toast.error("Failed to update route", {
                        description: error.response?.data?.message || "An error occurred",
                    });
                    set({ loading: false });
                }
            },

            deleteRoute: async (id) => {
                set({ loading: true });
                try {
                    await api.delete(`/routes/${id}`);
                    set((state) => ({
                        routes: state.routes.filter((r) => r.id !== id),
                        loading: false,
                    }));
                    toast.success("Route deleted successfully");
                } catch (error: any) {
                    toast.error("Failed to delete route", {
                        description: error.response?.data?.message || "An error occurred",
                    });
                    set({ loading: false });
                }
            },
        }),
        {
            name: "routes-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
