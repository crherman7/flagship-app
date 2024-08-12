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
  name: string;
  path: string;
  options?: Options;
  action?: () => Promise<void>;
  Component?: React.ComponentType<any> | null;
  ErroBoundary?: React.ComponentType | null;
};

type AppRouter = {
  routes: Route[];
  Provider?: React.ComponentType | null;
  onAppLaunched?: () => Promise<void>;
};

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
   * Object containing the React Native Navigation layout
   * @protected
   * @type {Layout}
   */
  protected layout: LayoutRoot = {
    root: {},
  };

  static get shared(): FlagshipAppRouter {
    if (!FlagshipAppRouter.instance) {
      FlagshipAppRouter.instance = new FlagshipAppRouter();
    }

    return FlagshipAppRouter.instance;
  }

  constructor() {
    if (FlagshipAppRouter.instance) {
      throw new Error(
        "FlagshipAppRouter was already instantiated. Use FlagshipAppRouter.shared instead."
      );
    }

    Navigation.events().registerAppLaunchedListener(async () => {
      if (this.onAppLaunched) {
        await this.onAppLaunched().catch(() => {});
      }

      Navigation.setRoot(this.layout);
    });
  }

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
                  url: new URL(__flagship_app_router_url),
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

  register({ onAppLaunched, routes, Provider }: AppRouter) {
    this.onAppLaunched = onAppLaunched;
    this.registeredRoutes = routes;

    if (Provider) {
      this.Provider = Provider;
    }

    routes.forEach((route) => {
      if (route.options?.bottomTab) {
        this.registerBottomTab(route);
      } else {
        this.registerScreen(route);
      }
    });
  }

  pathToRouteName(path: string) {
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
