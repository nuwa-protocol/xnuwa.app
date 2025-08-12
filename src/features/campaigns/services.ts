import type { CampaignCategory, CampaignStats, CampaignTask } from './types';

// Mock data for demonstration - in real app this would come from API
const mockTasks: CampaignTask[] = [
  {
    id: '1',
    title: 'Start Your First Chat',
    description: 'Create your first conversation with an AI assistant',
    category: 'completed',
    points: 100,
    difficulty: 'easy',
    completed: true,
    completedAt: new Date('2024-01-15'),
    icon: '💬',
  },
  {
    id: '2',
    title: 'Create Your First CAP',
    description: 'Design and create your first Conversational AI Program',
    category: 'ongoing',
    points: 250,
    difficulty: 'medium',
    completed: false,
    requirements: ['Complete "Start Your First Chat"'],
    icon: '🤖',
  },
  {
    id: '3',
    title: 'Daily Check-in',
    description: 'Visit the platform and check your dashboard',
    category: 'ongoing',
    points: 50,
    difficulty: 'easy',
    completed: false,
    icon: '📅',
  },
  {
    id: '4',
    title: 'Connect Your Wallet',
    description: 'Link your Web3 wallet to unlock advanced features',
    category: 'completed',
    points: 150,
    difficulty: 'easy',
    completed: true,
    completedAt: new Date('2024-01-10'),
    icon: '💳',
  },
  {
    id: '5',
    title: 'Power User Achievement',
    description: 'Create 10 different CAPs with unique prompts',
    category: 'ongoing',
    points: 500,
    difficulty: 'hard',
    completed: false,
    requirements: ['Complete "Create Your First CAP"'],
    icon: '⚡',
  },
  {
    id: '6',
    title: 'Daily Exploration',
    description: 'Try a new AI model or feature today',
    category: 'ongoing',
    points: 75,
    difficulty: 'medium',
    completed: false,
    icon: '🔍',
  },
];

const mockStats: CampaignStats = {
  totalPoints: 250,
  tasksCompleted: 2,
  totalTasks: 6,
};

export class CampaignService {
  async getCampaignTasks(): Promise<CampaignTask[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockTasks;
  }

  async getCampaignTask(id: string): Promise<CampaignTask | null> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockTasks.find((task) => task.id === id) || null;
  }

  async getCampaignStats(): Promise<CampaignStats> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockStats;
  }

  async getCampaignCategories(): Promise<CampaignCategory[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const categories: CampaignCategory[] = [
      {
        id: 'daily',
        name: 'Daily Tasks',
        description: 'Complete these every day',
        icon: '📅',
        tasks: mockTasks.filter((task) => task.category === 'daily'),
      },
      {
        id: 'ongoing',
        name: 'On-Going',
        description: 'Long-term goals and achievements',
        icon: '🎯',
        tasks: mockTasks.filter((task) => task.category === 'ongoing'),
      },
      {
        id: 'completed',
        name: 'Completed',
        description: 'Tasks you have finished',
        icon: '✅',
        tasks: mockTasks.filter((task) => task.category === 'completed'),
      },
    ];

    return categories;
  }

  async completeTask(taskId: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const taskIndex = mockTasks.findIndex((task) => task.id === taskId);
    if (taskIndex !== -1) {
      mockTasks[taskIndex].completed = true;
      mockTasks[taskIndex].completedAt = new Date();
      mockTasks[taskIndex].category = 'completed';
      return true;
    }
    return false;
  }
}

export const campaignService = new CampaignService();
