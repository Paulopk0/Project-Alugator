import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import CustomButton from '../../../components/CustomButton/CustomButton';
import CustomTextInput from '../../../components/CustomTextInput/CustomTextInput';
import MessageDisplay from '../../../components/MessageDisplay/MessageDisplay';
import { requestPasswordReset } from '../../../apis/PasswordResetApi';

const COLORS = {
  background: '#F0FFF0', 
  primary: '#1DE9B6',
  darkText: '#444444ff',
  white: '#FFFFFF',
  error: '#FF5252',
  success: '#4CAF50',
};

const ForgotPasswordScreen = ({ navigation }) => {
  const screenHeight = Dimensions.get('window').height;
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  const handleNextStep = async () => {
    try {
      if (!email) {
        setFeedback({ message: 'Por favor, insira seu email.', type: 'error' });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setFeedback({ message: 'Por favor, insira um email válido.', type: 'error' });
        return;
      }

      setLoading(true);
      setFeedback({ message: '', type: '' });

      const response = await requestPasswordReset(email);

      setFeedback({
        message: 'Código enviado para seu e-mail! Verifique sua caixa de entrada.',
        type: 'success'
      });

      // Navega para tela de validação do código
      setTimeout(() => {
        navigation.navigate('ValidateCode', { email });
      }, 2000);

    } catch (error) {
      console.error('Erro ao solicitar recuperação:', error);
      setFeedback({
        message: error.message || 'Erro ao enviar código. Tente novamente.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Fundo colorido que ocupa 100% da tela com o header */}
      <View style={[styles.background, { paddingTop: screenHeight * 0.12 }]}>
        <Text style={styles.headerText}>Recuperar Senha</Text>
      </View>

      {/* Conteúdo rolável que fica por cima */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContainer, { paddingTop: screenHeight * 0.25 }]}
      >
        {/* Card com o formulário */}
        <View style={styles.contentCard}>
          <Text style={styles.infoText}>
            Por favor, insira seu endereço de e-mail para iniciar o processo de recuperação de senha.
          </Text>

          {feedback.message ? (
            <MessageDisplay 
              message={feedback.message} 
              type={feedback.type} 
            />
          ) : null}

          <CustomTextInput
            label="Digite Seu Email"
            placeholder="exemplo@exemplo.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            editable={!loading}
          />
          
          <CustomButton
            title={loading ? "Enviando..." : "Próximo Passo"}
            onPress={handleNextStep}
            style={{ backgroundColor: COLORS.primary, marginTop: 30, width: '100%' }}
            disabled={loading}
          />

          {loading && (
            <ActivityIndicator 
              size="small" 
              color={COLORS.primary} 
              style={{ marginTop: 15 }} 
            />
          )}

          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
            disabled={loading}
          >
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  },
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.darkText,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  contentCard: {
    flex: 1, 
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    paddingTop: 40,
    paddingHorizontal: 40,
    paddingBottom: 80,
  },
  infoText: {
    fontSize: 16,
    color: COLORS.darkText,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
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

export default ForgotPasswordScreen;