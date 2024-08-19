import React, {Fragment, PropsWithChildren} from 'react';

import {DevMenuContext, ModalContextProvider} from '../context';
import {DevMenuType} from '../types';
import {showDevMenu} from '../env';

import {VersionOverlay} from './VersionOverlay';
import {DevMenuModal} from './DevMenuModal';

export namespace DevMenu {
  export type Props = DevMenuType & VersionOverlay.Props & PropsWithChildren;
}

export function DevMenu({children, location, ...props}: DevMenu.Props) {
  if (!showDevMenu) {
    return <Fragment>{children}</Fragment>;
  }

  return (
    <DevMenuContext.Provider value={props}>
      {children}
      <ModalContextProvider>
        <VersionOverlay location={location} />
        <DevMenuModal />
      </ModalContextProvider>
    </DevMenuContext.Provider>
  );
}
