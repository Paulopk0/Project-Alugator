/**
 * EditProfileScreen - Tela de edição de dados do usuário
 * Design: 8.1 - A - Editar perfil
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth'; 
import { updateProfile } from '../../apis/UserApi'; 
import MessageDisplay from '../../components/MessageDisplay/MessageDisplay';

const COLORS = {
  background: '#1DE9B6',
  headerText: '#444444',
  card: '#FFFFFF',
  darkText: '#444444',
  gray: '#888888',
  lightGray: '#E0E0E0',
  inputBg: '#E8F5E9',
};

// Formata o texto para +NN NN NNNNN-NNNN
const formatPhone = (text) => {
  const digits = text.replace(/\D/g, '').substring(0, 13); 

  let masked = '+';
  if (digits.length > 0) {
    masked += digits.substring(0, 2);
  }
  if (digits.length > 2) {
    masked += ` ${digits.substring(2, 4)}`;
  }
  if (digits.length > 4) {
    masked += ` ${digits.substring(4, 9)}`;
  }
  if (digits.length > 9) {
    masked += `-${digits.substring(9, 13)}`;
  }
  return masked;
};

export default function EditProfileScreen({ navigation }) {
  const { user, updateUser } = useAuth(); 
  
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phoneNumber ? formatPhone(user.phoneNumber) : '');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSave = async () => {
    setMessage(null); 
    
    // 1. Validação do Nome
    if (!name.trim() || name.trim().length < 3) {
      setMessage({ text: 'Nome é obrigatório e deve ter pelo menos 3 caracteres.', type: 'error' });
      return;
    }

    // 2. Validação do Telefone
    const rawPhone = phone.replace(/\D/g, ''); 
    if (rawPhone.length > 0 && rawPhone.length < 13) {
      setMessage({ text: 'Telefone inválido. O formato completo é +55 11 99999-9999.', type: 'error' });
      return;
    }
    
    setLoading(true);
    try {
      const response = await updateProfile(name.trim(), phone.trim()); 
      
      if (response.statusCode === 200 && response.user) {
        await updateUser(response.user); 
        
        setMessage({ text: 'Perfil atualizado com sucesso!', type: 'success' });

        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      } else {
        setMessage({ text: response.message || 'Erro ao atualizar perfil.', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: error.message || 'Um erro inesperado ocorreu.', type: 'error' });
    } finally {
      if (message?.type !== 'success') {
         setLoading(false);
      }
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
        <Text style={styles.headerTitle}>Editar Meu Perfil</Text>
      </View>
      
      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          <MessageDisplay
            message={message?.text}
            type={message?.type || 'error'}
            onHide={() => setMessage(null)}
          />
          
          <View style={styles.userInfoSection}>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userId}>ID: {user?.id}</Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>Usuário</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Seu nome completo"
            />
            
            <Text style={styles.label}>Telefone</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={(text) => setPhone(formatPhone(text))} 
              placeholder="+55 11 99999-9999"
              keyboardType="phone-pad"
              maxLength={17} 
            />
            
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.card} />
              ) : (
                <Text style={styles.saveButtonText}>Editar Perfil</Text>
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
    paddingTop: 40, 
    paddingHorizontal: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  userInfoSection: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10, 
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.darkText,
  },
  userId: {
    fontSize: 14,
    color: COLORS.gray,
  },
  formSection: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkText,
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: COLORS.darkText,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  saveButton: {
    backgroundColor: COLORS.background,
    borderRadius: 25,
    padding: 18,
    alignItems: 'center',
    marginTop: 30,
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