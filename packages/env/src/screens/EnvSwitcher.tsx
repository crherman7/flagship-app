import {View, Text, StyleSheet} from 'react-native';
import React from 'react';

export function EnvSwitcher() {
  return (
    <View style={styles.container}>
      <Text>EnvSwitcher</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

EnvSwitcher.name = 'EnvSwitcher';
