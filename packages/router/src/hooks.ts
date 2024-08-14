import {match} from 'path-to-regexp';
import {useContext, useEffect} from 'react';
import {Layout, Navigation, Options} from 'react-native-navigation';
import {Linking} from 'react-native';

import {ComponentIdContext, RouterContext} from './context';
import {URL} from 'react-native-url-polyfill';

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
   * Push a new screen onto the navigation stack.
   *
   * @param {string} path - The path or route name to navigate to.
   * @param {object} [passProps={}] - Optional props to pass to the new screen.
   * @param {Options} [options] - Optional navigation options for customizing the transition.
   */
  async function push(path: string, passProps = {}, options?: Options) {
    const routeMapKey = Object.keys(route.routeMap).find(key => {
      return match(key)(path);
    });

    if (!routeMapKey) return;

    return Navigation.push(componentId, {
      component: {
        name: route.routeMap[routeMapKey],
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
      navigator.push(parsedURL.pathname + parsedURL.search);
    } catch (e) {
      // Handle the error (e.g., log it)
    }
  }

  useEffect(() => {
    // Check the initial URL when the app is launched
    (async function () {
      const url = await Linking.getInitialURL();
      callback({url});
    })();

    // Listen for any URL events and handle them with the callback
    const subscription = Linking.addEventListener('url', callback);

    // Cleanup the event listener when the component unmounts
    return () => {
      subscription.remove();
    };
  }, []);
}
