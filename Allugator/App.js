import React, { useContext } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { AuthContext } from './contexts/AuthContext';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

/*
 * App.js - Entrypoint do aplicativo React Native (Expo)
 *
 * Estrutura principal:
 * - Providers: `AuthProvider`, `ItemProvider`, `RentalProvider` (envolvem toda a árvore)
 * - Navegadores (navigators):
 *    - AuthNavigator: login / register / forgot password flow
 *    - StoreNavigator: telas da loja, detalhe de itens, pagamento
 *    - TransactionNavigator: telas de transações / meus itens
 *    - ProfileNavigator: telas de perfil / configurações / segurança
 *    - MainTabNavigator: bottom tabs (Home, Store, Transaction, Perfil)
 * - AppNavigator escolhe entre `AuthNavigator` e `MainTabNavigator` com base em `AuthContext`
 *
 * Comentários importantes:
 * - Evite remover importações de telas sem atualizar os navigators.
 * - Muitos listeners usam `navigation.navigate('Stack', { screen: 'X' })` — checar rotas ao renomear.
 */

// Import Contexts
import { AuthProvider } from './contexts/AuthContext';
import { ItemProvider } from './contexts/ItemContext';
import { RentalProvider } from './contexts/RentalContext';

// Import screens
import AuthScreen from './screens/authSystem/auth/authScreen';
import LoginScreen from './screens/authSystem/login/LoginScreen';
import RegisterScreen from './screens/authSystem/register/RegisterScreen';
import ForgotPasswordScreen from './screens/authSystem/forgotpassword/ForgotPasswordScreen';
import ValidateCodeScreen from './screens/authSystem/validatecode/ValidateCodeScreen';
import ResetPasswordScreen from './screens/authSystem/resetpassword/ResetPasswordScreen';
import HomeScreen from './screens/home/HomeScreen';
import StoreScreen from './screens/storeSystem/store/StoreScreen';
import SearchScreen from './screens/search/SearchScreen';
import SearchResultsScreen from './screens/search/searchResults/SearchResultsScreen';
import FavoritesScreen from './screens/favorites/FavoritesScreen';
import CalendarScreen from './screens/search/calendar/CalendarScreen';
import TransactionScreen from './screens/transaction/TransactionScreen';
import ItemDetailsScreen from './screens/storeSystem/itemDetails/ItemDetailsScreen';
import PaymentScreen from './screens/transaction/payment/PaymentScreen';
import ProcessingPaymentScreen from './screens/transaction/processingPayment/ProcessingPaymentScreen';
import RentalTrackingScreen from './screens/transaction/rentalTracking/RentalTrackingScreen';
import AddItemScreen from './screens/storeSystem/addItem/AddItemScreen';
import EditItemScreen from './screens/storeSystem/editItem/EditItemScreen';

// --- INÍCIO: NOVAS TELAS DE PERFIL ---
import PerfilScreen from './screens/perfil/PerfilScreen';
import EditProfileScreen from './screens/perfil/EditProfileScreen';
import SecurityScreen from './screens/perfil/SecurityScreen';
import ChangePasswordScreen from './screens/perfil/ChangePasswordScreen';
import PasswordSuccessScreen from './screens/perfil/PasswordSuccessScreen';
import SettingsScreen from './screens/perfil/SettingsScreen';
import TermsScreen from './screens/perfil/TermsScreen';
import PrivacyPolicyScreen from './screens/perfil/PrivacyPolicyScreen';
import DeleteAccountScreen from './screens/perfil/DeleteAccountScreen';
// --- FIM: NOVAS TELAS DE PERFIL ---

const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const StoreStack = createNativeStackNavigator();
const TransactionStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const ProfileStack = createNativeStackNavigator();

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
      <AuthStack.Screen name="ValidateCode" component={ValidateCodeScreen} />
      <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </AuthStack.Navigator>
  );
}

// Stack Navigator para Store, Search e Calendar
function StoreNavigator() {
  const insets = useSafeAreaInsets();
  return (
    <StoreStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { 
          backgroundColor: '#F0FFF0',
          paddingBottom: 70 + insets.bottom // Espaço para a tab bar
        }
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
        name="ProcessingPayment" 
        component={ProcessingPaymentScreen}
        options={{
          animation: 'fade',
          gestureEnabled: false, // Impede voltar durante processamento
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
        name="EditItem" 
        component={EditItemScreen}
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

// Stack Navigator para Transaction
function TransactionNavigator() {
  const insets = useSafeAreaInsets();
  return (
    <TransactionStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { 
          backgroundColor: '#F0FFF0',
          paddingBottom: 70 + insets.bottom // Espaço para a tab bar
        }
      }}
    >
      <TransactionStack.Screen 
        name="TransactionMain" 
        component={TransactionScreen}
        options={{
          animation: 'slide_from_right'
        }}
      />
      <TransactionStack.Screen 
        name="AddItem" 
        component={AddItemScreen}
        options={{
          animation: 'slide_from_right'
        }}
      />
      <TransactionStack.Screen 
        name="EditItem" 
        component={EditItemScreen}
        options={{
          animation: 'slide_from_right'
        }}
      />
      <TransactionStack.Screen 
        name="RentalTracking" 
        component={RentalTrackingScreen}
        options={{
          animation: 'slide_from_right'
        }}
      />
    </TransactionStack.Navigator>
  );
}

// --- INÍCIO: NOVO STACK NAVIGATOR DE PERFIL ---
function ProfileNavigator() {
  const insets = useSafeAreaInsets();
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <ProfileStack.Screen 
        name="ProfileMain" 
        component={PerfilScreen}
      />
      <ProfileStack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <ProfileStack.Screen 
        name="Security" 
        component={SecurityScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <ProfileStack.Screen 
        name="ChangePassword" 
        component={ChangePasswordScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <ProfileStack.Screen 
        name="PasswordSuccess" 
        component={PasswordSuccessScreen}
        options={{ animation: 'fade' }}
      />
      <ProfileStack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <ProfileStack.Screen 
        name="DeleteAccount" 
        component={DeleteAccountScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </ProfileStack.Navigator>
  );
}
// Componente que decide qual navigator mostrar baseado na autenticação
function AppNavigator() {
  const { isAuthenticated, loading } = useContext(AuthContext);

  console.log('[AppNavigator] Estado:', { isAuthenticated, loading });

  // Mostra loading enquanto verifica sessão
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0FFF0' }}>
        <ActivityIndicator size="large" color="#1DE9B6" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={isAuthenticated ? "MainTabs" : "Auth"}
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
      <ProfileStack.Screen 
        name="Terms" 
        component={TermsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <ProfileStack.Screen 
        name="PrivacyPolicy" 
        component={PrivacyPolicyScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
}


// Tab Navigator principal com Home, Store, Transaction e Perfil
function MainTabNavigator() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#E8F5E9',
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          height: 70 + insets.bottom, // Ajusta altura para incluir safe area bottom
          paddingBottom: 10 + insets.bottom,
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
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('Store', { screen: 'StoreMain' });
          },
        })}
      />
      <Tab.Screen 
        name="Transaction" 
        component={TransactionNavigator}
        options={{
          tabBarLabel: 'Transações',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 24, color }}>🔄</Text>
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('Transaction', { screen: 'TransactionMain' });
          },
        })}
      />
      <Tab.Screen 
        name="Perfil" 
        component={ProfileNavigator}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 24, color }}>👤</Text>
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('Perfil', { screen: 'ProfileMain' });
          },
        })}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ItemProvider>
          <RentalProvider>
            <NavigationContainer>
              <StatusBar style="auto" />
              <AppNavigator />
            </NavigationContainer>
          </RentalProvider>
        </ItemProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}