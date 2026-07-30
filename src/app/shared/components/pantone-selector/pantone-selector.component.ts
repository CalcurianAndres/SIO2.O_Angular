import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { PantoneService, Pantone } from 'src/app/services/pantone.service';

@Component({
  selector: 'app-pantone-selector',
  standalone: false,
  templateUrl: './pantone-selector.component.html',
  styleUrls: ['./pantone-selector.component.scss'],
})
export class PantoneSelectorComponent implements OnChanges {
  @Input() isOpen = false;
  @Output() pantoneSelected = new EventEmitter<Pantone>();
  @Output() closed = new EventEmitter<void>();

  // Estado de la vista
  showCreateForm = false;
  loading = false;
  errorMessage = '';

  // Búsqueda
  allPantones: Pantone[] = [];
  filteredPantones: Pantone[] = [];
  searchQuery = '';
  private searchSubject = new Subject<string>();

  // Formulario de registro
  form = {
    code: '',
    hex: '',
    r: 0,
    g: 0,
    b: 0,
  };
  creating = false;

  constructor(private pantoneService: PantoneService) {
    // Configurar debounce para búsqueda
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => {
          if (!query || query.trim().length < 2) {
            // Filtrar localmente
            return [this.filterLocal(query)];
          }
          // Llamar a la API
          this.loading = true;
          return this.pantoneService.search(query);
        }),
      )
      .subscribe({
        next: (results) => {
          if (Array.isArray(results)) {
            this.filteredPantones = results;
          }
          this.loading = false;
        },
        error: () => {
          this.filteredPantones = [];
          this.loading = false;
        },
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen']?.currentValue && !changes['isOpen']?.previousValue) {
      this.onOpen();
    }
  }

  /**
   * Se ejecuta al abrir el modal: carga todos los Pantones
   */
  private onOpen() {
    this.showCreateForm = false;
    this.searchQuery = '';
    this.errorMessage = '';
    this.resetForm();

    if (this.allPantones.length === 0) {
      this.loading = true;
      this.pantoneService.getAll().subscribe({
        next: (pantones) => {
          this.allPantones = pantones;
          this.filteredPantones = pantones;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
    } else {
      this.filteredPantones = this.allPantones;
    }
  }

  /**
   * Filtrado local (cuando query < 2 chars)
   */
  private filterLocal(query: string): Pantone[] {
    if (!query || query.trim() === '') {
      return this.allPantones;
    }
    const q = query.toLowerCase().trim();
    return this.allPantones.filter((p) => p.code.toLowerCase().includes(q) || p.hex.toLowerCase().includes(q));
  }

  /**
   * Handler del input de búsqueda
   */
  onSearchInput() {
    this.errorMessage = '';
    this.searchSubject.next(this.searchQuery);
  }

  /**
   * Selecciona un Pantone de la lista
   */
  selectPantone(pantone: Pantone) {
    this.pantoneSelected.emit(pantone);
    this.close();
  }

  /**
   * Cierra el modal
   */
  close() {
    this.closed.emit();
  }

  // ─── FORMULARIO DE REGISTRO ───

  /**
   * Muestra el formulario de registro
   */
  showCreate() {
    this.showCreateForm = true;
    this.errorMessage = '';
    this.resetForm();
  }

  /**
   * Vuelve a la vista de búsqueda
   */
  backToSearch() {
    this.showCreateForm = false;
    this.errorMessage = '';
  }

  /**
   * Resetea el formulario de registro
   */
  private resetForm() {
    this.form = { code: '', hex: '', r: 0, g: 0, b: 0 };
    this.creating = false;
  }

  /**
   * Cuando cambia R, G o B → recalcula HEX automáticamente
   */
  onRgbChange() {
    this.form.hex = this.rgbToHex(this.form.r, this.form.g, this.form.b);
  }

  /**
   * Cuando cambia HEX → recalcula R, G, B automáticamente
   */
  onHexChange() {
    const hex = this.form.hex.toUpperCase().replace(/[^0-9A-F]/g, '');
    this.form.hex = hex;

    if (hex.length === 6) {
      this.form.r = parseInt(hex.substring(0, 2), 16);
      this.form.g = parseInt(hex.substring(2, 4), 16);
      this.form.b = parseInt(hex.substring(4, 6), 16);
    }
  }

  /**
   * Convierte RGB a HEX
   */
  private rgbToHex(r: number, g: number, b: number): string {
    return [r, g, b]
      .map((x) => {
        const val = Math.max(0, Math.min(255, x || 0));
        return val.toString(16).padStart(2, '0');
      })
      .join('')
      .toUpperCase();
  }

  /**
   * Color de preview en tiempo real
   */
  get previewColor(): string {
    return `rgb(${this.form.r || 0}, ${this.form.g || 0}, ${this.form.b || 0})`;
  }

  /**
   * Valida el formulario antes de enviar
   */
  get formValid(): boolean {
    if (!this.form.code.trim()) return false;
    if (!this.form.hex || this.form.hex.length !== 6) return false;
    if (!/^[0-9A-Fa-f]{6}$/.test(this.form.hex)) return false;
    if (this.form.r < 0 || this.form.r > 255) return false;
    if (this.form.g < 0 || this.form.g > 255) return false;
    if (this.form.b < 0 || this.form.b > 255) return false;
    return true;
  }

  /**
   * Envía el formulario de creación
   */
  createPantone() {
    if (!this.formValid || this.creating) return;

    this.creating = true;
    this.errorMessage = '';

    const pantone = {
      code: this.form.code.trim(),
      hex: this.form.hex.toUpperCase(),
      r: Number(this.form.r),
      g: Number(this.form.g),
      b: Number(this.form.b),
    };

    this.pantoneService.create(pantone).subscribe({
      next: (created) => {
        // Agregar al array local para futuras búsquedas
        this.allPantones.push(created);
        // Emitir selección y cerrar
        this.pantoneSelected.emit(created);
        this.close();
      },
      error: (err) => {
        this.errorMessage = err.message || 'Error al crear el Pantone';
        this.creating = false;
      },
    });
  }

  /**
   * Construye el color RGB como string CSS
   */
  getSwatchColor(pantone: Pantone): string {
    return `rgb(${pantone.r}, ${pantone.g}, ${pantone.b})`;
  }
}
