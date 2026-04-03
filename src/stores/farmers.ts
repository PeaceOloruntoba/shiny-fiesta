// stores/farmers.ts
import { create } from 'zustand';

export interface Farmer {
  id: string;
  farmName: string;
  town: string;
  capacity: string;
  batches: string;
  status: 'Active' | 'Inactive';
  dateJoined: string;
}

const dummyFarmers: Farmer[] = [
  { id: '1', farmName: 'Genesis Farms', town: 'Abeokuta, Ogun State', batches: '400', capacity: '2,000', dateJoined: 'Aug. 14, 2026', status: 'Active' },
  { id: '2', farmName: 'Genesis Farms', town: 'Ibadan, Oyo State', batches: '200', capacity: '2,500', dateJoined: 'Dec. 15, 2026', status: 'Inactive' },
  { id: '3', farmName: 'Elysium Gardens', town: 'Ilorin, Kwara State', batches: '201', capacity: '3,000', dateJoined: 'July 16, 2026', status: 'Active' },
  { id: '4', farmName: 'Verdant Valley', town: 'Oyo Town, Oyo State', batches: '202', capacity: '3,500', dateJoined: 'June 17, 2026', status: 'Active' },
  { id: '5', farmName: 'Harvest Moon Orchards', town: 'Iseyin, Oyo State', batches: '203', capacity: '4,000', dateJoined: 'Feb. 18, 2026', status: 'Active' },
];

interface FarmerStore {
  farmers: Farmer[];
  loading: boolean;
  selectedIds: string[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  fetchFarmers: (params?: any) => Promise<void>;
  toggleSelection: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  deleteFarmers: (ids: string[]) => Promise<void>;
}

export const useFarmerStore = create<FarmerStore>((set, _get) => ({
  farmers: dummyFarmers, // Start with dummy data
  loading: false,
  selectedIds: [],
  pagination: { page: 1, limit: 10, total: 5, totalPages: 1 },

  fetchFarmers: async (params) => {
    // Logic for actual API call...
    console.log("Fetching with:", params);
  },

  deleteFarmers: async (ids) => {
    // Simulate API delay
    set({ loading: true });
    await new Promise(resolve => setTimeout(resolve, 800)); 
    
    set((state) => ({
      farmers: state.farmers.filter(f => !ids.includes(f.id)),
      selectedIds: [],
      loading: false
    }));
  },

  toggleSelection: (id) => set((state) => ({
    selectedIds: state.selectedIds.includes(id) 
      ? state.selectedIds.filter(i => i !== id) 
      : [...state.selectedIds, id]
  })),
  selectAll: () => set((state) => ({ selectedIds: state.farmers.map(f => f.id) })),
  clearSelection: () => set({ selectedIds: [] }),
}));