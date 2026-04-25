import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (request, next) =>
  next(request).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        const message = error.error?.message ?? error.message ?? 'Ошибка mock API';

        return throwError(() => new Error(message));
      }

      return throwError(() => error);
    }),
  );
