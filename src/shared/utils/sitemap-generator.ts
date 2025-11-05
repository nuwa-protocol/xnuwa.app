export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never';
  priority?: number;
}

export function generateSitemap(urls: SitemapUrl[]): string {
  const urlEntries = urls
    .map((url) => {
      return `  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority ? `<priority>${url.priority}</priority>` : ''}
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

function buildStaticUrls(baseUrl: string): SitemapUrl[] {
  const today = new Date().toISOString().split('T')[0];

  return [
    {
      loc: baseUrl,
      changefreq: 'daily',
      priority: 1.0,
      lastmod: today,
    },
    {
      loc: `${baseUrl}/explore`,
      changefreq: 'hourly',
      priority: 0.9,
      lastmod: today,
    },
    {
      loc: `${baseUrl}/explore/caps`,
      changefreq: 'hourly',
      priority: 0.85,
      lastmod: today,
    },
    {
      loc: `${baseUrl}/explore/installed`,
      changefreq: 'daily',
      priority: 0.6,
      lastmod: today,
    },
    {
      loc: `${baseUrl}/agent-studio`,
      changefreq: 'weekly',
      priority: 0.8,
      lastmod: today,
    },
    {
      loc: `${baseUrl}/chat`,
      changefreq: 'daily',
      priority: 0.8,
      lastmod: today,
    },
    {
      loc: `${baseUrl}/wallet`,
      changefreq: 'weekly',
      priority: 0.5,
      lastmod: today,
    },
    {
      loc: `${baseUrl}/settings`,
      changefreq: 'weekly',
      priority: 0.5,
      lastmod: today,
    },
    {
      loc: `${baseUrl}/docs`,
      changefreq: 'daily',
      priority: 0.6,
      lastmod: today,
    },
  ];
}

export function generateBasicSitemap(baseUrl: string): string {
  return generateSitemap(buildStaticUrls(baseUrl));
}

// Function to generate sitemap with cap pages
export function generateCapSitemap(
  baseUrl: string,
  caps: Array<{
    idName: string;
    submittedAt?: number;
  }>,
): string {
  const today = new Date().toISOString().split('T')[0];
  const staticUrls = buildStaticUrls(baseUrl);
  const capUrls: SitemapUrl[] = caps.map((cap) => ({
    loc: `${baseUrl}/explore/caps/${cap.idName}`,
    changefreq: 'weekly',
    priority: 0.7,
    lastmod: cap.submittedAt
      ? new Date(cap.submittedAt).toISOString().split('T')[0]
      : today,
  }));

  const urlMap = new Map<string, SitemapUrl>();

  [...staticUrls, ...capUrls].forEach((url) => {
    urlMap.set(url.loc, url);
  });

  return generateSitemap(Array.from(urlMap.values()));
}
