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
  private destroySubj$ = new Subject<void>();

  constructor(private deadlineTimerService: DeadlineTimerService) {
    // Initialize secondsLeft$ as an observable that updates every second
    this.secondsLeft$ = this.initialSecondsSubject.pipe(
      switchMap(initialSeconds =>
        interval(1000).pipe(
          map(tick => Math.max(0, initialSeconds - tick)),
          takeUntil(this.destroySubj$)
        )
      )
    );
  }

  ngOnInit(): void {
    this.fetchSecondsLeft();
  }

  /**
   * This method is called when the component is initialized.
   * It fetches the initial seconds left from the API.
   */
  fetchSecondsLeft(): void {
    this.deadlineTimerService.getSecondsLeft().pipe(
      takeUntil(this.destroySubj$)
    ).subscribe({
      next: ({ secondsLeft }) => {
        this.initialSecondsSubject.next(secondsLeft);
      },
      error: (error) => {
        console.error('Failed to fetch deadline:', error);
      }
    });
  }

  /**
   * This method is called when the component is destroyed.
   * It cleans up the subscriptions to prevent memory leaks.
   */
  ngOnDestroy(): void {
    this.destroySubj$.next();
    this.destroySubj$.complete();
  }
}