import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Self,
  Renderer2,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DEFAULT_DECIMALS, formatNumber, formatRawInput, parseNumber } from './utils/number-format.utils';

/**
 * Aplica automáticamente a todo <input type="number"> del sistema.
 * Cambia type="text" internamente para permitir formato 1.234,56.
 * Sincroniza bidireccional: display formateado ↔ modelo número puro.
 * Excluye implícitamente teléfonos (type="text" en <app-phone-input>).
 */
@Directive({
  selector: 'input[type="number"]',
})
export class NumberFormatDirective implements OnInit, OnDestroy {
  @Input() decimals: number = DEFAULT_DECIMALS;

  private el: HTMLInputElement;
  private internalUpdate = false;
  private userEditing = false;
  private userTouched = false;
  private userHasDecimal = false;
  private subs = new Subscription();

  constructor(
    elementRef: ElementRef<HTMLInputElement>,
    private renderer: Renderer2,
    @Optional() @Self() private ngControl: NgControl,
  ) {
    this.el = elementRef.nativeElement;
  }

  ngOnInit(): void {
    this.renderer.setAttribute(this.el, 'type', 'text');
    this.renderer.setAttribute(this.el, 'inputmode', 'decimal');

    if (this.ngControl?.control) {
      const initial = this.ngControl.control.value;
      if (initial != null && initial !== '') {
        this.setDisplayValue(formatNumber(initial, this.decimals, true));
      }

      this.subs.add(
        this.ngControl.control.valueChanges.subscribe((value) => {
          if (this.internalUpdate || this.userEditing || document.activeElement === this.el) {
            return;
          }
          this.setDisplayValue(formatNumber(value, this.decimals, true));
        }),
      );
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  @HostListener('focus')
  onFocus(): void {
    this.userEditing = true;
    this.userTouched = false;
  }

  @HostListener('input', ['$event.target.value'])
  onInput(raw: string): void {
    if (this.internalUpdate) return;

    this.userEditing = true;
    this.userTouched = true;
    this.userHasDecimal = /[,.]\d+/.test(raw);

    const parsed = parseNumber(raw);

    if (this.ngControl?.control && parsed !== null) {
      this.internalUpdate = true;
      this.ngControl.control.setValue(parsed, { emitEvent: false, emitModelToViewChange: false });
      this.internalUpdate = false;
    }

    this.setFormattedDisplay(formatRawInput(raw), raw);
  }

  @HostListener('blur')
  onBlur(): void {
    this.userEditing = false;

    if (!this.userTouched) return;

    if (this.ngControl?.control) {
      const val = this.ngControl.control.value;
      this.setDisplayValue(formatNumber(val, this.decimals, this.userHasDecimal));
    }
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
