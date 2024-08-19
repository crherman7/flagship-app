import {
  View,
  Text,
  Modal,
  ModalProps,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import React from 'react';

import {useModal} from '../context';

const DEFAULT_MODAL_PROPS: ModalProps = {
  /**
   * slides in from the bottom
   *
   * @link {https://reactnative.dev/docs/modal#animationtype}
   */
  animationType: 'slide',

  /**
   * covers the screen completely
   *
   * @link {https://reactnative.dev/docs/modal#presentationstyle-ios}
   */
  presentationStyle: 'fullScreen',
};

export function DevMenuModal() {
  const [visible, setVisible] = useModal();

  function onRequestClose() {
    setVisible(false);
  }

  function onClose() {
    setVisible(false);
  }

  function onRestart() {
    // TODO: add restart package and execute restart bundle
  }

  return (
    <Modal
      {...DEFAULT_MODAL_PROPS}
      visible={visible}
      onRequestClose={onRequestClose}>
      <SafeAreaView style={styles.safeAreaContainer}>
        <View style={styles.container}>
          <Text>DevMenuModal</Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.text}>Close</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.text}>Restart</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  buttonContainer: {
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
