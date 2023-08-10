import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Subject, tap, timer } from 'rxjs';

@Component({
  selector: 'app-auto-filter',
  templateUrl: './auto-filter.component.html',
  styleUrls: ['./auto-filter.component.css'],
})
export class AutoFilterComponent<T> implements OnInit, OnChanges {
  _isPanelOpen = false;

  public get isPanelOpen(): boolean {
    return this._isPanelOpen;
  }

  private set isPanelOpen(open: boolean) {
    this._isPanelOpen = open;
    this._isPanelOpen ? this.opened.emit() : this.closed.emit();
  }

  private subj = new Subject<string[]>();
  options$ = this.subj.asObservable();

  public filter = '';
  private value?: T;

  @Input({ required: true }) dataset!: T[] | null;

  @Input() transformer: (option: T) => string = (option: T) => '';

  @Output() opened = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  @Output() selected = new EventEmitter<T>();

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    this.updateOptions();
  }

  updateOptions(): void {
    this.subj.next(
      (this.dataset?.map((opt) => this.transformer(opt)) ?? []).filter((opt) =>
        opt.toLowerCase().includes(this.filter.toLowerCase())
      )
    );
  }

  select(option: string): void {
    this.filter = option;
    this.updateOptions();
    this.value = this.dataset?.find((opt) => this.transformer(opt) === option);
    this.selected.emit(this.value);
  }

  onFocus(): void {
    this.isPanelOpen = true;
  }

  onBlur(): void {
    timer(100)
      .pipe(
        tap(() => {
          this.isPanelOpen = false;
        })
      )
      .subscribe();
  }
}
