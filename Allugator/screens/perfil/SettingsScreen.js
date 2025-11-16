/**
 * SettingsScreen - Tela de Configurações
 * Design: 8.3 - A - Configurações
 */
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Paleta de cores
const COLORS = {
  background: '#1DE9B6',
  headerText: '#444444',
  card: '#FFFFFF',
  darkText: '#444444',
  gray: '#888888',
  lightGray: '#E0E0E0',
  iconBg: '#E8F5E9',
};

export default function SettingsScreen({ navigation }) {
  const menuOptions = [
    {
      id: 'delete',
      title: 'Apagar Conta',
      icon: '🗑️',
      screen: 'DeleteAccount'
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurações</Text>
      </View>
      
      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 30, paddingBottom: 100 }}>
          <View style={styles.menuSection}>
            {menuOptions.map((option) => (
              <TouchableOpacity 
                key={option.id} 
                style={styles.menuRow} 
                onPress={() => navigation.navigate(option.screen)}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: '#FFEBEE' }]}>
                  <Text style={styles.menuIcon}>{option.icon}</Text>
                </View>
                <Text style={styles.menuText}>{option.title}</Text>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
            ))}
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
});