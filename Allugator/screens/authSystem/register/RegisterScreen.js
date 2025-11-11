import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import CustomButton from '../../../components/CustomButton/CustomButton';
import CustomTextInput from '../../../components/CustomTextInput/CustomTextInput';
import { register } from '../../../apis/AuthApi';
import MessageDisplay from '../../../components/MessageDisplay/MessageDisplay';

const COLORS = {
  background: '#F0FFF0', 
  primary: '#1DE9B6',
  darkText: '#444444ff',
  white: '#FFFFFF',
};

// Obtém a altura da tela para o posicionamento inicial do card
const screenHeight = Dimensions.get('window').height;

/**
 * Tela de Cadastro com layout de fundo completo e card de conteúdo animado.
 */
const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

    const [feedback, setFeedback] = useState({ message: '', type: '' });

  const handleRegister = async () => {
    // 4. Modificamos a função handleRegister para usar o setFeedback
    if (password !== confirmPassword) {
      setFeedback({ message: 'As senhas não conferem!', type: 'error' });
      return;
    }

    try {
      const userData = { name, email, phoneNumber, password };
      await register(userData);

      // Feedback de sucesso
      setFeedback({ message: 'Usuário cadastrado com sucesso!', type: 'success' });
      
      // Aguarda um pouco antes de navegar para o usuário ver a mensagem
      setTimeout(() => {
        navigation.navigate('Login'); // Use o nome da sua tela de Login
      }, 1500);

    } catch (error) {
      // Feedback de erro da API
      setFeedback({ message: error.message || 'Erro desconhecido', type: 'error' });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.background}>
        <Text style={styles.headerText}>Criar Conta</Text>
      </View>

      {/* O conteúdo rolável que fica por cima */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* O card com o formulário*/}
        <View style={styles.contentCard}>
          <CustomTextInput
            label="Nome Completo"
            placeholder="exemplo da silva"
            value={name}
            onChangeText={setName}
          />

          <CustomTextInput
            label="Email"
            placeholder="exemplo@exemplo.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <CustomTextInput
            label="Número De Telefone"
            placeholder="+55 13 98812 3586"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
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

          <CustomTextInput
            label="Confirme A Senha"
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!isConfirmPasswordVisible}
            icon={isConfirmPasswordVisible ? '👁️' : '👁️‍🗨️'}
            onIconPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
          />
          
          <Text style={styles.termsText}>
            Ao continuar, você concorda com os {'\n'}
            <Text style={styles.link}>Termos de Uso</Text> e a <Text style={styles.link}>Política de Privacidade</Text>.
          </Text>

          <CustomButton
            title="Criar Conta"
            onPress={handleRegister}
            style={{ backgroundColor: COLORS.primary, marginTop: 20, width: '100%' }}
          />
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
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
    // Posiciona o fundo por trás de todo o conteúdo e ocupa a tela inteira
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    // Posiciona o texto do header na área visível do topo
    paddingTop: screenHeight * 0.12, 
  },
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.darkText,
  },
  scrollContainer: {
    // Adiciona um espaço no topo, empurrando o card para baixo
    paddingTop: screenHeight * 0.25,
    height: 500,
  },
  contentCard: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    paddingTop: 40,
    paddingHorizontal: 40,
    paddingBottom: 200,
    minHeight: screenHeight * 0.75, // Garante que o card tenha no mínimo a altura para preencher a tela inicial
  },
  termsText: {
    color: COLORS.darkText,
    textAlign: 'center',
    marginTop: 15,
    marginHorizontal: 20,
    lineHeight: 20,
  },
  link: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  backButton: {
      marginTop: 15,
      alignItems: 'center',
  },
  backButtonText: {
      color: COLORS.darkText,
      fontSize: 16,
  }
});

export default RegisterScreen;

