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

  transformerFn = (category: Category) => category.name;

  constructor(protected quizService: QuizService) {
    this.categories$ = quizService.getAllCategories();
  }

  createQuiz(cat?: string, difficulty?: string): void {
    if (!cat || !difficulty) {
      return;
    }

    this.questions$ = this.quizService.createQuiz(
      cat,
      difficulty as Difficulty
    );
  }
}
