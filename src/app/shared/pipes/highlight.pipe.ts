import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'highlight',
})
export class HighlightPipe implements PipeTransform {
  constructor(private domSanitizer: DomSanitizer) {}

  transform(value: string, highlight: string): string | null {
    if (!highlight) {
      return value;
    }

    return this.domSanitizer.sanitize(
      SecurityContext.HTML,
      this.highlight(value, highlight)
    );
  }

  private highlight(value: string, highlight: string): string {
    // Regex to capture the portions of text to be highlighted
    const regex = new RegExp(`(${highlight})`, 'gi');

    // Replaces the captured strings with themselves wrapped inside <b>
    return value.replace(regex, `<b>$1</b>`);
  }
}
