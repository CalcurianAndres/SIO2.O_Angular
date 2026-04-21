import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[appNumberFormat]'
})
export class NumberFormatDirective {

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event']) onInput(event: any) {
    console.log('aja')
    let inputVal = event.target.value;
    inputVal = inputVal.replace(/\D/g, ''); // Eliminar todos los caracteres que no sean dígitos
    inputVal = inputVal.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Agregar puntos como separadores de miles
    event.target.value = inputVal;
  }
}