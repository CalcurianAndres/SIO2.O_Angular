export interface TasaCambioResponse {
  ok: boolean;
  tasa: number;
  fuente: 'api' | 'manual' | null;
  fecha: string | null;
  cached: boolean;
  manual: boolean;
  fallback: boolean;
}

export interface TasaCambioError {
  ok: false;
  err: { code: string; message: string };
}

export interface GuardarTasaManualResponse {
  ok: boolean;
  tasa: number;
  fuente: 'api' | 'manual';
  fecha: string;
  manual: boolean;
}
