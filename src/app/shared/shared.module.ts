import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoFilterComponent } from './auto-filter/auto-filter.component';
import { HighlightPipe } from './pipes/highlight.pipe';

@NgModule({
  declarations: [AutoFilterComponent, HighlightPipe],
  imports: [CommonModule, FormsModule],
  exports: [AutoFilterComponent],
})
export class SharedModule {}
