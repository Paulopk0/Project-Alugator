import React from 'react';
import { LogBox } from 'react-native';
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
import SearchResultsScreen from './screens/searchResults/SearchResultsScreen';
import FavoritesScreen from './screens/favorites/FavoritesScreen';
import CalendarScreen from './screens/calendar/CalendarScreen';

const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const StoreStack = createNativeStackNavigator();

// Stack Navigator para Auth, Login, Register e ForgotPassword
function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F0FFF0' }
      }}
    >
      <AuthStack.Screen name="AuthMain" component={AuthScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
}

// Stack Navigator para Store, Search e Calendar
function StoreNavigator() {
  return (
    <StoreStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F0FFF0' }
      }}
    >
      <StoreStack.Screen 
        name="StoreMain" 
        component={StoreScreen}
        options={{
          animation: 'slide_from_right'
        }}
      />
      <StoreStack.Screen 
        name="Search" 
        component={SearchScreen}
        options={{
          animation: 'slide_from_right'
        }}
      />
      <StoreStack.Screen 
        name="SearchResults" 
        component={SearchResultsScreen}
        options={{
          animation: 'slide_from_right'
        }}
      />
      <StoreStack.Screen 
        name="Favorites" 
        component={FavoritesScreen}
        options={{
          animation: 'slide_from_right'
        }}
      />
      <StoreStack.Screen 
        name="Calendar" 
        component={CalendarScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom'
        }}
      />
    </StoreStack.Navigator>
  );
}

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
        <Stack.Screen 
          name="Auth" 
          component={AuthNavigator}
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen name="Home" component={HomeScreen} />

        <Stack.Screen 
          name="Store" 
          component={StoreNavigator}
          options={{
            headerShown: false,
            animation: 'slide_from_right'
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
