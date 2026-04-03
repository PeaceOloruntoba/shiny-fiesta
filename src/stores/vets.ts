import { create } from 'zustand';

interface Vet {
  id: string;
  name: string;
  licenceNumber: string;
  specialization: string;
  dateJoined: string;
  email: string;
}

interface VetState {
  vets: Vet[];
  selectedIds: string[];
  isLoading: boolean;
  pagination: { page: number; total: number; totalPages: number; };
  fetchVets: (params?: { search?: string; page?: number }) => Promise<void>;
  toggleSelection: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  deleteVets: (ids: string[]) => Promise<void>;
}

const DUMMY_VETS: Vet[] = [
  { id: '1', name: 'Green Pastures Vet Clinic', licenceNumber: 'EPE-987-123', specialization: 'Consultant', dateJoined: 'Aug. 14, 2026', email: 'greenpastures@gmail.com' },
  { id: '2', name: 'Happy Tails Animal Hospital', licenceNumber: 'BAD-654-321', specialization: 'Consultant', dateJoined: 'Dec. 15, 2026', email: 'happytails@gmail.com' },
  { id: '3', name: 'Noble Paws Veterinary Care', licenceNumber: 'ILR-987-654', specialization: 'Consultant', dateJoined: 'July 16, 2026', email: 'happytails@gmail.com' },
];

export const useVetStore = create<VetState>((set, _get) => ({
  vets: [],
  selectedIds: [],
  isLoading: false,
  pagination: { page: 1, total: 60, totalPages: 4 },

  fetchVets: async (params) => {
    set({ isLoading: true });
    await new Promise(r => setTimeout(r, 2000));
    set({ 
      vets: params?.search ? DUMMY_VETS.filter(v => v.name.toLowerCase().includes(params.search!.toLowerCase())) : DUMMY_VETS, 
      isLoading: false 
    });
  },

  toggleSelection: (id) => set(s => ({ 
    selectedIds: s.selectedIds.includes(id) ? s.selectedIds.filter(i => i !== id) : [...s.selectedIds, id] 
  })),
  selectAll: () => set(s => ({ selectedIds: s.vets.map(v => v.id) })),
  clearSelection: () => set({ selectedIds: [] }),
  deleteVets: async (ids) => {
    set({ isLoading: true });
    await new Promise(r => setTimeout(r, 3000));
    set(s => ({ vets: s.vets.filter(v => !ids.includes(v.id)), selectedIds: [], isLoading: false }));
  }
}));