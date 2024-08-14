import React from 'react';

import {Match} from './types';

/**
 * React context to provide a unique component identifier.
 *
 * @type {React.Context<string | null>}
 */
export const ComponentIdContext = React.createContext<string | null>(null);

// Assign a display name to the ComponentIdContext for easier debugging in development
// eslint-disable-next-line no-undef
if (__DEV__) {
  ComponentIdContext.displayName = 'ComponentIdContext';
}

/**
 * React context to provide routing information, such as the matched route, URL, and associated data.
 *
 * @type {React.Context<Match | null>}
 */
export const RouterContext = React.createContext<Match | null>(null);

// Assign a display name to the RouteContext for easier debugging in development
// eslint-disable-next-line no-undef
if (__DEV__) {
  RouterContext.displayName = 'RouterContext';
}
