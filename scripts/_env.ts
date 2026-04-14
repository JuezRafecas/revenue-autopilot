import { config } from 'dotenv';
import { resolve } from 'node:path';

config({ path: resolve(process.cwd(), '.env.local') });

export function requireEnv(key: string): string {
  const v = process.env[key];
  if (!v) {
    console.error(`\n✗ Missing env var: ${key}`);
    console.error(`  Add it to .env.local (see .env.local.example)\n`);
    process.exit(1);
  }
  return v;
}
