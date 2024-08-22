import 'react-native-url-polyfill/auto';

/**
 * Re-exports everything from the `hooks` module.
 *
 * This allows you to access hooks like `useLinking` and other utilities directly
 * from this file, providing a single point of access for related functionalities.
 *
 * @remarks
 * Ensure you have `react-native-url-polyfill` installed and imported if you
 * use URL-related features across your application.
 *
 * @packageDocumentation
 */
export * from './hooks';

/**
 * Re-exports everything from the `router` module.
 *
 * This includes functions and types related to routing and navigation within
 * your application, such as the `register` function for setting up routes and
 * layouts.
 *
 * @remarks
 * This is essential for setting up and managing navigation within your app.
 *
 * @packageDocumentation
 */
export * from './router';
