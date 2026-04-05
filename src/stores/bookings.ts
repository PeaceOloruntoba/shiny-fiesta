import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "sonner";

export type Booking = {
    id: string;
    userId: string;
    routeId: string;
    departure: string;
    date: string;
    seats: number[];
    status: "confirmed" | "used" | "cancelled";
    fare: number;
    timestamp: string;
};

type BookingsState = {
    bookings: Booking[];
    loading: boolean;

    // Actions
    fetchBookings: () => Promise<void>;
    addBooking: (booking: Omit<Booking, "id">) => Promise<void>;
    updateBookingStatus: (id: string, status: Booking["status"]) => Promise<void>;
    deleteBooking: (id: string) => Promise<void>;
};

const MOCK_BOOKINGS: Booking[] = [
    { id: "TKT-001", userId: "STU001", routeId: "R001", departure: "08:30", date: "2026-04-03", seats: [5, 6], status: "confirmed", fare: 300,  timestamp: "2026-04-02T14:30:00" },
    { id: "TKT-002", userId: "STU001", routeId: "R002", departure: "09:00", date: "2026-04-04", seats: [12],   status: "confirmed", fare: 80,   timestamp: "2026-04-03T08:00:00" },
    { id: "TKT-003", userId: "STU002", routeId: "R003", departure: "10:30", date: "2026-04-03", seats: [3],    status: "used",      fare: 100,  timestamp: "2026-04-01T09:00:00" },
    { id: "TKT-004", userId: "STU003", routeId: "R001", departure: "14:00", date: "2026-04-05", seats: [8],    status: "cancelled", fare: 150,  timestamp: "2026-04-02T11:00:00" },
    { id: "TKT-005", userId: "STU004", routeId: "R004", departure: "15:00", date: "2026-04-03", seats: [2, 4], status: "confirmed", fare: 120,  timestamp: "2026-04-03T07:30:00" },
    { id: "TKT-006", userId: "STU005", routeId: "R002", departure: "11:00", date: "2026-04-03", seats: [7],    status: "used",      fare: 80,   timestamp: "2026-04-03T10:30:00" },
];

export const useBookings = create<BookingsState>()(
    persist(
        (set) => ({
            bookings: MOCK_BOOKINGS,
            loading: false,

            fetchBookings: async () => {
                set({ loading: true });
                await new Promise((resolve) => setTimeout(resolve, 1000));
                set({ loading: false });
            },

            addBooking: async (booking) => {
                set({ loading: true });
                await new Promise((resolve) => setTimeout(resolve, 1000));
                const newBooking = { ...booking, id: `TKT-${Math.floor(Math.random() * 1000)}` };
                set((state) => ({ bookings: [newBooking, ...state.bookings], loading: false }));
                toast.success("Booking added successfully");
            },

            updateBookingStatus: async (id, status) => {
                set({ loading: true });
                await new Promise((resolve) => setTimeout(resolve, 1000));
                set((state) => ({
                    bookings: state.bookings.map((b) => (b.id === id ? { ...b, status } : b)),
                    loading: false,
                }));
                toast.success(`Booking marked as ${status}`);
            },

            deleteBooking: async (id) => {
                set({ loading: true });
                await new Promise((resolve) => setTimeout(resolve, 1000));
                set((state) => ({
                    bookings: state.bookings.filter((b) => b.id !== id),
                    loading: false,
                }));
                toast.success("Booking deleted successfully");
            },
        }),
        {
            name: "bookings-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
