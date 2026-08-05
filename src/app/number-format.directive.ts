import { Directive, ElementRef, HostListener, Input, Renderer2, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DEFAULT_DECIMALS, formatNumber, formatRawInput, parseNumber } from './utils/number-format.utils';

/**
 * Aplica automáticamente a todo <input type="number"> del sistema.
 * Cambia type="text" internamente para permitir formato 1.234,56.
 * Actúa como ControlValueAccessor (tiene prioridad sobre NumberValueAccessor):
 * la vista muestra el valor formateado ("12,34") y el modelo recibe siempre
 * el número puro con sus decimales (12.34).
 * Excluye implícitamente teléfonos (type="text" en <app-phone-input>).
 */
@Directive({
  selector: 'input[type="number"]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NumberFormatDirective),
      multi: true,
    },
  ],
})
export class NumberFormatDirective implements ControlValueAccessor {
  @Input() decimals: number = DEFAULT_DECIMALS;

  private el: HTMLInputElement;
  private userEditing = false;
  private userTouched = false;
  private userHasDecimal = false;
  private lastValue: number | null = null;

  private onChangeFn: (value: number | null) => void = () => {};
  private onTouchedFn: () => void = () => {};

  constructor(
    elementRef: ElementRef<HTMLInputElement>,
    private renderer: Renderer2,
  ) {
    this.el = elementRef.nativeElement;
    this.renderer.setAttribute(this.el, 'type', 'text');
    this.renderer.setAttribute(this.el, 'inputmode', 'decimal');
  }

  writeValue(value: number | string | null | undefined): void {
    this.lastValue = this.toNumber(value);
    if (document.activeElement === this.el) return;
    this.setDisplayValue(formatNumber(this.lastValue, this.decimals, true));
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.renderer.setProperty(this.el, 'disabled', isDisabled);
  }

  @HostListener('focus')
  onFocus(): void {
    this.userEditing = true;
    this.userTouched = false;
  }

  @HostListener('input', ['$event.target.value'])
  onInput(raw: string): void {
    this.userEditing = true;
    this.userTouched = true;
    this.userHasDecimal = /[,.]\d+/.test(raw);

    const parsed = parseNumber(raw);
    this.lastValue = parsed;
    this.onChangeFn(parsed);

    this.setFormattedDisplay(formatRawInput(raw), raw);
  }

  @HostListener('blur')
  onBlur(): void {
    this.userEditing = false;
    this.onTouchedFn();

    if (!this.userTouched) return;

    this.setDisplayValue(formatNumber(this.lastValue, this.decimals, this.userHasDecimal));
  }

  private toNumber(value: number | string | null | undefined): number | null {
    if (typeof value === 'number') return isNaN(value) ? null : value;
    if (value === null || value === undefined || value === '') return null;
    const parsed = parseFloat(String(value));
    return isNaN(parsed) ? null : parsed;
  }

  private setDisplayValue(value: string | undefined): void {
    this.renderer.setProperty(this.el, 'value', value ?? '');
  }

  private setFormattedDisplay(formatted: string, raw: string): void {
    const cursorPos = this.el.selectionStart ?? raw.length;
    this.renderer.setProperty(this.el, 'value', formatted);
    const diff = formatted.length - raw.length;
    const newPos = Math.min(Math.max(cursorPos + diff, 0), formatted.length);
    this.el.setSelectionRange(newPos, newPos);
  }
}
