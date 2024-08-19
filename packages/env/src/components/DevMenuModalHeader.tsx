import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import React, {useMemo} from 'react';

import {useScreen} from '../context';

export function DevMenuModalHeader() {
  const [Screen, setScreen] = useScreen();

  const isScreenSet = useMemo(() => {
    return !!Screen;
  }, [Screen]);

  function onPressBack() {
    setScreen(null);
  }

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {isScreenSet && (
          <TouchableOpacity onPress={onPressBack}>
            <Text>back</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.title}>Dev Menu</Text>
      <View style={styles.right} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: 'lightgrey',
    borderBottomWidth: 1,
  },
  left: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-start',
    paddingLeft: 24,
  },
  right: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-end',
    paddingRight: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
