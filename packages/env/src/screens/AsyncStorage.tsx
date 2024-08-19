import {View, Text, StyleSheet} from 'react-native';
import React from 'react';

export function AsyncStorage() {
  return (
    <View style={styles.container}>
      <Text>AsyncStorage</Text>
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

AsyncStorage.name = 'AsyncStorage';
