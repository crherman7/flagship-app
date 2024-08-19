import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {env} from '@brandingbrand/flagship-app-env';

function Account() {
  console.log('🚀 ~ env:', env);

  return (
    <View style={styles.container}>
      <Text>/account</Text>
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

export default Account;
