import { PassedInitialConfig } from 'angular-auth-oidc-client';

export const authConfig: PassedInitialConfig = {
  config: {
    authority: 'https://20.244.11.56/auth/realms/spring-microservices-security-realm',
    redirectUrl: 'https://20.244.11.56',
    postLogoutRedirectUri: 'https://20.244.11.56',
    clientId: 'angular-client',
    scope: 'openid profile offline_access',
    responseType: 'code',
    silentRenew: true,
    useRefreshToken: true,
    renewTimeBeforeTokenExpiresInSeconds: 30
  }
}

