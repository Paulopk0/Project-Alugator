import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
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

/**
 * Tela de Cadastro com layout de fundo completo e card de conteúdo animado.
 */
const RegisterScreen = ({ navigation }) => {
  // Obtém a altura da tela para o posicionamento inicial do card
  const screenHeight = Dimensions.get('window').height;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  // ✅ Novo: Hook do AuthContext
  const { register, loading } = useAuth();

  const handleRegister = async () => {
    // Valida se as senhas conferem
    if (password !== confirmPassword) {
      setFeedback({ message: 'As senhas não conferem!', type: 'error' });
      return;
    }

    // Valida campos obrigatórios
    if (!name || !email || !password || !phoneNumber) {
      setFeedback({ message: 'Por favor, preencha todos os campos.', type: 'error' });
      return;
    }

    try {
      console.log('[RegisterScreen] Dados para registro:', { name, email, password, phoneNumber });
      // ✅ Novo: Usa o método do contexto
      const result = await register(name, email, password, phoneNumber);
      console.log('[RegisterScreen] Resultado do registro:', result);

      if (result.success) {
        setFeedback({ message: result.message, type: 'success' });
        
        // Aguarda um pouco antes de navegar para o usuário ver a mensagem
        setTimeout(() => {
          navigation.replace('MainTabs'); // Navega direto para MainTabs após registro
        }, 1500);
      } else {
        setFeedback({ message: result.message, type: 'error' });
      }
    } catch (error) {
      setFeedback({ message: error.message || 'Erro ao registrar', type: 'error' });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.background, { paddingTop: screenHeight * 0.12 }]}>
        <Text style={styles.headerText}>Criar Conta</Text>
      </View>

      {/* O conteúdo rolável que fica por cima */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContainer, { paddingTop: screenHeight * 0.25 }]}
      >
        {/* O card com o formulário*/}
        <View style={[styles.contentCard, { minHeight: screenHeight * 0.75 }]}>
          <CustomTextInput
            label="Nome Completo"
            placeholder="exemplo da silva"
            value={name}
            onChangeText={setName}
            editable={!loading}
          />

          <CustomTextInput
            label="Email"
            placeholder="exemplo@exemplo.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            editable={!loading}
          />

          <CustomTextInput
            label="Número De Telefone"
            placeholder="+55 13 98812 3586"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
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

          <CustomTextInput
            label="Confirme A Senha"
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!isConfirmPasswordVisible}
            icon={isConfirmPasswordVisible ? '👁️' : '👁️‍🗨️'}
            onIconPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
            editable={!loading}
          />
          
          <Text style={styles.termsText}>
            Ao continuar, você concorda com os {'\n'}
            <Text style={styles.link}>Termos de Uso</Text> e a <Text style={styles.link}>Política de Privacidade</Text>.
          </Text>

          <CustomButton
            title={loading ? 'Criando conta...' : 'Criar Conta'}
            onPress={handleRegister}
            style={{ 
              backgroundColor: COLORS.primary, 
              marginTop: 20, 
              width: '100%',
              opacity: loading ? 0.6 : 1,
            }}
            disabled={loading}
          />
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
            disabled={loading}
          >
            <Text style={[styles.backButtonText, { opacity: loading ? 0.6 : 1 }]}>Voltar</Text>
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
  },
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.darkText,
  },
  scrollContainer: {
    height: 500,
  },
  contentCard: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    paddingTop: 40,
    paddingHorizontal: 40,
    paddingBottom: 200,
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

