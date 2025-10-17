// convert a http url to a websocket url
// the schema matched with the live-server url schema
export const toLiveWebSocketUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    const protocol = parsed.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${parsed.host}/ws`;
  } catch {
    return '';
  }
};
