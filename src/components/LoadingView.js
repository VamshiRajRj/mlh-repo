import React from 'react';
import {View, StyleSheet, ActivityIndicator} from 'react-native';
import {height, width} from '../utils/Styles';

export const LoadingView = props => {
  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      height: height,
      width: width,
      alignSelf: 'center',
      alignItems: 'center',
      alignContent: 'center',
      justifyContent: 'center',
      opacity: 0.5,
      backgroundColor: 'black',
      borderRadius: 8,
    },
  });

  // -------------------- RENDER -------------------- //
  return (
    <View style={styles.container}>
      <ActivityIndicator size={'large'} color={'#156CF7'} />
    </View>
  );
};
