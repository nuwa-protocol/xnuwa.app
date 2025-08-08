export interface CampaignTask {
  id: string;
  title: string;
  description: string;
  category: 'daily' | 'ongoing' | 'completed';
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  requirements?: string[];
  completed: boolean;
  completedAt?: Date;
  icon?: string;
  unlockConditions?: string[];
}

export interface CampaignStats {
  totalPoints: number;
  tasksCompleted: number;
  totalTasks: number;
}

export interface CampaignCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  tasks: CampaignTask[];
}
