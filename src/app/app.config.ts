import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { authTokenInterceptor } from './core/http/auth-token.interceptor';
import { httpErrorInterceptor } from './core/http/http-error.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([authTokenInterceptor, httpErrorInterceptor])),
    provideRouter(routes),
  ],
};
