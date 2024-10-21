import React, {useEffect, useState} from 'react';
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
import {PostDataRequest} from '../APIKit';
import {cognitoPool} from '../utils/cognito-pool';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useGlobal} from '../hooks/global';
import {Dropdown} from 'react-native-element-dropdown';
import Toast from 'react-native-toast-message';

function AddTripModal({
  tripDetails,
  setDetails,
  onClose,
  onConfirm,
  vehicles,
  setLoading,
}) {
  const {user, setUser} = useGlobal();
  const [error, setError] = useState({
    vehicleNumber: false,
    name: false,
    phoneNumber: false,
  });

  const [vehs, setVehs] = useState([]);

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      dropData();
    }
    return () => {
      mounted = false;
    };
  }, []);

  const dropData = () => {
    let vehicleNumbers = [];
    vehicles?.map(vhs => {
      if (vhs?.vehicleCapacityCft === tripDetails?.quantityValue) {
        vehicleNumbers?.push({label: vhs?.vehicleNo, value: vhs?.id});
      }
    });
    setVehs(vehicleNumbers);
  };

  const addTrip = () => {
    if (tripDetails?.vehicleNumber?.length === 0) {
      setError({
        vehicleNumber: true,
        name: false,
        phoneNumber: false,
      });
      setLoading(false);
      return;
    }
    if (tripDetails?.driverName?.length === 0) {
      setError({
        vehicleNumber: false,
        name: true,
        phoneNumber: false,
      });
      setLoading(false);
      return;
    }
    if (tripDetails?.driverContactNumber?.length !== 10) {
      setError({
        vehicleNumber: false,
        name: false,
        phoneNumber: true,
      });
      setLoading(false);
      return;
    }
    setError({
      vehicleNumber: false,
      name: false,
      phoneNumber: false,
    });

    PostDataRequest('tripDetails/create', {
      orderId: tripDetails?.orderId,
      vehicleNumber: tripDetails?.vehicleNumber,
      deliveryCharges: tripDetails?.deliveryCharges,
      driverName: tripDetails?.driverName,
      driverContactNumber: tripDetails?.driverContactNumber,
      companyId: tripDetails?.companyId,
    })
      .then(async res => {
        if (res?.status === 200 || res?.status === 201) {
          Toast.show({
            type: 'success',
            text1: 'Trip Added',
          });
          onConfirm();
        } else if (
          res?.status === 400 ||
          res?.status === 404 ||
          res?.status === 401
        ) {
          setLoading(false);
          cognitoPool.getCurrentUser().signOut();
          setUser(null);
          await AsyncStorage.clear();
        } else {
          Toast.show({
            type: 'error',
            text1: 'Unable to add trip',
          });
          setLoading(false);
        }
      })
      .catch(err => console.error(err?.status));
  };
  return (
    <Modal
      animationType="fade"
      visible={tripDetails.visibility}
      transparent
      presentationStyle="overFullScreen">
      <TouchableOpacity
        onPress={() => {
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
                alignItems: 'center',
              }}>
              <Text style={styles.title}>Add Trip</Text>
              <TouchableOpacity
                onPress={() => {
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
              <Text style={styles.inputHead}>Vehicle Number*</Text>
              {/* <TextInput
                style={[
                  styles.textInput,
                  {borderColor: error?.vehicleNumber ? 'red' : '#DFDFDF'},
                ]}
                value={tripDetails?.vehicleNumber}
                onChangeText={v => {
                  setDetails({...tripDetails, vehicleNumber: v});
                }}
              /> */}
              <Dropdown
                style={{
                  // width: width * 0.6,
                  height: 54,
                  fontSize: 16,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  marginHorizontal: 16,
                  borderRadius: 4,
                  marginTop: 3,
                }}
                placeholderStyle={{fontSize: 16}}
                selectedTextStyle={{fontSize: 16}}
                inputSearchStyle={{fontSize: 16}}
                data={vehs}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="Select item"
                searchPlaceholder="Search..."
                value={tripDetails?.vehicleNumber}
                onChange={item => {
                  setDetails({...tripDetails, vehicleNumber: item.value});
                }}
              />
              {error?.vehicleNumber && (
                <Text
                  style={{
                    color: 'red',
                    fontSize: 10,
                    marginHorizontal: 18,
                    marginTop: 4,
                  }}>
                  Enter a Vehicle Number
                </Text>
              )}
              {vehs?.length === 0 && (
                <Text
                  style={{
                    color: 'red',
                    fontSize: 10,
                    marginHorizontal: 18,
                    marginTop: 4,
                  }}>
                  No Vehicles present at this moment
                </Text>
              )}
              <Text style={styles.inputHead}>Delivery Charges*</Text>
              <TextInput
                style={styles.textInput}
                value={tripDetails?.deliveryCharges + ''}
                editable={false}
              />
              <Text style={styles.inputHead}>Driver Name*</Text>
              <TextInput
                style={[
                  styles.textInput,
                  {borderColor: error?.name ? 'red' : '#DFDFDF'},
                ]}
                value={tripDetails?.driverName}
                onChangeText={v => {
                  setDetails({...tripDetails, driverName: v});
                }}
              />
              {error?.name && (
                <Text
                  style={{
                    color: 'red',
                    fontSize: 10,
                    marginHorizontal: 18,
                    marginTop: 4,
                  }}>
                  Enter driver name
                </Text>
              )}
              <Text style={styles.inputHead}>Driver Phone Number*</Text>
              <TextInput
                style={[
                  styles.textInput,
                  {borderColor: error?.phoneNumber ? 'red' : '#DFDFDF'},
                ]}
                value={tripDetails?.driverContactNumber}
                maxLength={10}
                keyboardType="phone-pad"
                onChangeText={v => {
                  setDetails({...tripDetails, driverContactNumber: v});
                }}
              />
              {error?.phoneNumber && (
                <Text
                  style={{
                    color: 'red',
                    fontSize: 10,
                    marginHorizontal: 18,
                    marginTop: 4,
                  }}>
                  Enter a valid contact number
                </Text>
              )}
              <Text style={styles.inputHead}>Order ID*</Text>
              <TextInput
                style={styles.textInput}
                editable={false}
                value={tripDetails?.orderId}
              />
            </ScrollView>

            <TouchableOpacity
              onPress={() => {
                addTrip(tripDetails);
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
    color: '#000',
    fontWeight: '500',
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

export default AddTripModal;
