import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Category, Difficulty, Question } from '../data.models';
import { QuizService } from '../quiz.service';

@Component({
  selector: 'app-quiz-maker',
  templateUrl: './quiz-maker.component.html',
  styleUrls: ['./quiz-maker.component.css'],
})
export class QuizMakerComponent {
  categories$: Observable<Category[]>;
  questions$!: Observable<Question[]>;

  difficulties = ['Easy', 'Medium', 'Hard'];

  currentCategory?: number;
  currentDifficulty?: Difficulty;

  transformerFn = (category: Category) => category.name;

  constructor(protected quizService: QuizService) {
    this.categories$ = quizService.getAllCategories();
  }

  createQuiz(
    categoryId?: number,
    subCategoryId?: number,
    difficulty?: string
  ): void {
    // On doit avoir une catégorie, une difficulté.
    // Et si la catégorie a un sous-categorie (id == -1), il faut que la sous-categorie soit alimentée
    if (!categoryId || !difficulty || (categoryId === -1 && !subCategoryId)) {
      return;
    }

    this.currentCategory = categoryId !== -1 ? categoryId : subCategoryId;
    this.currentDifficulty = difficulty as Difficulty;

    this.questions$ = this.quizService.createQuiz(
      this.currentCategory!,
      this.currentDifficulty
    );
  }
}
