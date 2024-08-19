import React from 'react';

/**
 * Context for the Developer Menu in a React Native application.
 *
 * This context provides access to developer menu-specific data and functionality
 * throughout the component tree. It is particularly useful in development mode (`__DEV__`).
 *
 * @example
 * ```tsx
 * import { DevMenuContext } from './DevMenuContext';
 *
 * const MyComponent = () => {
 *   const devMenu = React.useContext(DevMenuContext);
 *
 *   return <SomeComponent />;
 * };
 * ```
 */
export const DevMenuContext = React.createContext<any>(null);

// Set the display name for easier debugging in React DevTools
if (__DEV__) {
  DevMenuContext.displayName = 'DevMenuContext';
}
