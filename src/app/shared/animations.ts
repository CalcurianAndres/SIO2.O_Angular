import { animate, group, query, style, transition, trigger } from '@angular/animations';

export const routeAnimations = trigger('routeAnimations', [
  transition('* <=> *', [
    query(':enter, :leave', style({ position: 'fixed', width: '100%' }), { optional: true }),
    group([
      query(':leave', [style({ opacity: 1 }), animate('200ms ease-out', style({ opacity: 0 }))], { optional: true }),
      query(':enter', [style({ opacity: 0 }), animate('300ms ease-in', style({ opacity: 1 }))], { optional: true }),
    ]),
  ]),
]);
