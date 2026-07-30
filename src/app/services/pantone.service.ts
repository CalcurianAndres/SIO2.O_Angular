import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

const BASE_URL = environment.apiUrl + '/pantones';

export interface Pantone {
  _id?: string;
  code: string;
  hex: string;
  r: number;
  g: number;
  b: number;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root',
})
export class PantoneService {
  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los Pantones de la base de datos
   * @returns Observable con array de Pantones ordenados por código
   */
  getAll(): Observable<Pantone[]> {
    return this.http.get<Pantone[]>(BASE_URL).pipe(catchError(this.handleError));
  }

  /**
   * Busca Pantones por código o HEX (búsqueda regex case-insensitive)
   * @param query Texto de búsqueda
   * @returns Observable con array de Pantones que coinciden
   */
  search(query: string): Observable<Pantone[]> {
    if (!query || query.trim() === '') {
      return this.getAll();
    }
    return this.http
      .get<Pantone[]>(`${BASE_URL}/search`, {
        params: { q: query },
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtiene un Pantone específico por su código
   * @param code Código Pantone (ej: "Yellow C")
   * @returns Observable con el Pantone o null si no existe
   */
  getByCode(code: string): Observable<Pantone | null> {
    return this.http.get<Pantone>(`${BASE_URL}/${encodeURIComponent(code)}`).pipe(
      catchError((err) => {
        if (err.status === 404) {
          return new Observable<Pantone | null>((observer) => {
            observer.next(null);
            observer.complete();
          });
        }
        return this.handleError(err);
      }),
    );
  }

  /**
   * Crea un nuevo Pantone en la base de datos
   * @param pantone Objeto Pantone a crear (sin _id)
   * @returns Observable con el Pantone creado
   * @throws Error 409 si el código o HEX ya existen
   */
  create(pantone: Omit<Pantone, '_id' | 'createdAt' | 'updatedAt'>): Observable<Pantone> {
    return this.http.post<Pantone>(BASE_URL, pantone).pipe(
      catchError((err) => {
        if (err.status === 409) {
          const errorMsg = err.error?.error || 'El código o HEX ya existe en la base de datos';
          return throwError(() => new Error(errorMsg));
        }
        if (err.status === 400) {
          const errorMsg = err.error?.error || 'Datos inválidos';
          return throwError(() => new Error(errorMsg));
        }
        return this.handleError(err);
      }),
    );
  }

  /**
   * Manejo centralizado de errores HTTP
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'Error al comunicarse con el servidor';

    if (error.error?.error) {
      errorMessage = error.error.error;
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.error('[PantoneService] Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
