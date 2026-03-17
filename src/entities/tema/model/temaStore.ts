import { create } from 'zustand';
import type { Tema } from '@/shared/types';

interface TemaState {
  grupos: Tema[];
  setGrupos: (grupos: Tema[]) => void;
}

export const useTemaStore = create<TemaState>()((set) => ({
  grupos: [],
  setGrupos: (grupos) => set({ grupos }),
}));
