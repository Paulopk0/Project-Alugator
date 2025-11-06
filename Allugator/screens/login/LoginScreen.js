import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import CustomButton from '../../components/CustomButton/CustomButton';
import CustomTextInput from '../../components/CustomTextInput/CustomTextInput';
import MessageDisplay from '../../components/MessageDisplay/MessageDisplay';
import { login } from '../../apis/AuthApi';
import AuthStorage from '../../services/AuthStorage'; 

const COLORS = {
  background: '#F0FFF0',
  primary: '#1DE9B6',
  darkText: '#444444ff',
  white: '#FFFFFF',
};

const screenHeight = Dimensions.get('window').height;

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        setFeedback({
          message: 'Por favor, preencha todos os campos.',
          type: 'error'
        });
        return;
      }

      // Chama a função da API para fazer login
      const response = await login(email, password);
      
      // Salva o token e os dados do usuário
      if (response.token) {
        await AuthStorage.saveToken(response.token);
        await AuthStorage.saveUser(response.user);
      }
      
      setFeedback({
        message: 'Login realizado com sucesso!',
        type: 'success'
      });

      // Aguarda um pouco antes de navegar para o usuário ver a mensagem
      setTimeout(() => {
        // 'replace' impede o usuário de voltar para a tela de login
        navigation.replace('Home'); // Altere 'Home' se o nome da sua tela principal for outro
      }, 1500);

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
      <View style={styles.background}>
        <Text style={styles.headerText}>Bem-Vindo</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled" // Ajuda a gerenciar toques quando o teclado está aberto
      >
        <View style={styles.contentCard}>
          <CustomTextInput
            label="Usuário Ou Email"
            placeholder="exemplo@exemplo.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <CustomTextInput
            label="Senha"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!isPasswordVisible}
            icon={isPasswordVisible ? '👁️' : '👁️‍🗨️'}
            onIconPress={() => setIsPasswordVisible(!isPasswordVisible)}
          />

          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotPasswordContainer}>
            <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
          </TouchableOpacity>

          <CustomButton
            title="Entrar"
            onPress={handleLogin}
            style={{ backgroundColor: COLORS.primary, marginTop: 20, width: '100%' }}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Não tem uma conta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[styles.footerText, styles.link]}>Cadastrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* O MessageDisplay deve ficar fora do ScrollView para ter posicionamento absoluto na tela */}
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
    paddingTop: screenHeight * 0.12,
  },
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.darkText,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: screenHeight * 0.25,
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