const getBaseUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:3000';
  const hostname = window.location.hostname;
  const port = window.location.port;
  if (port === '4200') return 'http://localhost:3000';
  if (hostname === '192.168.0.22') return 'https://192.168.0.22';
  return '';
};

const base = getBaseUrl();

export const environment = {
  production: false,
  apiUrl: base ? `${base}/api` : '/api',
  wsUrl: base,
};
