// _worker.js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/docs')) {
      const path = url.pathname.replace('/docs', '') || '/';
      const target = `https://docs.nuwa.dev${path}${url.search}`;

      const response = await fetch(target, {
        method: request.method,
        headers: request.headers,
        body: request.method !== 'GET' ? request.body : undefined,
      });

      const newResponse = new Response(response.body, response);
      newResponse.headers.set('Cache-Control', 'public, max-age=600');
      return newResponse;
    }

    return env.ASSETS.fetch(request);
  },
};
