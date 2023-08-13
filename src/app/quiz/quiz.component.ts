import { Component, inject, Input, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Difficulty, Question } from '../data.models';
import { QuizService } from '../quiz.service';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css'],
})
export class QuizComponent implements OnDestroy {
  allowQuestionChange = true;

  @Input()
  questions: Question[] | null = [];

  @Input() categoryId?: number;
  @Input() difficulty?: Difficulty;

  userAnswers: string[] = [];
  quizService = inject(QuizService);
  router = inject(Router);

  subscriptions = new Subscription();

  changeQuestion(index: number): void {
    if (!this.allowQuestionChange) {
      return;
    }
    this.allowQuestionChange = false;

    this.subscriptions.add(
      this.quizService
        .getQuestion(this.categoryId!, this.difficulty!)
        .subscribe({
          next: (newQuestion) => {
            if (newQuestion) {
              this.questions![index] = newQuestion;
            }
          },
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  submit(): void {
    this.quizService.computeScore(this.questions ?? [], this.userAnswers);
    this.router.navigateByUrl('/result');
  }
}
