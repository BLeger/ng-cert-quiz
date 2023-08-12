import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Question } from '../data.models';
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

  @Output() changeQuestionAsked = new EventEmitter<number>();

  userAnswers: string[] = [];
  quizService = inject(QuizService);
  router = inject(Router);

  changeQuestion(index: number): void {
    if (this.allowQuestionChange) {
      this.allowQuestionChange = false;
      this.changeQuestionAsked.emit(index);
    }
  }

  submit(): void {
    this.quizService.computeScore(this.questions ?? [], this.userAnswers);
    this.router.navigateByUrl('/result');
  }
}
