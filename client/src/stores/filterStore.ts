import { create } from 'zustand';
import { TransactionFilters } from '../types';

interface FilterState {
  filters: TransactionFilters;
}

interface FilterActions {
  setFilters: (newFilters: Partial<TransactionFilters>) => void;
  clearFilters: () => void; // Renamed from resetFilters
}

const initialFilters: TransactionFilters = {
  transactionType: undefined,
  accountId: undefined,
  startDate: undefined,
  endDate: undefined,
  minAmount: undefined,
  maxAmount: undefined,
  keyword: undefined,
  createdById: undefined,
};

export const useFilterStore = create<FilterState & FilterActions>((set) => ({
  filters: initialFilters,

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  clearFilters: () => {
    // Renamed from resetFilters
    set({ filters: initialFilters });
  },
}));
