export interface UrlMetadata {
  url?: string;
  title?: string;
  description?: string;
  image?: string;
  favicons?: Array<{
    rel: string;
    href: string;
    sizes?: string;
  }>;
  'og:image'?: string;
  'og:site_name'?: string;
  'og:title'?: string;
  'og:description'?: string;
  publisher?: string;
}
