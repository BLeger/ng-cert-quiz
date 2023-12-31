import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  ViewChildren,
  forwardRef,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import {
  BehaviorSubject,
  Subscription,
  combineLatest,
  map,
  shareReplay,
  startWith,
  tap,
} from 'rxjs';
import { ScrollableDirective } from '../directives/scrollable.directive';

interface IOption<T> {
  value: T;
  label: string;
  active: boolean;
}

@Component({
  selector: 'app-auto-filter',
  templateUrl: './auto-filter.component.html',
  styleUrls: ['./auto-filter.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutoFilterComponent),
      multi: true,
    },
  ],
})
export class AutoFilterComponent<T>
  implements OnInit, OnChanges, ControlValueAccessor, OnDestroy
{
  @ViewChildren(ScrollableDirective) items?: QueryList<ScrollableDirective>;

  @Input() set disabled(disabled: boolean) {
    disabled ? this.filterControl.disable() : this.filterControl.enable();
  }

  @Input({ required: true }) options!: T[] | null;
  @Input() placeholder = '';

  // By default, displays the option as a string
  @Input() displayFn: (option: T) => string = (option: T) => `${option}`;
  // By defaults, filters by inclusion, non case sensitive
  @Input() filterFn: (option: IOption<T>, filter: string) => boolean = (
    option: IOption<T>,
    filter: string
  ) => option.label.toLowerCase().includes(filter.toLowerCase());

  @Output() opened = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  @Input() selected?: T;
  @Output() selectedChange = new EventEmitter<T>();

  // Open or close
  private _isPanelOpen = false;

  public get isPanelOpen(): boolean {
    return this._isPanelOpen;
  }

  private set isPanelOpen(open: boolean) {
    this._isPanelOpen = open;
    this._isPanelOpen ? this.opened.emit() : this.closed.emit();
  }

  // Control & options

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

  // Value

  private _value?: T;
  private set value(value: T | undefined) {
    this._value = value;
    this.selectedChange.emit(value);
    this.onChange(value);
  }
  public get value(): T | undefined {
    return this._value;
  }

  // Id
  static defaultId = 0;
  public componentId: number;
  public listboxId: string;

  // Control Value Accessor
  private onChange: (option: T | undefined) => void = () => {};
  private onTouch: () => void = () => {};

  private subscriptions = new Subscription();

  constructor(private elementRef: ElementRef) {
    AutoFilterComponent.defaultId++;
    this.componentId = AutoFilterComponent.defaultId;
    this.listboxId = `listbox_${this.componentId}`;
  }

  ngOnInit(): void {
    // Resets the active (showed in blue) option when typing
    this.subscriptions.add(
      this.filterControl.valueChanges.subscribe({
        next: (value) => {
          this.activeSubject.next(0);
          if (value && value.length > 0) {
            this.onTouch();
          }
        },
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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

    if (changes['selected'] && this.selected) {
      this.selectWithoutWrapper(this.selected);
    }
  }

  // Selects an option
  select(option: IOption<T>): void {
    this.filterControl.setValue(option.label);
    this.value = option.value;
    this.isPanelOpen = false;
  }

  // Selects an option without the IOption wrapper
  private selectWithoutWrapper(option: T): void {
    this.select({
      active: false,
      value: option,
      label: this.displayFn(option),
    });
  }

  trackByLabel(index: number, item: IOption<T>): string {
    return item.label;
  }

  private closePanel(): void {
    this.isPanelOpen = false;
    const option = this.options?.find(
      (opt) => this.displayFn(opt) === this.filterControl.value
    );
    if (option) {
      this.selectWithoutWrapper(option);
    } else {
      this.reset();
    }
  }

  private reset(): void {
    this.filterControl.setValue('');
    this.value = undefined;
  }

  // -- Control Value Accessor --

  writeValue(option: T | undefined): void {
    if (option && this.options?.includes(option)) {
      this.selectWithoutWrapper(option);
    } else {
      this.reset();
    }
  }

  registerOnChange(fn: (option: T | undefined) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // -- Click outside --

  @HostListener('document:click', ['$event'])
  onClick(event: any) {
    if (
      this.isPanelOpen &&
      !this.elementRef.nativeElement.contains(event.target)
    ) {
      this.closePanel();
    }
  }

  // -- Keyboard navigation --

  @HostListener('keydown.arrowdown', ['$event'])
  onArrowDown($event: KeyboardEvent) {
    $event.preventDefault();

    const activeIndex = this.activeSubject.value;
    if (activeIndex < this.filteredOptionsCount - 1) {
      this.activeSubject.next(activeIndex + 1);
      this.scrollToOption(activeIndex + 1);
    }
  }

  @HostListener('keydown.arrowup', ['$event'])
  onArrowUp($event: KeyboardEvent) {
    $event.preventDefault();

    const activeIndex = this.activeSubject.value;
    if (activeIndex > 0) {
      this.activeSubject.next(activeIndex - 1);
      this.scrollToOption(activeIndex - 1);
    }
  }

  private scrollToOption(index: number): void {
    const items = this.items?.toArray();
    if (items && items?.length >= index) {
      items[index]?.scrollTo();
    }
  }

  @HostListener('keydown.enter', ['$event'])
  onEnter($event: KeyboardEvent) {
    $event.preventDefault();

    if (this.activeOption) {
      this.select(this.activeOption);
    }
  }

  onFocus(): void {
    this.isPanelOpen = true;
  }

  /**
   * Closes the panel when navigating to another field (tabulation) or typing escape
   */
  @HostListener('keydown.tab')
  @HostListener('keydown.escape')
  onTabulationOrEscape() {
    this.closePanel();
  }
}
