import { Bug, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AccountStore } from '@/features/auth/store';
import { Button } from '@/shared/components/ui/button';
import { useLanguage } from '@/shared/hooks/use-language';

export function AboutSection() {
  const { t } = useLanguage();
  const version = __APP_VERSION__;
  const { account, logout } = AccountStore();

  const createGitHubIssueURL = () => {
    const owner = 'nuwa-protocol';
    const repo = 'nuwa';
    const title = '[x402AI Feedback] PLEASE ENTER TITLE HERE';
    const body = `## Info\n- My DID: ${account?.address}\n- Client Version: ${version}\n\n## Description\n PLEASE DESCRIBE THE ISSUE HERE...`;
    const labels = ['uncategorized'];

    const baseURL = `https://github.com/${owner}/${repo}/issues/new`;
    const params = new URLSearchParams();

    params.append('title', title);
    params.append('body', body);
    params.append('labels', labels.join(','));

    return `${baseURL}?${params.toString()}`;
  };

  const handleLogout = () => {
    void logout();
  };

  return (
    <div className="space-y-6">
      {/* Version Info & Feedback */}
      <div className="rounded-lg border p-6">
        <div className="space-y-4">
          <div className="space-y-0.5">
            <h3 className="text-base font-medium">x402AI v{version}</h3>
            <div className="pt-2">
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs"
                onClick={() =>
                  window.open(
                    'https://github.com/nuwa-protocol/xnuwa/releases',
                    '_blank',
                  )
                }
              >
                View Release Notes
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="text-sm font-medium">Feedback</h4>
                <p className="text-xs text-muted-foreground">
                  Have any issues or suggestions? Please let us know!
                </p>
              </div>
              <Link
                to={createGitHubIssueURL()}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm">
                  <Bug className="h-4 w-4 mr-2" />
                  Submit Feedback
                </Button>
              </Link>
            </div>
          </div>
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="text-sm font-medium">Logout</h4>
                <p className="text-xs text-muted-foreground">
                  Sign out of your current session.
                </p>
              </div>
              <Button variant="destructive" size="sm" onClick={handleLogout}>
                Log out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
