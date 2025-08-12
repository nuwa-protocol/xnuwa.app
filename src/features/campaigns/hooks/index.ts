import { useEffect } from 'react';
import { useCampaignStore } from '../stores';

export const useCampaignTasks = () => {
  const { tasks, loading, error, fetchTasks, clearError } = useCampaignStore();

  useEffect(() => {
    fetchTasks();
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
    fetchStats();
  }, [stats, fetchStats]);

  return { stats, refresh: fetchStats };
};

export const useCampaignTaskActions = () => {
  const { completeTask } = useCampaignStore();

  return {
    completeTask,
  };
};
