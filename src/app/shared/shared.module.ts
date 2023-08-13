import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AutoFilterComponent } from './auto-filter/auto-filter.component';
import { HighlightPipe } from './pipes/highlight.pipe';

@NgModule({
  declarations: [AutoFilterComponent, HighlightPipe],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  exports: [AutoFilterComponent],
})
export class SharedModule {}
