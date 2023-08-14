import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import {
  ApiCategory,
  ApiQuestion,
  Category,
  Difficulty,
  Question,
  Results,
} from './data.models';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  private API_URL = 'https://opentdb.com/';
  private latestResults!: Results;

  constructor(private http: HttpClient) {}

  getAllCategories(): Observable<Category[]> {
    return this.http
      .get<{ trivia_categories: ApiCategory[] }>(
        this.API_URL + 'api_category.php'
      )
      .pipe(map((res) => this.stucturizeCategories(res.trivia_categories)));
  }

  createQuiz(
    categoryId: number,
    difficulty: Difficulty
  ): Observable<Question[]> {
    return this.getQuestions(categoryId, difficulty, 5);
  }

  getQuestion(
    categoryId: number,
    difficulty: Difficulty
  ): Observable<Question | undefined> {
    return this.getQuestions(categoryId, difficulty, 1).pipe(
      map((questions) => (questions.length > 0 ? questions[0] : undefined))
    );
  }

  computeScore(questions: Question[], answers: string[]): void {
    let score = 0;
    questions.forEach((q, index) => {
      if (q.correct_answer == answers[index]) score++;
    });
    this.latestResults = { questions, answers, score };
  }

  getLatestResults(): Results {
    return this.latestResults;
  }

  private getQuestions(
    categoryId: number,
    difficulty: Difficulty,
    amount: number
  ): Observable<Question[]> {
    return this.http
      .get<{ results: ApiQuestion[] }>(
        `${
          this.API_URL
        }/api.php?amount=${amount}&category=${categoryId}&difficulty=${difficulty.toLowerCase()}&type=multiple`
      )
      .pipe(map((res) => this.transformQuestions(res.results)));
  }

  private transformQuestions(questions: ApiQuestion[]): Question[] {
    const quiz: Question[] = questions.map((q) => ({
      ...q,
      all_answers: [...q.incorrect_answers, q.correct_answer].sort(() =>
        Math.random() > 0.5 ? 1 : -1
      ),
    }));
    return quiz;
  }

  /**
   * Transforms an ApiCategory array to a hierarchy of Categories
   */
  private stucturizeCategories(categories: ApiCategory[]): Category[] {
    const structuredCategories: Category[] = [];
    for (const category of categories) {
      // If there is no :, then it's a simple category (no children)
      if (!category.name.includes(': ')) {
        structuredCategories.push({ ...category, children: [] });
      } else {
        const names = category.name.split(': ');

        const subcategory = {
          id: category.id,
          name: names[1],
          children: [],
        };

        // Check if there already is a parent with this name
        const parent = structuredCategories.find(
          (cat) => cat.name === names[0]
        );

        // if so, push a new subcategory in the parent
        if (parent) {
          parent.children.push(subcategory);
        } else {
          // Otherwise, create a new category with a child
          structuredCategories.push({
            id: -1,
            name: names[0],
            children: [subcategory],
          });
        }
      }
    }

    return structuredCategories;
  }
}
