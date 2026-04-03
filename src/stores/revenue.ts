import { create } from 'zustand';

interface Transaction {
  id: string;
  transactionId: string;
  userType: 'Farmer' | 'Veterinary' | 'Professional';
  paymentType: 'Subscription' | 'Service Fee';
  amount: number;
  date: string;
  status: 'Completed' | 'Pending' | 'Failed';
}

interface RevenueState {
  revenue: Transaction[];
  selectedIds: string[];
  isLoading: boolean;
  pagination: {
    page: number;
    total: number;
    totalPages: number;
  };
  // Actions
  fetchRevenue: (params?: { search?: string; page?: number }) => Promise<void>;
  toggleSelection: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  deleteTransactions: (ids: string[]) => Promise<void>;
}

// Dummy Data Helper
const DUMMY_DATA: Transaction[] = [
  { id: '1', transactionId: 'ID90777844', userType: 'Farmer', paymentType: 'Subscription', amount: 250000, date: 'Aug. 14, 2026', status: 'Completed' },
  { id: '2', transactionId: 'ID90777845', userType: 'Veterinary', paymentType: 'Service Fee', amount: 250000, date: 'Dec. 15, 2026', status: 'Completed' },
  { id: '3', transactionId: 'ID90777846', userType: 'Professional', paymentType: 'Subscription', amount: 250000, date: 'July 16, 2026', status: 'Completed' },
  { id: '4', transactionId: 'ID90777847', userType: 'Farmer', paymentType: 'Service Fee', amount: 250000, date: 'June 17, 2026', status: 'Completed' },
  { id: '5', transactionId: 'ID90777848', userType: 'Veterinary', paymentType: 'Subscription', amount: 250000, date: 'Feb. 18, 2026', status: 'Pending' },
  { id: '6', transactionId: 'ID90777849', userType: 'Professional', paymentType: 'Service Fee', amount: 250000, date: 'March 19, 2026', status: 'Pending' },
  { id: '7', transactionId: 'ID90777850', userType: 'Farmer', paymentType: 'Subscription', amount: 250000, date: 'April 20, 2026', status: 'Pending' },
  { id: '8', transactionId: 'ID90777851', userType: 'Veterinary', paymentType: 'Service Fee', amount: 250000, date: 'May 21, 2026', status: 'Failed' },
  { id: '9', transactionId: 'ID90777852', userType: 'Professional', paymentType: 'Subscription', amount: 250000, date: 'Aug. 14, 2026', status: 'Completed' },
  { id: '10', transactionId: 'ID90777853', userType: 'Farmer', paymentType: 'Service Fee', amount: 250000, date: 'Dec. 15, 2026', status: 'Failed' },
];

export const useRevenueStore = create<RevenueState>((set, get) => ({
  revenue: [],
  selectedIds: [],
  isLoading: false,
  pagination: {
    page: 1,
    total: 60,
    totalPages: 6,
  },

  fetchRevenue: async (params) => {
    set({ isLoading: true });
    
    // Simulate a 2-second API delay for fetching
    await new Promise((resolve) => setTimeout(resolve, 2000));

    let filteredData = [...DUMMY_DATA];
    
    if (params?.search) {
      filteredData = DUMMY_DATA.filter(item => 
        item.transactionId.toLowerCase().includes(params.search!.toLowerCase()) ||
        item.userType.toLowerCase().includes(params.search!.toLowerCase())
      );
    }

    set({ 
      revenue: filteredData, 
      isLoading: false,
      pagination: { ...get().pagination, page: params?.page || 1 }
    });
  },

  toggleSelection: (id) => {
    const { selectedIds } = get();
    set({
      selectedIds: selectedIds.includes(id)
        ? selectedIds.filter((sid) => sid !== id)
        : [...selectedIds, id],
    });
  },

  selectAll: () => {
    set({ selectedIds: get().revenue.map((r) => r.id) });
  },

  clearSelection: () => {
    set({ selectedIds: [] });
  },

  deleteTransactions: async (ids) => {
    set({ isLoading: true });

    // Simulate a 3-second API delay for deletion
    await new Promise((resolve) => setTimeout(resolve, 3000));

    set((state) => ({
      revenue: state.revenue.filter((item) => !ids.includes(item.id)),
      selectedIds: [],
      isLoading: false,
    }));
  },
}));