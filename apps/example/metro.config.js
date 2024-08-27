const path = require('path');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const {
  getCacheVersion,
} = require('@brandingbrand/flagship-app-env/metro-bundler');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */

const workspaceRoot = path.resolve(__dirname, '../../');
const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.cacheVersion = getCacheVersion();

/**
 * Resetting Metro cache to ensure Babel transforms reflect the updated environment.
 *
 * When switching environments (e.g., development, staging, production), Babel may apply
 * different transformations based on the environment-specific configuration. However,
 * Metro's caching mechanism might retain outdated transforms from the previous environment,
 * leading to unexpected behavior or incorrect code being executed. To avoid this, we reset
 * the Metro cache whenever the environment changes, ensuring that the latest Babel transforms
 * are applied correctly.
 *
 * @example
 * config.resetCache = true;
 */
// config.resetCache = true;

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
