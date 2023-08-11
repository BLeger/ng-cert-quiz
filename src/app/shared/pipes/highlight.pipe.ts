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
      SecurityContext.HTML, // TODO : vérifier si c'est le meilleur contexte
      this.highlight(value, highlight)
    );
  }

  private highlight(value: string, highlight: string): string {
    // Regex qui capture la portion de texte à highlight
    const regex = new RegExp(`(${highlight})`, 'gi');

    // Remplace la capture par elle même entourée de <b>
    return value.replace(regex, `<b>$1</b>`);
  }
}
