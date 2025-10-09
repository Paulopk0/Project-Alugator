import React from 'react';
import { StyleSheet, Text, View, Image, StatusBar, TouchableOpacity } from 'react-native';
import CustomButton from '../../components/CustomButton/CustomButton';

// Cores do design
const COLORS = {
  background: '#E0F8E0',
  primary: '#1DE9B6',
  lightGreen: '#F0FFF0',
  darkText: '#555555',
  linkText: '#555555',
};

/*
 * Tela de autenticação inicial.
 */

const AuthScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <Image
        source={require('../../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Alugator</Text>
      <Text style={styles.subtitle}>Sua plataforma de troca ...</Text>

      <View style={styles.buttonContainer}>
        <CustomButton
          title="Entrar"
          onPress={() => navigation.navigate('Login')}
          style={{ backgroundColor: COLORS.primary }}
        />

        <CustomButton
          title="Cadastrar"
          onPress={() => navigation.navigate('Register')}
          style={{ backgroundColor: COLORS.lightGreen, borderWidth: 1, borderColor: COLORS.primary }}
        />
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
      </TouchableOpacity>

    </View>
  );
};

// Estilos da página
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.darkText,
    marginTop: -5,
    marginBottom: 60,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: COLORS.linkText,
    fontSize: 14,
    marginTop: 20,
    textDecorationLine: 'underline',
  },
});

export default AuthScreen;
