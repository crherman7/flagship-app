/**
 * Re-exports all exports from the 'env' module.
 * This approach ensures that TypeScript correctly merges and aggregates type declarations
 * from the 'env' module into the current namespace, allowing for consistent type management
 * and improved type inference across the project.
 *
 * Example:
 *
 * ```typescript
 * // env.ts
 * export function getEnv() {
 *   return process.env.NODE_ENV;
 * }
 *
 * // index.ts
 * export * from './env';
 *
 * // app.ts
 * import { env } from '@brandingbrand/flagship-app-env';
 *
 * // with over-written types
 * console.log(env);
 * ```
 */

export * from './env';
