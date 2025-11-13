import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

const COLORS = {
  primary: '#1DE9B6',
  background: '#F0FFF0',
  darkText: '#444444ff',
  white: '#FFFFFF',
};

const HomeScreen = ({ navigation }) => {
  const { height: screenHeight } = Dimensions.get('window');
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Background verde */}
      <View style={[styles.backgroundGreen, { height: screenHeight * 0.35 }]} />

      <View style={styles.content}>
        {/* Card branco com conteúdo */}
        <View style={styles.contentCard}>
          <Text style={styles.title}>Bem-vindo ao Allugator! 🐊</Text>
          <Text style={styles.subtitle}>
            Alugue e empreste itens com facilidade
          </Text>

          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderTitle}>Tela Home</Text>
            <Text style={styles.placeholderText}>
              Esta tela será implementada pelo colaborador.
            </Text>
            <Text style={styles.placeholderSubtext}>
              Use a barra de navegação abaixo para acessar:
            </Text>
            </View>

          </View>
        </View>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backgroundGreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    zIndex: 1,
  },
  content: {
    flex: 1,
    zIndex: 2,
    paddingTop: 60,
  },
  contentCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
    boxShadow: '0px -2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.darkText,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.darkText,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 40,
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  placeholderIcon: {
    fontSize: 72,
    marginBottom: 20,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginBottom: 12,
  },
  placeholderText: {
    fontSize: 16,
    color: COLORS.darkText,
    textAlign: 'center',
    marginBottom: 8,
    opacity: 0.8,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: COLORS.darkText,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 16,
    opacity: 0.6,
  },
  featuresContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    gap: 12,
  },
  featureItem: {
    fontSize: 15,
    color: COLORS.darkText,
    paddingVertical: 8,
  },
});

export default HomeScreen;