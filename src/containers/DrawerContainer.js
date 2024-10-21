import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import HomeScreen from '../screens/NavScreens/HomeScreen';
import ProfileScreen from '../screens/NavScreens/ProfileScreen';
import {height, width} from '../utils/Styles';
import {useGlobal} from '../hooks/global';
import {cognitoPool} from '../utils/cognito-pool';

const Drawer = createDrawerNavigator();
const DrawerContainer = () => {
  const {user, setUser} = useGlobal();
  return (
    <Drawer.Navigator
      screenOptions={{
        header: ({navigation, options}) => {
          return (
            <View
              style={{
                width: width,
                height: height * 0.1,
                backgroundColor: '#156CF7',
                flexDirection: 'row',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
              }}>
              <TouchableOpacity
                style={{marginBottom: 8, marginStart: 8}}
                onPress={() => {
                  navigation.openDrawer();
                }}>
                <Image
                  source={{uri: 'burger'}}
                  resizeMode="contain"
                  style={{width: 28, height: 28}}
                />
              </TouchableOpacity>
              <Image
                source={{uri: 'logo'}}
                resizeMode="contain"
                style={{
                  width: width * 0.47,
                  height: height * 0.035,
                  marginBottom: 8,
                  tintColor: '#FFF',
                }}
              />
              <TouchableOpacity
                onPress={() => {
                  cognitoPool.getCurrentUser().signOut();
                  setUser(null);
                }}
                style={{
                  height: 32,
                  width: 32,
                  borderRadius: 32,
                  backgroundColor: '#ECEBF0',
                  marginBottom: 8,
                  marginEnd: 8,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text
                  style={{fontSize: 12, color: '#1c1c1e', fontWeight: '400'}}>
                  R
                </Text>
              </TouchableOpacity>
            </View>
          );
        },
      }}>
      <Drawer.Screen name="HomeScreen" component={HomeScreen} />
      <Drawer.Screen name="ProfileScreen" component={ProfileScreen} />
    </Drawer.Navigator>
  );
};

export default DrawerContainer;

const styles = StyleSheet.create({});
