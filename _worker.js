export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/docs')) {
      // proxy to Mintlify hosted docs
      const target = new URL(url);
      target.hostname = 'docs.nuwa.dev';
      target.protocol = 'https:';
      target.pathname = url.pathname.replace(/^\/docs/, ''); // remove /docs prefix

      // keep query params
      target.search = url.search;

      const headers = new Headers(request.headers);
      headers.delete('host');

      const response = await fetch(target.toString(), {
        headers,
        method: request.method,
        body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
      });
      response.headers.set('Cache-Control', 'max-age=600');
      return response;
    }

    // other paths go to React static assets
    return env.ASSETS.fetch(request);
  },
};
