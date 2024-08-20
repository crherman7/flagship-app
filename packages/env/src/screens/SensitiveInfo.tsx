import {View, Text, StyleSheet} from 'react-native';
import React from 'react';

export function SensitiveInfo() {
  return (
    <View style={styles.container}>
      <Text>SensitiveInfo</Text>
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

SensitiveInfo.displayName = 'SensitiveInfo';
