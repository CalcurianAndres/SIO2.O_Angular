import { ElementRef, Renderer2 } from '@angular/core';
import { NumberFormatDirective } from './number-format.directive';

describe('NumberFormatDirective', () => {
  it('should create an instance', () => {
    const el = new ElementRef(document.createElement('input'));
    const renderer = { setAttribute: () => {}, setProperty: () => {} } as unknown as Renderer2;
    const directive = new NumberFormatDirective(el, renderer, null!);
    expect(directive).toBeTruthy();
  });
});
