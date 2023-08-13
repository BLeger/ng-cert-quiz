import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appScrollable]',
})
export class ScrollableDirective {
  constructor(private elementRef: ElementRef) {}

  scrollTo(): void {
    this.elementRef.nativeElement.scrollIntoView({
      block: 'nearest',
    });
  }
}
