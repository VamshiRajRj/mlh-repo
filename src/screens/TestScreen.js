import {StyleSheet, Text, View} from 'react-native';
import React, {useRef} from 'react';
const TestScreen = () => {
  const bottomRef = useRef(null);

  return (
    <View style={{flex: 1}}>
      <Text>TestScreen</Text>
    </View>
  );
};

export default TestScreen;

const styles = StyleSheet.create({});
