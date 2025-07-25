import {
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Mail,
  MessageCircle,
  Share2,
  Twitter,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/shared/components';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
} from '@/shared/components/ui';
import { cn } from '@/shared/utils';

interface PublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  capName: string;
  capId?: string;
}

const publishSteps = [
  {
    id: 'submitted',
    title: 'Submitted',
    description: 'Your cap has been submitted for review',
    completed: true,
  },
  {
    id: 'review',
    title: 'Under Review',
    description: 'Our team is reviewing your cap for quality and safety',
    completed: false,
    inProgress: true,
  },
  {
    id: 'approved',
    title: 'Approved',
    description: 'Your cap has been approved and will be published',
    completed: false,
  },
  {
    id: 'published',
    title: 'Published',
    description: 'Your cap is now live in the Nuwa Cap Store',
    completed: false,
  },
];

export function PublishDialog({
  open,
  onOpenChange,
  capName,
  capId = 'cap_123',
}: PublishDialogProps) {
  const [shareUrl] = useState(`https://nuwa.ai/caps/${capId}`);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        type: 'success',
        description: 'Cap URL copied to clipboard',
      });
    } catch (error) {
      toast({
        type: 'error',
        description: 'Failed to copy URL to clipboard',
      });
    }
  };

  const handleShare = (platform: string) => {
    const text = `Check out my new cap "${capName}" on the Nuwa Cap Store!`;
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(shareUrl);

    let shareUrl_platform = '';
    switch (platform) {
      case 'twitter':
        shareUrl_platform = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'discord':
        shareUrl_platform = `https://discord.com/channels/@me?message=${encodedText} ${encodedUrl}`;
        break;
      case 'email':
        shareUrl_platform = `mailto:?subject=${encodeURIComponent(`New Cap: ${capName}`)}&body=${encodedText}%0A%0A${encodedUrl}`;
        break;
    }

    if (shareUrl_platform) {
      window.open(shareUrl_platform, '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
            Cap Submitted Successfully!
          </DialogTitle>
          <DialogDescription>
            "{capName}" has been submitted to the Nuwa Cap Store and is now
            under review.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Publication Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Publication Status</CardTitle>
              <CardDescription>
                Track your cap's journey to publication
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {publishSteps.map((step, index) => (
                  <div key={step.id} className="flex items-center space-x-4">
                    <div
                      className={cn(
                        'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors',
                        step.completed
                          ? 'bg-green-500 border-green-500 text-white'
                          : step.inProgress
                            ? 'bg-blue-500 border-blue-500 text-white'
                            : 'bg-muted border-muted-foreground/25 text-muted-foreground',
                      )}
                    >
                      {step.completed ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : step.inProgress ? (
                        <Clock className="h-4 w-4" />
                      ) : (
                        <span className="text-xs font-medium">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4
                        className={cn(
                          'font-medium',
                          step.completed || step.inProgress
                            ? 'text-foreground'
                            : 'text-muted-foreground',
                        )}
                      >
                        {step.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                    {step.inProgress && (
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        In Progress
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* What Happens Next */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">What Happens Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                  <div>
                    <p className="font-medium">Review Process (1-3 days)</p>
                    <p className="text-muted-foreground">
                      Our team will review your cap for quality, safety, and
                      compliance with our guidelines.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                  <div>
                    <p className="font-medium">Approval & Publication</p>
                    <p className="text-muted-foreground">
                      Once approved, your cap will be automatically published to
                      the store and available for download.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                  <div>
                    <p className="font-medium">Notifications</p>
                    <p className="text-muted-foreground">
                      You'll receive email notifications about status changes
                      and when your cap goes live.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Share Your Cap */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <Share2 className="h-4 w-4 mr-2" />
                Share Your Cap
              </CardTitle>
              <CardDescription>
                Get the word out about your new cap
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="flex-1 font-mono text-sm"
                />
                <Button onClick={handleCopyUrl} size="sm">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare('twitter')}
                >
                  <Twitter className="h-4 w-4 mr-2" />
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare('discord')}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Discord
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare('email')}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cap Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-muted-foreground">
                    0
                  </div>
                  <div className="text-xs text-muted-foreground">Downloads</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-muted-foreground">
                    0
                  </div>
                  <div className="text-xs text-muted-foreground">Reviews</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-muted-foreground">
                    -
                  </div>
                  <div className="text-xs text-muted-foreground">Rating</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Continue Developing
            </Button>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() =>
                  window.open(
                    `https://nuwa.ai/dashboard/caps/${capId}`,
                    '_blank',
                  )
                }
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View in Dashboard
              </Button>
              <Button onClick={() => onOpenChange(false)}>Done</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
