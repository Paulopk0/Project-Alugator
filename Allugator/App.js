import React from 'react';
import {  Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';

// Import screens
import AuthScreen from './screens/authSystem/auth/authScreen';
import LoginScreen from './screens/login/LoginScreen';
import RegisterScreen from './screens/authSystem/register/RegisterScreen';
import ForgotPasswordScreen from './screens/forgotpassword/ForgotPasswordScreen';
import HomeScreen from './screens/home/HomeScreen';
import StoreScreen from './screens/storeSystem/store/StoreScreen';
import SearchScreen from './screens/search/SearchScreen';
import SearchResultsScreen from './screens/search/searchResults/SearchResultsScreen';
import FavoritesScreen from './screens/favorites/FavoritesScreen';
import CalendarScreen from './screens/calendar/CalendarScreen';
import TransactionScreen from './screens/transaction/TransactionScreen';
import PerfilScreen from './screens/perfil/PerfilScreen';
import ItemDetailsScreen from './screens/itemDetails/ItemDetailsScreen';
import PaymentScreen from './screens/payment/PaymentScreen';
import RentalTrackingScreen from './screens/rentalTracking/RentalTrackingScreen';
import AddItemScreen from './screens/addItem/AddItemScreen';

const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const StoreStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

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
        name="ItemDetails" 
        component={ItemDetailsScreen}
        options={{
          animation: 'slide_from_right'
        }}
      />
      <StoreStack.Screen 
        name="Payment" 
        component={PaymentScreen}
        options={{
          animation: 'slide_from_right'
        }}
      />
      <StoreStack.Screen 
        name="RentalTracking" 
        component={RentalTrackingScreen}
        options={{
          animation: 'slide_from_right'
        }}
      />
      <StoreStack.Screen 
        name="AddItem" 
        component={AddItemScreen}
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

// Tab Navigator principal com Home, Store, Transaction e Perfil
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#E8F5E9',
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          position: 'absolute',
          elevation: 0,
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: '#1DE9B6',
        tabBarInactiveTintColor: '#888888',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 5,
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 24, color }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Store" 
        component={StoreNavigator}
        options={{
          tabBarLabel: 'Loja',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 24, color }}>🏪</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Transaction" 
        component={TransactionScreen}
        options={{
          tabBarLabel: 'Transações',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 24, color }}>🔄</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Perfil" 
        component={PerfilScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 24, color }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
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
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabNavigator}
          options={{
            headerShown: false
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
