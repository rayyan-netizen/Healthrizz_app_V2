/**
 * Environment variables — read once, validated, exported as typed constants.
 * Expo embeds EXPO_PUBLIC_* vars at build time.
 */

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing required env var ${name}. Did you set it in .env?`
    );
  }
  return value;
}

export const ENV = {
  SUPABASE_URL: required(
    'EXPO_PUBLIC_SUPABASE_URL',
    process.env.EXPO_PUBLIC_SUPABASE_URL
  ),
  SUPABASE_ANON_KEY: required(
    'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  ),
  APP_ENV: (process.env.EXPO_PUBLIC_APP_ENV ?? 'development') as
    | 'development'
    | 'production',
  /** When true, app renders against fixtures/demo child without requiring auth. */
  DEMO_MODE: process.env.EXPO_PUBLIC_DEMO_MODE === 'true',
};

export const IS_DEV = ENV.APP_ENV === 'development';
export const IS_DEMO = ENV.DEMO_MODE;
