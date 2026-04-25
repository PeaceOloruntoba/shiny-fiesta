import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "sonner";
import { api } from "../utils/api";

export type User = {
    id: string;
    name: string;
    email: string;
    matric_number: string;
    phone: string;
    role: "user" | "admin";
    profile_image: string | null;
    created_at: string;
    updated_at: string;
};

export type UserStats = {
    total_users: string;
    admin_count: string;
    user_count: string;
    new_users_30d: string;
};

type UserState = {
    users: User[];
    stats: UserStats | null;
    loading: boolean;

    // Actions
    fetchUsers: () => Promise<void>;
    fetchUserStats: () => Promise<void>;
    updateUser: (id: string, data: Partial<User>) => Promise<void>;
};

export const useUsers = create<UserState>()(
    persist(
        (set) => ({
            users: [],
            stats: null,
            loading: false,

            fetchUsers: async () => {
                set({ loading: true });
                try {
                    const res = await api.get("/admin/users");
                    set({ users: res.data.data, loading: false });
                } catch (error: any) {
                    toast.error("Failed to fetch users", {
                        description: error.response?.data?.message || "An error occurred",
                    });
                    set({ loading: false });
                }
            },

            fetchUserStats: async () => {
                try {
                    const res = await api.get("/admin/users/stats");
                    set({ stats: res.data.data });
                } catch (error: any) {
                    console.error("Failed to fetch user stats", error);
                }
            },

            updateUser: async (id, data) => {
                set({ loading: true });
                try {
                    const res = await api.patch(`/admin/users/${id}`, data);
                    set((state) => ({
                        users: state.users.map((u) => (u.id === id ? { ...u, ...res.data.data } : u)),
                        loading: false,
                    }));
                    toast.success("User updated successfully");
                } catch (error: any) {
                    toast.error("Failed to update user", {
                        description: error.response?.data?.message || "An error occurred",
                    });
                    set({ loading: false });
                }
            },
        }),
        {
            name: "users-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
