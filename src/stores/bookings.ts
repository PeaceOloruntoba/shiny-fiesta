import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "sonner";
import { api } from "../utils/api";

export type Booking = {
    id: string;
    user_id: string;
    user_name?: string;
    user_email?: string;
    route_id: string;
    origin?: string;
    destination?: string;
    departure_time: string;
    booking_date: string;
    seats: number[];
    status: "confirmed" | "used" | "cancelled";
    total_fare: number;
    payment_status: "pending" | "paid" | "failed";
    payment_reference?: string;
    created_at: string;
};

type BookingsState = {
    bookings: Booking[];
    loading: boolean;

    // Actions
    fetchBookings: () => Promise<void>;
    updateBookingStatus: (id: string, status: Booking["status"]) => Promise<void>;
    deleteBooking: (id: string) => Promise<void>;
};

export const useBookings = create<BookingsState>()(
    persist(
        (set) => ({
            bookings: [],
            loading: false,

            fetchBookings: async () => {
                set({ loading: true });
                try {
                    const res = await api.get("/admin/bookings");
                    set({ bookings: res.data.data, loading: false });
                } catch (error: any) {
                    toast.error("Failed to fetch bookings", {
                        description: error.response?.data?.message || "An error occurred",
                    });
                    set({ loading: false });
                }
            },

            updateBookingStatus: async (id, status) => {
                set({ loading: true });
                try {
                    const res = await api.patch(`/admin/bookings/${id}`, { status });
                    set((state) => ({
                        bookings: state.bookings.map((b) => (b.id === id ? res.data.data : b)),
                        loading: false,
                    }));
                    toast.success(`Booking marked as ${status}`);
                } catch (error: any) {
                    toast.error("Failed to update booking", {
                        description: error.response?.data?.message || "An error occurred",
                    });
                    set({ loading: false });
                }
            },

            deleteBooking: async (id) => {
                set({ loading: true });
                try {
                    await api.delete(`/admin/bookings/${id}`);
                    set((state) => ({
                        bookings: state.bookings.filter((b) => b.id !== id),
                        loading: false,
                    }));
                    toast.success("Booking deleted successfully");
                } catch (error: any) {
                    toast.error("Failed to delete booking", {
                        description: error.response?.data?.message || "An error occurred",
                    });
                    set({ loading: false });
                }
            },
        }),
        {
            name: "bookings-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
