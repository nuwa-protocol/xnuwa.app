import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../shared/components/ui/card';
import { Badge } from '../../../shared/components/ui/badge';
import { Button } from '../../../shared/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../shared/components/ui/tabs';
import { CheckCircle, Calendar, Target, Trophy } from 'lucide-react';
import { useCampaignTasks } from '../hooks';
import type { CampaignTask } from '../types';
import { CampaignStatsCard } from './campaign-stats-card';

export function Campaigns() {
  const { tasks, loading } = useCampaignTasks();
  const [selectedCategory, setSelectedCategory] = useState<string>('daily');

  const filteredTasks = tasks.filter((task) => {
    if (selectedCategory === 'daily') return task.category === 'daily';
    if (selectedCategory === 'ongoing') return task.category === 'ongoing';
    if (selectedCategory === 'completed') return task.category === 'completed';
    return true;
  });

  const categories = [
    { id: 'daily', name: 'Daily', icon: Calendar },
    { id: 'ongoing', name: 'On-Going', icon: Target },
    { id: 'completed', name: 'Completed', icon: CheckCircle },
  ];

  const getDifficultyColor = (difficulty: CampaignTask['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-theme-primary/20 text-theme-primary border-theme-primary/30';
      case 'medium':
        return 'bg-theme-primary/30 text-theme-primary border-theme-primary/50';
      case 'hard':
        return 'bg-theme-primary/40 text-theme-primary border-theme-primary/70';
      default:
        return 'bg-muted text-muted-foreground border-muted';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-muted rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }, (_, i) => (
                <div
                  key={`skeleton-${i}`}
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
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-theme-primary">
            Campaigns
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Complete tasks to earn points and unlock achievements
          </p>
        </div>

        <CampaignStatsCard />

        <div className="mt-8">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="flex items-center gap-2 data-[state=active]:bg-theme-primary/10 data-[state=active]:text-theme-primary"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{category.name}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value={selectedCategory} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTasks.map((task) => (
                  <Card
                    key={task.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-l-4 ${
                      task.completed
                        ? 'bg-muted/30 border-l-theme-primary'
                        : 'border-l-theme-primary/50'
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{task.icon}</span>
                          <div>
                            <CardTitle className="text-lg leading-tight">
                              {task.title}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                variant="outline"
                                className={getDifficultyColor(task.difficulty)}
                              >
                                {task.difficulty}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {task.completed && (
                          <CheckCircle className="h-5 w-5 text-theme-primary flex-shrink-0" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-3">
                        {task.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Trophy className="h-4 w-4 text-theme-primary" />
                          <span className="font-semibold text-theme-primary">
                            {task.points} pts
                          </span>
                        </div>
                        <Link to={`/campaigns/task/${task.id}`}>
                          <Button
                            size="sm"
                            variant={task.completed ? 'outline' : 'default'}
                            className={
                              task.completed
                                ? 'border-theme-primary text-theme-primary hover:bg-theme-primary hover:text-white'
                                : 'bg-theme-primary hover:bg-theme-primary/90 text-white'
                            }
                          >
                            {task.completed ? 'View' : 'Details'}
                          </Button>
                        </Link>
                      </div>

                      {task.completedAt && (
                        <div className="text-xs text-theme-primary mt-2 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Completed on{' '}
                          {new Date(task.completedAt).toLocaleDateString()}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredTasks.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-muted-foreground mb-4">
                    {selectedCategory === 'daily' && 'No daily tasks available'}
                    {selectedCategory === 'ongoing' && 'No on-going tasks'}
                    {selectedCategory === 'completed' &&
                      'No completed tasks yet'}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedCategory === 'daily' &&
                      'Check back tomorrow for new daily tasks'}
                    {selectedCategory === 'ongoing' &&
                      'Start with some daily tasks first'}
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
