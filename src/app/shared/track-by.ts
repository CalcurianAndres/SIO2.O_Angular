import { TrackByFunction } from '@angular/core';

export const trackByIndex: TrackByFunction<number> = (index) => index;

export function trackById<T extends { id: number | string }>(): TrackByFunction<T> {
  return (_, item) => item.id;
}
