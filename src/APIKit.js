import axios from 'axios';
import {getCredentials} from './utils/RefreshToken';
// import Toast from 'react-native-toast-message';
import {URI} from '../env-vars';
let APIKit = axios.create({
  baseURL: `${URI}/api/`,
});
const onSuccess = response => {
  return response;
};

const onFailure = error => {
  // Toast.show({
  //   type: 'error',
  //   text1: 'Unexpected error occurred',
  // });
  return error;
};

export async function GetDataRequest(path, params) {
  try {
    let cred = await getCredentials();
    if (cred != null) {
      const fetchParams = {
        method: 'GET',
        url: path,
        headers: {
          Authorization: `Bearer ${cred?.token}`,
          Parameter1: cred?.id,
        },
        data: '',
      };

      return APIKit(fetchParams).then(onSuccess).catch(onFailure);
    } else {
      throw new Error('APIKIT GET CREDENTIALS ERROR OCCURRED');
    }
  } catch (err) {
    console.error(JSON.stringify(err), 'TRY CATCH BLOCK APIKIT ERROR');
  }
}

export async function PutDataRequest(path, body) {
  try {
    let cred = await getCredentials();
    if (cred != null) {
      const data1 = JSON.stringify(body);
      const fetchParams = {
        method: 'PUT',
        url: path,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cred?.token}`,
          Parameter1: cred?.id,
        },
        data: data1,
      };
      return APIKit(path, fetchParams).then(onSuccess).catch(onFailure);
    } else {
      throw new Error('APIKIT GET CREDENTIALS ERROR OCCURRED');
    }
  } catch (err) {
    console.error(JSON.stringify(err), 'TRY CATCH BLOCK APIKIT ERROR');
  }
}

export async function PostDataRequest(path, body) {
  try {
    let cred = await getCredentials();
    if (cred != null) {
      const data1 = JSON.stringify(body);
      const fetchParams = {
        method: 'POST',
        url: path,

        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cred?.token}`,
          Parameter1: cred?.id,
        },
        data: data1,
      };

      return APIKit(path, fetchParams).then(onSuccess).catch(onFailure);
    } else {
      throw new Error('APIKIT GET CREDENTIALS ERROR OCCURRED');
    }
  } catch (err) {
    console.error(JSON.stringify(err), 'TRY CATCH BLOCK APIKIT ERROR');
  }
}

export async function DeleteDataRequest(path, body, cookie) {
  try {
    let cred = await getCredentials();
    if (cred != null) {
      const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        Authorization: `Bearer ${cred}`,
      };
      const data1 = JSON.stringify(body);
      const fetchParams = {
        method: 'DELETE',
        url: path,
        headers,
        credentials: 'omit',
        data: data1,
      };

      return APIKit(path, fetchParams).then(onSuccess).catch(onFailure);
    } else {
      throw new Error('APIKIT GET CREDENTIALS ERROR OCCURRED');
    }
  } catch (err) {
    console.error(JSON.stringify(err), 'TRY CATCH BLOCK APIKIT ERROR');
  }
}
