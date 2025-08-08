import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../shared/components/ui/card';
import { Button } from '../../../shared/components/ui/button';
import { Badge } from '../../../shared/components/ui/badge';
import { ArrowLeft, CheckCircle, Trophy, Users, Lightbulb } from 'lucide-react';
import { campaignService } from '../services';
import { useCampaignTaskActions } from '../hooks';
import type { CampaignTask } from '../types';

export function CampaignTaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { completeTask } = useCampaignTaskActions();
  const [task, setTask] = useState<CampaignTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const taskData = await campaignService.getCampaignTask(id);
        setTask(taskData);
      } catch (error) {
        console.error('Failed to fetch task:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  const handleCompleteTask = async () => {
    if (!task || task.completed) return;

    setCompleting(true);
    try {
      await completeTask(task.id);
      setTask((prev) =>
        prev
          ? {
              ...prev,
              completed: true,
              completedAt: new Date(),
              category: 'completed',
            }
          : null,
      );
    } catch (error) {
      console.error('Failed to complete task:', error);
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Task Not Found</h1>
            <Link to="/campaigns">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Campaigns
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

  const getCategoryColor = (category: CampaignTask['category']) => {
    switch (category) {
      case 'daily':
        return 'bg-theme-primary/20 text-theme-primary border-theme-primary/30';
      case 'ongoing':
        return 'bg-theme-primary/30 text-theme-primary border-theme-primary/50';
      case 'completed':
        return 'bg-theme-primary/40 text-theme-primary border-theme-primary/70';
      default:
        return 'bg-muted text-muted-foreground border-muted';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
          <Link to="/campaigns">
            <Button variant="outline" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Campaigns
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card
              className={`border-l-4 ${task.completed ? 'border-l-theme-primary bg-muted/30' : 'border-l-theme-primary/50'}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{task.icon}</span>
                    <div>
                      <CardTitle className="text-2xl">{task.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getCategoryColor(task.category)}>
                          {task.category}
                        </Badge>
                        <Badge className={getDifficultyColor(task.difficulty)}>
                          {task.difficulty}
                        </Badge>
                        {task.completed && (
                          <Badge
                            variant="outline"
                            className="border-theme-primary text-theme-primary"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-theme-primary" />
                      Description
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {task.description}
                    </p>
                  </div>

                  {task.requirements && task.requirements.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Users className="h-4 w-4 text-theme-primary" />
                        Requirements
                      </h3>
                      <ul className="space-y-1">
                        {task.requirements.map((requirement, index) => (
                          <li
                            key={`requirement-${index}-${requirement.slice(0, 10)}`}
                            className="text-sm text-muted-foreground flex items-center gap-2"
                          >
                            <div className="w-1.5 h-1.5 bg-theme-primary rounded-full flex-shrink-0"></div>
                            {requirement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {task.completedAt && (
                    <div>
                      <h3 className="font-semibold mb-2">Completion Details</h3>
                      <div className="text-sm text-theme-primary bg-theme-primary/5 p-3 rounded-lg border border-theme-primary/20">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          <span>
                            Completed on{' '}
                            {task.completedAt.toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-theme-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">Reward</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="bg-theme-primary/5 p-4 rounded-lg border border-theme-primary/20">
                    <Trophy className="h-8 w-8 text-theme-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-theme-primary">
                      {task.points}
                    </div>
                    <div className="text-sm text-muted-foreground">Points</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-theme-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {!task.completed && (
                    <Button
                      onClick={handleCompleteTask}
                      disabled={completing}
                      className="w-full bg-theme-primary hover:bg-theme-primary/90 text-white"
                      size="lg"
                    >
                      {completing ? 'Completing...' : 'Mark as Complete'}
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    className="w-full border-theme-primary/30 text-theme-primary hover:bg-theme-primary hover:text-white"
                    onClick={() => navigate('/campaigns')}
                  >
                    View All Tasks
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full text-muted-foreground hover:text-theme-primary hover:bg-theme-primary/5"
                  >
                    Share Achievement
                  </Button>
                </div>
              </CardContent>
            </Card>

            {task.unlockConditions && task.unlockConditions.length > 0 && (
              <Card className="border-theme-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg">Unlock Conditions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {task.unlockConditions.map((condition, index) => (
                      <li
                        key={`condition-${index}-${condition.slice(0, 10)}`}
                        className="text-sm text-muted-foreground flex items-start gap-2"
                      >
                        <div className="w-1.5 h-1.5 bg-theme-primary rounded-full flex-shrink-0 mt-2"></div>
                        {condition}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
