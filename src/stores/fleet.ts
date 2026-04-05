import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "sonner";

export type Bus = {
    id: string;
    name: string;
    plate: string;
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

const MOCK_BUSES: Bus[] = [
    { id: "B001", name: "Green Eagle I",    plate: "PHC-001-KW", capacity: 32, model: "Toyota Coaster",   year: 2022, status: "active" },
    { id: "B002", name: "Blue Hawk II",     plate: "PHC-002-KW", capacity: 24, model: "Mitsubishi Rosa",  year: 2021, status: "active" },
    { id: "B003", name: "Gold Falcon III",  plate: "PHC-003-KW", capacity: 32, model: "Toyota Coaster",   year: 2023, status: "active" },
    { id: "B004", name: "Purple Condor IV", plate: "PHC-004-KW", capacity: 16, model: "Ford Transit",     year: 2022, status: "maintenance" },
];

export const useFleet = create<FleetState>()(
    persist(
        (set) => ({
            buses: MOCK_BUSES,
            loading: false,

            fetchBuses: async () => {
                set({ loading: true });
                await new Promise((resolve) => setTimeout(resolve, 1000));
                set({ loading: false });
            },

            addBus: async (bus) => {
                set({ loading: true });
                await new Promise((resolve) => setTimeout(resolve, 1000));
                const newBus = { ...bus, id: `B00${Math.floor(Math.random() * 1000)}` };
                set((state) => ({ buses: [newBus, ...state.buses], loading: false }));
                toast.success("Bus added successfully");
            },

            updateBus: async (id, updatedBus) => {
                set({ loading: true });
                await new Promise((resolve) => setTimeout(resolve, 1000));
                set((state) => ({
                    buses: state.buses.map((b) => (b.id === id ? { ...b, ...updatedBus } : b)),
                    loading: false,
                }));
                toast.success("Bus updated successfully");
            },

            deleteBus: async (id) => {
                set({ loading: true });
                await new Promise((resolve) => setTimeout(resolve, 1000));
                set((state) => ({
                    buses: state.buses.filter((b) => b.id !== id),
                    loading: false,
                }));
                toast.success("Bus deleted successfully");
            },
        }),
        {
            name: "fleet-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
