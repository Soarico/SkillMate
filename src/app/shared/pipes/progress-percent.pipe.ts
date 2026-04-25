import { Pipe, PipeTransform } from '@angular/core';

import { calculateProgressPercent } from '../utils/compatibility.util';

@Pipe({
  name: 'progressPercent',
  standalone: true,
})
export class ProgressPercentPipe implements PipeTransform {
  transform(completedLessons: number, totalLessons: number): number {
    return calculateProgressPercent(completedLessons, totalLessons);
  }
}
