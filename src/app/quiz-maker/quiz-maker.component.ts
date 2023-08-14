import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Category, Difficulty, Question } from '../data.models';
import { QuizService } from '../quiz.service';

@Component({
  selector: 'app-quiz-maker',
  templateUrl: './quiz-maker.component.html',
  styleUrls: ['./quiz-maker.component.css'],
})
export class QuizMakerComponent implements OnInit, OnDestroy {
  categories$: Observable<Category[]>;
  questions$!: Observable<Question[]>;

  difficulties = ['Easy', 'Medium', 'Hard'];
  subCategories: Category[] = [];

  currentCategory?: number;
  currentDifficulty?: Difficulty;

  displayFn = (category: Category) => category.name;

  form = this.formBuilder.group({
    category: [null as Category | null, [Validators.required]],
    subcategory: [null as Category | null, []],
    difficulty: ['', [Validators.required]],
  });

  private subscription = new Subscription();

  constructor(
    protected quizService: QuizService,
    private formBuilder: FormBuilder
  ) {
    this.categories$ = quizService.getAllCategories();
  }

  ngOnInit(): void {
    this.subscription.add(
      this.form.get('category')?.valueChanges.subscribe({
        next: (value: Category | null) => {
          // Si la catégorie a un sous-categorie (id == -1), il faut que la sous-categorie soit alimentée
          const hasSubcategories = value?.id === -1;
          this.subCategories = hasSubcategories ? value.children : [];
          this.form
            .get('subcategory')
            ?.setValidators(hasSubcategories ? [Validators.required] : []);
          this.form.get('subcategory')?.reset();
        },
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  createQuiz(): void {
    if (this.form.invalid) {
      return;
    }

    const values = this.form.value;

    this.currentCategory =
      values.category?.id !== -1 ? values.category?.id : values.subcategory?.id;
    this.currentDifficulty = values.difficulty as Difficulty;

    this.questions$ = this.quizService.createQuiz(
      this.currentCategory!,
      this.currentDifficulty
    );
  }
}
