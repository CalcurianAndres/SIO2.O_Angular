import { Component, EventEmitter, HostListener, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { PAISES } from 'src/app/services/paises.service';

interface Pais {
  nombre: string;
  nombreEn: string;
  cca2: string;
  bandera: string;
  prefijo: string;
}

@Component({
  selector: 'app-phone-input',
  templateUrl: './phone-input.component.html',
  styleUrls: ['./phone-input.component.scss'],
})
export class PhoneInputComponent implements OnInit {
  @Input() value: string = '';
  @Input() placeholder: string = 'Número telefónico';
  @Input() disabled: boolean = false;
  @Output() valueChange = new EventEmitter<string>();

  readonly allPrefixes: Pais[] = PAISES;

  searchTerm: string = '';
  selectedPrefix: Pais | null = null;
  localNumber: string = '';
  isOpen: boolean = false;
  filteredPrefixes: Pais[] = this.allPrefixes;

  ngOnInit(): void {
    this.parseValue();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] && !changes['value'].firstChange) {
      this.parseValue();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.isOpen && !target.closest('.phone-input-wrapper')) {
      this.isOpen = false;
    }
  }

  private parseValue(): void {
    if (!this.value) {
      this.selectedPrefix = null;
      this.localNumber = '';
      return;
    }

    const cleaned = this.value.replace(/[^0-9]/g, '');
    const detected = this.allPrefixes.find((p) => {
      const code = p.prefijo.replace('+', '');
      return cleaned.startsWith(code);
    });

    if (detected) {
      this.selectedPrefix = detected;
      this.localNumber = cleaned.replace(detected.prefijo.replace('+', ''), '');
    } else {
      this.selectedPrefix = null;
      this.localNumber = cleaned;
    }
  }

  toggleDropdown(): void {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.searchTerm = '';
      this.filteredPrefixes = this.allPrefixes;
    }
  }

  closeDropdown(): void {
    this.isOpen = false;
  }

  filterCountries(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredPrefixes = this.allPrefixes;
      return;
    }
    this.filteredPrefixes = this.allPrefixes.filter(
      (p) =>
        p.nombre.toLowerCase().includes(term) ||
        p.nombreEn.toLowerCase().includes(term) ||
        p.prefijo.includes(term) ||
        p.cca2.toLowerCase().includes(term),
    );
  }

  selectPrefix(pais: Pais): void {
    this.selectedPrefix = pais;
    this.isOpen = false;
    this.emitValue();
  }

  onNumberInput(target: any): void {
    const input = target as HTMLInputElement;
    this.localNumber = input.value.replace(/[^0-9]/g, '');
    input.value = this.localNumber;
    this.emitValue();
  }

  private emitValue(): void {
    if (this.selectedPrefix) {
      const code = this.selectedPrefix.prefijo.replace('+', '');
      this.valueChange.emit(code + this.localNumber);
    } else {
      this.valueChange.emit(this.localNumber);
    }
  }
}
