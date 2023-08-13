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
import { FormControl } from '@angular/forms';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  map,
  startWith,
} from 'rxjs';

// TODO :
// * Améliorer le positionnement CSS
// * Implémenter ControlValueAccessor
// * Mieux détecter l'arrivée du dataset
// * Rename dataset
// * Gérer flèches haut / bas / entréé
// * Echap pour fermer
// * aria
// * Disabled
// * Remplacer ngModel par un FormControl pour debounce ?
// * Afficher tous les résultats avec un scroll ?

interface IOption<T> {
  value: T;
  label: string;
  active: boolean;
}

@Component({
  selector: 'app-auto-filter',
  templateUrl: './auto-filter.component.html',
  styleUrls: ['./auto-filter.component.css'],
})
export class AutoFilterComponent<T> implements OnChanges {
  _isPanelOpen = false;

  public get isPanelOpen(): boolean {
    return this._isPanelOpen;
  }

  private set isPanelOpen(open: boolean) {
    this._isPanelOpen = open;
    this._isPanelOpen ? this.opened.emit() : this.closed.emit();
  }

  private subj = new BehaviorSubject<IOption<T>[]>([]);
  options$ = this.subj.asObservable();

  public filterControl = new FormControl('', { nonNullable: true });

  filteredOptions$ = combineLatest([
    this.options$,
    this.filterControl.valueChanges.pipe(startWith(''), debounceTime(100)),
  ]).pipe(
    map(([options, filter]) =>
      options.filter((opt) => this.filterFn(opt, filter))
    )
  );

  private _value?: T;
  private set value(value: T | undefined) {
    this._value = value;
    this.selectedChange.emit(value);
  }
  public get value(): T | undefined {
    return this._value;
  }

  @Input({ required: true }) options!: T[] | null;
  @Input() placeholder = '';

  // Par défaut, affiche l'option en tant que string
  @Input() displayFn: (option: T) => string = (option: T) => `${option}`;
  // Par défaut, filtre le label en lowercase
  @Input() filterFn: (option: IOption<T>, filter: string) => boolean = (
    option: IOption<T>,
    filter: string
  ) => option.label.toLowerCase().includes(filter.toLowerCase());

  @Output() opened = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  @Input() selected?: T;
  @Output() selectedChange = new EventEmitter<T>();

  constructor(private elementRef: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options']) {
      this.subj.next(
        this.options?.map(
          (opt) =>
            ({
              value: opt,
              label: this.displayFn(opt),
              active: false,
            } as IOption<T>)
        ) ?? []
      );
    }
  }

  select(option: IOption<T>): void {
    this.filterControl.setValue(option.label, { emitEvent: false });
    this.value = option.value;
    this.isPanelOpen = false;
  }

  onFocus(): void {
    this.isPanelOpen = true;
  }

  private findOptionsFromFilter(filter: string): T | undefined {
    return this.options?.find((opt) => this.displayFn(opt) === filter);
  }

  trackById(index: number, item: IOption<T>): string {
    return item.label;
  }

  @HostListener('document:click', ['$event'])
  onClick(event: any) {
    // Si on clic en dehors du composant
    if (
      this.isPanelOpen &&
      !this.elementRef.nativeElement.contains(event.target)
    ) {
      this.isPanelOpen = false;
      const option = this.findOptionsFromFilter(this.filterControl.value);
      if (option) {
        this.value = option;
      } else {
        this.filterControl.setValue('');
      }
    }
  }
}
