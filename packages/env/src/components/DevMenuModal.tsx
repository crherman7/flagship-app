import {
  View,
  Text,
  Modal,
  ModalProps,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import React, {Fragment, useMemo} from 'react';

import {useModal, useScreen} from '../context';
import {useDevMenu} from '../hooks';
import {EnvSwitcher} from '../screens/EnvSwitcher';

import {DevMenuModalFooter} from './DevMenuModalFooter';
import {DevMenuModalHeader} from './DevMenuModalHeader';

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
  const [visible] = useModal();
  const {screens = []} = useDevMenu();
  const [Screen, setScreen] = useScreen();

  const devMenuScreens = useMemo(() => {
    return [...screens, EnvSwitcher];
  }, [screens]);

  const isScreenSet = useMemo(() => !!Screen, [Screen]);

  function onItemPress(Component: React.ComponentType<any> | null) {
    return () => {
      if (Component == null) {
        return setScreen(null);
      }

      const RenderedComponent = <Component />;

      setScreen(RenderedComponent);
    };
  }

  return (
    <Modal {...DEFAULT_MODAL_PROPS} visible={visible}>
      <SafeAreaView style={styles.safeAreaContainer}>
        <DevMenuModalHeader />
        {isScreenSet ? (
          <Fragment>{Screen}</Fragment>
        ) : (
          <FlatList
            ItemSeparatorComponent={() => (
              <View
                style={{
                  width: '100%',
                  height: 1,
                  backgroundColor: 'lightgrey',
                }}
              />
            )}
            style={styles.container}
            data={devMenuScreens}
            renderItem={({item}) => {
              return (
                <TouchableOpacity
                  style={styles.rowContainer}
                  key={item.name}
                  onPress={onItemPress(item)}>
                  <Text>{item.name}</Text>
                  <Text>{`>`}</Text>
                </TouchableOpacity>
              );
            }}
          />
        )}
        <DevMenuModalFooter />
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
  rowContainer: {
    height: 64,
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: 36,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
