import AsyncStorage from '@react-native-async-storage/async-storage';

const getCredentials = async () => {
  try {
    var cognitoUser = await AsyncStorage.getItem('REFRESH_TOKEN');

    return JSON.parse(cognitoUser);
  } catch (e) {
    console.error(e);
    return null;
  }
};

export {getCredentials};
