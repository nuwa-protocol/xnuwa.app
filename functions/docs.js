export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  const path = url.pathname.replace(/^\/docs/, '') || '/';
  const targetUrl = `https://docs.nuwa.dev${path}${url.search}`;

  const upstreamRequest = new Request(targetUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body,
    redirect: 'manual',
  });

  const upstreamResponse = await fetch(upstreamRequest);

  // handle redirect
  if (upstreamResponse.status >= 300 && upstreamResponse.status < 400) {
    const location = upstreamResponse.headers.get('Location');
    if (location) {
      const newLocation = location.startsWith('http')
        ? location.replace('https://docs.nuwa.dev', `${url.origin}/docs`)
        : `/docs${location}`;

      return Response.redirect(newLocation, upstreamResponse.status);
    }
  }

  // handle HTML content
  const contentType = upstreamResponse.headers.get('Content-Type') || '';
  if (contentType.includes('text/html')) {
    let html = await upstreamResponse.text();

    // rewrite important SEO related links
    html = html
      // canonical link
      .replace(
        /<link\s+rel="canonical"\s+href="https:\/\/docs\.nuwa\.dev([^"]*)"/g,
        `<link rel="canonical" href="${url.origin}/docs$1"`,
      )
      // og:url meta tag
      .replace(
        /<meta\s+property="og:url"\s+content="https:\/\/docs\.nuwa\.dev([^"]*)"/g,
        `<meta property="og:url" content="${url.origin}/docs$1"`,
      )
      // replace common docs.nuwa.dev
      .replace(/https:\/\/docs\.nuwa\.dev/g, `${url.origin}/docs`)
      // internal links
      .replace(/href="\//g, 'href="/docs/')
      .replace(/src="\//g, 'src="/docs/');

    const response = new Response(html, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: upstreamResponse.headers,
    });

    // SEO friendly response headers
    response.headers.set('Cache-Control', 'public, max-age=3600');
    response.headers.delete('X-Robots-Tag'); // remove possible crawler restrictions

    return response;
  }

  const response = new Response(upstreamResponse.body, upstreamResponse);
  response.headers.set('Cache-Control', 'public, max-age=3600');
  return response;
}
