import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, shareReplay } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { GuardarTasaManualResponse, TasaCambioResponse } from './models/tasa-cambio.model';

/**
 * Servicio de integración con el endpoint REST de tasa de cambio.
 *
 * - Cachea la respuesta en memoria durante 5 minutos (shareReplay + TTL).
 * - Inyecta automáticamente el JWT desde localStorage.TOKEN_SESSION.
 * - Nunca rompe al consumidor: si la API falla, emite un TasaCambioResponse
 *   con tasa=null y manual=true para que el formulario active el input manual.
 */
@Injectable({ providedIn: 'root' })
export class TasaCambioService {
  private readonly baseUrl = `${environment.apiUrl}/tasa-cambio`;
  private readonly TTL_MS = 5 * 60 * 1000;

  private cache: { value: TasaCambioResponse; expiresAt: number } | null = null;
  private tasaActual$ = new BehaviorSubject<TasaCambioResponse | null>(null);

  constructor(private http: HttpClient) {}

  /**
   * Devuelve la tasa actual. Si hay cache vigente lo retorna de inmediato;
   * si no, hace la llamada HTTP con reintentos automáticos.
   */
  getTasaActual(): Observable<TasaCambioResponse> {
    if (this.cache && Date.now() < this.cache.expiresAt) {
      return of(this.cache.value);
    }

    return this.http.get<TasaCambioResponse>(`${this.baseUrl}/actual`, { headers: this.authHeaders() }).pipe(
      tap((resp) => {
        if (resp?.ok) {
          this.cache = { value: resp, expiresAt: Date.now() + this.TTL_MS };
          this.tasaActual$.next(resp);
        }
      }),
      catchError((err: HttpErrorResponse) => this.handleError(err)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
  }

  /**
   * Emite la tasa actual como un stream reactivo. Se actualiza con
   * `refrescar()` o automáticamente al llamar `getTasaActual()`.
   */
  tasaObservable(): Observable<TasaCambioResponse | null> {
    return this.tasaActual$.asObservable();
  }

  /** Fuerza la invalidación del cache y dispara un fetch. */
  refrescar(): Observable<TasaCambioResponse> {
    this.cache = null;
    return this.getTasaActual().pipe(switchMap((r) => of(r)));
  }

  /**
   * Persiste una tasa manual. Al éxito, limpia el cache para forzar
   * que la próxima lectura traiga la nueva tasa manual.
   */
  guardarTasaManual(tasa: number): Observable<GuardarTasaManualResponse> {
    return this.http
      .post<GuardarTasaManualResponse>(`${this.baseUrl}/manual`, { tasa }, { headers: this.authHeaders() })
      .pipe(
        tap(() => {
          this.cache = null;
          this.refrescar().subscribe();
        }),
        catchError((_err: HttpErrorResponse) => {
          return of({
            ok: false,
            tasa: 0,
            fuente: 'manual',
            fecha: new Date().toISOString(),
            manual: true,
          } as GuardarTasaManualResponse);
        }),
      );
  }

  /** Header de autorización con JWT. */
  private authHeaders(): HttpHeaders {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('TOKEN_SESSION') : null;
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: token } : {}),
    });
  }

  /**
   * Manejo elegante: nunca propaga el error al consumidor. Devuelve un
   * objeto con tasa=null para que el formulario habilite el input manual.
   */
  private handleError(err: HttpErrorResponse): Observable<TasaCambioResponse> {
    const fallback: TasaCambioResponse = {
      ok: false,
      tasa: null as unknown as number,
      fuente: null,
      fecha: null,
      cached: false,
      manual: true,
      fallback: true,
    };
    return of(fallback);
  }
}
