import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import CustomButton from '../../../components/CustomButton/CustomButton';
import CustomTextInput from '../../../components/CustomTextInput/CustomTextInput';
import MessageDisplay from '../../../components/MessageDisplay/MessageDisplay';
import { validateResetCode } from '../../../apis/PasswordResetApi';

const COLORS = {
  background: '#F0FFF0', 
  primary: '#1DE9B6',
  darkText: '#444444ff',
  white: '#FFFFFF',
  error: '#FF5252',
  success: '#4CAF50',
};

const ValidateCodeScreen = ({ route, navigation }) => {
  const screenHeight = Dimensions.get('window').height;
  const { email } = route.params;
  
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  const handleValidateCode = async () => {
    try {
      if (!code) {
        setFeedback({
          message: 'Por favor, insira o código.',
          type: 'error'
        });
        return;
      }

      if (code.length !== 6) {
        setFeedback({
          message: 'O código deve ter 6 dígitos.',
          type: 'error'
        });
        return;
      }

      setLoading(true);
      setFeedback({ message: '', type: '' });

      const response = await validateResetCode(email, code);
      
      setFeedback({
        message: 'Código validado com sucesso!',
        type: 'success'
      });

      // Navega para tela de nova senha
      setTimeout(() => {
        navigation.navigate('ResetPassword', { 
          resetToken: response.resetToken,
          email
        });
      }, 1500);

    } catch (error) {
      console.error('Erro ao validar código:', error);
      setFeedback({
        message: error.message || 'Código inválido ou expirado',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Fundo colorido */}
      <View style={[styles.background, { paddingTop: screenHeight * 0.12 }]}>
        <Text style={styles.headerText}>Validar Código</Text>
      </View>

      {/* Conteúdo rolável */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContainer, { paddingTop: screenHeight * 0.25 }]}
      >
        {/* Card com o formulário */}
        <View style={styles.contentCard}>
          <Text style={styles.infoText}>
            Insira o código de 6 dígitos que foi gerado para o email:
          </Text>
          
          <Text style={styles.emailText}>{email}</Text>

          {feedback.message ? (
            <MessageDisplay 
              message={feedback.message} 
              type={feedback.type} 
            />
          ) : null}

          <CustomTextInput
            label="Código de 6 dígitos"
            placeholder="123456"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
            editable={!loading}
          />
          
          <CustomButton
            title={loading ? "Validando..." : "Validar Código"}
            onPress={handleValidateCode}
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
            onPress={handleResendCode} 
            style={styles.resendButton}
            disabled={loading}
          >
            <Text style={styles.resendButtonText}>Solicitar novo código</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => navigation.navigate('Login')} 
            style={styles.backButton}
            disabled={loading}
          >
            <Text style={styles.backButtonText}>Voltar ao Login</Text>
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
    marginBottom: 10,
    lineHeight: 22,
  },
  emailText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  resendButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  resendButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  backButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  backButtonText: {
    color: COLORS.darkText,
    fontSize: 14,
  },
});

export default ValidateCodeScreen;
