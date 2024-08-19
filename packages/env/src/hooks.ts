import {useContext} from 'react';

import {DevMenuContext} from './context';

export function useDevMenu() {
  const state = useContext(DevMenuContext);

  if (state == null) {
    throw new Error('useDevMenu must be used inside a DevMenuContext.Provider');
  }

  return state;
}
