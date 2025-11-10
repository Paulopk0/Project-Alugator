import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

// Import screens
import AuthScreen from './screens/auth/authScreen';
import LoginScreen from './screens/login/LoginScreen';
import RegisterScreen from './screens/register/RegisterScreen';
import ForgotPasswordScreen from './screens/forgotpassword/ForgotPasswordScreen';
import HomeScreen from './screens/home/HomeScreen';
import StoreScreen from './screens/store/StoreScreen';
import SearchScreen from './screens/search/SearchScreen';
import CalendarScreen from './screens/calendar/CalendarScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  console.log('App iniciando...');
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName="Auth"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#F0FFF0' }
        }}
      >
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Store" component={StoreScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="Calendar" component={CalendarScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
