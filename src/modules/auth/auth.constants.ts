export const ACCESS_TOKEN_SUBJECT = 'access';
export const REFRESH_TOKEN_SUBJECT = 'refresh';

export const DEFAULT_ACCESS_TOKEN_SECRET =
  process.env.JWT_ACCESS_SECRET ?? 'odonto-dev-access-secret';
export const DEFAULT_REFRESH_TOKEN_SECRET =
  process.env.JWT_REFRESH_SECRET ?? 'odonto-dev-refresh-secret';

export const DEFAULT_ACCESS_TOKEN_EXPIRES_IN =
  process.env.JWT_ACCESS_EXPIRES_IN ?? '15m';
export const DEFAULT_REFRESH_TOKEN_EXPIRES_IN =
  process.env.JWT_REFRESH_EXPIRES_IN ?? '30d';
