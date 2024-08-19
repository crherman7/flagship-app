import {
  View,
  Text,
  Modal,
  ModalProps,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import React from 'react';

import {useModal} from '../context';

const DEFAULT_MODAL_PROPS: ModalProps = {
  animationType: 'slide',
  presentationStyle: 'fullScreen',
};

export function DevMenuModal() {
  const [visible] = useModal();

  return (
    <Modal {...DEFAULT_MODAL_PROPS} visible={visible}>
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
