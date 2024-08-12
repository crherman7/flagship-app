import React from "react";
import { URL } from "react-native-url-polyfill";

type Router = {
  match: { path: string; name: string }; // Type representing the match object from the router
  url: URL; // Type representing the URL object
  data: unknown; // Type representing any data associated with the router
};

/**
 * React context to provide routing information, such as the matched route, URL, and associated data.
 *
 * @type {React.Context<Router | null>}
 */
export const RouterContext = React.createContext<Router | null>(null);

// Assign a display name to the RouterContext for easier debugging in development
if (__DEV__) {
  RouterContext.displayName = "RouterContext";
}

/**
 * React context to provide a unique component identifier.
 *
 * @type {React.Context<string | null>}
 */
export const ComponentIdContext = React.createContext<string | null>(null);

// Assign a display name to the ComponentIdContext for easier debugging in development
if (__DEV__) {
  ComponentIdContext.displayName = "ComponentIdContext";
}
