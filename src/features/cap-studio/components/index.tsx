import { Bug, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { CurrentCapStore } from '@/shared/stores/current-cap-store';
import type { LocalCap } from '../types';
import { DashboardHeader, DashboardLayout } from './layout/dashboard-layout';
import { MyCaps } from './my-caps';
import { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
// No registry link here; direct users to /explore to choose a registry

export function CapStudio() {
  const navigate = useNavigate();
  const { setCurrentCap } = CurrentCapStore();
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);

  const handleEditCap = (cap: LocalCap) => {
    navigate(`/agent-studio/edit/${cap.id}`);
  };

  const handleTestCap = (cap: LocalCap) => {
    // Set this cap as the current cap for testing
    setCurrentCap(cap);
    navigate(`/chat`);
  };

  const handleSubmitCap = (cap: LocalCap) => {
    navigate(`/agent-studio/submit/${cap.id}`);
  };

  const handleCreateNew = () => {
    navigate('/agent-studio/create');
  };

  const handleGoToMcp = () => {
    navigate('/agent-studio/mcp');
  };

  // Intentional: we don't link a specific registry here; users can choose in /explore

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Agent Studio"
        description="Agent Studio allows you to create Agents and test it. Create, test, and publish powerful AI agents with integrated MCP tools"
        actions={
          <div className="flex flex-col space-y-2">
            <Button onClick={handleGoToMcp} variant="outline" size="sm">
              <Bug className="mr-1" /> MCP Debug Tool
            </Button>
            <Button
              onClick={() => setPublishDialogOpen(true)}
              variant="secondary"
              size="sm"
            >
              <Upload className="mr-1" /> Publish to ERC8004
            </Button>
          </div>
        }
      />

      <MyCaps
        onEditCap={handleEditCap}
        onTestCap={handleTestCap}
        onSubmitCap={handleSubmitCap}
        onCreateNew={handleCreateNew}
      />

      {/* How To Publish (ERC8004) */}
      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Publish Your Agent to ERC8004</DialogTitle>
            <DialogDescription>
              Follow these steps to make your agent discoverable via an
              ERC-8004 registry.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm">
            <div>
              <div className="font-medium">1) Export the ERC8004 JSON</div>
              <p className="text-muted-foreground">
                In Agent Studio, open your agent card menu and choose
                <span className="mx-1 font-medium">Export 8004 JSON</span>
                to download the JSON that describes your agent and endpoints.
              </p>
            </div>

            <div>
              <div className="font-medium">2) Host the JSON (IPFS or Gist)</div>
              <p className="text-muted-foreground">
                Upload the exported JSON to a public, immutable URL. Common
                options include IPFS (e.g. Pinata, web3.storage) or a GitHub
                Gist (Raw URL). Make sure the final link is an http(s) URL that
                returns the JSON content directly.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <a
                  className="underline text-primary"
                  href="https://app.pinata.cloud/pinmanager"
                  target="_blank"
                  rel="noreferrer"
                >
                  Pinata (IPFS)
                </a>
                <a
                  className="underline text-primary"
                  href="https://web3.storage"
                  target="_blank"
                  rel="noreferrer"
                >
                  web3.storage
                </a>
                <a
                  className="underline text-primary"
                  href="https://gist.github.com/new"
                  target="_blank"
                  rel="noreferrer"
                >
                  Create a Gist
                </a>
              </div>
            </div>

            <div>
              <div className="font-medium">
                3) Register the URL as the tokenURI on the Registry
              </div>
              <p className="text-muted-foreground">
                Visit the Explore page to see available registries and pick the
                right one for your agent. Then go to that registry contract and
                call its register function to set the <span className="font-medium">tokenURI</span>
                {' '}to the URL from Step 2.
              </p>

              <div className="mt-2 text-sm text-muted-foreground">
                Tip: Open <a href="/explore" className="underline text-primary">/explore</a>
                {' '}to browse registries. After your transaction confirms, your
                agent will show up in the selected registry.
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setPublishDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
