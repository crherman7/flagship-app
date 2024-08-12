import {
  LayoutRoot,
  LayoutStack,
  Navigation,
  Options,
} from "react-native-navigation";
import { URL } from "react-native-url-polyfill";
import { Fragment, PropsWithChildren } from "react";

import { ComponentIdContext, RouterContext } from "./context";

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
    (route.Component as any).options = route.options;
    const { Component } = route;

    if (!Component) return;

    const { Provider } = this;

    const ErrorBoundary =
      route.ErroBoundary ??
      function ({ children }: PropsWithChildren) {
        return <Fragment>{children}</Fragment>;
      };

    Navigation.registerComponent(
      route.name,
      () => (props) => {
        const { componetId, __flagship_app_router_url, ...passProps } = props;

        const url = new URL(__flagship_app_router_url);

        return (
          <ErrorBoundary>
            <Provider>
              <RouterContext.Provider
                value={{ match: route, url, data: passProps }}
              >
                <ComponentIdContext.Provider value={componetId}>
                  <Component {...passProps} />
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

    if (Provider) {
      this.Provider = Provider;
    }

    routes.forEach((it) => {
      if (it.options?.bottomTab) {
        this.registerBottomTab(it);
      } else {
        this.registerScreen(it);
      }
    });
  }
}

export default FlagshipAppRouter;
