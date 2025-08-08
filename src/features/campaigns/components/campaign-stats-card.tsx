import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../shared/components/ui/card';
import { Trophy, Target } from 'lucide-react';
import { useCampaignStats } from '../hooks';

export function CampaignStatsCard() {
  const { stats } = useCampaignStats();

  if (!stats) {
    return (
      <div className="animate-pulse">
        <Card>
          <CardHeader>
            <div className="h-6 bg-muted rounded w-1/3"></div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 2 }, (_, i) => (
                <div key={`skeleton-${i}`} className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completionPercentage = (stats.tasksCompleted / stats.totalTasks) * 100;

  return (
    <Card className="border-theme-primary/20 bg-theme-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Trophy className="h-6 w-6 text-theme-primary" />
          Your Campaign Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-theme-primary/10 p-3 rounded-lg">
              <Trophy className="h-6 w-6 text-theme-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-theme-primary">
                {stats.totalPoints}
              </div>
              <div className="text-sm text-muted-foreground">Total Points</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-theme-primary/10 p-3 rounded-lg">
              <Target className="h-6 w-6 text-theme-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-theme-primary">
                {stats.tasksCompleted}/{stats.totalTasks}
              </div>
              <div className="text-sm text-muted-foreground">
                Tasks Completed
              </div>
              <div className="text-xs text-theme-primary">
                {Math.round(completionPercentage)}% complete
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
