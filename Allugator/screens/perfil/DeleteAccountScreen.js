/**
 * DeleteAccountScreen - Tela para apagar conta
 * Design: 8.3 - C - Apagar Conta
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { deleteAccount } from '../../apis/UserApi'; 
import { useAuth } from '../../hooks/useAuth'; 
import MessageDisplay from '../../components/MessageDisplay/MessageDisplay';
import CustomTextInput from '../../components/CustomTextInput/CustomTextInput'; 

const COLORS = {
  background: '#1DE9B6',
  headerText: '#444444',
  card: '#FFFFFF',
  darkText: '#444444',
  gray: '#888888',
  lightGray: '#E0E0E0',
  inputBg: '#E8F5E9',
  red: '#FF5252', 
  modalOverlay: 'rgba(0, 0, 0, 0.4)', 
  modalBg: '#F0FFF0', 
  modalBtnCancel: '#B9F6CA', 
};

export default function DeleteAccountScreen({ navigation }) {
  const { logout } = useAuth();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [modalVisible, setModalVisible] = useState(false); 

  const handleDelete = () => {
    if (!password) {
      setMessage({ text: 'Por favor, digite sua senha para confirmar.', type: 'error' });
      return;
    }
    
    setMessage(null);
    setModalVisible(true);
  };
  
  const confirmDelete = async () => {
    setModalVisible(false);
    setLoading(true);
    setMessage(null);

    try {
      const response = await deleteAccount(password);
      
      if (response.statusCode === 200) {
        await logout();
        navigation.navigate('Auth');
      } else {
        setMessage({ text: response.message || 'Erro ao apagar conta.', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: error.message || 'Erro de conexão. Tente novamente.', type: 'error' });
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
        <Text style={styles.headerTitle}>Apagar Conta</Text>
      </View>
      
      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 30, paddingBottom: 100 }}>
          <MessageDisplay
            message={message?.text}
            type={message?.type || 'error'}
            onHide={() => setMessage(null)}
          />

          <Text style={styles.warningTitle}>Tem certeza que quer chutar o balde?</Text>
          
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              Essa ação é tipo deletar o save do jogo: permanente. Sem choro. Lembre-se:
            </Text>
            <Text style={styles.warningListItem}>• Todo seu histórico, itens e glória serão... deletados.</Text>
            <Text style={styles.warningListItem}>• Você não vai mais poder logar. Sério.</Text>
            <Text style={styles.warningListItem}>• Não tem 'Ctrl + Z'.</Text>
          </View>
          
          <View style={styles.formSection}>
        
            <CustomTextInput
              label="Digite sua senha para provar que é você"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              icon={showPass ? '👁️' : '👁️‍🗨️'}
              onIconPress={() => setShowPass(!showPass)}
              editable={!loading}
            />
            
            <TouchableOpacity 
              style={styles.deleteButton} 
              onPress={handleDelete} 
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.card} />
              ) : (
                <Text style={styles.deleteButtonText}>Sim, Apagar A Conta</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      <Modal
        transparent={true}
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Última Chance!</Text>
            
            <Text style={styles.modalText}>
              Ao clicar no botão vermelho, você entende que tudo será apagado para sempre. Para. Todo. O. Sempre. Sem volta.
            </Text>
            
            <TouchableOpacity 
              style={styles.modalButtonConfirm} 
              onPress={confirmDelete}
              disabled={loading}
            >
              <Text style={styles.modalButtonConfirmText}>Sim, apagar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalButtonCancel} 
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  warningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginBottom: 15,
  },
  warningBox: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  warningText: {
    fontSize: 14,
    color: COLORS.darkText,
    lineHeight: 20,
    marginBottom: 10,
  },
  warningListItem: {
    fontSize: 14,
    color: COLORS.darkText,
    lineHeight: 20,
    marginBottom: 5,
    paddingLeft: 10,
  },
  formSection: {
    width: '100%',
    alignItems: 'center', 
  },
  

  deleteButton: {
    backgroundColor: COLORS.red,
    borderRadius: 25,
    padding: 18,
    alignItems: 'center',
    marginTop: 30,
    width: '100%', 
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  deleteButtonText: {
    color: COLORS.card,
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: COLORS.gray,
    fontSize: 16,
    fontWeight: 'bold',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.modalOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: COLORS.modalBg, 
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    width: '90%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 25,
  },
  modalButtonConfirm: {
    backgroundColor: COLORS.red, 
    borderRadius: 25,
    padding: 15,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 3,
  },
  modalButtonConfirmText: {
    color: COLORS.card, 
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalButtonCancel: {
    backgroundColor: COLORS.modalBtnCancel, 
    borderRadius: 25,
    padding: 15,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonCancelText: {
    color: COLORS.darkText, 
    fontSize: 16,
    fontWeight: 'bold',
  },
  
});