/**
 * ChangePasswordScreen - Tela para alterar senha
 * Design: 8.2 - B - Mudar senha
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { changePassword } from '../../apis/UserApi';
import MessageDisplay from '../../components/MessageDisplay/MessageDisplay';
import CustomTextInput from '../../components/CustomTextInput/CustomTextInput'; 

// Paleta de cores
const COLORS = {
  background: '#1DE9B6',
  headerText: '#444444',
  card: '#FFFFFF',
  darkText: '#444444',
  gray: '#888888',
  lightGray: '#E0E0E0',
  inputBg: '#E8F5E9',
};

export default function ChangePasswordScreen({ navigation }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSave = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setMessage({ text: 'Por favor, preencha todos os campos.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'A nova senha e a confirmação não conferem.', type: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ text: 'A nova senha deve ter pelo menos 6 caracteres.', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const response = await changePassword(oldPassword, newPassword);
      if (response.statusCode === 200) {
        navigation.replace('PasswordSuccess');
      } else {
        setMessage({ text: response.message || 'Erro ao alterar senha.', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Erro de conexão. Tente novamente.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mudar Senha</Text>
      </View>
      
      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 30, paddingBottom: 100, alignItems: 'center' }}>
          <MessageDisplay
            message={message?.text}
            type={message?.type}
            onHide={() => setMessage(null)}
          />
          <View style={styles.formSection}>
            
            <CustomTextInput
              label="Senha Atual"
              placeholder="••••••••"
              value={oldPassword}
              onChangeText={setOldPassword}
              secureTextEntry={!showOld}
              icon={showOld ? '👁️' : '👁️‍🗨️'}
              onIconPress={() => setShowOld(!showOld)}
              editable={!loading}
            />
            
            <CustomTextInput
              label="Nova Senha"
              placeholder="••••••••"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNew}
              icon={showNew ? '👁️' : '👁️‍🗨️'}
              onIconPress={() => setShowNew(!showNew)}
              editable={!loading}
            />

            <CustomTextInput
              label="Confirme A Senha"
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirm}
              icon={showConfirm ? '👁️' : '👁️‍🗨️'}
              onIconPress={() => setShowConfirm(!showConfirm)}
              editable={!loading}
            />
            
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.card} />
              ) : (
                <Text style={styles.saveButtonText}>Mudar A Senha</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    height: '18%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    flexDirection: 'row',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    padding: 10,
    zIndex: 10,
  },
  backIcon: {
    fontSize: 28,
    color: COLORS.headerText,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.headerText,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    paddingHorizontal: 20,
    paddingTop: 30,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  formSection: {
    width: '100%',
    alignItems: 'center',
  },
  
  saveButton: {
    backgroundColor: COLORS.background,
    borderRadius: 25,
    padding: 18,
    alignItems: 'center',
    marginTop: 40,
    width: '100%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  saveButtonText: {
    color: COLORS.card,
    fontSize: 18,
    fontWeight: 'bold',
  },
  
});