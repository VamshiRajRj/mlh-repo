import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Modal,
  Image,
  TextInput,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import {PostDataRequest, PutDataRequest} from '../APIKit';
import {cognitoPool} from '../utils/cognito-pool';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useGlobal} from '../hooks/global';
import Toast from 'react-native-toast-message';

function CancelOrderModal({visible, onClose, onConfirm, selected, setLoading}) {
  const {user, setUser} = useGlobal();
  const [error, setError] = useState(false);
  const [reason, setReason] = useState('');
  const updateOrder = () => {
    if (reason?.length === 0) {
      setError(true);
      setLoading(false);
      return;
    }
    setError(false);
    PutDataRequest('/orders', {
      ...selected,
      orderStatus: 'CANCELLEDBYADMIN',
      notes: reason,
    })
      .then(async res => {
        if (res?.status === 200 || res?.status === 201) {
          Toast.show({
            type: 'success',
            text1: 'Order Cancelled',
          });
          setReason(null);
          setError(false);
          onConfirm();
        } else if (
          res?.status === 400 ||
          res?.status === 404 ||
          res?.status === 401
        ) {
          setLoading(false);
          setReason(null);
          setError(false);
          cognitoPool.getCurrentUser().signOut();
          setUser(null);
          await AsyncStorage.clear();
          console.error(res);
        } else {
          Toast.show({
            type: 'error',
            text1: 'Unable to cancel',
          });
          setLoading(false);
        }
      })
      .catch(e => {
        console.error(e);
      });
  };
  return (
    <Modal
      animationType="fade"
      visible={visible}
      transparent
      presentationStyle="overFullScreen">
      <TouchableOpacity
        onPress={() => {
          setReason(null);
          setError(false);
          onClose();
        }}
        activeOpacity={1}
        style={styles.viewWrapper}>
        <TouchableWithoutFeedback>
          <View
            style={{
              width: width * 0.9,
              backgroundColor: '#FFF',
              borderRadius: 12,
            }}>
            <View
              style={{
                flexDirection: 'row',
                borderBottomColor: '#DFDFDF',
                borderBottomWidth: 1,
                padding: 12,
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}>
              <Text style={styles.title}>Are you sure to cancel order?</Text>
              <TouchableOpacity
                onPress={() => {
                  setReason(null);
                  setError(false);
                  onClose();
                }}
                style={{}}>
                <Image
                  source={{uri: 'close'}}
                  style={{
                    height: 32,
                    width: 32,
                    tintColor: '#000',
                  }}
                />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.tcContainer}>
              <Text style={styles.inputHead}>Reason*</Text>
              <TextInput
                style={[
                  styles.textInput,
                  {borderColor: error ? 'red' : '#DFDFDF'},
                ]}
                value={reason}
                onChangeText={v => {
                  setReason(v);
                }}
              />
              {error && (
                <Text
                  style={{
                    color: 'red',
                    fontSize: 10,
                    marginHorizontal: 18,
                    marginTop: 4,
                  }}>
                  Enter a valid reason.
                </Text>
              )}
            </ScrollView>

            <TouchableOpacity
              onPress={() => {
                updateOrder();
                setLoading(true);
              }}
              style={styles.button}>
              <Text style={styles.buttonLabel}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
}

const {width, height} = Dimensions.get('window');

const styles = {
  container: {
    marginTop: 20,
    marginLeft: 10,
    marginRight: 10,
    width: width * 0.9,
  },
  viewWrapper: {
    flex: 1,
    backgroundColor: '#00000020',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    alignSelf: 'center',
    color: 'red',
    fontWeight: '500',
    width: width * 0.9 - 60,
    textAlign: 'center',
  },
  tcContainer: {
    marginTop: 15,
    marginBottom: 15,
    maxHeight: height * 0.7,
  },
  inputHead: {
    width: width * 0.8,
    fontSize: 14,
    lineHeight: 20,
    marginHorizontal: 16,
    marginTop: 16,
    color: 'red',
  },
  textInput: {
    height: 54,
    fontSize: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    marginHorizontal: 16,
    borderRadius: 4,
    marginTop: 3,
  },

  button: {
    backgroundColor: 'green',
    borderRadius: 5,
    padding: 10,
    width: width * 0.4,
    marginHorizontal: width * 0.25,
    marginBottom: 12,
  },
  buttonLabel: {
    fontSize: 16,
    color: '#FFF',
    alignSelf: 'center',
    fontWeight: '600',
  },
};

export default CancelOrderModal;
