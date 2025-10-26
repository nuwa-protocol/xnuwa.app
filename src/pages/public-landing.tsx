import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  Bolt,
  GlobeLock,
  Layers,
  Network,
  ShieldCheck,
  Sparkles,
  WalletMinimal,
} from 'lucide-react';
import nuwaAtAGlance from '@/assets/nuwa-at-a-glance.png';
import nuwaAtAGlanceDark from '@/assets/nuwa-at-a-glance-dark.png';
import { Logo } from '@/shared/components/logo';
import { useTheme } from '@/shared/components/theme-provider';
import { Button } from '@/shared/components/ui';
import { GridPattern } from '@/shared/components/ui/shadcn-io/grid-pattern';
import { cn } from '@/shared/utils';

type PublicLandingProps = {
  onOpenAuth: () => void;
};

type FeatureHighlight = {
  title: string;
  description: string;
  icon: LucideIcon;
  tag: string;
};

type ProtocolHighlight = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const featureHighlights: FeatureHighlight[] = [
  {
    title: 'One x402 entry point',
    description:
      'xNUWA pulls every x402-compatible AI service, MCP server, and Cap into a single local canvas so you can route work without juggling dashboards.',
    icon: Layers,
    tag: 'Unified access',
  },
  {
    title: 'Local-first trust boundary',
    description:
      'Wallets, sessions, and service preferences live on your machine. You decide when credentials leave the device and which providers can see them.',
    icon: ShieldCheck,
    tag: 'Stay sovereign',
  },
  {
    title: 'Wallet native settlement',
    description:
      'Fund once, approve with your PIN or passkey-backed session key, and stream per-call payments across every x402 integration you compose.',
    icon: WalletMinimal,
    tag: 'Session secure',
  },
];

const protocolHighlights: ProtocolHighlight[] = [
  {
    title: 'What is x402?',
    description:
      'x402 turns the HTTP 402 Payment Required code into a full payment handshake. Providers describe acceptable payment requirements and clients respond with signed payment headers.',
    icon: Sparkles,
  },
  {
    title: 'Pay-per-request economics',
    description:
      'Instead of flat subscriptions, xNUWA streams micro transactions (default 0.1 USDC) across whichever x402 providers you route. You always know the exact spend per call.',
    icon: Bolt,
  },
  {
    title: 'Trustless settlement',
    description:
      'Facilitators validate transfers and respond with tamper-proof `X-PAYMENT-RESPONSE` receipts, so clients, aggregators, and service operators share the same source of truth.',
    icon: GlobeLock,
  },
];

const workflowSteps = [
  {
    title: 'Discover',
    detail:
      'Index the x402 AI ecosystem, sync provider manifests locally, and pin the services your teams rely on.',
  },
  {
    title: 'Compose',
    detail:
      'Wire prompts, models, and tool calls into new x402-ready experiences, then share them like native desktop apps.',
  },
  {
    title: 'Monetize',
    detail:
      'Protect premium workloads with the x402 payment protocol so every inference settles instantly, no matter the provider.',
  },
];

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
                  x402 AI Hub
                  <span className="inline-flex h-2 w-2 rounded-full bg-theme-primary" />
                  Local-first custody
                </div>
                <h1 className="text-4xl font-semibold leading-tight tracking-tight text-balance sm:text-5xl lg:text-6xl">
                  Your local-first gateway to the x402 AI service network.
                </h1>
                <p className="text-lg text-muted-foreground">
                  Launch xNUWA to discover, compose, and run every x402-capable
                  AI provider from one place. Keep credentials on-device, stream
                  per-call payments with verifiable receipts, and offer AI
                  services that feel like native apps—no extra dashboards, no
                  data lock-in.
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
                <div className="flex flex-wrap gap-4">
                  <Button size="lg" variant="primary" onClick={onOpenAuth}>
                    Enter xNUWA
                    <ArrowRight className="size-4" />
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <a
                      href="https://docs.nuwa.dev"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Explore the docs
                    </a>
                  </Button>
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

          {/* Feature highlights */}
          <section className="px-6 py-12">
            <div className="mx-auto grid w-full max-w-6xl gap-6 md:grid-cols-3">
              {featureHighlights.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    className="rounded-3xl border border-border/60 bg-background/80 p-6 shadow-lg shadow-black/5"
                    {...getFadeIn(index * 0.1)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-theme-primary">
                        {feature.tag}
                      </span>
                      <Icon className="size-4 text-theme-primary" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* x402 section */}
          <section className="px-6 py-16">
            <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <motion.div
                className="rounded-3xl border border-border/60 bg-gradient-to-br from-background via-background/60 to-primary/5 p-8 shadow-2xl shadow-black/10"
                {...getFadeIn()}
              >
                <div className="flex items-center gap-3 text-sm font-semibold text-theme-primary">
                  <Network className="size-5" />
                  x402 Payment Protocol
                </div>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight">
                  The payment rail behind your x402 AI gateway.
                </h2>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                  xNUWA ships with the official x402 client. When any provider
                  responds with HTTP 402, we parse the payment requirements,
                  create the signed `x402/payment` header, and retry your
                  request automatically—keeping every service in your catalog
                  payable from the same wallet.
                </p>
                <ul className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-theme-primary" />
                    Automatic retries with context IDs and exposed
                    `X-PAYMENT-RESPONSE` headers for auditable histories.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-theme-primary" />
                    Network-aware pricing so you only fund the asset and chain
                    the provider accepts.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-theme-primary" />
                    Streaming-friendly hints keep SSE + NDJSON responses payable
                    without tearing down the connection.
                  </li>
                </ul>
              </motion.div>

              <motion.div
                className="rounded-3xl border border-border/60 bg-background/80 p-8"
                {...getFadeIn(0.1)}
              >
                <p className="text-sm font-semibold uppercase tracking-[0.4em] text-muted-foreground">
                  Why builders choose x402
                </p>
                <div className="mt-6 space-y-5">
                  {protocolHighlights.map((highlight) => {
                    const Icon = highlight.icon;
                    return (
                      <div
                        key={highlight.title}
                        className="rounded-2xl border border-border/50 p-4"
                      >
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <Icon className="size-4 text-theme-primary" />
                          {highlight.title}
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {highlight.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </section>

          {/* Workflow */}
          <section className="px-6 pb-20">
            <div className="mx-auto w-full max-w-6xl rounded-3xl border border-border/60 bg-muted/20 p-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
                    How Nuwa flows
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold">
                    Design → Deploy → Monetize
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                    Everything from x402 service discovery to payment
                    settlement lives in one interface. You can experiment
                    privately, share with a team, or list in the Cap Store when
                    you are ready.
                  </p>
                </div>
                <Button size="lg" onClick={onOpenAuth}>
                  Launch xNUWA
                </Button>
              </div>
              <div className="mt-10 grid gap-6 md:grid-cols-3">
                {workflowSteps.map((step, index) => (
                  <motion.div
                    key={step.title}
                    className={cn(
                      'rounded-2xl border border-border/60 bg-background/90 p-5 shadow-lg shadow-black/5',
                      index === 2 && 'border-theme-primary/60',
                    )}
                    {...getFadeIn(index * 0.1)}
                  >
                    <div className="text-sm font-semibold text-theme-primary">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <h3 className="mt-2 text-xl font-semibold">{step.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {step.detail}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
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
