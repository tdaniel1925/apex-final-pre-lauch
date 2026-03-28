import { beforeAll, afterAll } from 'vitest';
import '@testing-library/jest-dom';
import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables from .env.test
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

beforeAll(() => {
  // Setup test environment
  // Fallback values if .env.test is not configured
  process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://test.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key';
  process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-key';
});

afterAll(() => {
  // Cleanup
});
