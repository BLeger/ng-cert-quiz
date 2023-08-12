import { Component, inject, Input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Difficulty, Question } from '../data.models';
import { QuizService } from '../quiz.service';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css'],
})
export class QuizComponent {
  allowQuestionChange = true;

  @Input()
  questions: Question[] | null = [];

  @Input() categoryId?: number;
  @Input() difficulty?: Difficulty;

  userAnswers: string[] = [];
  quizService = inject(QuizService);
  router = inject(Router);

  changeQuestion(index: number): void {
    if (!this.allowQuestionChange) {
      return;
    }
    this.allowQuestionChange = false;

    this.quizService
      .getQuestion(this.categoryId!, this.difficulty!)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (newQuestion) => {
          if (newQuestion) {
            this.questions![index] = newQuestion;
          }
        },
      });
  }

  submit(): void {
    this.quizService.computeScore(this.questions ?? [], this.userAnswers);
    this.router.navigateByUrl('/result');
  }
}
