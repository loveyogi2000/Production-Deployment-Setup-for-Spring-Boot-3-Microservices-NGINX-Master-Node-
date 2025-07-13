import {HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {OidcSecurityService} from 'angular-auth-oidc-client';
import {switchMap, take} from 'rxjs/operators';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(OidcSecurityService);

  return authService.getAccessToken().pipe(
    take(1), // ensure the observable completes
    switchMap((token: string) => {
      if (token) {
        const headers = req.headers.set('Authorization', 'Bearer ' + token);
        const authReq = req.clone({ headers });
        return next(authReq);
      }
      return next(req); // no token, send original request
    })
  );
};

