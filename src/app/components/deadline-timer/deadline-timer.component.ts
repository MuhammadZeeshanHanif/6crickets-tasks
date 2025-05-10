import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, interval, Observable, Subject } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { DeadlineTimerService } from 'src/app/services/deadline-timer/deadline-timer.service';

@Component({
  selector: 'app-deadline-timer',
  templateUrl: './deadline-timer.component.html',
  styleUrls: ['./deadline-timer.component.css']
})
export class DeadlineTimerComponent implements OnInit, OnDestroy {
  secondsLeft$: Observable<number>;
  private initialSecondsSubject = new BehaviorSubject<number>(0);
  private destroy$ = new Subject<void>();

  constructor(private deadlineTimerService: DeadlineTimerService) {
    // Initialize secondsLeft$ as an observable that updates every second
    this.secondsLeft$ = this.initialSecondsSubject.pipe(
      switchMap(initialSeconds =>
        interval(1000).pipe(
          map(tick => Math.max(0, initialSeconds - tick)),
          takeUntil(this.destroy$)
        )
      )
    );
  }

  ngOnInit(): void {
    // Fetch initial seconds from API
    this.deadlineTimerService.getSecondsLeft().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: ({ secondsLeft }) => {
        this.initialSecondsSubject.next(secondsLeft);
      },
      error: (error) => {
        console.error('Failed to fetch deadline:', error);
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.destroy$.next();
    this.destroy$.complete();
  }
}