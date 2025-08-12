import { CheckCircle, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
    Card, CardContent, CardHeader, CardTitle
} from '../../../shared/components/ui/card';
import type { CampaignTask } from '../types';

export const CampaignTaskCard = ({ task }: { task: CampaignTask }) => {
    return (
        <Link to={`/campaigns/task/${task.id}`} className="block">
            <Card
                key={task.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-l-4 ${task.completed ? 'bg-muted/30 border-l-primary' : 'border-l-primary/50'
                    }`}
            >
                <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">{task.icon}</span>
                            <div className="space-y-1">
                                <CardTitle className="text-lg leading-tight">
                                    {task.title}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {task.description}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="flex items-center justify-start">
                        <div className="flex items-center gap-1">
                            <Trophy className="h-4 w-4 text-primary" />
                            <span className="font-semibold text-primary">
                                {task.points} pts
                            </span>
                        </div>
                    </div>

                    {task.completedAt && (
                        <div className="text-xs text-primary mt-3 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Completed on {new Date(task.completedAt).toLocaleDateString()}
                        </div>
                    )}
                </CardContent>
            </Card>
        </Link>
    );
};
