import {match} from 'path-to-regexp';
import {useContext, useEffect} from 'react';
import {Layout, Navigation, Options} from 'react-native-navigation';
import {Linking} from 'react-native';
import {URL} from 'react-native-url-polyfill';

import {ComponentIdContext, RouterContext} from './context';
import {Route} from './types';

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
      'useRouterContext must be used inside a AppRouterURLContext.Provider',
    );
  }

  return state;
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

  // Regular expression to find query parameters in the URL
  const regex = /[?&]([^=#]+)=([^&#]*)/g;

  // Object to store search parameters
  const params: Record<string, string> = {};

  // Variable to store each match found by regex
  let match: RegExpExecArray | null;

  // Loop through all matches found in the URL
  while ((match = regex.exec(route.url.href)) !== null) {
    // Extract parameter name and value from the match
    const paramName = match[1];
    const paramValue = match[2];

    // If both name and value are found, add them to the params object
    if (paramName && paramValue) {
      params[paramName] = paramValue;
    }
  }

  // Return the object containing search parameters
  return params;
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
    const matchedRoute = route.routes.find(it => {
      return match(it.path)(path);
    });

    if (!matchedRoute) return;

    // Perform any associated action with the matched route
    await matchedRoute.action?.().catch(() => {
      // handle error (e.g., log it)
    });

    // If there's no associated component, return
    if (matchedRoute?.Component) return;

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
   * Show a modal screen.
   *
   * TODO: Implement the logic for displaying a modal screen.
   */
  function showModal() {
    // TODO: implement showModal logic
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
