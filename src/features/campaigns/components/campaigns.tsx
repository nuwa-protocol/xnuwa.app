import { CheckCircle, Target } from 'lucide-react';
import { useState } from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../shared/components/ui/tabs';
import { useCampaignTasks } from '../hooks';
import { CampaignStatsCard } from './campaign-stats-card';
import { CampaignTaskCard } from './task-card';

export function Campaigns() {
  const { tasks, loading } = useCampaignTasks();
  const [selectedCategory, setSelectedCategory] = useState<string>('ongoing');

  const filteredTasks = tasks.filter((task) => {
    if (selectedCategory === 'ongoing') return task.category === 'ongoing';
    if (selectedCategory === 'completed') return task.category === 'completed';
    return true;
  });

  const categories = [
    { id: 'ongoing', name: 'On-Going', icon: Target },
    { id: 'completed', name: 'Completed', icon: CheckCircle },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-muted rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }, () => (
                <div
                  key={`skeleton-${Math.random()}`}
                  className="h-32 bg-muted rounded"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Complete tasks to earn Nuwa points!
          </p>
        </div>

        <CampaignStatsCard />

        <div className="mt-8">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{category.name}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value={selectedCategory} className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                {filteredTasks.map((task) => (
                  <CampaignTaskCard key={task.id} task={task} />
                ))}
              </div>

              {filteredTasks.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-muted-foreground mb-4">
                    {selectedCategory === 'ongoing' && 'No on-going tasks'}
                    {selectedCategory === 'completed' &&
                      'No completed tasks yet'}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedCategory === 'ongoing' &&
                      'Check back later for new tasks'}
                    {selectedCategory === 'completed' &&
                      'Complete some tasks to see them here'}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
