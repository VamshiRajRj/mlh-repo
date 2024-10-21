import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import React, {useMemo, useRef, useCallback, useState, useEffect} from 'react';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import {height, width} from '../../utils/Styles';
import {Dropdown} from 'react-native-element-dropdown';

import {updateUser, updateStock} from '../../redux/actions';
import {connect} from 'react-redux';
import {GetDataRequest, PostDataRequest} from '../../APIKit';
import {cognitoPool} from '../../utils/cognito-pool';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useGlobal} from '../../hooks/global';
import Loading from '../../components/Loading';
import Toast from 'react-native-toast-message';

const StockScreen = props => {
  const [stock, setStock] = useState({
    productMasterId: '',
    quantity: '',
  });
  const {user, setUser} = useGlobal();
  const [loading, setLoading] = useState(false);

  const [products, setProducts] = useState([]);

  const [stocks, setStocks] = useState({bool: true, value: props?.stock});
  const [isFocus, setIsFocus] = useState({product: false, quantity: false});

  const [search, setSearch] = useState({value: '', show: true});
  const searchRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      getStock();
      getProducts();
    }
    return () => {
      mounted = false;
    };
  }, []);

  const getStock = () => {
    GetDataRequest(
      `inventory/inventoryDetails/${props?.myDetails['custom:companyId']}`,
      null,
    )
      .then(async res => {
        if (res?.status === 200 || res?.status === 201) {
          setStocks({bool: false, value: res?.data});
          props?.updateStock(res?.data);
          setLoading(false);
        } else if (
          res?.status === 400 ||
          res?.status === 404 ||
          res?.status === 401
        ) {
          cognitoPool.getCurrentUser().signOut();
          setUser(null);
          await AsyncStorage.clear();
        }
      })
      .catch(err => console.error(err?.status));
  };

  const getProducts = () => {
    GetDataRequest(
      `products/allForProductsScreen/${props?.myDetails['custom:companyId']}`,
    )
      .then(async res => {
        if (res?.status === 200 || res?.status === 201) {
          let arr = [];
          res?.data?.map(r => {
            if (r?.productStatus === 'ACTIVE')
              arr.push({label: r?.productName, value: r?.productMasterId});
          });
          setProducts(arr);
        } else if (
          res?.status === 400 ||
          res?.status === 404 ||
          res?.status === 401
        ) {
          cognitoPool.getCurrentUser().signOut();
          setUser(null);
          await AsyncStorage.clear();
        }
      })
      .catch(err => console.error(err?.status));
  };

  const addStock = ({quantity, productMasterId}) => {
    PostDataRequest('production/create', {
      companyId: props?.myDetails['custom:companyId'],
      productId: productMasterId,
      productionStock: Number(quantity),
      productionType: 'MANUALPRODUCTION',
    })
      .then(async res => {
        if (res?.status === 200 || res?.status == 201) {
          Toast.show({
            type: 'success',
            text1: 'Stock Added',
          });
          getStock();
          setStock({
            productMasterId: '',
            quantity: '',
          });
        } else if (res?.status === 400 || res?.status === 404) {
          cognitoPool.getCurrentUser().signOut();
          setUser(null);
          await AsyncStorage.clear();
        } else {
          Toast.show({
            type: 'error',
            text1: 'Could not add stock',
          });
        }
        setLoading(false);
      })
      .catch(err => console.error(err?.status));
  };

  // ref
  const bottomSheet = useRef(null);

  // variables
  const snapPoints = useMemo(() => [height * 0.65], []);

  // callbacks
  const handleChanges = useCallback(index => {
    console.log('handleSheetChanges', index);
  }, []);

  const renderProduct = () => {
    if (stock?.product || isFocus?.product) {
      return <Text style={[bottomStyles.label]}>Select a product *</Text>;
    }
    return null;
  };

  const renderQuantity = () => {
    if (stock?.quantity || isFocus?.quantity) {
      return <Text style={[bottomStyles.label]}>Quantity (In Tons) *</Text>;
    }
    return null;
  };

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
          styles.row,
          index % 2 !== 0
            ? {backgroundColor: '#FFF'}
            : {backgroundColor: 'rgba(244, 244, 244, 1)'},
        ]}>
        <Text style={styles.heading}>{head}</Text>
        <Text style={styles.heading}>{value}</Text>
      </View>
    );
  };

  const sort = () => {
    let s = stocks?.value?.sort(function (a, b) {
      return stocks?.bool
        ? a?.manualStock - b?.manualStock
        : b?.manualStock - a?.manualStock;
    });
    setStocks({bool: !stocks?.bool, value: s});
  };

  const onSearch = txt => {
    let s = props?.stock?.filter(v => {
      return v?.productName?.toLowerCase().includes(txt?.toLowerCase());
    });

    setStocks({...stocks, value: s});
  };

  return (
    <View style={styles.mainContainer}>
      <Loading loading={loading} />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: width * 0.95,
          marginHorizontal: width * 0.025,
          marginTop: 12,
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
            onEndEditing={() => {
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
            bottomSheet.current.snapToIndex(0);
          }}
          style={styles.filters}>
          <Text style={styles.filtersIcon}>+</Text>
        </TouchableOpacity>
      </View>
      <View style={[styles.row, {backgroundColor: '#FFF'}]}>
        <Text style={[styles.content]}>Product</Text>
        <TouchableOpacity onPress={sort}>
          <Text style={styles.content}>Stock {stocks?.bool ? '^' : '>'}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        renderItem={({item, index}) => (
          <Row
            index={index}
            head={item?.productName}
            value={item?.manualStock}
          />
        )}
        data={stocks?.value}
        style={{
          marginTop: 18,
          paddingBottom: Platform.OS === 'ios' ? 90 : 60,
        }}
      />
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
            <Text style={bottomStyles.headerText}>ADD MANUAL STOCK</Text>
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
          <BottomSheetScrollView
            contentContainerStyle={{backgroundColor: 'white', padding: 16}}>
            <View style={{marginVertical: 12}}>
              {renderProduct()}
              <Dropdown
                style={[bottomStyles.dropdown]}
                placeholderStyle={bottomStyles.placeholderStyle}
                selectedTextStyle={bottomStyles.selectedTextStyle}
                inputSearchStyle={bottomStyles.inputSearchStyle}
                data={products}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={!isFocus.product ? 'Select a product *' : ''}
                searchPlaceholder="Search..."
                value={stock?.productMasterId}
                onFocus={() => setIsFocus({...isFocus, product: true})}
                onBlur={() => setIsFocus({...isFocus, product: false})}
                onChange={item => {
                  setStock({
                    ...stock,
                    productMasterId: item?.value,
                  });
                  setIsFocus(false);
                }}
              />
            </View>
            <View style={{marginVertical: 12}}>
              {renderQuantity()}
              <TextInput
                style={[bottomStyles.dropdown]}
                keyboardType="numeric"
                onFocus={() => setIsFocus({...isFocus, quantity: true})}
                onBlur={() => setIsFocus({...isFocus, quantity: false})}
                placeholder={!isFocus.quantity ? 'Quantity (In Tons) *' : ''}
                onChangeText={v => {
                  setStock({...stock, quantity: v});
                }}
                onEndEditing={() => {
                  setIsFocus({...isFocus, quantity: false});
                }}
                value={stock?.quantity}
              />
            </View>
            <View style={bottomStyles.buttonContainer}>
              <TouchableOpacity
                style={bottomStyles.cancelBtn}
                onPress={() => {
                  bottomSheet.current.close();
                  setStock({
                    productMasterId: '',
                    quantity: '',
                  });
                }}>
                <Text
                  style={[
                    bottomStyles.txt,
                    {
                      color: 'rgb(196,63,56)',
                    },
                  ]}>
                  Close
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={bottomStyles.saveBtn}
                onPress={() => {
                  setLoading(true);
                  addStock(stock);
                  bottomSheet.current.close();
                }}>
                <Text
                  style={[
                    bottomStyles.txt,
                    {
                      color: 'rgb(78,91,83)',
                    },
                  ]}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </BottomSheetScrollView>
        </View>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  searchContainer: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    width: width * 0.8,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 6,
    borderColor: '#DFDFDF',
    borderWidth: 1,
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
    fontSize: 52,
    fontFamily: 'Inter-Regular',
    color: 'white',
    lineHeight: 52,
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
    paddingHorizontal: 24,
  },
  content: {
    width: width * 0.5,
    fontFamily: 'Inter-SemiBold',
    color: 'rgba(0, 0, 0, 1)',
    fontSize: 15,
    lineHeight: 20,
    paddingHorizontal: 24,
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
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    width: width * 0.9,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: 'absolute',
    backgroundColor: 'white',
    left: 18,
    top: -8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
    color: 'blue',
  },
  placeholderStyle: {
    fontSize: 16,
    color: 'red',
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  buttonContainer: {
    width: width * 0.9,
    marginVertical: 16,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  saveBtn: {
    width: width * 0.4,
    backgroundColor: 'rgb(202,210,205)',
    height: 45,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txt: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0.3,
  },
  cancelBtn: {
    width: width * 0.4,
    backgroundColor: 'rgb(222,193,189)',
    height: 45,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const mapStateToProps = state => ({
  myDetails: state?.user?.myDetails,
  homeDetails: state?.user?.homeDetails,
  stock: state?.user?.stock,
});

export default connect(mapStateToProps, {
  updateUser,
  updateStock,
})(StockScreen);
