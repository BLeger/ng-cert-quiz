import {ComponentFixture, TestBed} from '@angular/core/testing';

import {QuizMakerComponent} from './quiz-maker.component';

describe('GameStatsComponent', () => {
  let component: QuizMakerComponent;
  let fixture: ComponentFixture<QuizMakerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QuizMakerComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(QuizMakerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
