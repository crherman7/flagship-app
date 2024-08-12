import { match } from "path-to-regexp";
import { useContext } from "react";
import { Layout, Navigation, Options } from "react-native-navigation";

import { RouterContext, ComponentIdContext } from "./context";
import FlagshipAppRouter from "./FlagshipAppRouter";

/**
 * Custom hook to access the Router context.
 *
 * @returns {RouterContextType} The current router state from the RouterContext.
 * @throws Will throw an error if the hook is used outside of a RouterContext.Provider.
 */
export function useRouterContext() {
  const state = useContext(RouterContext);

  if (!state) {
    throw new Error(
      "useRouterContext must be used inside a AppRouterURLContext.Provider"
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
      "useAppRouterURLContext must be used inside a ComponentIdContext.Provider"
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
export function useParams() {
  const router = useRouterContext();

  // Match the current URL pathname against the router's path pattern
  const matches = match(router.match.path)(router.url.pathname);

  if (!matches) {
    throw new Error("no matches for path params");
  }

  // Return the matched parameters
  return matches.params;
}

/**
 * Custom hook to retrieve search parameters from the URL.
 *
 * @returns {Record<string, string>} An object containing key-value pairs of search parameters.
 */
export function useSearchParams() {
  const router = useRouterContext();

  // Regular expression to find query parameters in the URL
  const regex = /[?&]([^=#]+)=([^&#]*)/g;

  // Object to store search parameters
  const params: Record<string, string> = {};

  // Variable to store each match found by regex
  let match: RegExpExecArray | null;

  // Loop through all matches found in the URL
  while ((match = regex.exec(router.url.href)) !== null) {
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
export function useRouterData() {
  const router = useRouterContext();

  return router.data;
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

  /**
   * Push a new screen onto the navigation stack.
   *
   * @param {string} path - The path or route name to navigate to.
   * @param {object} [passProps={}] - Optional props to pass to the new screen.
   * @param {Options} [options] - Optional navigation options for customizing the transition.
   */
  function push(path: string, passProps = {}, options?: Options) {
    const name = FlagshipAppRouter.shared.pathToRouteName(path);

    Navigation.push(componentId, {
      component: {
        name,
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
    Navigation.pop(componentId, mergeOptions);
  }

  /**
   * Pop all screens off the stack and return to the root screen.
   *
   * @param {Options} [mergeOptions] - Optional navigation options for customizing the transition.
   */
  function popToRoot(mergeOptions?: Options) {
    Navigation.popToRoot(componentId, mergeOptions);
  }

  /**
   * Pop to a specific screen in the stack.
   *
   * @param {Options} [mergeOptions] - Optional navigation options for customizing the transition.
   */
  function popTo(mergeOptions?: Options) {
    Navigation.popTo(componentId, mergeOptions);
  }

  /**
   * Set a new root for the stack, replacing all existing screens.
   *
   * @param {Layout | Layout[]} layout - The new layout or stack of layouts to set as the root.
   */
  function setStackRoot(layout: Layout | Layout[]) {
    Navigation.setStackRoot(componentId, layout);
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
