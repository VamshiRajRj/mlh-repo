import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/NavScreens/HomeScreen';
import ProfileScreen from '../screens/NavScreens/ProfileScreen';
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {height, width} from '../utils/Styles';
import {useGlobal} from '../hooks/global';
import {cognitoPool} from '../utils/cognito-pool';
import StockScreen from '../screens/NavScreens/StockScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Tab = createBottomTabNavigator();

function BottomTabs() {
  const {user, setUser} = useGlobal();
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: 'rgba(150, 158, 198, 1)',
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingVertical: 12,
        },
        header: ({navigation, options}) => {
          return (
            <View
              style={{
                width: width,
                height: Platform.OS === 'ios' ? height * 0.1 : 60,
                backgroundColor: '#156CF7',
                flexDirection: 'row',
                alignItems: Platform.OS === 'ios' ? 'flex-end' : 'center',
                justifyContent: 'center',
              }}>
              <Image
                source={{uri: 'logo'}}
                resizeMode="contain"
                style={{
                  width: width * 0.47,
                  height: height * 0.035,
                  marginBottom: 8,
                  tintColor: '#FFF',
                }}
              />
            </View>
          );
        },
      }}>
      <Tab.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          tabBarIcon: ({focused, size}) => (
            <Image
              source={{uri: 'home'}}
              style={{
                width: size,
                height: size,
                tintColor: focused ? '#FFF' : 'rgba(0, 0, 0, 0.6)',
              }}
              resizeMode={'contain'}
            />
          ),
          tabBarLabel: ({focused, size}) => (
            <Text
              style={{
                color: focused ? '#FFF' : 'rgba(0, 0, 0, 0.6)',
                fontSize: 11,
                fontFamily: 'Inter-SemiBold',
                lineHeight: 20,
                letterSpacing: 0.41,
              }}>
              OMS
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="StockScreen"
        component={StockScreen}
        options={{
          tabBarIcon: ({focused, size}) => (
            <Image
              source={{uri: 'stoke'}}
              style={{
                width: size,
                height: size,
                tintColor: focused ? '#FFF' : 'rgba(0, 0, 0, 0.6)',
              }}
              resizeMode={'contain'}
            />
          ),
          tabBarLabel: ({focused, size}) => (
            <Text
              style={{
                color: focused ? '#FFF' : 'rgba(0, 0, 0, 0.6)',
                fontSize: 11,
                fontFamily: 'Inter-SemiBold',
                lineHeight: 20,
                letterSpacing: 0.41,
              }}>
              Stock
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({focused, size}) => (
            <Image
              source={{uri: 'profile'}}
              style={{
                width: size,
                height: size,
                tintColor: focused ? '#FFF' : 'rgba(0, 0, 0, 0.6)',
              }}
              resizeMode={'contain'}
            />
          ),
          tabBarLabel: ({focused, size}) => (
            <Text
              style={{
                color: focused ? '#FFF' : 'rgba(0, 0, 0, 0.6)',
                fontSize: 11,
                fontFamily: 'Inter-SemiBold',
                lineHeight: 20,
                letterSpacing: 0.41,
              }}>
              Profile
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="LogOutScreen"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({focused, size}) => (
            <TouchableOpacity
              onPress={async () => {
                cognitoPool.getCurrentUser().signOut();
                setUser(null);
                await AsyncStorage.clear();
              }}>
              <Image
                source={{uri: 'logout'}}
                style={{
                  width: size,
                  height: size,
                  tintColor: focused ? '#FFF' : 'rgba(0, 0, 0, 0.6)',
                }}
                resizeMode={'contain'}
              />
            </TouchableOpacity>
          ),
          tabBarLabel: ({focused, size}) => (
            <Text
              style={{
                color: focused ? '#FFF' : 'rgba(0, 0, 0, 0.6)',
                fontSize: 11,
                fontFamily: 'Inter-SemiBold',
                lineHeight: 20,
                letterSpacing: 0.41,
              }}>
              Logout
            </Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default BottomTabs;
