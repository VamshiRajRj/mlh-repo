import React, {useState, useEffect, useCallback} from 'react';
import {createStackNavigator, TransitionPresets} from '@react-navigation/stack';
import TestScreen from '../screens/TestScreen';
import BottomTabs from './BottomTabs';

const Stack = createStackNavigator();

export const MainContainer = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        ...TransitionPresets.SlideFromRightIOS,
        headerShown: false,
      }}>
      <Stack.Screen
        name="BottomTabs"
        component={BottomTabs}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="TestScreen"
        component={TestScreen}
        options={{
          headerShown: false,
        }}
      />

      {/* The screens below don't show a tab bar so moving them
          outside the BottomTabContainer fixes this as explained
          in React Navigation docs:
          https://reactnavigation.org/docs/hiding-tabbar-in-screens/ */}
    </Stack.Navigator>
  );
};
