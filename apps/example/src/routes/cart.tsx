import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

function Cart() {
  return (
    <View style={styles.container}>
      <Text>/cart</Text>
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

export default Cart;
