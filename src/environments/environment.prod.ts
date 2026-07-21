const getBaseUrl = () => {
  if (typeof window === 'undefined') return '';
  const port = window.location.port;
  const hostname = window.location.hostname;
  if (port === '4200') return 'https://192.168.0.22';
  if (hostname === '192.168.0.22') return '';
  return '';
};

const base = getBaseUrl();

export const environment = {
  production: true,
  apiUrl: base ? `${base}/api` : '/api',
  imgUrl: base ? `${base}/api` : '/api',
  wsUrl: base,
  company: {
    nombre: 'Poligráfica de Venezuela',
    rif: 'J-XXXXXXXXX',
    direccion: 'Guatire, Estado Miranda',
  },
};
