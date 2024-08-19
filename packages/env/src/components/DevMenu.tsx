import React, {PropsWithChildren} from 'react';

import {DevMenuContext} from '../context';
import {DevMenuType} from '../types';
import {showDevMenu} from '../env';

import {VersionOverlay} from './VersionOverlay';

export namespace DevMenu {
  export type Props = DevMenuType & VersionOverlay.Props & PropsWithChildren;
}

export function DevMenu({children, location, ...props}: DevMenu.Props) {
  return (
    <DevMenuContext.Provider value={props}>
      {children}
      {!!showDevMenu && <VersionOverlay location={location} />}
    </DevMenuContext.Provider>
  );
}
