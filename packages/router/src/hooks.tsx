import {match} from 'path-to-regexp';
import {useContext, useEffect} from 'react';
import {Layout, Navigation, Options} from 'react-native-navigation';
import {Linking} from 'react-native';
import {URL} from 'react-native-url-polyfill';
import parseUrl from 'parse-url';

import {ComponentIdContext, ModalContext, RouterContext} from './context';
import {Guard, Route} from './types';

/**
 * Counter used for generating unique IDs.
 *
 * This variable keeps track of the last assigned ID and is incremented
 * each time a new ID is generated. It ensures that each generated ID
 * is unique within the current session or application lifecycle.
 *
 * @type {number}
 * @default 0
 */
let idCounter = 0;

/**
 * Custom hook to access the Router context.
 *
 * @returns {RouterContextType} The current router state from the RouterContext.
 * @throws Will throw an error if the hook is used outside of a RouterContext.Provider.
 */
export function useRoute() {
  const state = useContext(RouterContext);

  if (!state) {
    throw new Error(
      'useRoute must be used inside a AppRouterURLContext.Provider',
    );
  }

  return state;
}

/**
 * Hook to interact with a modal's state within the context of a `ModalContext.Provider`.
 * Provides access to the modal's data and functions to resolve or reject the modal.
 *
 * @template T - The type of the data passed to the modal.
 * @template U - The type of the result returned when the modal is resolved.
 *
 * @throws {Error} If the hook is used outside of a `ModalContext.Provider`.
 *
 * @returns {Object} An object containing the modal's data, a `resolve` function to return a result, and a `reject` function to close the modal without returning a result.
 *
 * @example
 * ```typescript
 * // Using useModal in a component
 * const { data, resolve, reject } = useModal<MyDataType, MyResultType>();
 *
 * // Access the data passed to the modal
 * console.log(data);
 *
 * // Resolve the modal with a result
 * const handleConfirm = () => {
 *   resolve({ success: true });
 * };
 *
 * // Reject the modal without returning a result
 * const handleCancel = () => {
 *   reject();
 * };
 * ```
 */
export function useModal<T, U>() {
  // Access the current modal state from the ModalContext
  const state = useContext(ModalContext);

  // Get the unique component ID of the modal
  const componentId = useComponentId();

  // Ensure the hook is used within a ModalContext.Provider
  if (!state) {
    throw new Error('useModal must be used inside a ModalContext.Provider');
  }

  return {
    // The data passed to the modal, cast to the type T
    data: state.data as T,

    // A function to resolve the modal with a result of type U
    resolve: state.resolve(componentId) as (result: U) => void,

    // A function to reject the modal, closing it without returning a result
    reject: state.reject(componentId) as () => void,
  };
}

/**
 * Custom hook to access the Component ID context.
 *
 * @returns {ComponentIdContextType} The current component ID from the ComponentIdContext.
 * @throws Will throw an error if the hook is used outside of a ComponentIdContext.Provider.
 */
export function useComponentId() {
  const state = useContext(ComponentIdContext);

  if (!state) {
    throw new Error(
      'useAppRouterURLContext must be used inside a ComponentIdContext.Provider',
    );
  }

  return state;
}

/**
 * Custom hook to retrieve URL parameters matched by the route's path.
 *
 * @returns {Record<string, string>} An object containing the matched URL parameters.
 * @throws Will throw an error if no matches are found for the path parameters.
 */
export function usePathParams() {
  const route = useRoute();

  if (!route.url) return {};

  // Match the current URL pathname against the router's path pattern
  try {
    const matches = match(route.path)(route.url.pathname);

    if (!matches) {
      throw new Error('no matches for path params');
    }

    // Return the matched parameters
    return matches.params;
  } catch (e) {
    return {};
  }
}

/**
 * Custom hook to retrieve search parameters from the URL.
 *
 * @returns {Record<string, string>} An object containing key-value pairs of search parameters.
 */
export function useQueryParams() {
  const route = useRoute();

  if (!route.url) return {};

  const {query} = parseUrl(route.url.href);

  return query;
}

/**
 * Custom hook to retrieve the router data.
 *
 * @returns {RouterDataType} The current router data.
 */
export function useRouteData<T>(): T {
  const route = useRoute();

  return route.data as T;
}

/**
 * Custom hook to provide navigation functions for managing the component stack.
 *
 * This hook relies on `react-native-navigation` to navigate between screens. It includes methods
 * to push new screens onto the stack, pop screens off the stack, and set the root of the stack.
 *
 * @returns {object} An object containing navigation methods: `push`, `pop`, `popToRoot`, `popTo`, `setStackRoot`, and `showModal`.
 */
export function useNavigator() {
  const componentId = useComponentId();
  const route = useRoute();

  /**
   * Executes a series of guards to determine if navigation should be redirected or canceled.
   *
   * @param toPath - The destination path for navigation.
   * @param fromPath - The current path from which navigation is happening. If not provided, it defaults to `undefined`.
   * @param guards - An optional array of guard functions to be executed. Each guard is invoked with the destination path, current path, and control functions.
   *
   * @returns A promise that resolves to the redirect path if a guard calls `redirect`, or `undefined` if no redirection is needed.
   */
  async function runGuards(
    toPath: string,
    fromPath?: string | null,
    guards?: Guard[],
  ): Promise<string | false | undefined> {
    // If no guards are provided, exit early
    if (!guards) return;

    let redirectPath: string | false | undefined;

    /**
     * Cancels the navigation process by throwing an error.
     * This will halt the execution of the guards and propagate the error.
     */
    function cancel() {
      redirectPath = false;
    }

    /**
     * Sets the redirect path if navigation needs to be redirected.
     *
     * @param path - The path to redirect to.
     */
    function redirect(path: string) {
      redirectPath = path;
    }

    // Execute each guard in the order they are provided
    for (const guard of guards) {
      // If a redirect has been set, exit early and return the redirect path
      if (redirectPath !== undefined) {
        return redirectPath;
      }

      try {
        // Call the guard function with the parsed paths and control functions
        await guard(
          parseUrl(toPath),
          fromPath ? parseUrl(fromPath) : undefined,
          {cancel, redirect, showModal},
        );
      } catch (e) {
        // TODO: Implement error handling logic if needed
        console.error(e); // Optional: Log error for debugging purposes
      }
    }

    // Return the redirect path if set, otherwise return `undefined`
    return redirectPath;
  }

  /**
   * Converts a URL path or full URL string to a `URL` object.
   *
   * If the input string does not contain a protocol, it prepends the default `bundleId`
   * and converts it into a complete URL. If a protocol exists, it directly converts the
   * input into a `URL` object.
   *
   * @param pathOrUrl - The URL path or full URL string to be converted.
   * @returns A `URL` object representing the complete URL.
   *
   * @example
   * ```typescript
   * const url1 = createAppURL('/path/to/resource');
   * console.log(url1.toString()); // Outputs: app://path/to/resource
   *
   * const url2 = createAppURL('https://example.com/resource');
   * console.log(url2.toString()); // Outputs: https://example.com/resource
   * ```
   */
  function createAppURL(pathOrUrl: string): URL {
    // Check if the input string contains a protocol using a regular expression.
    const hasProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(pathOrUrl);

    // Default bundle ID (or protocol) to prepend if no protocol is present.
    // TODO: use react-native-device-info to get bundleId or packageName
    const bundleId = 'app://';

    // Construct the full URL. If the input has a protocol, use it as is.
    // Otherwise, prepend the bundleId and format the URL.
    const fullUrl = hasProtocol
      ? pathOrUrl
      : `${bundleId}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;

    // Convert the resulting string into a URL object and return it.
    return new URL(fullUrl);
  }

  /**
   * Determines if a given route is associated with a bottom tab.
   *
   * @param {Route} route - The route to check.
   * @returns {boolean} True if the route is associated with a bottom tab, otherwise false.
   *
   * @example
   * const route = { name: 'Home', Component: HomeComponent, options: { bottomTab: { text: 'Home' } } };
   * const isTab = isBottomTab(route);
   * console.log(isTab); // true
   */
  function isBottomTab(route: Route): boolean {
    if (route.options?.bottomTab) {
      return true;
    }

    if ((route.Component as any)?.options?.bottomTab) {
      return true;
    }

    return false;
  }

  /**
   * Gets the index of a bottom tab for a given route.
   *
   * @param {Route} route - The route for which to get the bottom tab index.
   * @param {Route[]} routes - The array of all routes.
   * @returns {number} The index of the bottom tab.
   *
   * @example
   * const routes = [
   *   { name: 'Home', Component: HomeComponent, options: { bottomTab: { text: 'Home' } } },
   *   { name: 'Profile', Component: ProfileComponent, options: { bottomTab: { text: 'Profile' } } },
   * ];
   * const index = getBottomTabIndex(routes[1], routes);
   * console.log(index); // 1
   */
  function getBottomTabIndex(route: Route, routes: Route[]): number {
    const index = routes
      .filter(it => isBottomTab(it))
      .reduce((acc, curr, index) => {
        if (curr.name === route.name) {
          return index;
        }
        return acc;
      }, 0);

    return index;
  }

  /**
   * Opens a route based on the given path. If the route is associated with a bottom tab,
   * it pops to the root tab, otherwise, it pushes the new route.
   *
   * @param {string} path - The path to navigate to.
   * @param {Object} [passProps={}] - Optional properties to pass to the route.
   * @param {Options} [options] - Optional navigation options.
   *
   * @example
   * open('/profile', { userId: 123 }, { animated: true });
   *
   * @example
   * open('/home');
   */
  async function open(path: string, passProps = {}, options?: Options) {
    const url = createAppURL(path);
    const matchedRoute = route.routes.find(it => {
      return match(it.path)(url.pathname);
    });

    if (!matchedRoute) return;

    try {
      const redirect = await runGuards(
        url.href,
        route.url?.href,
        matchedRoute.guards,
      );

      if (redirect) {
        await open(redirect);
        // Break out of function since we are redirecting
        return;
      }

      if (redirect === false) {
        // Break out of function since cancel was executed
        return;
      }
    } catch (e) {
      // Break out of function due to side-effect throwing error from a guard
      return;
    }

    const res = match(matchedRoute.path)(url.pathname);
    const {query} = parseUrl(url.href);

    // Perform any associated action with the matched route
    try {
      await matchedRoute.action?.(url.href, res ? res.params : {}, query);
    } catch (e) {
      // handle error (e.g., log it)
    }

    // If there's no associated component, return
    if (!matchedRoute.hasComponent) return;

    // If the route is a bottom tab, pop to root
    if (isBottomTab(matchedRoute)) {
      return popToRoot({
        ...options,
        bottomTabs: {
          currentTabIndex: getBottomTabIndex(matchedRoute, route.routes),
        },
      });
    }

    // Otherwise, push the new route
    return push(path, passProps, options);
  }

  /**
   * Push a new screen onto the navigation stack.
   *
   * @param {string} path - The path or route name to navigate to.
   * @param {object} [passProps={}] - Optional props to pass to the new screen.
   * @param {Options} [options] - Optional navigation options for customizing the transition.
   */
  async function push(path: string, passProps = {}, options?: Options) {
    const matchedRoute = route.routes.find(it => {
      return match(it.path)(path);
    });

    if (!matchedRoute) return;

    return Navigation.push(componentId, {
      component: {
        name: matchedRoute.name,
        passProps: {
          ...passProps,
          __flagship_app_router_url: path, // Inject the URL path as a special prop
        },
        options,
      },
    });
  }

  /**
   * Pop the current screen off the navigation stack, returning to the previous screen.
   *
   * @param {Options} [mergeOptions] - Optional navigation options for customizing the transition.
   */
  function pop(mergeOptions?: Options) {
    return Navigation.pop(componentId, mergeOptions);
  }

  /**
   * Pop all screens off the stack and return to the root screen.
   *
   * @param {Options} [mergeOptions] - Optional navigation options for customizing the transition.
   */
  function popToRoot(mergeOptions?: Options) {
    return Navigation.popToRoot(componentId, mergeOptions);
  }

  /**
   * Pop to a specific screen in the stack.
   *
   * @param {Options} [mergeOptions] - Optional navigation options for customizing the transition.
   */
  function popTo(mergeOptions?: Options) {
    return Navigation.popTo(componentId, mergeOptions);
  }

  /**
   * Set a new root for the stack, replacing all existing screens.
   *
   * @param {Layout | Layout[]} layout - The new layout or stack of layouts to set as the root.
   */
  function setStackRoot(layout: Layout | Layout[]) {
    return Navigation.setStackRoot(componentId, layout);
  }

  /**
   * Displays a modal with the specified component and data, and returns a promise
   * that resolves when the modal is dismissed.
   *
   * @template T - The type of data passed to the modal.
   * @template U - The type of data returned when the modal is resolved.
   *
   * @param Component - The React component to render inside the modal.
   * @param data - The data to pass to the modal component.
   * @param options - Additional options for displaying the modal.
   *
   * @returns A promise that resolves with the data returned from the modal when it's dismissed.
   *
   * @example
   * ```typescript
   * const result = await showModal<MyComponentProps, ResultType>(MyComponent, { prop1: 'value' }, { modalOptions: true });
   * console.log('Modal result:', result);
   * ```
   */
  async function showModal<T, U>(
    Component: React.ComponentType,
    data: T,
    options: Options = {},
  ): Promise<U> {
    // Generate a unique name for the modal component.
    const name = `Modal_${idCounter}`;
    idCounter++;

    // Register the modal component with React Native Navigation.
    Navigation.registerComponent(
      name,
      () => props => {
        const {componentId, resolve, reject, ...passProps} = props;

        return (
          <ComponentIdContext.Provider value={componentId}>
            <ModalContext.Provider value={{resolve, reject, data: passProps}}>
              <Component />
            </ModalContext.Provider>
          </ComponentIdContext.Provider>
        );
      },
      () => Component,
    );

    // Return a promise that resolves or rejects based on modal dismissal.
    return new Promise((res, rej) => {
      // Define the resolve function that dismisses the modal and resolves the promise.
      function resolve(componentId: string) {
        return (data: U) => {
          res(data);

          Navigation.dismissModal(componentId);
        };
      }

      // Define the reject function that dismisses the modal and rejects the promise.
      function reject(componentId: string) {
        return () => {
          rej();

          Navigation.dismissModal(componentId);
        };
      }

      // Show the modal using React Native Navigation with the provided options.
      Navigation.showModal({
        stack: {
          children: [
            {
              component: {
                name,
                passProps: {
                  ...data,
                  resolve,
                  reject,
                },
                options: {
                  ...((Component as any).options ?? {}),
                  ...options,
                },
              },
            },
          ],
        },
      });
    });
  }

  return {
    open,
    push,
    pop,
    popToRoot,
    popTo,
    setStackRoot,
    showModal,
  };
}

/**
 * A custom hook that manages deep linking by listening for URL changes
 * and navigating accordingly using a navigator.
 *
 * @example
 * function App() {
 *   useLinking();
 *
 *   return <YourAppComponent />;
 * }
 *
 * // This hook will automatically handle incoming deep links and navigate
 * // based on the URL, such as `yourapp://path?query=param`.
 */
export function useLinking() {
  const navigator = useNavigator();

  /**
   * Handles the URL passed from deep linking and navigates to the correct screen.
   *
   * @param {Object} params - Parameters object.
   * @param {string | null} params.url - The URL to be processed.
   *
   * @example
   * callback({ url: 'yourapp://profile?user=123' });
   */
  function callback({url}: {url: string | null}) {
    if (!url) return;

    try {
      const parsedURL = new URL(url);

      // Navigates to the parsed URL's pathname and search params
      navigator.open(parsedURL.pathname + parsedURL.search);
    } catch (e) {
      // Handle the error (e.g., log it)
    }
  }

  useEffect(() => {
    // Check the initial URL when the app is launched
    (async function () {
      try {
        const url = await Linking.getInitialURL();

        callback({url});
      } catch (e) {
        // Handle the error (e.g., log it)
      }
    })();

    // Listen for any URL events and handle them with the callback
    const subscription = Linking.addEventListener('url', callback);

    // Cleanup the event listener when the component unmounts
    return () => {
      subscription.remove();
    };
  }, []);
}
