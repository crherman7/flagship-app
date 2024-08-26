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
  action?: (
    url: string,
    pathParms: object,
    queryParams: object,
  ) => Promise<void>;

  /**
   * The React component associated with the route
   */
  Component?: React.ComponentType;

  /**
   * Optional error boundary component for the route
   */
  ErrorBoundary?: React.ComponentType;

  /**
   * An optional array of navigation guard functions.
   *
   * Each guard is executed sequentially during the navigation process.
   *
   * @type {Guard[]}
   * @example
   * const guards: Guard[] = [
   *   async (to, from, next) => {
   *     if (to.path === '/protected') {
   *       await next.redirect('/login');
   *     } else {
   *       next.cancel();
   *     }
   *   },
   *   async (to, from, next) => {
   *     if (to.query.token) {
   *       next.cancel(); // Stop further guards if a token is present
   *     }
   *   }
   * ];
   */
  guards?: Guard[];
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
  routes: (Omit<Route, 'Component' | 'ErrorBoundary'> & {
    hasComponent: boolean;
  })[];
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

interface ParsedPath {
  /** The url hash. */
  hash: string;
  /** The url domain (including subdomain and port). */
  host: string;
  /** The input url. */
  href: string;
  /**
   * @default ''
   */
  password: string;
  /**
   * Whether the parsing failed or not.
   */
  parse_failed: boolean;
  /** The url pathname. */
  pathname: string;
  /**
   * The domain port.
   * @default ''
   */
  port: string;
  /** The first protocol, `"ssh"` (if the url is a ssh url) or `"file"`. */
  protocol: string;
  /** An array with the url protocols (usually it has one element). */
  protocols: string[];
  /** The url querystring, parsed as object. */
  query: Record<string, string>;
  /** The url domain (including subdomains). */
  resource: string;
  /** The url querystring value. */
  search: string;
  /** The authentication user (usually for ssh urls). */
  user: string;
}

/**
 * Represents an object with methods to control the flow of navigation guards.
 */
type Next = {
  /**
   * Cancels the navigation process.
   * @example
   * next.cancel();
   */
  cancel: Function;

  /**
   * Redirects the navigation to a specified path.
   *
   * @param path - The path to redirect to.
   * @returns A promise that resolves when the redirection is complete.
   * @example
   * next.redirect('/login');
   */
  redirect: (path: string) => void;
};

/**
 * Represents a navigation guard function.
 *
 * @param to - The destination route's parsed path object.
 * @param from - The current route's parsed path object.
 * @param next - An object with methods to control the navigation process.
 *
 * @returns A promise that resolves when the guard logic is complete.
 *
 * @example
 * const guard: Guard = async (to, from, next) => {
 *   if (to.path === '/protected') {
 *     await next.redirect('/login');
 *   } else {
 *     next.cancel();
 *   }
 * };
 */
export type Guard = (
  to: ParsedPath,
  from: ParsedPath,
  next: Next,
) => Promise<void>;
