import {
  LayoutRoot,
  LayoutStack,
  Navigation,
  Options,
} from "react-native-navigation";
import { URL } from "react-native-url-polyfill";
import { Fragment, PropsWithChildren } from "react";

import { ComponentIdContext, RouterContext } from "./context";
import { match } from "path-to-regexp";

type Route = {
  name: string; // The name of the route, used for registration with React Native Navigation
  path: string; // The path pattern associated with the route
  options?: Options; // Optional navigation options for customizing the route
  action?: () => Promise<void>; // Optional action to be executed when the route is activated
  Component?: React.ComponentType<any> | null; // The React component associated with the route
  ErroBoundary?: React.ComponentType | null; // Optional error boundary component for the route
};

type AppRouter = {
  routes: Route[]; // Array of routes to be registered with the router
  Provider?: React.ComponentType | null; // Optional provider component for wrapping the application
  onAppLaunched?: () => Promise<void>; // Optional callback for when the app is launched
};

/**
 * A singleton class that manages the routing logic and registration of components
 * with React Native Navigation for a Flagship app.
 */
class FlagshipAppRouter {
  protected static instance: FlagshipAppRouter;

  protected registeredRoutes: Route[] = [];

  protected onAppLaunched?: () => Promise<void>;

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
        "FlagshipAppRouter was already instantiated. Use FlagshipAppRouter.shared instead."
      );
    }

    // Register the app launch event listener
    Navigation.events().registerAppLaunchedListener(async () => {
      if (this.onAppLaunched) {
        await this.onAppLaunched().catch(() => {});
      }

      // Set the root layout of the app
      Navigation.setRoot(this.layout);
    });
  }

  /**
   * Registers a screen component with React Native Navigation.
   *
   * @protected
   * @param {Route} route - The route object containing the component and associated metadata.
   */
  protected registerScreen(route: Route) {
    const { Component, ErroBoundary, action, options, ...match } = route;

    if (!Component) return;

    (route.Component as any).options = options;

    const { Provider } = this;
    const ErrorBoundary =
      route.ErroBoundary ??
      function ({ children }: PropsWithChildren) {
        return <Fragment>{children}</Fragment>;
      };

    // Register the component with React Native Navigation
    Navigation.registerComponent(
      route.name,
      () => (props) => {
        const { componetId, __flagship_app_router_url, ...data } = props;

        return (
          <ErrorBoundary>
            <Provider>
              <RouterContext.Provider
                value={{
                  match,
                  url: new URL(__flagship_app_router_url), // Create a URL object from the route path
                  data,
                }}
              >
                <ComponentIdContext.Provider value={componetId}>
                  <Component {...data} />
                </ComponentIdContext.Provider>
              </RouterContext.Provider>
            </Provider>
          </ErrorBoundary>
        );
      },
      () => Component
    );
  }

  /**
   * Registers a bottom tab layout with React Native Navigation.
   *
   * @protected
   * @param {Route} route - The route object containing the component and tab options.
   */
  protected registerBottomTab(route: Route) {
    const { bottomTab, ...passOptions } = route.options!;

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
      root: {
        bottomTabs: {
          children: [
            ...(this.layout.root.bottomTabs?.children ?? []),
            { stack: tab },
          ],
        },
      },
    };

    this.registerScreen({ ...route, options: passOptions });
  }

  /**
   * Registers the provided routes and initializes the router with optional configuration.
   *
   * @param {AppRouter} config - The configuration object containing routes, provider, and app launch callback.
   */
  register({ onAppLaunched, routes, Provider }: AppRouter) {
    this.onAppLaunched = onAppLaunched;
    this.registeredRoutes = routes;

    if (Provider) {
      this.Provider = Provider;
    }

    // Register each route based on its options
    routes.forEach((route) => {
      if (route.options?.bottomTab) {
        this.registerBottomTab(route);
      } else {
        this.registerScreen(route);
      }
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
    const route = this.registeredRoutes.find((route) => {
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
