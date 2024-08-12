import { match } from "path-to-regexp";
import { useContext } from "react";

import { RouterContext, ComponentIdContext } from "./context";

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
