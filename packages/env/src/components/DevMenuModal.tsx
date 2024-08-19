import {
  View,
  Text,
  Modal,
  ModalProps,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import React, {useContext} from 'react';

import {DevMenuContext, useModal} from '../context';

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

  return (
    <Modal
      {...DEFAULT_MODAL_PROPS}
      visible={visible}
      onRequestClose={onRequestClose}>
      <SafeAreaView style={styles.safeAreaContainer}>
        <View>
          <Text>DevMenuModal</Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
  },
});
