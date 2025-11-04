import { Copy, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/shared/components';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { useAuth } from '@/shared/hooks';
import { useCopyToClipboard } from '@/shared/hooks/use-copy-to-clipboard';

interface TestnetFaucetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TestnetFaucetDialog({
  open,
  onOpenChange,
}: TestnetFaucetDialogProps) {
  const { did } = useAuth();
  const [copy] = useCopyToClipboard();
  const handleDiscordClick = () => {
    // Open Discord link
    window.open('https://discord.gg/nuwaai', '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[650px]">
        <DialogHeader>
          <DialogDescription className=" text-sm text-muted-foreground">
            Need more testnet balance?
          </DialogDescription>
          <DialogTitle className=" text-lg font-medium text-primary">
            Join x402AI Discord to get free testnet balance
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center mb-6 w-full">
          <div className="flex flex-col gap-4 p-6 bg-gradient-to-b from-muted/30 to-muted/50 rounded-xl border border-border/50 w-full">
            <div className="flex items-center gap-4 w-full">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-full flex items-center justify-center text-base font-semibold shadow-sm flex-shrink-0">
                1
              </div>
              <span className="text-md font-medium">Join Discord</span>
            </div>
            <div className="flex items-center gap-4 w-full">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-full flex items-center justify-center text-base font-semibold shadow-sm flex-shrink-0">
                2
              </div>
              <div className="flex flex-col">
                <span className="text-md font-medium">
                  Go To{' '}
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    #testnet-faucet
                  </code>{' '}
                  Channel
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 w-full">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-full flex items-center justify-center text-base font-semibold shadow-sm flex-shrink-0">
                3
              </div>
              <div className="flex flex-col">
                <span className="text-md font-medium">
                  Request tokens with{' '}
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    /faucet
                  </code>{' '}
                  command
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 w-full ">
          <span className="text-md font-medium w-full">
            Don't forget to copy your DID :)
          </span>
          <div className="flex flex-row w-full items-left justify-start">
            <Badge
              variant="outline"
              className="min-h-[40px] flex items-center text-xs leading-tight w-full cursor-pointer"
              onClick={() => {
                copy(did || '');
                toast.success('DID Copied!');
              }}
            >
              <span className="flex-1 text-left whitespace-pre-line font-mono">
                {did}
              </span>
              <Copy className="w-4 h-4 flex-shrink-0" />
            </Badge>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button
            onClick={handleDiscordClick}
            variant="primary"
            className="w-full"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Join Discord
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
