// This service fetches the remaining seconds to a deadline from an API.
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { observable, Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DeadlineTimerService {
  private apiUrl = '/api/deadline';

  constructor(private http: HttpClient) {}

  /**
   * Fetches the seconds left to the deadline from the API.
   * @returns Observable with the seconds left.
   */
  getSecondsLeft(): Observable<{ secondsLeft: number }> {
     // Mock response (e.g., 1 hour = 3600 seconds)
    const mockResponse = { secondsLeft: 15 };
    return of(mockResponse);
  }

  /**
   * Handles HTTP errors and returns a user-friendly error message.
   * @param error - The HTTP error response.
   * @returns Observable with the error.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('API Error:', error);
    const errorMessage = error.status === 0
      ? 'Network error: Please check your connection.'
      : `API Error: ${error.status} - ${error.message}`;
    return throwError(() => new Error(errorMessage));
  }
}