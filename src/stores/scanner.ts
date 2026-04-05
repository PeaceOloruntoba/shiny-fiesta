import { create } from "zustand";
import { toast } from "sonner";
import { useBookings, type Booking } from "./bookings";

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
        await new Promise((resolve) => setTimeout(resolve, 1100));
        
        const { bookings } = useBookings.getState();
        const booking = bookings.find((b) => b.id === id.toUpperCase());
        
        set({ scanning: false, result: booking || "not_found" });
        if (!booking) {
            toast.error(`Ticket ${id} not found`);
        }
    },

    validate: async (id) => {
        const { updateBookingStatus } = useBookings.getState();
        await updateBookingStatus(id, "used");
        set((state) => ({
            result: state.result && typeof state.result !== "string" ? { ...state.result, status: "used" } : state.result
        }));
        toast.success(`Ticket ${id} validated!`);
    },

    reset: () => set({ result: null, scanning: false }),
}));
