import {Text, StyleSheet, TouchableOpacity} from 'react-native';
import React from 'react';

import {envName} from '../env';

export namespace VersionOverlay {
  export type Props = {
    location?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
  };
}

export function VersionOverlay({
  location = 'bottomRight',
}: VersionOverlay.Props) {
  const s = styles({location});

  return (
    <TouchableOpacity style={s.container}>
      <Text style={s.text}>{`env: ${envName}`}</Text>
      {/**
       * TODO: add version from `react-native-device-info`
       */}
      <Text style={s.text}>{`v1.0.0`}</Text>
    </TouchableOpacity>
  );
}

const styles = ({location}: VersionOverlay.Props) => {
  let style;

  switch (location) {
    case 'topLeft':
      style = {
        top: 0,
        left: 0,
      };
      break;
    case 'topRight':
      style = {
        top: 0,
        right: 0,
      };
      break;
    case 'bottomLeft':
      style = {
        left: 0,
        bottom: 0,
      };
      break;
    case 'bottomRight':
    default:
      style = {
        right: 0,
        bottom: 0,
      };
  }

  return StyleSheet.create({
    container: {
      ...style,
      position: 'absolute',
      backgroundColor: 'rgba(0,0,0,0.36)',
    },
    text: {
      paddingVertical: 2,
      paddingHorizontal: 5,
      fontSize: 10,
      color: 'white',
    },
  });
};
