import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AutoFilterComponent } from './auto-filter/auto-filter.component';
import { ScrollableDirective } from './directives/scrollable.directive';
import { HighlightPipe } from './pipes/highlight.pipe';

@NgModule({
  declarations: [AutoFilterComponent, HighlightPipe, ScrollableDirective],
  imports: [CommonModule, ReactiveFormsModule],
  exports: [AutoFilterComponent, HighlightPipe, ScrollableDirective],
})
export class SharedModule {}
