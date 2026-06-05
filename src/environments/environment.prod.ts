const getBaseUrl = () => {
  if (typeof window === 'undefined') return 'https://192.168.0.22';
  const port = window.location.port;
  if (port === '4200') return 'https://192.168.0.22';
  return '';
};

const base = getBaseUrl();

export const environment = {
  production: true,
  apiUrl: base ? `${base}/api` : '/api',
  wsUrl: base,
};
