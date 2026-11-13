import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true, tsconfig: 'tsconfig.test.json' }],
    '^.+\\.jsx?$': ['ts-jest', { useESM: true, tsconfig: 'tsconfig.test.json' }],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(?:\\.pnpm/)?@sergeylc\\+knowledge-vault-contract(?:@[^/]+)?(?:/.*)?/node_modules/@sergeylc/knowledge-vault-contract/)',
  ],
  testPathIgnorePatterns: ['/dist/'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};

export default config;
