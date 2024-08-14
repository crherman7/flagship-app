import {useNavigator} from '@brandingbrand/flagship-app-router';
import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

function Account() {
  const navigator = useNavigator();

  function onPress() {
    navigator.open('/shop');
  }

  return (
    <View style={styles.container}>
      <Text>/account</Text>
      <TouchableOpacity onPress={onPress}>
        <Text>push</Text>
      </TouchableOpacity>
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
