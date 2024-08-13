import {Options} from 'react-native-navigation';

export type Route = {
  /**
   * The name of the route, used for registration with React Native Navigation
   */
  name: string;

  /**
   * The path pattern associated with the route
   */
  path: string;

  /**
   * Optional navigation options for customizing the route
   */
  options?: Options;

  /**
   * Optional action to be executed when the route is activated
   */
  action?: () => Promise<void>;

  /**
   * The React component associated with the route
   */
  Component?: React.ComponentType<any> | null;

  /**
   * Optional error boundary component for the route
   */
  ErroBoundary?: React.ComponentType | null;
};

export type MatchedRoute = {
  /**
   * Type representing the match object from the router
   */
  match: Route;

  /**
   * Type representing the URL object
   */
  url: URL;

  /**
   * Type representing any data associated with the router
   */
  data: unknown;
};

export type AppRouter = {
  /**
   * Array of routes to be registered with the router
   */
  routes: Route[];

  /**
   * Optional provider component for wrapping the application
   */
  Provider?: React.ComponentType;

  /**
   * Optional callback for when the app is launched
   */
  onAppLaunched?: () => Promise<void>;
};
