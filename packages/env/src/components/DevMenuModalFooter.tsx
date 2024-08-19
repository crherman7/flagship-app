import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import React from 'react';
import AppRestart from '@brandingbrand/react-native-app-restart';

import {useModal} from '../lib/context';

export function DevMenuModalFooter() {
  const [_, setVisible] = useModal();

  function onPressRestart() {
    AppRestart.restartApplication();
  }

  function onPressClose() {
    setVisible(false);
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={onPressClose}>
        <Text style={styles.text}>Close</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={onPressRestart}>
        <Text style={styles.text}>Restart</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: 'lightgrey',
    padding: 20,
    flexDirection: 'row',
    gap: 20,
  },
  button: {
    borderRadius: 12,
    backgroundColor: 'black',
    height: 48,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 12,
  },
});
