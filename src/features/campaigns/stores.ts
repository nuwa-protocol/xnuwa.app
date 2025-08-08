import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CampaignTask, CampaignStats } from './types';
import { campaignService } from './services';

interface CampaignStore {
  tasks: CampaignTask[];
  stats: CampaignStats | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchTasks: () => Promise<void>;
  fetchStats: () => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  clearError: () => void;
}

export const useCampaignStore = create<CampaignStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      stats: null,
      loading: false,
      error: null,

      fetchTasks: async () => {
        set({ loading: true, error: null });
        try {
          const tasks = await campaignService.getCampaignTasks();
          set({ tasks, loading: false });
        } catch (error) {
          set({ error: 'Failed to fetch campaign tasks', loading: false });
        }
      },

      fetchStats: async () => {
        try {
          const stats = await campaignService.getCampaignStats();
          set({ stats });
        } catch (error) {
          set({ error: 'Failed to fetch campaign stats' });
        }
      },

      completeTask: async (taskId: string) => {
        set({ loading: true, error: null });
        try {
          const success = await campaignService.completeTask(taskId);
          if (success) {
            const { tasks } = get();
            const updatedTasks = tasks.map((task) =>
              task.id === taskId
                ? { ...task, completed: true, completedAt: new Date() }
                : task,
            );
            set({ tasks: updatedTasks, loading: false });

            // Refresh stats
            get().fetchStats();
          } else {
            set({ error: 'Failed to complete task', loading: false });
          }
        } catch (error) {
          set({ error: 'Failed to complete task', loading: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'campaign-storage',
      partialize: (state) => ({
        tasks: state.tasks,
        stats: state.stats,
      }),
    },
  ),
);
