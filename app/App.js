import './config/base64Polyfill.js';
import React, { useEffect, useState } from "react";
import MainNavigator from "./src/Routes/MainNavigator";
import { AuthProvider } from "./src/Context/AuthContext";
import NetInfo from '@react-native-community/netinfo';
import NotConection from './src/Pages/NotConection.js';
import { StatusBar } from 'react-native';

export default function App() {

  const [internet, setInternet] = useState(null);

  useEffect(() => {
    let unsubscribe;

    const subscribe = () => {
      unsubscribe = NetInfo.addEventListener(({ isConnected }) => {
        setInternet(isConnected);
      });
    };

    subscribe();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return (
        <AuthProvider>
          <StatusBar backgroundColor={"#000"} />
          {internet === true && <MainNavigator />}
          {internet === false && <NotConection />}
        </AuthProvider>
  );

}
