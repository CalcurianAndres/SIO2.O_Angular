const getBaseUrl = () => {
  if (typeof window === 'undefined') return '';
  const hostname = window.location.hostname;
  const port = window.location.port;
  // Dev: ng serve → proxy handles forwarding to backend
  if (hostname === 'localhost' || hostname === '127.0.0.1') return '';
  // Production / Docker: same origin
  return '';
};

const base = getBaseUrl();

export const environment = {
  production: false,
  apiUrl: base ? `${base}/api` : '/api',
  wsUrl: base,
};
