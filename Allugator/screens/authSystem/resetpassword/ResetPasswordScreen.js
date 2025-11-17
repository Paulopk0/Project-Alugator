import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import CustomButton from '../../../components/CustomButton/CustomButton';
import CustomTextInput from '../../../components/CustomTextInput/CustomTextInput';
import MessageDisplay from '../../../components/MessageDisplay/MessageDisplay';
import { resetPassword } from '../../../apis/PasswordResetApi';

const COLORS = {
  background: '#F0FFF0', 
  primary: '#1DE9B6',
  darkText: '#444444ff',
  white: '#FFFFFF',
  error: '#FF5252',
  success: '#4CAF50',
};

const ResetPasswordScreen = ({ route, navigation }) => {
  const screenHeight = Dimensions.get('window').height;
  const { resetToken, email } = route.params;
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const handleResetPassword = async () => {
    try {
      // Validações
      if (!newPassword || !confirmPassword) {
        setFeedback({
          message: 'Por favor, preencha todos os campos.',
          type: 'error'
        });
        return;
      }

      if (newPassword.length < 6) {
        setFeedback({
          message: 'A senha deve ter no mínimo 6 caracteres.',
          type: 'error'
        });
        return;
      }

      if (newPassword !== confirmPassword) {
        setFeedback({
          message: 'As senhas não coincidem.',
          type: 'error'
        });
        return;
      }

      setLoading(true);
      setFeedback({ message: '', type: '' });

      const response = await resetPassword(resetToken, newPassword);
      
      setFeedback({
        message: 'Senha redefinida com sucesso! Redirecionando...',
        type: 'success'
      });

      // Navega para login após sucesso
      setTimeout(() => {
        navigation.navigate('Login');
      }, 2000);

    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      setFeedback({
        message: error.message || 'Erro ao redefinir senha',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Fundo colorido */}
      <View style={[styles.background, { paddingTop: screenHeight * 0.12 }]}>
        <Text style={styles.headerText}>Nova Senha</Text>
      </View>

      {/* Conteúdo rolável */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContainer, { paddingTop: screenHeight * 0.25 }]}
      >
        {/* Card com o formulário */}
        <View style={styles.contentCard}>
          <Text style={styles.infoText}>
            Crie uma nova senha para sua conta:
          </Text>
          
          <Text style={styles.emailText}>{email}</Text>

          {feedback.message ? (
            <MessageDisplay 
              message={feedback.message} 
              type={feedback.type} 
            />
          ) : null}

          <CustomTextInput
            label="Nova Senha"
            placeholder="Mínimo 6 caracteres"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!isPasswordVisible}
            isPassword={true}
            isPasswordVisible={isPasswordVisible}
            onTogglePassword={() => setIsPasswordVisible(!isPasswordVisible)}
            editable={!loading}
          />

          <CustomTextInput
            label="Confirmar Nova Senha"
            placeholder="Digite a senha novamente"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!isConfirmPasswordVisible}
            isPassword={true}
            isPasswordVisible={isConfirmPasswordVisible}
            onTogglePassword={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
            editable={!loading}
          />
          
          <CustomButton
            title={loading ? "Redefinindo..." : "Redefinir Senha"}
            onPress={handleResetPassword}
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
  backButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  backButtonText: {
    color: COLORS.darkText,
    fontSize: 14,
  },
});

export default ResetPasswordScreen;
