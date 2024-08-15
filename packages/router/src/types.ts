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
  action?: (...args: any) => Promise<void>;

  /**
   * The React component associated with the route
   */
  Component?: React.ComponentType;

  /**
   * Optional error boundary component for the route
   */
  ErrorBoundary?: React.ComponentType;
};

export type AppRouter = {
  /**
   * Array of routes to be registered with the router
   */
  routes: Route[];

  /**
   * Optional provider component for wrapping the application
   */
  Provider?: React.ComponentType<any>;

  /**
   * Optional provider component for wrapping the application
   */
  PartialProvider?: React.ComponentType<any>;

  /**
   * Optional callback for when the app is launched
   */
  onAppLaunched?: () => Promise<void>;
};

export type Match = {
  /**
   * The name of the route, used for registration with React Native Navigation
   */
  name: string;

  /**
   * The path pattern associated with the route
   */
  path: string;

  /**
   * Type representing the URL object
   */
  url: URL | null;

  /**
   * Type representing any data associated with the router
   */
  data: unknown;

  /**
   * Array of routes to be registered with the router
   */
  routes: Route[];
};

/**
 * Represents the data structure for a modal component.
 * @template T The type of data passed to the modal.
 * @template U The type of result returned by the modal.
 */
export type ModalData<T, U> = {
  /**
   * A function that returns another function to resolve the modal with a result.
   * @param componentId The unique identifier of the modal component.
   * @returns A function that takes a result and returns it.
   */
  resolve: (componentId: string) => (result: U) => U;

  /**
   * A function that returns another function to reject or close the modal without a result.
   * @param componentId The unique identifier of the modal component.
   * @returns A function that closes the modal without returning a result.
   */
  reject: (componentId: string) => () => void;

  /**
   * The data passed to the modal component.
   */
  data: T;
};
