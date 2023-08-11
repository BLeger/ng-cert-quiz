import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// TODO :
// * Améliorer le positionnement CSS
// * Ne plus avoir besoin du timer au blur => ok
// * Donner accès à l'input (ControlValueAccessor ? ou directive ?)
// * Mieux détecter l'arrivée du dataset

@Component({
  selector: 'app-auto-filter',
  templateUrl: './auto-filter.component.html',
  styleUrls: ['./auto-filter.component.css'],
})
export class AutoFilterComponent<T> implements OnChanges {
  _isPanelOpen = false;
  private init = false;

  public get isPanelOpen(): boolean {
    return this._isPanelOpen;
  }

  private set isPanelOpen(open: boolean) {
    this._isPanelOpen = open;
    this._isPanelOpen ? this.opened.emit() : this.closed.emit();
  }

  private subj = new BehaviorSubject<string[]>([]);
  options$ = this.subj.asObservable();

  public filter = '';

  private _value?: T;
  private set value(value: T | undefined) {
    this._value = value;
    this.selectedChange.emit(value);
  }
  public get value(): T | undefined {
    return this._value;
  }

  @Input({ required: true }) dataset!: T[] | null;
  @Input() placeholder = '';

  @Input() transformer: (option: T) => string = (option: T) => `${option}`;

  @Output() opened = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  @Input() selected?: T;
  @Output() selectedChange = new EventEmitter<T>();

  constructor(private elementRef: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataset']) {
      if (!this.init) {
        this.init = true;
      }
      this.updateOptions();
    }
  }

  updateOptions(): void {
    this.subj.next(
      (this.dataset?.map((opt) => this.transformer(opt)) ?? []).filter((opt) =>
        opt.toLowerCase().includes(this.filter.toLowerCase())
      )
    );
  }

  select(filter: string): void {
    this.filter = filter;
    this.updateOptions();
    this.value = this.findOptionsFromFilter(filter);
    this.isPanelOpen = false;
  }

  onFocus(): void {
    this.isPanelOpen = true;
  }

  private findOptionsFromFilter(filter: string): T | undefined {
    return this.dataset?.find((opt) => this.transformer(opt) === filter);
  }

  @HostListener('document:click', ['$event'])
  onClick(event: any) {
    // Si on clic en dehors du composant
    if (
      this.isPanelOpen &&
      !this.elementRef.nativeElement.contains(event.target)
    ) {
      this.isPanelOpen = false;
      const option = this.findOptionsFromFilter(this.filter);
      if (option) {
        this.value = option;
      } else {
        this.filter = '';
      }
    }
  }
}
