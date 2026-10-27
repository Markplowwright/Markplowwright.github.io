import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// The site is served from the root of markplowwright.github.io, so base is '/'.
export default defineConfig({
  base: '/',
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
