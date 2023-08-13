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
  map,
  shareReplay,
  startWith,
  tap,
} from 'rxjs';

// TODO :
// * Améliorer le positionnement CSS
// * Implémenter ControlValueAccessor
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
  static defaultId = 0;

  _isPanelOpen = false;

  public get isPanelOpen(): boolean {
    return this._isPanelOpen;
  }

  private set isPanelOpen(open: boolean) {
    this._isPanelOpen = open;
    this._isPanelOpen ? this.opened.emit() : this.closed.emit();
  }

  public filterControl = new FormControl('', { nonNullable: true });

  private optionsSubject = new BehaviorSubject<IOption<T>[]>([]);
  private activeSubject = new BehaviorSubject<number>(0);

  private activeOption?: IOption<T>;
  private filteredOptionsCount = 0;

  filteredOptions$ = combineLatest([
    this.optionsSubject.asObservable(),
    this.filterControl.valueChanges.pipe(startWith(''), shareReplay()),
    this.activeSubject.asObservable(),
  ]).pipe(
    map(([options, filter, activeIndex]) =>
      options
        .filter((opt) => this.filterFn(opt, filter))
        .map((opt, index) => ({ ...opt, active: index === activeIndex }))
    ),
    tap((options) => {
      this.activeOption = options.find((opt) => opt.active);
      this.filteredOptionsCount = options.length;
    })
  );

  private _value?: T;
  private set value(value: T | undefined) {
    this._value = value;
    this.selectedChange.emit(value);
  }
  public get value(): T | undefined {
    return this._value;
  }

  public componentId: number;
  public listboxId: string;

  @Input() set disabled(disabled: boolean) {
    disabled ? this.filterControl.disable() : this.filterControl.enable();
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

  @Input() selected?: T; // TODO ?
  @Output() selectedChange = new EventEmitter<T>();

  constructor(private elementRef: ElementRef) {
    AutoFilterComponent.defaultId++;
    this.componentId = AutoFilterComponent.defaultId;
    this.listboxId = `listbox_${this.componentId}`;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options']) {
      this.optionsSubject.next(
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
    this.filterControl.setValue(option.label);
    this.value = option.value;
    this.isPanelOpen = false;
  }

  private findOptionsFromFilter(filter: string): T | undefined {
    return this.options?.find((opt) => this.displayFn(opt) === filter);
  }

  trackByLabel(index: number, item: IOption<T>): string {
    return item.label;
  }

  private closePanel(): void {
    this.isPanelOpen = false;
    const option = this.findOptionsFromFilter(this.filterControl.value);
    if (option) {
      this.value = option;
    } else {
      this.filterControl.setValue('');
    }
  }

  @HostListener('document:click', ['$event'])
  onClick(event: any) {
    // Si on clic en dehors du composant
    if (
      this.isPanelOpen &&
      !this.elementRef.nativeElement.contains(event.target)
    ) {
      this.closePanel();
    }
  }

  @HostListener('keydown.arrowdown', ['$event'])
  onArrowDown($event: KeyboardEvent) {
    $event.preventDefault();

    const activeIndex = this.activeSubject.value;
    if (activeIndex < this.filteredOptionsCount - 1) {
      this.activeSubject.next(activeIndex + 1);
    }
  }

  @HostListener('keydown.arrowup', ['$event'])
  onArrowUp($event: KeyboardEvent) {
    $event.preventDefault();

    const activeIndex = this.activeSubject.value;
    if (activeIndex > 0) {
      this.activeSubject.next(activeIndex - 1);
    }
  }

  @HostListener('keydown.enter', ['$event'])
  onEnter($event: KeyboardEvent) {
    $event.preventDefault();

    this.select(this.activeOption!);
  }

  onFocus(): void {
    this.isPanelOpen = true;
  }

  /**
   * Ferme le panel quand on navige vers un autre input ou appuie sur echap
   */
  @HostListener('keydown.tab')
  @HostListener('keydown.escape')
  onTabulationOrEscape() {
    this.closePanel();
  }
}
