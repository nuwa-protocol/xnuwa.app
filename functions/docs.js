export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  const path = url.pathname.replace(/^\/docs/, '') || '/';
  const targetUrl = `https://docs.nuwa.dev${path}${url.search}`;

  // Recreate the incoming request against the docs service to preserve method, headers, and body.
  const upstreamRequest = new Request(targetUrl, request);
  const upstreamResponse = await fetch(upstreamRequest);

  const response = new Response(upstreamResponse.body, upstreamResponse);
  response.headers.set('Cache-Control', 'public, max-age=600');
  return response;
}
