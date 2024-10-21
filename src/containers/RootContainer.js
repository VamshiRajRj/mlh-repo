import {StyleSheet, Text, View} from 'react-native';
import React, {useState, useEffect, useCallback} from 'react';
import SplashScreen from '../screens/SplashScreen';
import {AuthContainer} from './AuthContainer';
import {MainContainer} from './MainContainer';
import {cognitoPool} from '../utils/cognito-pool';
import {useGlobal} from '../hooks/global';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RootContainer = () => {
  const [splash = true, setSplash] = useState();
  const {user, setUser} = useGlobal();
  useEffect(() => {
    let mounted = true;

    if (mounted) {
      getSession();

      setTimeout(() => {
        setSplash(false);
      }, 3000);
    }
    return () => {
      mounted = false;
    };
  }, []);

  const getSession = useCallback(async () => {
    const storageToken = await AsyncStorage.getItem('REFRESH_TOKEN');

    cognitoPool.storage.sync(function (err, res) {
      if (res !== 'SUCCESS') return;

      const u = cognitoPool.getCurrentUser();
      if (!u) return;

      u.getSession(async (err, session) => {
        if (err) return;

        const sessionToken = session.getAccessToken().getJwtToken();
        if (sessionToken === JSON.parse(storageToken)?.token) {
          setUser(u);
        } else {
          await AsyncStorage.clear();
        }
      });
    });
  }, []);

  if (splash) {
    return <SplashScreen />;
  }
  return <>{user ? <MainContainer /> : <AuthContainer />}</>;
};

export default RootContainer;

const styles = StyleSheet.create({});
