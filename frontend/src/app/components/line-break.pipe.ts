import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'lineBreak',
  standalone: true,
})
export class LineBreakPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return value;

    return value.replace(/(?:\r\n|\r|\n)/g, '<br />'); // Replace newlines with <br />
  }
}
