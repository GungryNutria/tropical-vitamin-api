// Placeholder values only. Never use real credentials in tests.
export const TEST_ENV: Record<string, string> = {
  DATABASE_URL: 'postgresql://user:password@localhost:5432/test',
  JWT_SECRET: 'test-secret-test-secret-test-secret-0123',
  AUTH0_DOMAIN: 'test.example.auth0.com',
  AUTH0_AUDIENCE: 'https://api.example.com',
  AGENCY_EMAIL: 'agency@example.com',
  MAIL_HOST: 'smtp.example.com',
  MAIL_PORT: '587',
  MAIL_USER: 'user@example.com',
  MAIL_PASS: 'change-me',
  MAIL_FROM: 'no-reply@example.com',
  S3_ENDPOINT: 'https://s3.example.com',
  S3_ACCESS_KEY: 'example',
  S3_SECRET_KEY: 'change-me',
  S3_BUCKET: 'example-bucket',
  S3_PUBLIC_URL: 'https://s3.example.com/example-bucket',
};

export function setTestEnv() {
  Object.assign(process.env, TEST_ENV);
}
