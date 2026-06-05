import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PaisesService {
  private paisesData$: Observable<any[]>;
  private estadosCache = new Map<string, Observable<string[]>>();

  constructor(private http: HttpClient) {
    this.paisesData$ = this.http
      .get<any[]>('https://restcountries.com/v3.1/all?fields=name,idd,cca2,flags,translations')
      .pipe(shareReplay(1));
  }

  getPaises(): Observable<{ nombre: string; nombreEn: string }[]> {
    return this.paisesData$.pipe(
      map((paises) =>
        paises
          .map((p: any) => ({
            nombre: p.translations?.spa?.common || p.name?.common || '',
            nombreEn: p.name?.common || '',
          }))
          .filter((p) => p.nombre)
          .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')),
      ),
    );
  }

  getEstados(pais: string): Observable<string[]> {
    if (this.estadosCache.has(pais)) {
      return this.estadosCache.get(pais)!;
    }
    const request = this.http
      .post<any>('https://countriesnow.space/api/v0.1/countries/states', { country: pais })
      .pipe(
        map((res) => res?.data?.states?.map((s: any) => s.name) || []),
        catchError(() => of([])),
        shareReplay(1),
      );
    this.estadosCache.set(pais, request);
    return request;
  }

  detectarPaisPorPrefijo(phone: string): Observable<{ nombre: string; bandera: string; codigo: string; cca2: string } | null> {
    if (!phone || !phone.startsWith('+')) return of(null);
    return this.paisesData$.pipe(
      map((paises) => {
        for (const p of paises) {
          const root = p.idd?.root || '';
          const suffixes = p.idd?.suffixes || [''];
          for (const s of suffixes) {
            if (phone.startsWith(root + s)) {
              return {
                nombre: p.name?.common || '',
                codigo: root + s,
                bandera: this.getFlagEmoji(p.cca2),
                cca2: p.cca2,
              };
            }
          }
        }
        return null;
      }),
    );
  }

  private getFlagEmoji(cca2: string): string {
    if (!cca2) return '';
    return String.fromCodePoint(
      ...cca2
        .toUpperCase()
        .split('')
        .map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
    );
  }
}
