import { create } from "zustand";
import { toast } from "sonner";
import { api } from "../utils/api";
import { type Booking } from "./bookings";

type ScannerState = {
    scanning: boolean;
    result: Booking | "not_found" | null;

    // Actions
    scan: (id: string) => Promise<void>;
    validate: (id: string) => Promise<void>;
    reset: () => void;
};

export const useScanner = create<ScannerState>()((set) => ({
    scanning: false,
    result: null,

    scan: async (id) => {
        set({ scanning: true, result: null });
        try {
            const res = await api.get(`/admin/scanner/verify/${id}`);
            set({ scanning: false, result: res.data.data });
        } catch (error: any) {
            set({ scanning: false, result: "not_found" });
            toast.error(error.response?.data?.message || `Ticket ${id} not found`);
        }
    },

    validate: async (id) => {
        try {
            const res = await api.post(`/admin/scanner/validate/${id}`);
            set((state) => ({
                result: state.result && typeof state.result !== "string" ? res.data.data : state.result
            }));
            toast.success(`Ticket ${id} validated!`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || `Failed to validate ticket ${id}`);
        }
    },

    reset: () => set({ result: null, scanning: false }),
}));
