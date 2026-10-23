import { Test } from '@nestjs/testing';
import { TEST_ENV, setTestEnv } from './test-env';

describe('Env validation (e2e)', () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
    jest.resetModules();
  });

  async function compileApp() {
    // Import after setting env: ConfigModule reads process.env on load.
    const { AppModule } = await import('../src/app.module');
    return Test.createTestingModule({ imports: [AppModule] }).compile();
  }

  it('does not start without JWT_SECRET (AC-26)', async () => {
    setTestEnv();
    delete process.env.JWT_SECRET;
    await expect(compileApp()).rejects.toThrow('Missing env: JWT_SECRET');
  });

  it('does not start with a short JWT_SECRET', async () => {
    setTestEnv();
    process.env.JWT_SECRET = 'short';
    await expect(compileApp()).rejects.toThrow('JWT_SECRET must be at least 32');
  });

  it.each(Object.keys(TEST_ENV).filter((k) => k !== 'JWT_SECRET'))(
    'does not start without %s',
    async (name) => {
      setTestEnv();
      delete process.env[name];
      await expect(compileApp()).rejects.toThrow(`Missing env: ${name}`);
    },
  );
});
