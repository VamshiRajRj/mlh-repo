import React from 'react';

import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {GlobalProvider} from './hooks/global';
import {LoadingProvider} from './hooks/loading';

import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {persistor, store} from './redux/store';
import RootContainer from './containers/RootContainer';
import Toast from 'react-native-toast-message';

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <NavigationContainer>
            <LoadingProvider>
              <GlobalProvider>
                <RootContainer />
                <Toast />
              </GlobalProvider>
            </LoadingProvider>
          </NavigationContainer>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
