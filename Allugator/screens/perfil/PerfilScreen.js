/**
 * PerfilScreen - Tela principal de perfil do usuário
 * Design: 8 - A - Perfil
 */
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  Modal 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth'; 

const COLORS = {
  background: '#1DE9B6',
  headerText: '#444444',
  card: '#FFFFFF',
  darkText: '#444444',
  gray: '#888888',
  lightGray: '#E0E0E0',
  iconBg: '#E8F5E9',
  red: '#FF5252',
  modalOverlay: 'rgba(0, 0, 0, 0.4)', 
  modalBg: '#F0FFF0', 
  modalBtnCancel: '#B9F6CA', 
};

export default function PerfilScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [modalVisible, setModalVisible] = useState(false); 

  const handleLogout = async () => {
    setModalVisible(false); 
    const result = await logout(); 
    if (result.success) {
      navigation.replace('Auth'); 
    } else {
      Alert.alert('Erro', 'Não foi possível sair. Tente novamente.');
    }
  };

  const menuOptions = [
    { id: 'edit', title: 'Editar Perfil', icon: '👤', screen: 'EditProfile' },
    { id: 'security', title: 'Segurança', icon: '🛡️', screen: 'Security' },
    { id: 'settings', title: 'Configurações', icon: '⚙️', screen: 'Settings' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Perfil</Text>
      </View>
      
      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          
          <View style={styles.userInfoSection}>
            <Text style={styles.userName}>{user?.name || 'Usuário'}</Text>
            <Text style={styles.userId}>ID: {user?.id || 'N/A'}</Text>
          </View>

          <View style={styles.menuSection}>
            {menuOptions.map((option) => (
              <TouchableOpacity 
                key={option.id} 
                style={styles.menuRow} 
                onPress={() => navigation.navigate(option.screen)}
              >
                <View style={styles.menuIconContainer}>
                  <Text style={styles.menuIcon}>{option.icon}</Text>
                </View>
                <Text style={styles.menuText}>{option.title}</Text>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
              style={styles.menuRow} 
              onPress={() => setModalVisible(true)}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: '#FFEBEE' }]}>
                <Text style={styles.menuIcon}>🚪</Text>
              </View>
              <Text style={styles.menuText}>Sair</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* --- INÍCIO: MODAL DE SAIR --- */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Sair da Conta</Text>
            
            <Text style={styles.modalText}>
              Tem certeza que deseja sair? O jacaré já está com saudades.
            </Text>
            
            <TouchableOpacity 
              style={styles.modalButtonConfirm} 
              onPress={handleLogout}
            >
              <Text style={styles.modalButtonConfirmText}>Sim, Sair</Text>
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
      {/* --- FIM: MODAL DE SAIR --- */}

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
  },
  headerTitle: {
    fontSize: 28, 
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
  menuSection: {
    width: '100%',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.iconBg, 
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuIcon: {
    fontSize: 20,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkText,
  },
  menuArrow: {
    fontSize: 24,
    color: COLORS.gray,
  },
  
  // --- ESTILOS DO MODAL---
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