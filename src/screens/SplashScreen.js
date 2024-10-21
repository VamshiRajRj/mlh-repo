import * as React from 'react';
import {
  Text,
  View,
  Image,
  ImageBackground,
  Dimensions,
  StatusBar,
} from 'react-native';
const {height, width} = Dimensions.get('screen');
export default function SplashScreen() {
  return (
    <View
      style={{
        flex: 1,
        width: width,
        height: height,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
      }}>
      <StatusBar backgroundColor={'#FFF'} barStyle={'dark-content'} />
      <Image
        style={{width: width * 0.9, height: width}}
        source={{uri: 'logo'}}
        resizeMode="contain"
      />
    </View>
  );
}
