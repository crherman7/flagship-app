import {LayoutRoot, LayoutStack, Navigation} from 'react-native-navigation';
import {Fragment, useMemo} from 'react';

import {AppRouter} from './types';
import {ComponentIdContext, RouterContext} from './context';

function register({routes, onAppLaunched, Provider = Fragment}: AppRouter) {
  let layout: LayoutRoot = {
    root: {},
  };
  const routeMap = routes.reduce((acc, curr) => {
    return {...acc, [curr.path]: curr.name};
  }, {});

  routes.forEach(route => {
    const {bottomTab, ...passOptions} = route.options ?? {};
    const {ErrorBoundary = Fragment, Component} = route;

    if (!Component) return;

    (Component as any).options = passOptions;

    Navigation.registerComponent(
      route.name,
      () => props => {
        const {componentId, __flagship_app_router_url, ...data} = props;

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
      },
      () => Component,
    );

    if (bottomTab) {
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
      layout = {
        ...layout,
        root: {
          bottomTabs: {
            children: [
              ...(layout.root.bottomTabs?.children ?? []),
              {stack: tab},
            ],
          },
        },
      };
    }
  });

  if (!Object.keys(layout.root).length) {
    layout = {
      ...layout,
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

  Navigation.events().registerAppLaunchedListener(async function () {
    await onAppLaunched?.().catch(() => {});

    Navigation.setRoot(layout);
  });
}

export {register};
