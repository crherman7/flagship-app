import {LayoutRoot, LayoutStack, Navigation} from 'react-native-navigation';
import {match} from 'path-to-regexp';
import {URL} from 'react-native-url-polyfill';
import {Fragment, PropsWithChildren} from 'react';

import {ComponentIdContext, RouteContext} from './context';
import {AppRouter, Route} from './types';

/**
 * A singleton class that manages the routing logic and registration of components
 * with React Native Navigation for a Flagship app.
 */
class FlagshipAppRouter {
  protected static instance: FlagshipAppRouter;

  protected routes: Route[] = [];

  protected Provider: React.ComponentType<PropsWithChildren> = function ({
    children,
  }: PropsWithChildren) {
    return <Fragment>{children}</Fragment>;
  };

  /**
   * Object containing the React Native Navigation layout.
   * This layout defines the root structure of the app, such as stacks and tabs.
   *
   * @protected
   * @type {LayoutRoot}
   */
  protected layout: LayoutRoot = {
    root: {},
  };

  /**
   * Retrieves the singleton instance of FlagshipAppRouter.
   * Ensures only one instance of the router exists.
   *
   * @returns {FlagshipAppRouter} The shared instance of the router.
   */
  static get shared(): FlagshipAppRouter {
    if (!FlagshipAppRouter.instance) {
      FlagshipAppRouter.instance = new FlagshipAppRouter();
    }

    return FlagshipAppRouter.instance;
  }

  /**
   * Private constructor to enforce the singleton pattern.
   * Registers the app launch listener with React Native Navigation.
   */
  constructor() {
    if (FlagshipAppRouter.instance) {
      throw new Error(
        'FlagshipAppRouter was already instantiated. Use FlagshipAppRouter.shared instead.',
      );
    }
  }

  /**
   * Registers a screen component with React Native Navigation.
   *
   * @protected
   * @param {Route} route - The route object containing the component and associated metadata.
   */
  protected registerScreen(
    route: Route,
    PartialProvider?: React.ComponentType,
  ) {
    const {Component, action, options} = route;

    if (!Component) return;

    (route.Component as any).options = options;

    const ErrorBoundary =
      route.ErroBoundary ??
      function ({children}: PropsWithChildren) {
        return <Fragment>{children}</Fragment>;
      };

    const Provider =
      PartialProvider ??
      function ({children}: PropsWithChildren) {
        return <Fragment>{children}</Fragment>;
      };

    // Register the component with React Native Navigation
    Navigation.registerComponent(
      route.name,
      () => props => {
        const {componetId, __flagship_app_router_url, ...data} = props;

        return (
          <ErrorBoundary>
            <Provider>
              <RouteContext.Provider
                value={{
                  match: route,
                  url: new URL(__flagship_app_router_url), // Create a URL object from the route path
                  data,
                }}>
                <ComponentIdContext.Provider value={componetId}>
                  <Component {...data} />
                </ComponentIdContext.Provider>
              </RouteContext.Provider>
            </Provider>
          </ErrorBoundary>
        );
      },
      () => Component,
    );
  }

  /**
   * Registers a bottom tab layout with React Native Navigation.
   *
   * @protected
   * @param {Route} route - The route object containing the component and tab options.
   */
  protected registerBottomTab(route: Route) {
    const {bottomTab} = route.options!;

    const tab: LayoutStack = {
      children: [
        {
          component: {
            name: route.name,
          },
        },
      ],
      options: {
        bottomTab,
      },
    };

    // Add the tab to the root layout
    this.layout = {
      ...this.layout,
      root: {
        bottomTabs: {
          children: [
            ...(this.layout.root.bottomTabs?.children ?? []),
            {stack: tab},
          ],
        },
      },
    };
  }

  /**
   * Registers the provided routes and initializes the router with optional configuration.
   *
   * @param {AppRouter} config - The configuration object containing routes, provider, and app launch callback.
   */
  register({onAppLaunched, routes, Provider}: AppRouter) {
    this.routes = routes;

    // Register each route based on its options
    routes.forEach(route => {
      const {bottomTab, ...passOptions} = route.options ?? {};

      this.registerScreen({...route, options: passOptions}, Provider);

      if (bottomTab) {
        this.registerBottomTab(route);
      }
    });

    if (Object.keys(this.layout.root).length === 0) {
      this.layout = {
        ...this.layout,
        root: {
          stack: {
            children: [
              {
                component: {
                  name: routes[0].name,
                },
              },
            ],
          },
        },
      };
    }

    // Register the app launch event listener
    Navigation.events().registerAppLaunchedListener(async () => {
      if (onAppLaunched) {
        await onAppLaunched().catch(() => {});
      }

      Navigation.setRoot(this.layout);
    });
  }

  /**
   * Finds the route name that corresponds to a given path.
   *
   * @param {string} path - The path to match against the registered routes.
   * @returns {string} The name of the matched route.
   * @throws Will throw an error if no route is found for the given path.
   */
  pathToRouteName(path: string): string {
    const route = this.routes.find(route => {
      const matches = match(route.path)(path);

      return matches;
    });

    if (!route) {
      throw new Error(`unable to find route for ${path}`);
    }

    return route.name;
  }
}

export default FlagshipAppRouter;
