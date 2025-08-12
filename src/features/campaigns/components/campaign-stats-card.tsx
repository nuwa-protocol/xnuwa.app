import { Target, Trophy } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../shared/components/ui/card';
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
              {Array.from({ length: 2 }, () => (
                <div key={`skeleton-${Math.random()}`} className="space-y-2">
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

  return (
    <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background via-background to-muted/20">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-theme-primary/5 via-transparent to-theme-primary/5" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-theme-primary/10 rounded-full -translate-y-16 translate-x-16 blur-2xl" />

      <CardHeader className="relative pb-4">
        <div className="flex items-center gap-3">
          <Trophy className="size-6 text-primary" />
          <div>
            <CardTitle className="text-lg font-semibold">
              Your Campaign Progress
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Track your achievements
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="p-1.5 rounded-md bg-primary/10">
              <Trophy className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                {stats.totalPoints}
              </div>
              <div className="text-sm font-medium text-muted-foreground">
                Total Points
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="p-1.5 rounded-md bg-primary/10">
              <Target className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                {stats.tasksCompleted}
              </div>
              <div className="text-sm font-medium text-muted-foreground">
                Tasks Completed
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
