import {
  Alert,
  FlatList,
  Image,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import {cognitoPool} from '../../utils/cognito-pool';
import {useGlobal} from '../../hooks/global';
import {height, width} from '../../utils/Styles';
import HomeDetails from '../../components/HomeDetails';
import {Colors, Icons} from '../../utils/Colors';
import DatePicker from 'react-native-date-picker';
import {Dropdown} from 'react-native-element-dropdown';
const data = [
  {label: 'Item 1', value: '1'},
  {label: 'Item 2', value: '2'},
  {label: 'Item 3', value: '3'},
  {label: 'Item 4', value: '4'},
  {label: 'Item 5', value: '5'},
  {label: 'Item 6', value: '6'},
  {label: 'Item 7', value: '7'},
  {label: 'Item 8', value: '8'},
];
import OrderListData from '../../constants/OrderData';
import {GetDataRequest, PostDataRequest, PutDataRequest} from '../../APIKit';

import {updateUser, updateHomeData, updateVehicles} from '../../redux/actions';
import {connect} from 'react-redux';

import {OrderStatus, PayStatus} from '../../constants/Status';
import AddTripModal from '../../components/AddTripModal';
import AddDCNumberModal from '../../components/AddDCNumberModal';
import CancelOrderModal from '../../components/CancelOrderModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loading from '../../components/Loading';
import Toast from 'react-native-toast-message';

// import BottomSheetComp from '../../components/BottomSheetComp';

const HomeScreen = props => {
  const {user, setUser} = useGlobal();

  const [filters, setFilters] = useState({
    startDate: new Date(),
    endDate: new Date(),
    orderId: '',
    orderStatus: '',
    payStatus: '',
  });

  const [tripDetails, setTripDetails] = useState({
    visibility: false,
    orderId: '',
    vehicleNumber: '',
    deliveryCharges: 0,
    driverName: '',
    driverContactNumber: '',
    companyId: '',
  });

  const [loading, setLoading] = useState(false);

  const [manualDCNo, setManualDCNo] = useState({value: null, show: false});
  const [cancelOrder, setCancelOrder] = useState(false);

  const [home, setHome] = useState(props?.homeDetails);

  const [selected, setSelected] = useState();

  const [modal, setModals] = useState({
    start: false,
    end: false,
  });

  const [confirmDate, setConfirmDate] = useState(false);

  const [search, setSearch] = useState({value: '', show: true});
  const searchRef = useRef(null);

  // ref
  const bottomSheetRef = useRef(null);
  const filterSheetRef = useRef(null);
  const tripDetailsSheetRef = useRef(null);
  // ref
  const bottomSheet = useRef(null);

  // variables
  const snapPoints = useMemo(() => [height * 0.65], []);

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      cognitoPool.storage.sync(function (err, result) {
        if (err) {
        } else if (result === 'SUCCESS') {
          if (user != null) {
            return user.getSession(function (err, session) {
              if (err) {
                Alert.alert(err.message || JSON.stringify(err));
                return;
              }
              user.getUserAttributes(function (err, userData) {
                if (err) {
                  Alert.alert(err.message || JSON.stringify(err));
                  return;
                }
                let d = {};
                userData.map(val => {
                  d[val.Name] = val.Value;
                });
                props?.updateUser(d);
                getVehicles(d);
                getData(d);
              });
            });
          }
        }
      });
    }
    return () => {
      mounted = false;
    };
  }, []);

  const getVehicles = val => {
    GetDataRequest(
      `vehicleDetails/availableVehicles/${val['custom:companyId']}`,
      null,
    )
      .then(async res => {
        if (res?.status === 200 || res?.status === 201) {
          props?.updateVehicles(res?.data);
        } else if (
          res?.status === 400 ||
          res?.status === 404 ||
          res?.status === 401
        ) {
          cognitoPool.getCurrentUser().signOut();
          setUser(null);
          await AsyncStorage.clear();
          console.error(res);
        }
      })
      .catch(err => console.error(err?.status));
  };

  const updateOrder = status => {
    setLoading(true);
    PutDataRequest('/orders', {
      id: selected?.id,
      orderStatus: status,
      transportOpted: selected?.transportOpted,
      manualDcNo: selected?.manualDcNo,
    })
      .then(async res => {
        if (res?.status === 200 || res?.status === 201) {
          Toast.show({
            type: 'success',
            text1: 'Order Updated',
          });
          getData(props?.myDetails);
          bottomSheet.current.close();
        } else if (
          res?.status === 400 ||
          res?.status === 404 ||
          res?.status === 401
        ) {
          cognitoPool.getCurrentUser().signOut();
          setUser(null);
          await AsyncStorage.clear();
          console.error(res);
        } else {
          Toast.show({
            type: 'error',
            text1: 'Unable to update order',
          });
        }
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
      });
  };

  const onSearch = txt => {
    let s = props?.homeDetails?.filter(v => {
      return v?.id.includes(txt);
    });

    setHome(s);
  };

  const getData = val => {
    GetDataRequest(
      `/orders/allDetailsForOrdersPage/${val['custom:companyId']}`,
      null,
    )
      .then(async res => {
        if (res?.status === 200 || res?.status === 201) {
          const d = res?.data.sort((a, b) => {
            let da = new Date(a.createdAt),
              db = new Date(b.createdAt);
            return db - da;
          });
          setHome(d);
          props?.updateHomeData(d);
        } else if (
          res?.status === 400 ||
          res?.status === 404 ||
          res?.status === 401
        ) {
          cognitoPool.getCurrentUser().signOut();
          setUser(null);
          await AsyncStorage.clear();
          console.error(res);
        } else {
          Toast.show({
            type: 'error',
            text1: 'Unable to get data',
          });
        }
        setLoading(false);
      })
      .catch(err => console.error(err?.status));
  };

  // callbacks
  const handleSheetChanges = useCallback(index => {
    console.log('handleSheetChanges', index);
  }, []);
  // callbacks
  const handleChanges = useCallback(index => {
    console.log('handleSheetChanges', index);
  }, []);

  const renderBackdrop = useCallback(
    props => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    [],
  );

  const Row = ({index, head, value}) => {
    return (
      <View
        style={[
          bottomStyles.row,
          index % 2 !== 0
            ? {backgroundColor: '#FFF'}
            : {backgroundColor: 'rgba(244, 244, 244, 1)'},
        ]}>
        <Text style={bottomStyles.heading}>{head}</Text>
        <Text style={bottomStyles.content}>{value}</Text>
      </View>
    );
  };

  const applyFilters = () => {
    let body = {
      companyId: props?.myDetails['custom:companyId'],
      startDate: filters?.startDate?.toISOString().substr(0, 10),
      endDate: filters?.endDate?.toISOString().substr(0, 10),
    };

    if (filters?.payStatus !== '') {
      body['paymentStatus'] = filters?.payStatus;
    }

    if (filters?.orderStatus !== '') {
      body['orderStatus'] = filters?.orderStatus;
    }
    PostDataRequest('orders/filterForOrdersPage', body)
      .then(async res => {
        if (res?.status === 200 || res?.status === 201) {
          const d = res?.data.sort((a, b) => {
            let da = new Date(a.createdAt),
              db = new Date(b.createdAt);
            return da - db;
          });
          setHome(d);
          props?.updateHomeData(d);
          filterSheetRef.current.close();
        } else if (
          res?.status === 400 ||
          res?.status === 404 ||
          res?.status === 401
        ) {
          cognitoPool.getCurrentUser().signOut();
          setUser(null);
          await AsyncStorage.clear();
          console.error(res);
        } else {
          Toast.show({
            type: 'error',
            text1: 'Try again after sometime',
          });
        }
        setLoading(false);
      })
      .catch(err => console.error(err?.status));
  };

  const getChallan = () => {
    GetDataRequest(`orders/getPreSignedUrl/${selected?.dcUrl}`)
      .then(async res => {
        if (res?.status === 200 || res?.status === 201) {
          if (Linking.canOpenURL(res?.data?.url)) {
            await Linking.openURL(res?.data?.url);
          }
        } else if (
          res?.status === 400 ||
          res?.status === 404 ||
          res?.status === 401
        ) {
          cognitoPool.getCurrentUser().signOut();
          setUser(null);
          await AsyncStorage.clear();
        } else {
          Toast.show({
            type: 'error',
            text1: 'Try again after sometime',
          });
        }
      })
      .catch(console.error);
  };

  const getInvoice = () => {
    GetDataRequest(`orders/getPreSignedUrl/${selected?.invoiceUrl}`)
      .then(async res => {
        if (res?.status === 200 || res?.status === 201) {
          if (Linking.canOpenURL(res?.data?.url)) {
            await Linking.openURL(res?.data?.url);
          }
        } else if (
          res?.status === 400 ||
          res?.status === 404 ||
          res?.status === 401
        ) {
          cognitoPool.getCurrentUser().signOut();
          setUser(null);
          await AsyncStorage.clear();
        } else {
          Toast.show({
            type: 'error',
            text1: 'Try again after sometime',
          });
        }
      })
      .catch(console.error);
  };

  const getLogisticsInvoice = () => {
    GetDataRequest(`orders/getPreSignedUrl/${selected?.logisticsInvoiceUrl}`)
      .then(async res => {
        if (res?.status === 200 || res?.status === 201) {
          if (Linking.canOpenURL(res?.data?.url)) {
            await Linking.openURL(res?.data?.url);
          }
        } else if (
          res?.status === 400 ||
          res?.status === 404 ||
          res?.status === 401
        ) {
          cognitoPool.getCurrentUser().signOut();
          setUser(null);
          await AsyncStorage.clear();
        } else {
          Toast.show({
            type: 'error',
            text1: 'Try again after sometime',
          });
        }
      })
      .catch(console.error);
  };

  const RenderItem = ({icon, title, onPress}) => {
    return (
      <TouchableOpacity
        style={bottomStyles.item}
        activeOpacity={0.6}
        onPress={onPress}>
        <View style={[bottomStyles.imageView, {backgroundColor: Colors[icon]}]}>
          <Image
            source={{uri: Icons[icon]}}
            style={bottomStyles.imageItem}
            resizeMode="contain"
          />
        </View>
        <Text style={bottomStyles.head}>{title}</Text>
      </TouchableOpacity>
    );
  };
  const onPress = item => {
    setManualDCNo({...manualDCNo, value: item?.manualDcNo});
    setSelected(item);
    bottomSheetRef.current.snapToIndex(0);
  };

  const confirmOrder = date => {
    PutDataRequest('/orders', {
      ...selected,
      orderStatus: 'CONFIRMED',
      expectedDispatchDate: date?.toISOString().substr(0, 10),
    })
      .then(async res => {
        if (res?.status === 200 || res?.status === 201) {
          Toast.show({
            type: 'success',
            text1: 'Confirmed order',
          });
          getData(props?.myDetails);
          bottomSheet.current.close();
        } else if (
          res?.status === 400 ||
          res?.status === 404 ||
          res?.status === 401
        ) {
          cognitoPool.getCurrentUser().signOut();
          setUser(null);
          await AsyncStorage.clear();
          console.error(res);
        } else {
          Toast.show({
            type: 'error',
            text1: 'Unable to confirm',
          });
        }
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
      });
  };

  const onOptionsPress = item => {
    setSelected(item);
    bottomSheet.current.snapToIndex(0);
  };

  const onFiltersPress = () => {
    filterSheetRef.current.snapToIndex(0);
  };

  const selectDate = () => {
    setConfirmDate(true);
  };

  const onDispatch = () => {
    setManualDCNo({show: true, value: null});
  };

  const onCancel = () => {
    setCancelOrder(true);
  };

  const initiateCall = () => {
    GetDataRequest(`customersupport/agentToCustomerCalling/${selected?.id}`)
      .then(async res => {
        if (res?.status === 200 || res?.status === 201) {
          Toast.show({
            type: 'success',
            text1: 'We are placing the call',
          });
        } else if (
          res?.status === 400 ||
          res?.status === 404 ||
          res?.status === 401
        ) {
          cognitoPool.getCurrentUser().signOut();
          setUser(null);
          await AsyncStorage.clear();
        } else {
          Toast.show({
            type: 'error',
            text1: 'Unable to place the call',
          });
        }
      })
      .catch(console.error);
  };

  return (
    <View style={styles.mainContainer}>
      <Loading loading={loading} />
      <DatePicker
        modal
        mode="date"
        open={modal.start}
        date={filters.startDate}
        onConfirm={date => {
          setModals({...modal, start: false});
          setFilters({...filters, startDate: date});
        }}
        onCancel={() => {
          setModals({...modal, start: false});
        }}
      />
      <DatePicker
        modal
        mode="date"
        open={modal.end}
        date={filters.endDate}
        onConfirm={date => {
          setModals({...modal, end: false});
          setFilters({...filters, endDate: date});
        }}
        onCancel={() => {
          setModals({...modal, end: false});
        }}
      />
      <DatePicker
        modal
        mode="date"
        open={confirmDate}
        date={new Date(new Date().setDate(new Date().getDate() + 1))}
        onConfirm={date => {
          setLoading(true);
          confirmOrder(date);
        }}
        minimumDate={new Date()}
        onCancel={() => {
          setConfirmDate(false);
        }}
      />
      <AddTripModal
        tripDetails={tripDetails}
        onClose={() => {
          setTripDetails({...tripDetails, visibility: false});
        }}
        setDetails={setTripDetails}
        setLoading={setLoading}
        vehicles={props?.vehicles}
        onConfirm={() => {
          setLoading(true);
          getData(props?.myDetails);
          bottomSheet.current.close();
          setTripDetails({
            visibility: false,
            orderId: '',
            vehicleNumber: '',
            deliveryCharges: 0,
            driverName: '',
            driverContactNumber: '',
            companyId: '',
          });
        }}
      />

      <AddDCNumberModal
        manualDCNo={manualDCNo}
        onClose={() => {
          setManualDCNo({...manualDCNo, show: false});
        }}
        selected={selected}
        setLoading={setLoading}
        setManualDCNo={setManualDCNo}
        onConfirm={() => {
          setLoading(true);
          getData(props?.myDetails);
          bottomSheet.current.close();
          setManualDCNo({show: false, manualDCNo: null});
        }}
      />
      <CancelOrderModal
        visible={cancelOrder}
        onClose={() => {
          setCancelOrder(false);
        }}
        setLoading={setLoading}
        selected={selected}
        onConfirm={() => {
          setLoading(true);
          getData(props?.myDetails);
          bottomSheet.current.close();
          setCancelOrder(false);
        }}
      />
      <StatusBar barStyle={'light-content'} />

      <View>
        <Text style={styles.heading}>ORDERS</Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: width * 0.95,
            marginHorizontal: width * 0.025,
          }}>
          <View style={styles.searchContainer}>
            {search.show && (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                  searchRef.current.focus();
                  setSearch({value: '', show: false});
                }}>
                <Image style={styles.searchIcon} source={{uri: 'search'}} />
              </TouchableOpacity>
            )}
            <TextInput
              style={[
                styles.searchInput,
                search.show
                  ? {width: width * 0.8 - 52}
                  : {width: width * 0.8 - 28},
              ]}
              ref={searchRef}
              onBlur={() => {
                setSearch({...search, show: search.value.length === 0});
              }}
              onFocus={() => {
                setSearch({...search, show: false});
              }}
              onChangeText={v => {
                setSearch({...search, value: v});
                onSearch(v);
              }}
            />
            {/* <TouchableOpacity style={styles.searchButton} onPress={() => {}}>
              <Text style={styles.searchButtonText}>search</Text>
            </TouchableOpacity> */}
          </View>
          <TouchableOpacity
            onPress={() => {
              onFiltersPress();
            }}
            style={styles.filters}>
            <Image source={{uri: 'filters'}} style={styles.filtersIcon} />
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        renderItem={({item, index}) => (
          <HomeDetails
            idx={index}
            item={item}
            onPress={onPress}
            onOptionsPress={onOptionsPress}
          />
        )}
        data={home}
        style={{marginTop: 18}}
      />

      {/*Change Mode Options */}
      <BottomSheet
        ref={bottomSheet}
        index={-1}
        enablePanDownToClose
        backgroundStyle={{
          borderTopEndRadius: 20,
          backgroundColor: 'rgba(255, 255, 255, 1)',
          borderTopStartRadius: 20,
        }}
        backdropComponent={renderBackdrop}
        snapPoints={snapPoints}
        onChange={handleChanges}>
        <View style={bottomStyles.container}>
          <View style={bottomStyles.header}>
            <Text style={bottomStyles.headerText}></Text>
            <TouchableOpacity
              style={bottomStyles.closeBtn}
              onPress={() => {
                bottomSheet.current.close();
              }}>
              <Image
                source={{uri: 'close'}}
                style={{height: 32, width: 32}}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          <BottomSheetScrollView contentContainerStyle={bottomStyles.grid}>
            {selected?.orderStatus === 'PLACED' && (
              <RenderItem
                icon={'confirmed'}
                title={'Confirm'}
                onPress={() => {
                  selectDate();
                }}
              />
            )}
            {selected?.orderStatus === 'CONFIRMED' &&
              selected?.tripDetails?.length !== 0 && (
                <RenderItem
                  icon={'dispatched'}
                  title={'Dispatch'}
                  onPress={() => {
                    manualDCNo?.value === null ||
                    manualDCNo?.value?.length === 0
                      ? onDispatch()
                      : updateOrder('dispatched');
                  }}
                />
              )}
            {selected?.orderStatus === 'DISPATCHED' &&
              selected?.tripDetails?.length !== 0 && (
                <RenderItem
                  icon={'delivered'}
                  title={'Delivered'}
                  onPress={() => {
                    updateOrder('delivered');
                  }}
                />
              )}
            {selected?.orderStatus !== 'DELIVERED' &&
              !selected?.orderStatus?.startsWith('CANCELLED') && (
                <RenderItem
                  icon={'cancelledbyadmin'}
                  title={'Cancel'}
                  onPress={() => {
                    onCancel();
                  }}
                />
              )}
            {selected?.orderStatus === 'CONFIRMED' &&
              selected?.tripDetails?.length === 0 && (
                <RenderItem
                  icon={'add_trip'}
                  title={'Add Trip'}
                  onPress={() => {
                    setTripDetails({
                      ...tripDetails,
                      visibility: true,
                      orderId: selected?.id,
                      deliveryCharges: selected?.deliveryCharges,
                      companyId: selected?.companyId,
                      quantityValue: selected?.quantityValue,
                    });
                  }}
                />
              )}
            {selected?.orderStatus !== 'DELIVERED' &&
              !selected?.orderStatus?.startsWith('CANCELLED') && (
                <RenderItem
                  icon={'call'}
                  title={'Call'}
                  onPress={async () => {
                    initiateCall();
                    // const canOpen = await Linking.canOpenURL(
                    //   `tel:${selected?.phoneNumber}`,
                    // );
                    // if (selected?.phoneNumber?.length === 13) {
                    //   await Linking.openURL(`tel:${selected?.phoneNumber}`);
                    // } else if (selected?.phoneNumber?.length === 12) {
                    //   await Linking.openURL(`tel:+${selected?.phoneNumber}`);
                    // } else if (selected?.phoneNumber?.length === 10) {
                    //   await Linking.openURL(`tel:+91${selected?.phoneNumber}`);
                    // }
                  }}
                />
              )}
            {selected?.orderStatus === 'DELIVERED' &&
              selected?.invoiceUrl !== null && (
                <RenderItem
                  icon={'invoice'}
                  title={'Invoice'}
                  onPress={() => {
                    getInvoice();
                  }}
                />
              )}
            {selected?.orderStatus === 'DELIVERED' &&
              selected?.invoiclogisticsInvoiceUrleUrl !== null && (
                <RenderItem
                  icon={'invoice'}
                  title={'Logistics Invoice'}
                  onPress={() => {
                    getLogisticsInvoice();
                  }}
                />
              )}
            {/* {selected?.orderStatus === 'DELIVERED' && (
              <RenderItem
                icon={'pay_status'}
                title={'Payment Status'}
                onPress={() => {}}
              />
            )} */}
            <RenderItem
              icon={'details'}
              title={'Order Details'}
              onPress={() => {
                bottomSheetRef.current.snapToIndex(0);
              }}
            />
            {selected?.tripDetails?.length !== 0 && (
              <RenderItem
                icon={'details'}
                title={'Trip Details'}
                onPress={() => {
                  tripDetailsSheetRef.current.snapToIndex(0);
                }}
              />
            )}
          </BottomSheetScrollView>
        </View>
      </BottomSheet>

      {/* Order Details Bottomsheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        enablePanDownToClose
        backgroundStyle={{
          borderTopEndRadius: 20,
          backgroundColor: 'rgba(255, 255, 255, 1)',
          borderTopStartRadius: 20,
        }}
        backdropComponent={renderBackdrop}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}>
        <View style={bottomStyles.container}>
          <View style={bottomStyles.header}>
            <Text style={bottomStyles.headerText}>ORDER DETAILS</Text>
            <TouchableOpacity
              style={bottomStyles.closeBtn}
              onPress={() => {
                bottomSheetRef.current.close();
              }}>
              <Image
                source={{uri: 'close'}}
                style={{height: 32, width: 32}}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          <Text style={bottomStyles.title}>{selected?.id}</Text>
          <Text
            style={[
              bottomStyles.orderStatus,
              {color: Colors[selected?.orderStatus?.toLowerCase()]},
            ]}>
            {selected?.orderStatus}
          </Text>
          <Row index={0} head={'PRODUCT'} value={selected?.productName} />
          <Row index={1} head={'Quantity'} value={selected?.quantityValue} />

          <Row
            index={2}
            head={'Per Unit'}
            value={`${selected?.pricePerUnit} Rs`}
          />
          <Row index={3} head={'Bill(Rs)'} value={selected?.billAmount} />
          <Row index={4} head={'Pay Mode'} value={selected?.paymentMode} />
          <Row
            index={5}
            head={'Created On'}
            value={
              new Date(selected?.createdAt).toLocaleString().substr(0, 17) +
              new Date(selected?.createdAt).toLocaleString().substr(20, 23)
            }
          />
          <Row index={6} head={'Distance'} value={`${selected?.distance} Km`} />
        </View>
      </BottomSheet>

      {/* Trip Details Bottomsheet */}
      <BottomSheet
        ref={tripDetailsSheetRef}
        index={-1}
        enablePanDownToClose
        backgroundStyle={{
          borderTopEndRadius: 20,
          backgroundColor: 'rgba(255, 255, 255, 1)',
          borderTopStartRadius: 20,
        }}
        backdropComponent={renderBackdrop}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}>
        <View style={bottomStyles.container}>
          <View style={bottomStyles.header}>
            <Text style={bottomStyles.headerText}>TRIP DETAILS</Text>
            <TouchableOpacity
              style={bottomStyles.closeBtn}
              onPress={() => {
                tripDetailsSheetRef.current.close();
              }}>
              <Image
                source={{uri: 'close'}}
                style={{height: 32, width: 32}}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          <Text style={bottomStyles.title}>
            {selected?.tripDetails[0]?.vehicleNumber}
          </Text>
          <Row
            index={0}
            head={'Driver Name'}
            value={selected?.tripDetails[0]?.driverName}
          />
          <Row
            index={1}
            head={'Driver Contact'}
            value={selected?.tripDetails[0]?.driverContactNumber}
          />
          <Row
            index={2}
            head={'Manual DC No.'}
            value={selected?.tripDetails[0]?.manualDcNo}
          />
          <Row
            index={3}
            head={'Dispatched Date'}
            value={selected?.tripDetails[0]?.dispatchDate?.substr(0, 10)}
          />
          <Row
            index={4}
            head={'Trip Status'}
            value={selected?.tripDetails[0]?.tripStatus}
          />
          <Row
            index={5}
            head={'Delivery Charges'}
            value={selected?.tripDetails[0]?.deliveryCharges}
          />
          {selected?.dcUrl !== null && (
            <TouchableOpacity
              onPress={() => {
                getChallan();
              }}
              style={{
                backgroundColor: '#156CF7',
                height: 50,
                width: width * 0.8,
                borderRadius: 12,
                justifyContent: 'center',
                alignItems: 'center',
                marginHorizontal: width * 0.1,
                marginTop: 22,
              }}>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: 'Inter-Bold',
                  color: '#FFF',
                }}>
                DELIVERY CHALLAN
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </BottomSheet>

      {/* Filters Bottomsheet */}
      <BottomSheet
        ref={filterSheetRef}
        index={-1}
        enablePanDownToClose
        backgroundStyle={{
          borderTopEndRadius: 20,
          backgroundColor: 'rgba(255, 255, 255, 1)',
          borderTopStartRadius: 20,
        }}
        backdropComponent={renderBackdrop}
        snapPoints={snapPoints}
        onChange={handleChanges}>
        <View style={bottomStyles.container}>
          <View style={bottomStyles.header}>
            <Text style={bottomStyles.headerText}>FILTERS</Text>
            <TouchableOpacity
              style={bottomStyles.closeBtn}
              onPress={() => {
                filterSheetRef.current.close();
              }}>
              <Image
                source={{uri: 'close'}}
                style={{height: 32, width: 32}}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          <BottomSheetScrollView contentContainerStyle={bottomStyles.filters}>
            <View
              style={{
                flexDirection: 'row',
                width: width * 0.9,
                marginHorizontal: width * 0.025,
                alignItems: 'center',
                marginVertical: 12,
              }}>
              <Text
                style={{
                  width: width * 0.3,
                  fontSize: 17,
                  lineHeight: 20,
                  fontFamily: 'Inter-Regular',
                  color: 'rgba(0, 0, 0, 0.6)',
                }}>
                Start Date
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModals({...modal, start: true});
                }}
                style={{
                  width: width * 0.6,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderBottomColor: 'rgba(185, 186, 200, 1)',
                  borderBottomWidth: 1,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <Text
                  style={{
                    fontFamily: 'Inter-Bold',
                    fontSize: 20,
                    lineHeight: 24,
                  }}>
                  {filters.startDate.getDate()}/
                  {filters.startDate.getMonth() + 1}/
                  {filters.startDate.getFullYear()}
                </Text>
                <Image
                  source={{uri: 'calendar'}}
                  style={{height: 24, width: 24}}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
            <View
              style={{
                flexDirection: 'row',
                width: width * 0.9,
                marginHorizontal: width * 0.025,
                alignItems: 'center',
                marginVertical: 12,
              }}>
              <Text
                style={{
                  width: width * 0.3,
                  fontSize: 17,
                  lineHeight: 20,
                  fontFamily: 'Inter-Regular',
                  color: 'rgba(0, 0, 0, 0.6)',
                }}>
                End Date
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModals({...modal, end: true});
                }}
                style={{
                  width: width * 0.6,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderBottomColor: 'rgba(185, 186, 200, 1)',
                  borderBottomWidth: 1,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <Text
                  style={{
                    fontFamily: 'Inter-Bold',
                    fontSize: 20,
                    lineHeight: 24,
                  }}>
                  {filters.endDate.getDate()}/{filters.endDate.getMonth() + 1}/
                  {filters.endDate.getFullYear()}
                </Text>
                <Image
                  source={{uri: 'calendar'}}
                  style={{height: 24, width: 24}}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
            {/* <View
              style={{
                flexDirection: 'row',
                width: width * 0.9,
                marginHorizontal: width * 0.025,
                alignItems: 'center',
                marginVertical: 12,
              }}>
              <Text
                style={{
                  width: width * 0.3,
                  fontSize: 17,
                  lineHeight: 20,
                  fontFamily: 'Inter-Regular',
                  color: 'rgba(0, 0, 0, 0.6)',
                }}>
                Order ID
              </Text>
              <TextInput
                onChangeText={v => {
                  setFilters({...filters, orderId: v});
                }}
                style={{
                  width: width * 0.6,
                  fontSize: 17,
                  lineHeight: 20,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  fontFamily: 'Inter-Regular',
                  borderBottomColor: 'rgba(185, 186, 200, 1)',
                  borderBottomWidth: 1,
                }}
                value={filters.orderId}
              />
            </View> */}
            <View
              style={{
                flexDirection: 'row',
                width: width * 0.9,
                marginHorizontal: width * 0.025,
                alignItems: 'center',
                marginVertical: 12,
              }}>
              <Text
                style={{
                  width: width * 0.3,
                  fontSize: 17,
                  lineHeight: 20,
                  fontFamily: 'Inter-Regular',
                  color: 'rgba(0, 0, 0, 0.6)',
                }}>
                Order Status
              </Text>
              <Dropdown
                style={{
                  width: width * 0.6,
                  fontSize: 17,
                  lineHeight: 20,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  fontFamily: 'Inter-Regular',
                  borderBottomColor: 'rgba(185, 186, 200, 1)',
                  borderBottomWidth: 1,
                }}
                placeholderStyle={{fontSize: 16}}
                selectedTextStyle={{fontSize: 16}}
                inputSearchStyle={{fontSize: 16}}
                data={OrderStatus}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="Select item"
                searchPlaceholder="Search..."
                value={filters.orderStatus}
                onChange={item => {
                  setFilters({...filters, orderStatus: item.value});
                }}
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                width: width * 0.9,
                marginHorizontal: width * 0.025,
                alignItems: 'center',
                marginVertical: 12,
              }}>
              <Text
                style={{
                  width: width * 0.3,
                  fontSize: 17,
                  lineHeight: 20,
                  fontFamily: 'Inter-Regular',
                  color: 'rgba(0, 0, 0, 0.6)',
                }}>
                Pay Status
              </Text>
              <Dropdown
                style={{
                  width: width * 0.6,
                  fontSize: 17,
                  lineHeight: 20,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  fontFamily: 'Inter-Regular',
                  borderBottomColor: 'rgba(185, 186, 200, 1)',
                  borderBottomWidth: 1,
                }}
                placeholderStyle={{fontSize: 16}}
                selectedTextStyle={{fontSize: 16}}
                inputSearchStyle={{fontSize: 16}}
                data={PayStatus}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="Select item"
                searchPlaceholder="Search..."
                value={filters.payStatus}
                onChange={item => {
                  setFilters({...filters, payStatus: item.value});
                }}
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
              }}>
              <TouchableOpacity
                onPress={() => {
                  setFilters({
                    startDate: new Date(),
                    endDate: new Date(),
                    orderId: '',
                    orderStatus: '',
                    payStatus: '',
                  });
                  filterSheetRef.current.close();
                  setLoading(true);
                  getData(props?.myDetails);
                }}
                style={{
                  width: width * 0.4,
                  marginHorizontal: width * 0.05,
                  height: 60,
                  backgroundColor: '#1c1c1e80',
                  borderRadius: 15,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 16,
                }}>
                <Text
                  style={{
                    fontFamily: 'Inter-SemiBold',
                    fontSize: 15,
                    lineHeight: 20,
                    color: '#FFF',
                  }}>
                  Clear Filter
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setLoading(true);
                  applyFilters();
                }}
                style={{
                  width: width * 0.4,
                  height: 60,
                  marginHorizontal: width * 0.05,
                  backgroundColor: 'rgba(21, 108, 247, 1)',
                  borderRadius: 15,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 16,
                }}>
                <Text
                  style={{
                    fontFamily: 'Inter-SemiBold',
                    fontSize: 15,
                    lineHeight: 20,
                    color: '#FFF',
                  }}>
                  Submit
                </Text>
              </TouchableOpacity>
            </View>
          </BottomSheetScrollView>
        </View>
      </BottomSheet>
    </View>
  );
};

const mapStateToProps = state => ({
  myDetails: state?.user?.myDetails,
  homeDetails: state?.user?.homeDetails,
  vehicles: state?.user?.vehicles,
});

export default connect(mapStateToProps, {
  updateUser,
  updateHomeData,
  updateVehicles,
})(HomeScreen);

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },

  heading: {
    fontSize: 17,
    color: '#000',
    lineHeight: 20,
    padding: 15,
    fontFamily: 'Inter-SemiBold',
    // fontWeight: 'bold',
  },
  searchContainer: {
    backgroundColor: '#F3F5F9',
    flexDirection: 'row',
    width: width * 0.8,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 4,
  },
  searchInput: {
    height: 54,
    fontSize: 16,
    paddingStart: 12,
  },
  searchIcon: {
    height: 24,
    width: 24,
    marginStart: 8,
  },
  searchButton: {
    width: width * 0.15,
    height: 34,
    backgroundColor: '#E8F1FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#156CF7',
    justifyContent: 'center',
    alignItems: 'center',
    marginEnd: 8,
  },
  searchButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#156CF7',
  },
  filters: {
    height: 52,
    width: 52,
    borderRadius: 15,
    backgroundColor: '#156CF7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersIcon: {
    width: 34,
    height: 34,
    tintColor: '#FFF',
  },
});

const bottomStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  headerText: {
    fontSize: 17,
    lineHeight: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#rgba(0, 0, 0, 0.87)',
  },
  closeBtn: {
    height: 45,
    width: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: 'rgba(36, 42, 55, 1)',
    fontSize: 19,
    lineHeight: 20,
    letterSpacing: 0.4,
    fontFamily: 'Inter-Bold',
    marginTop: 32,
    marginBottom: 8,
    paddingStart: 24,
  },
  orderStatus: {
    fontSize: 14,
    letterSpacing: 0.25,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
    paddingStart: 24,
  },
  row: {
    width: width,
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
  },
  heading: {
    width: width * 0.5,
    fontFamily: 'Inter-Regular',
    color: 'rgba(0, 0, 0, 1)',
    fontSize: 15,
    lineHeight: 20,
    paddingStart: 24,
  },
  content: {
    width: width * 0.5,
    fontFamily: 'Inter-SemiBold',
    color: 'rgba(0, 0, 0, 1)',
    fontSize: 15,
    lineHeight: 20,
    paddingEnd: 24,
  },
  grid: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: width * 0.025,
  },
  item: {
    minHeight: (width * 0.8) / 3,
    minWidth: (width * 0.8) / 3,
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    margin: width * 0.025,
    borderRadius: 18,
  },
  imageView: {
    height: (width * 0.65) / 3,
    width: (width * 0.65) / 3,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  imageItem: {
    height: 45,
    width: (width * 0.4) / 3,
    tintColor: 'white',
  },
  head: {
    width: (width * 0.8) / 3,
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    lineHeight: 14.5,
    letterSpacing: 0.1,
    marginTop: width * 0.05 - 14.5,
    textAlign: 'center',
  },
  filters: {
    minHeight: (width * 0.8) / 3,
    minWidth: (width * 0.8) / 3,
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    margin: width * 0.025,
    borderRadius: 18,
  },
});
