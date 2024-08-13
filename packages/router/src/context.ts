import React from 'react';

import {MatchedRoute} from './types';

/**
 * React context to provide routing information, such as the matched route, URL, and associated data.
 *
 * @type {React.Context<MatchedRoute | null>}
 */
export const RouteContext = React.createContext<MatchedRoute | null>(null);

// Assign a display name to the RouteContext for easier debugging in development
if (__DEV__) {
  RouteContext.displayName = 'RouteContext';
}

/**
 * React context to provide a unique component identifier.
 *
 * @type {React.Context<string | null>}
 */
export const ComponentIdContext = React.createContext<string | null>(null);

// Assign a display name to the ComponentIdContext for easier debugging in development
if (__DEV__) {
  ComponentIdContext.displayName = 'ComponentIdContext';
}
