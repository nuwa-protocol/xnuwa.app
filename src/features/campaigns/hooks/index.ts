import { useEffect } from 'react';
import { useCampaignStore } from '../stores';

export const useCampaignTasks = () => {
  const { tasks, loading, error, fetchTasks, clearError } = useCampaignStore();

  useEffect(() => {
    if (tasks.length === 0) {
      fetchTasks();
    }
  }, [tasks.length, fetchTasks]);

  return {
    tasks,
    loading,
    error,
    refresh: fetchTasks,
    clearError,
  };
};

export const useCampaignStats = () => {
  const { stats, fetchStats } = useCampaignStore();

  useEffect(() => {
    if (!stats) {
      fetchStats();
    }
  }, [stats, fetchStats]);

  return { stats, refresh: fetchStats };
};

export const useCampaignTaskActions = () => {
  const { completeTask } = useCampaignStore();

  return {
    completeTask,
  };
};
