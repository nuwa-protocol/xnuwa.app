/*
  Generates a shareable OG image using a React component via Satori + Resvg.
  Output: public/og/x402ai-og.png (1200x630)

  Run: pnpm og:generate
*/
import fs from 'node:fs';
import path from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const WIDTH = 1200;
const HEIGHT = 630;

function readFont(file: string) {
  const p = path.resolve(
    process.cwd(),
    'node_modules',
    '@fontsource',
    'geist-sans',
    'files',
    file,
  );
  if (fs.existsSync(p)) return fs.readFileSync(p);
  return undefined;
}

const geistRegular =
  readFont('geist-sans-latin-400-normal.woff2') ||
  readFont('geist-sans-latin-400-normal.woff');
const geistBold =
  readFont('geist-sans-latin-700-normal.woff2') ||
  readFont('geist-sans-latin-700-normal.woff');

const logoFile = path.resolve('src/assets/logo-app-brand.png');
const logoDataUrl = fs.existsSync(logoFile)
  ? `data:image/png;base64,${fs.readFileSync(logoFile).toString('base64')}`
  : undefined;

async function main() {
  const element = (
    <div
      style={{
        width: WIDTH,
        height: HEIGHT,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 64,
        background:
          'radial-gradient(1200px 600px at 10% 10%, rgba(99,102,241,0.25), transparent 60%), radial-gradient(900px 500px at 90% 90%, rgba(16,185,129,0.2), transparent 55%), linear-gradient(180deg, #0b0f1a, #0b0f1a)',
        color: '#f8fafc',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        {logoDataUrl ? (
          <img
            src={logoDataUrl}
            width={88}
            height={88}
            style={{ borderRadius: 16 }}
          />
        ) : null}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 54,
              fontWeight: 700,
              letterSpacing: -0.5,
            }}
          >
            x402AI
          </div>
          <div
            style={{
              marginTop: 6,
              fontSize: 22,
              color: '#cbd5e1',
            }}
          >
            Your One-Stop Shop for AI Agents On-Chain
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            border: '1px dashed rgba(234,179,8,0.45)',
            background: 'rgba(234,179,8,0.08)',
            color: 'rgba(250,204,21,0.95)',
            borderRadius: 999,
            padding: '6px 12px',
            fontSize: 18,
          }}
        >
          Alpha Test · ERC-8004 Registry · x402 Payments
        </div>
        <div style={{ fontSize: 20, color: '#94a3b8' }}>x402ai.app</div>
      </div>
    </div>
  );

  const fonts: { name: string; data: Buffer; weight: number; style: 'normal' }[] = [];
  if (geistRegular) fonts.push({ name: 'Geist Sans', data: geistRegular, weight: 400, style: 'normal' });
  if (geistBold) fonts.push({ name: 'Geist Sans', data: geistBold, weight: 700, style: 'normal' });

  const svg = await satori(element, {
    width: WIDTH,
    height: HEIGHT,
    fonts,
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: WIDTH },
    background: 'transparent',
  });
  const pngData = resvg.render().asPng();

  const outDir = path.resolve('public/og');
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, 'x402ai-og.png');
  fs.writeFileSync(outFile, pngData);
  console.log(`OG image generated: ${path.relative(process.cwd(), outFile)}`);
}

main().catch((err) => {
  console.error('Failed to generate OG image:', err);
  process.exit(1);
});
