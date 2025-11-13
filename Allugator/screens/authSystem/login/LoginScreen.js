import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import CustomButton from '../../../components/CustomButton/CustomButton';
import CustomTextInput from '../../../components/CustomTextInput/CustomTextInput';
import MessageDisplay from '../../../components/MessageDisplay/MessageDisplay';
import { useAuth } from '../../../hooks/useAuth';

const COLORS = {
  background: '#F0FFF0',
  primary: '#1DE9B6',
  darkText: '#444444ff',
  white: '#FFFFFF',
};

const LoginScreen = ({ navigation }) => {
  const screenHeight = Dimensions.get('window').height;
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // ✅ Novo: Hook do AuthContext
  const { login, loading } = useAuth();

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        setFeedback({
          message: 'Por favor, preencha todos os campos.',
          type: 'error'
        });
        return;
      }

      // ✅ Novo: Usa o método do contexto (que já gerencia AsyncStorage)
      const result = await login(email, password);
      
      if (result.success) {
        setFeedback({
          message: result.message,
          type: 'success'
        });

        // Navega automaticamente após sucesso
        setTimeout(() => {
          navigation.replace('MainTabs');
        }, 1500);
      } else {
        setFeedback({
          message: result.message,
          type: 'error'
        });
      }
    } catch (error) {
      setFeedback({
        message: error.message || 'E-mail ou senha inválidos.',
        type: 'error'
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.background, { paddingTop: screenHeight * 0.12 }]}>
        <Text style={styles.headerText}>Bem-Vindo</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContainer, { paddingTop: screenHeight * 0.25 }]}
        keyboardShouldPersistTaps="handled" 
      >
        <View style={styles.contentCard}>
          <CustomTextInput
            label="Email"
            placeholder="exemplo@exemplo.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            editable={!loading}
          />

          <CustomTextInput
            label="Senha"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!isPasswordVisible}
            icon={isPasswordVisible ? '👁️' : '👁️‍🗨️'}
            onIconPress={() => setIsPasswordVisible(!isPasswordVisible)}
            editable={!loading}
          />

          <TouchableOpacity 
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotPasswordContainer}
            disabled={loading}
          >
            <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
          </TouchableOpacity>

          <CustomButton
            title={loading ? 'Entrando...' : 'Entrar'}
            onPress={handleLogin}
            style={{ 
              backgroundColor: COLORS.primary, 
              marginTop: 20, 
              width: '100%',
              opacity: loading ? 0.6 : 1,
            }}
            disabled={loading}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Não tem uma conta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[styles.footerText, styles.link]}>Cadastrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <MessageDisplay 
        message={feedback.message}
        type={feedback.type}
        onHide={() => setFeedback({ message: '', type: '' })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    // paddingTop removido - será inline
  },
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.darkText,
  },
  scrollContainer: {
    flexGrow: 1,
    // paddingTop removido - será inline
  },
  contentCard: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    paddingTop: 40,
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginVertical: 10,
  },
  forgotPasswordText: {
    color: COLORS.darkText,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto', 
    paddingBottom: 20,
  },
  footerText: {
    color: COLORS.darkText,
    fontSize: 16,
  },
  link: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});

export default LoginScreen;