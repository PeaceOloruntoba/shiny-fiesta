import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "sonner";
import { api } from "../utils/api";

export type Bus = {
    id: string;
    name: string;
    plate_number: string;
    capacity: number;
    model: string;
    year: number;
    status: "active" | "maintenance";
};

type FleetState = {
    buses: Bus[];
    loading: boolean;

    // Actions
    fetchBuses: () => Promise<void>;
    addBus: (bus: Omit<Bus, "id">) => Promise<void>;
    updateBus: (id: string, bus: Partial<Bus>) => Promise<void>;
    deleteBus: (id: string) => Promise<void>;
};

export const useFleet = create<FleetState>()(
    persist(
        (set) => ({
            buses: [],
            loading: false,

            fetchBuses: async () => {
                set({ loading: true });
                try {
                    const res = await api.get("/admin/fleet");
                    set({ buses: res.data.data, loading: false });
                } catch (error: any) {
                    toast.error("Failed to fetch fleet", {
                        description: error.response?.data?.message || "An error occurred",
                    });
                    set({ loading: false });
                }
            },

            addBus: async (bus) => {
                set({ loading: true });
                try {
                    const res = await api.post("/admin/fleet", bus);
                    set((state) => ({ buses: [res.data.data, ...state.buses], loading: false }));
                    toast.success("Bus added successfully");
                } catch (error: any) {
                    toast.error("Failed to add bus", {
                        description: error.response?.data?.message || "An error occurred",
                    });
                    set({ loading: false });
                }
            },

            updateBus: async (id, updatedBus) => {
                set({ loading: true });
                try {
                    const res = await api.put(`/admin/fleet/${id}`, updatedBus);
                    set((state) => ({
                        buses: state.buses.map((b) => (b.id === id ? res.data.data : b)),
                        loading: false,
                    }));
                    toast.success("Bus updated successfully");
                } catch (error: any) {
                    toast.error("Failed to update bus", {
                        description: error.response?.data?.message || "An error occurred",
                    });
                    set({ loading: false });
                }
            },

            deleteBus: async (id) => {
                set({ loading: true });
                try {
                    await api.delete(`/admin/fleet/${id}`);
                    set((state) => ({
                        buses: state.buses.filter((b) => b.id !== id),
                        loading: false,
                    }));
                    toast.success("Bus deleted successfully");
                } catch (error: any) {
                    toast.error("Failed to delete bus", {
                        description: error.response?.data?.message || "An error occurred",
                    });
                    set({ loading: false });
                }
            },
        }),
        {
            name: "fleet-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
