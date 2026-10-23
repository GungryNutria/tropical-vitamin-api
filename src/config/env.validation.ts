const REQUIRED = [
  'DATABASE_URL',
  'JWT_SECRET',
  'AUTH0_DOMAIN',
  'AUTH0_AUDIENCE',
  'AGENCY_EMAIL',
  'MAIL_HOST',
  'MAIL_PORT',
  'MAIL_USER',
  'MAIL_PASS',
  'MAIL_FROM',
  'S3_ENDPOINT',
  'S3_ACCESS_KEY',
  'S3_SECRET_KEY',
  'S3_BUCKET',
  'S3_PUBLIC_URL',
];

export function validateEnv(config: Record<string, unknown>) {
  for (const name of REQUIRED) {
    const value = config[name];
    if (typeof value !== 'string' || value.trim() === '') {
      throw new Error(`Missing env: ${name}`);
    }
  }
  if ((config.JWT_SECRET as string).length < 32) {
    throw new Error('Invalid env: JWT_SECRET must be at least 32 characters');
  }
  return config;
}
