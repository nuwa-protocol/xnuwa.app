import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import nuwaAtAGlance from '@/assets/nuwa-at-a-glance.png';
import nuwaAtAGlanceDark from '@/assets/nuwa-at-a-glance-dark.png';
import { Logo } from '@/shared/components/logo';
import { useTheme } from '@/shared/components/theme-provider';
import { Button } from '@/shared/components/ui';
import { GridPattern } from '@/shared/components/ui/shadcn-io/grid-pattern';

type PublicLandingProps = {
  onOpenAuth: () => void;
};

// Removed feature/protocol/workflow definitions along with their sections below the hero.

const getFadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay },
  viewport: { once: true, amount: 0.4 },
});

export function PublicLanding({ onOpenAuth }: PublicLandingProps) {
  const { resolvedTheme } = useTheme();
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute inset-x-0 top-[-30%] h-[60vh] bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.25),_transparent_60%)] blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-[40vh] bg-[radial-gradient(circle_at_bottom,_rgba(16,185,129,0.18),_transparent_70%)] blur-3xl" />
      </div>

      <GridPattern
        width={80}
        height={80}
        strokeDasharray="4 8"
        className="fill-transparent stroke-border/60 dark:stroke-border/20 opacity-70"
      />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="sticky top-0 border-b border-border/40 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <Logo variant="basic" size="md" className="px-0" />
            </div>
            <div className="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
              <Button variant="ghost" size="sm" asChild>
                <a
                  href="https://nuwa.dev"
                  target="_blank"
                  rel="noreferrer"
                >
                  Home
                </a>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a
                  href="https://docs.nuwa.dev"
                  target="_blank"
                  rel="noreferrer"
                >
                  Docs
                </a>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a
                  href="https://github.com/nuwa-protocol"
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub
                </a>
              </Button>
              <Button size="sm" onClick={onOpenAuth}>
                Enter App
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1">
          {/* Hero */}
          <section className="px-6 py-16 sm:py-24">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 lg:flex-row lg:items-center">
              <motion.div className="flex-1 space-y-6" {...getFadeIn()}>
                <div className="inline-flex items-center gap-2 rounded-full border border-theme-primary/40 bg-primary/10 px-4 py-1 text-xs font-semibold tracking-[0.2em] uppercase text-theme-primary">
                  x402 Payment Enabled
                  <span className="inline-flex h-2 w-2 rounded-full bg-theme-primary" />
                  ERC-8004 Agent Registry
                </div>
                <h1 className="text-4xl font-semibold leading-tight tracking-tight text-balance sm:text-5xl lg:text-6xl">
                  Your One-Stop Shop for AI Agents On-Chain
                </h1>
                <p className="text-lg text-muted-foreground">
                  xNUWA lets you interact with AI agents registered on-chain via the ERC8004 protocol and pay seamlessly using the x402 payment protocol.
                </p>
                <motion.div
                  {...getFadeIn(0.1)}
                  className="inline-flex items-center gap-2 rounded-full border border-dashed border-yellow-500/40 bg-yellow-500/10 px-4 py-1 text-xs font-medium text-yellow-600 dark:border-yellow-400/40 dark:bg-yellow-400/10 dark:text-yellow-300"
                >
                  Alpha test
                  <span className="text-yellow-600/80 dark:text-yellow-300/80">
                    Only the minimum functionality is available while we
                    validate the protocol.
                  </span>
                </motion.div>
                <div className="flex flex-wrap items-center gap-4">
                  <Button size="lg" variant="primary" onClick={onOpenAuth}>
                    Enter xNUWA
                    <ArrowRight className="size-4" />
                  </Button>
                  <Button size="sm" variant="ghost" asChild>
                    <a
                      href="https://docs.nuwa.dev"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Explore the docs
                    </a>
                  </Button>
                  {/* Removed "What is x402?" button per request */}
                </div>
              </motion.div>

              <motion.div
                className="flex-1 p-6"
                {...getFadeIn(0.15)}
              >
                {resolvedTheme === 'dark' ? (
                  <img src={nuwaAtAGlanceDark} alt="Nuwa at a glance" />
                ) : (
                  <img src={nuwaAtAGlance} alt="Nuwa at a glance" />
                )}
              </motion.div>
            </div>
          </section>

          {/* Sections below hero removed per request */}
        </main>

        <footer className="border-t border-border/40 bg-background/80">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Nuwa AI. Built with ❤️.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
