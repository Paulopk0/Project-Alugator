import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import CustomButton from '../../components/CustomButton/CustomButton';
import CustomTextInput from '../../components/CustomTextInput/CustomTextInput';

const COLORS = {
  background: '#F0FFF0', 
  primary: '#1DE9B6',
  darkText: '#444444ff',
  white: '#FFFFFF',
};

// Obtém a altura da tela para o posicionamento
const screenHeight = Dimensions.get('window').height;

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');

  const handleNextStep = () => {
    console.log('Enviando e-mail de recuperação para:', email);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Fundo colorido que ocupa 100% da tela com o header */}
      <View style={styles.background}>
        <Text style={styles.headerText}>Recuperar Senha</Text>
      </View>

      {/* Conteúdo rolável que fica por cima */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Card com o formulário */}
        <View style={styles.contentCard}>
          <Text style={styles.infoText}>
            Por favor, insira seu endereço de e-mail para iniciar o processo de recuperação de senha.
          </Text>

          <CustomTextInput
            label="Digite Seu Email"
            placeholder="exemplo@exemplo.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <CustomButton
            title="Próximo Passo"
            onPress={handleNextStep}
            style={{ backgroundColor: COLORS.primary, marginTop: 30, width: '100%' }}
          />
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
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