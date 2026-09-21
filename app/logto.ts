import { UserScope, type LogtoNextConfig } from '@logto/next';

export const logtoConfig: LogtoNextConfig = {
  endpoint: process.env.LOGTO_ENDPOINT ?? 'https://r3qv5a.logto.app/',
  appId: process.env.LOGTO_APP_ID ?? 'rcy12ljbvz0gbc556lgz7',
  appSecret: process.env.LOGTO_APP_SECRET ?? '',
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  cookieSecret: process.env.LOGTO_COOKIE_SECRET ?? '',
  cookieSecure: process.env.NODE_ENV === 'production',
  scopes: [UserScope.Email, UserScope.Roles, UserScope.Phone],
};
