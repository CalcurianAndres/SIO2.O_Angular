const getBaseUrl = () => {
  if (typeof window === 'undefined') return '';
  return '';
};

const base = getBaseUrl();

export const environment = {
  production: false,
  apiUrl: base ? `${base}/api` : '/api',
  imgUrl: base ? `${base}/api` : '/api',
  wsUrl: base,
};
