import { create } from 'zustand';
import type { SelectedActivity, Atividade } from '@/shared/types';

type SelectedActivityT = SelectedActivity;
type AtividadeT = Atividade;

interface AtividadeState {
  selectedActivities: SelectedActivityT[];
  atividades: AtividadeT[];

  addActivity: (activity: Omit<SelectedActivityT, 'prioridade'>) => void;
  removeActivity: (id: number) => void;
  setPrimary: (id: number) => void;
  clearActivities: () => void;
  setAtividades: (atividades: AtividadeT[]) => void;
}

export const useAtividadeStore = create<AtividadeState>()((set, get) => ({
  selectedActivities: [],
  atividades: [],

  addActivity: (activity) => {
    const { selectedActivities } = get();
    if (selectedActivities.find(a => a.id === activity.id)) return;
    const prioridade: 'Primaria' | 'Secundaria' = selectedActivities.length === 0 ? 'Primaria' : 'Secundaria';
    set({ selectedActivities: [...selectedActivities, { ...activity, prioridade }] });
  },

  removeActivity: (id) => {
    let activities = get().selectedActivities.filter(a => a.id !== id);
    if (activities.length > 0 && !activities.find(a => a.prioridade === 'Primaria')) {
      activities = activities.map((a, i) => i === 0 ? { ...a, prioridade: 'Primaria' as const } : a);
    }
    set({ selectedActivities: activities });
  },

  setPrimary: (id) => {
    const activities = get().selectedActivities.map(a => ({
      ...a,
      prioridade: (a.id === id ? 'Primaria' : 'Secundaria') as 'Primaria' | 'Secundaria',
    }));
    set({ selectedActivities: activities });
  },

  clearActivities: () => set({ selectedActivities: [] }),

  setAtividades: (atividades) => set({ atividades }),
}));
