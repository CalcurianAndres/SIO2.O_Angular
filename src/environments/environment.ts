const getBaseUrl = () => {
  if (typeof window === 'undefined') return 'https://192.168.0.22';
  const port = window.location.port;
  if (port === '4200') return 'https://192.168.0.22';
  return '';
};

const base = getBaseUrl();
const httpBase = 'http://192.168.0.22';

export const environment = {
  production: false,
  apiUrl: base ? `${base}/api` : '/api',
  imgUrl: httpBase ? `${httpBase}/api` : '/api',
  wsUrl: base,
};
