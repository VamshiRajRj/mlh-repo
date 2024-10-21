import React, {useState, useEffect, useCallback} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

import {createStackNavigator, TransitionPresets} from '@react-navigation/stack';

import {useLoading} from '../hooks/loading';

import {MainContainer} from './MainContainer';
import {LoginScreen} from '../screens/Authentication/LoginScreen';

import {LoadingView} from '../components/LoadingView';

const Stack = createStackNavigator();
export const AuthContainer = () => {
  const {loading} = useLoading();

  return (
    <>
      <Stack.Navigator
        initialRouteName={'LoginScreen'}
        screenOptions={{...TransitionPresets.SlideFromRightIOS}}>
        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen}
          options={{
            headerShown: false,
          }}
        />
        {/* The screens below don't show a tab bar so moving them
          outside the BottomTabContainer fixes this as explained
          in React Navigation docs:
          https://reactnavigation.org/docs/hiding-tabbar-in-screens/ */}
      </Stack.Navigator>
      {loading && <LoadingView />}
    </>
  );
};
