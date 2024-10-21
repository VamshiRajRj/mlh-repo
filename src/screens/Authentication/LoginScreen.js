import React, {useState, useEffect, useRef, useMemo, useCallback} from 'react';
import {
  View,
  Text,
  Alert,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Button,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {CognitoUser, AuthenticationDetails} from 'amazon-cognito-identity-js';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';

import {useGlobal} from '../../hooks/global';
import {useLoading} from '../../hooks/loading';
import {cognitoPool} from '../../utils/cognito-pool';

import {height, width} from '../../utils/Styles';
import {getCredentials} from '../../utils/RefreshToken';
import {GetDataRequest} from '../../APIKit';

const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.floor(Math.random() * 16);
    const v = c === 'x' ? r : (r % 4) + 8;
    return v.toString(16);
  });
};

export const LoginScreen = ({navigation}) => {
  const {setUser} = useGlobal();
  const {setLoading} = useLoading();

  const [loginData, setLoginData] = useState({
    nameRef: true,
    passwordRef: false,
    invalidPassword: false,
    invalidUserName: false,
    invalid: '',
    username: '',
    password: '',
    showPass: false,
  });

  const onPressLogin = () => {
    if (loginData?.username?.length < 4) {
      setLoginData({
        ...loginData,
        invalidUserName: true,
      });
      return;
    }

    if (loginData?.password?.length < 7) {
      setLoginData({
        ...loginData,
        invalidPassword: true,
      });
      return;
    }

    const authenticationDetails = new AuthenticationDetails({
      Username: loginData?.username,
      Password: loginData?.password,
    });

    const user = new CognitoUser({
      Username: loginData?.username,
      Pool: cognitoPool,
    });

    setLoading(true);
    user.authenticateUser(authenticationDetails, {
      onSuccess: async res => {
        var token = res.getAccessToken().getJwtToken();
        await AsyncStorage.setItem(
          'REFRESH_TOKEN',
          JSON.stringify({
            token: token,
            id: uuidv4(),
          }),
        );
        GetDataRequest(
          `roleUserRelation/allRoleUserRelationsForLoginUser`,
          null,
        )
          .then(async res => {
            if (res?.status === 200 || res?.status === 201) {
              setTimeout(() => {
                resetForm();
                setLoading(false);
                setUser(user);
              }, 350);
            }
          })
          .catch(e => {
            console.error(e);
          });
      },

      onFailure: err => {
        console.error(err);
        setLoading(false);

        switch (err.name) {
          case 'UserNotConfirmedException':
            setLoginData({
              ...loginData,
              invalid: 'Please confirm your email address.',
            });
            return;
          case 'NotAuthorizedException':
            setLoginData({
              ...loginData,
              invalid: 'Incorrect email or password.',
            });
            return;
          default:
            setLoginData({
              ...loginData,
              invalid:
                'Oops! Looks like something went wrong. Please try again later.',
            });
            return;
        }
      },
      mfaRequired: function (codeDeliveryDetails) {
        // MFA is required to complete user authentication.
        // Get the code from user and call
        user.sendMFACode(mfaCode, this);
      },

      newPasswordRequired: function (userAttributes, requiredAttributes) {
        setLoading(false);
        // User was signed up by an admin and must provide new
        // password and required attributes, if any, to complete
        // authentication.

        // the api doesn't accept this field back
        delete userAttributes.email_verified;
      },
    });
  };

  const resetForm = () => {
    setLoginData({
      ...loginData,
      username: '',
      password: '',
    });
  };

  const onFocusName = () => {
    setLoginData({
      ...loginData,
      nameRef: true,
    });
  };

  const onFocusPass = () => {
    setLoginData({
      ...loginData,
      passwordRef: true,
    });
  };

  const onBlurName = () => {
    setLoginData({
      ...loginData,
      nameRef: false,
    });
  };

  const onBlurPass = () => {
    setLoginData({
      ...loginData,
      passwordRef: false,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={{uri: 'logo'}}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.head}>Welcome to Order Management👋</Text>

      <Text style={styles.subHead}>Sign in to continue to ServCrust</Text>

      {/* Title */}
      <Text style={styles.title}>Sign in</Text>

      {/* Sub Title */}
      <Text style={styles.subTitle}>Sign up for continue explore!</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inpText}>Username</Text>
        <View
          style={[
            {
              flexDirection: 'row',
              borderBottomWidth: 1,
              width: width * 0.9,
            },
            loginData?.nameRef
              ? {borderBottomColor: '#156CF7'}
              : {borderBottomColor: '#D3D3D3'},
          ]}>
          <TextInput
            style={styles.input}
            autoFocus
            autoCapitalize="none"
            onFocus={onFocusName}
            onBlur={onBlurName}
            maxLength={45}
            onChangeText={e => {
              setLoginData({
                ...loginData,
                username: e,
                invalidUserName: false,
                invalid: '',
              });
            }}
            placeholderTextColor={'#1c1c1e50'}
            placeholder="Username"
            value={loginData?.username}
          />
          {loginData?.username?.length >= 6 && (
            <Image
              source={{uri: 'verified'}}
              style={{width: 24, aspectRatio: 1, marginTop: 12}}
              resizeMode="contain"
            />
          )}
        </View>
        {loginData?.invalidUserName && (
          <Text style={styles.errorTxt}>
            Please enter a valid email address or username.
          </Text>
        )}
      </View>
      {/* Username */}

      {/* Password */}
      <View style={styles.inputContainer}>
        <Text style={styles.inpText}>Password</Text>
        <View
          style={[
            {flexDirection: 'row', borderBottomWidth: 1, width: width * 0.9},
            loginData?.passwordRef
              ? {borderBottomColor: '#156CF7'}
              : {borderBottomColor: '#D3D3D3'},
          ]}>
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            onChangeText={e => {
              setLoginData({
                ...loginData,
                password: e,
                invalidPassword: false,
                invalid: '',
              });
            }}
            placeholder="Password"
            onFocus={onFocusPass}
            placeholderTextColor={'#1c1c1e50'}
            maxLength={31}
            onBlur={onBlurPass}
            secureTextEntry={!loginData?.showPass}
            value={loginData?.password}
          />
          {loginData?.showPass ? (
            <TouchableOpacity
              onPress={() => {
                setLoginData({...loginData, showPass: false});
              }}>
              <Image
                source={{uri: 'show_pass'}}
                style={{
                  width: 24,
                  aspectRatio: 1,
                  marginTop: 12,
                  tintColor: 'black',
                }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => {
                setLoginData({...loginData, showPass: true});
              }}>
              <Image
                source={{uri: 'close_pass'}}
                style={{
                  width: 24,
                  aspectRatio: 1.33,
                  marginTop: 12,
                  tintColor: 'black',
                }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
        </View>
        {loginData?.invalidPassword && (
          <Text style={styles.errorTxt}>
            Your password must be at least 6 characters long.
          </Text>
        )}
      </View>
      <Text
        style={[
          styles.errorTxt,
          {
            marginHorizontal: width * 0.05,
            paddingHorizontal: 12,
            marginTop: 12,
          },
        ]}>
        {loginData?.invalid}
      </Text>
      {/* Login button */}

      <TouchableOpacity
        style={styles.signInBtnView}
        onPress={onPressLogin}
        activeOpacity={0.7}>
        <Text style={styles.signInBtnText}>Sign in</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoContainer: {
    marginTop: 22,
    width: width,
    alignItems: 'center',
  },
  logo: {
    width: 281,
    height: 44.59,
  },
  title: {
    fontSize: 32,
    width: width,
    color: '#022150',
    textAlign: 'left',
    marginTop: 22,
    fontWeight: 'bold',
    paddingStart: 27,
  },
  subTitle: {
    fontSize: 16,
    width: width,
    color: '#969AA8',
    textAlign: 'left',
    marginTop: 8,
    fontWeight: '400',
    paddingStart: 27,
  },
  head: {
    fontSize: 19,
    width: width,
    color: '#022150',
    textAlign: 'center',
    marginTop: 50,
    fontWeight: 'bold',
  },
  subHead: {
    fontSize: 14,
    width: width,
    color: '#79869F',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '400',
  },
  inputContainer: {
    width: width * 0.9,
    marginHorizontal: width * 0.05,
    // backgroundColor: '#DFDFDF',
    height: 80,
    marginTop: 8,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  input: {
    fontSize: 16,
    width: width * 0.9 - 48,
    height: 45,
    marginHorizontal: 8,
    color: '#1c1c1e',
  },
  inpText: {
    fontSize: 12,
    lineHeight: 14.52,
    width: width * 0.9,
    color: '#6A6F7D',
    textAlign: 'left',
    marginTop: 8,
    fontWeight: '400',
    paddingStart: 8,
  },
  errorTxt: {
    fontSize: 10,
    lineHeight: 12,
    width: width * 0.9,
    color: 'red',
    textAlign: 'left',
    marginTop: 8,
    fontWeight: '400',
    paddingStart: 8,
  },
  signInBtnView: {
    width: width * 0.8,
    height: 56,
    backgroundColor: '#156CF7',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: width * 0.1,
    marginTop: 80,
  },
  signInBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    letterSpacing: 0.02,
    lineHeight: 24,
  },
});
