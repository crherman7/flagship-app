import {LayoutRoot, LayoutStack, Navigation} from 'react-native-navigation';
import {Fragment, useMemo} from 'react';

import {AppRouter, Route} from './types';
import {ComponentIdContext, RouterContext} from './context';

/**
 * Registers routes and sets the root layout for the application.
 *
 * @param {AppRouter} appRouter - The router configuration for the app.
 * @param {Route[]} appRouter.routes - Array of route definitions.
 * @param {Function} [appRouter.onAppLaunched] - Optional callback to be called after the app is launched.
 * @param {React.ComponentType} [appRouter.Provider=Fragment] - Optional React component to be used as a provider.
 *
 * @example
 * register({
 *   routes: [
 *     { path: '/home', name: 'HomeScreen', Component: HomeComponent },
 *     { path: '/profile', name: 'ProfileScreen', Component: ProfileComponent, options: { bottomTab: { text: 'Profile' } } }
 *   ],
 *   onAppLaunched: async () => {
 *     console.log('App launched');
 *   },
 *   Provider: MyCustomProvider,
 * });
 */
function register({routes, onAppLaunched, Provider = Fragment}: AppRouter) {
  const layout: LayoutRoot = createInitialLayout();
  const routeMap = createRouteMap(routes);

  routes.forEach(route => registerRoute(route, layout, routeMap, Provider));

  setRootLayout(layout, routes, onAppLaunched);
}

/**
 * Creates the initial layout object for the application.
 *
 * @returns {LayoutRoot} The initial layout object.
 *
 * @example
 * const initialLayout = createInitialLayout();
 * console.log(initialLayout); // { root: {} }
 */
function createInitialLayout(): LayoutRoot {
  return {root: {}};
}

/**
 * Creates a map of route paths to route names.
 *
 * @param {Route[]} routes - Array of route definitions.
 * @returns {Record<string, string>} A map of route paths to route names.
 *
 * @example
 * const routeMap = createRouteMap([
 *   { path: '/home', name: 'HomeScreen', Component: HomeComponent },
 *   { path: '/profile', name: 'ProfileScreen', Component: ProfileComponent }
 * ]);
 * console.log(routeMap); // { '/home': 'HomeScreen', '/profile': 'ProfileScreen' }
 */
function createRouteMap(routes: Route[]): Record<string, string> {
  return routes.reduce(
    (acc, curr) => {
      acc[curr.path] = curr.name;
      return acc;
    },
    {} as Record<string, string>,
  );
}

/**
 * Registers a single route with the navigation system.
 *
 * @param {Route} route - The route definition.
 * @param {LayoutRoot} layout - The current layout object.
 * @param {Record<string, string>} routeMap - A map of route paths to route names.
 * @param {React.ComponentType} Provider - The React component to be used as a provider.
 *
 * @example
 * registerRoute(
 *   { path: '/home', name: 'HomeScreen', Component: HomeComponent },
 *   layout,
 *   routeMap,
 *   MyCustomProvider
 * );
 */
function registerRoute(
  route: Route,
  layout: LayoutRoot,
  routeMap: Record<string, string>,
  Provider: React.ComponentType,
): void {
  const {bottomTab, ...passOptions} = route.options ?? {};
  const {ErrorBoundary = Fragment, Component} = route;

  if (!Component) return;

  // Attach options to the component
  (Component as any).options = passOptions;

  // Register the component with react-native-navigation
  Navigation.registerComponent(
    route.name,
    () => props =>
      renderComponent(route, props, Provider, routeMap, ErrorBoundary),
    () => Component,
  );

  // If the route has a bottomTab option, add it to the layout
  if (bottomTab) {
    addBottomTabToLayout(layout, route.name, bottomTab);
  }
}

/**
 * Renders the component for a given route.
 *
 * @param {Route} route - The route definition.
 * @param {any} props - The properties passed to the component.
 * @param {React.ComponentType} Provider - The React component to be used as a provider.
 * @param {Record<string, string>} routeMap - A map of route paths to route names.
 * @param {React.ComponentType} ErrorBoundary - The component to be used as an error boundary.
 * @returns {JSX.Element} The rendered component wrapped in the necessary providers.
 *
 * @example
 * const renderedComponent = renderComponent(
 *   { path: '/home', name: 'HomeScreen', Component: HomeComponent },
 *   { componentId: 'component1', __flagship_app_router_url: 'https://example.com' },
 *   MyCustomProvider,
 *   routeMap,
 *   MyErrorBoundary
 * );
 */
function renderComponent(
  route: Route,
  props: any,
  Provider: React.ComponentType<any>,
  routeMap: Record<string, string>,
  ErrorBoundary: React.ComponentType<any>,
) {
  const {componentId, __flagship_app_router_url, ...data} = props;

  // Ensure Component is defined (safeguard against potential undefined)
  const Component = route.Component!;

  // Memoize the URL if provided
  const url = useMemo(() => {
    if (!__flagship_app_router_url) return null;

    if (/^\S+:\/\//gm.test(__flagship_app_router_url))
      return __flagship_app_router_url;

    // TODO: use react-native-device-info to get bundleId / packageName as we use URL polyfill requiring standard URL
    return `app://${__flagship_app_router_url}`;
  }, [__flagship_app_router_url]);

  // Render the component wrapped with ErrorBoundary, Provider, RouterContext, and ComponentIdContext
  return (
    <ErrorBoundary>
      <Provider>
        <RouterContext.Provider
          value={{
            path: route.path,
            name: route.name,
            url,
            data,
            routeMap,
          }}>
          <ComponentIdContext.Provider value={componentId}>
            <Component />
          </ComponentIdContext.Provider>
        </RouterContext.Provider>
      </Provider>
    </ErrorBoundary>
  );
}

/**
 * Adds a bottom tab to the root layout.
 *
 * @param {LayoutRoot} layout - The current layout object.
 * @param {string} routeName - The name of the route associated with the bottom tab.
 * @param {any} bottomTab - The bottom tab configuration.
 *
 * @example
 * addBottomTabToLayout(layout, 'HomeScreen', { text: 'Home' });
 */
function addBottomTabToLayout(
  layout: LayoutRoot,
  routeName: string,
  bottomTab: any,
) {
  const tab: LayoutStack = {
    children: [
      {
        component: {
          name: routeName,
        },
      },
    ],
    options: {
      bottomTab,
    },
  };

  // Update the layout to include the new bottom tab
  layout.root = {
    bottomTabs: {
      children: [...(layout.root.bottomTabs?.children ?? []), {stack: tab}],
    },
  };
}

/**
 * Sets the root layout for the application and registers the app launch listener.
 *
 * @param {LayoutRoot} layout - The current layout object.
 * @param {Route[]} routes - Array of route definitions.
 * @param {Function} [onAppLaunched] - Optional callback to be called after the app is launched.
 *
 * @example
 * setRootLayout(layout, routes, async () => {
 *   console.log('App launched');
 * });
 */
function setRootLayout(
  layout: LayoutRoot,
  routes: Route[],
  onAppLaunched?: () => Promise<void>,
): void {
  // If no layout has been defined, set a default stack layout with the first route
  if (!Object.keys(layout.root).length) {
    layout.root = {
      stack: {
        children: [
          {
            component: {
              name: routes[0].name,
            },
          },
        ],
      },
    };
  }

  // Register the app launched listener to set the root layout
  Navigation.events().registerAppLaunchedListener(async () => {
    try {
      await onAppLaunched?.();
    } catch {
      // handle the error (e.g., log it)
    }

    Navigation.setRoot(layout);
  });
}

export {register};
