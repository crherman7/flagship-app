import {LayoutRoot, LayoutStack, Navigation} from 'react-native-navigation';
import {Fragment, useMemo} from 'react';

import {AppRouter, Route} from './types';
import {ComponentIdContext, RouterContext} from './context';

function register({routes, onAppLaunched, Provider = Fragment}: AppRouter) {
  const layout: LayoutRoot = createInitialLayout();
  const routeMap = createRouteMap(routes);

  routes.forEach(route => registerRoute(route, layout, routeMap, Provider));

  setRootLayout(layout, routes, onAppLaunched);
}

function createInitialLayout(): LayoutRoot {
  return {root: {}};
}

function createRouteMap(routes: Route[]): Record<string, string> {
  return routes.reduce(
    (acc, curr) => {
      acc[curr.path] = curr.name;
      return acc;
    },
    {} as Record<string, string>,
  );
}

function registerRoute(
  route: Route,
  layout: LayoutRoot,
  routeMap: Record<string, string>,
  Provider: React.ComponentType,
): void {
  const {bottomTab, ...passOptions} = route.options ?? {};
  const {ErrorBoundary = Fragment, Component} = route;

  if (!Component) return;

  (Component as any).options = passOptions;

  Navigation.registerComponent(
    route.name,
    () => props =>
      renderComponent(route, props, Provider, routeMap, ErrorBoundary),
    () => Component,
  );

  if (bottomTab) {
    addBottomTabToLayout(layout, route.name, bottomTab);
  }
}

function renderComponent(
  route: Route,
  props: any,
  Provider: React.ComponentType<any>,
  routeMap: Record<string, string>,
  ErrorBoundary: React.ComponentType<any>,
) {
  const {componentId, __flagship_app_router_url, ...data} = props;

  const Component = route.Component!;

  const url = useMemo(() => {
    if (__flagship_app_router_url) {
      return new URL(__flagship_app_router_url);
    }
    return null;
  }, [__flagship_app_router_url]);

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

  layout.root = {
    bottomTabs: {
      children: [...(layout.root.bottomTabs?.children ?? []), {stack: tab}],
    },
  };
}

function setRootLayout(
  layout: LayoutRoot,
  routes: Route[],
  onAppLaunched?: () => Promise<void>,
): void {
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
