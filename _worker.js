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
      headers.delete('host'); // let fetch set host based on the new URL

      const rewrittenPath = url.pathname.replace(/^\/docs/, '') || '/';
      target.pathname = rewrittenPath.startsWith('/') ? rewrittenPath : `/${rewrittenPath}`;

      const init = {
        method: request.method,
        headers,
      };

      if (request.method !== 'GET' && request.method !== 'HEAD') {
        init.body = request.body;
      }

      const upstreamResponse = await fetch(target.toString(), init);
      const response = new Response(upstreamResponse.body, upstreamResponse);
      response.headers.set('Cache-Control', 'max-age=600');
      return response;
    }

    // other paths go to React static assets
    return env.ASSETS.fetch(request);
  },
};
