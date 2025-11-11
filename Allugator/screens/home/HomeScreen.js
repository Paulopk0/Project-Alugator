import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

const { height: screenHeight } = Dimensions.get('window');

const COLORS = {
  primary: '#1DE9B6',
  background: '#F0FFF0',
  darkText: '#444444ff',
  white: '#FFFFFF',
};

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Background verde */}
      <View style={styles.backgroundGreen} />

      <View style={styles.content}>
        {/* Card branco com conteúdo */}
        <View style={styles.contentCard}>
          <Text style={styles.title}>Bem-vindo ao Allugator! 🐊</Text>
          <Text style={styles.subtitle}>
            Alugue e empreste itens com facilidade
          </Text>

          <View style={styles.buttonsContainer}>
            {/* Botão Loja */}
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('Store')}
            >
              <Text style={styles.buttonIcon}>🏪</Text>
              <Text style={styles.buttonTitle}>Loja</Text>
              <Text style={styles.buttonDescription}>
                Explore itens disponíveis para aluguel
              </Text>
            </TouchableOpacity>

            {/* Botão Favoritos */}
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('Store', { 
                screen: 'Favorites' 
              })}
            >
              <Text style={styles.buttonIcon}>♥</Text>
              <Text style={styles.buttonTitle}>Meus Favoritos</Text>
              <Text style={styles.buttonDescription}>
                Veja seus itens favoritos
              </Text>
            </TouchableOpacity>

            {/* Botão Buscar */}
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('Store', { 
                screen: 'Search' 
              })}
            >
              <Text style={styles.buttonIcon}>🔍</Text>
              <Text style={styles.buttonTitle}>Buscar</Text>
              <Text style={styles.buttonDescription}>
                Encontre o item perfeito
              </Text>
            </TouchableOpacity>
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
    height: screenHeight * 0.35,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
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
  buttonsContainer: {
    flex: 1,
    gap: 20,
  },
  button: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  buttonIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  buttonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginBottom: 8,
  },
  buttonDescription: {
    fontSize: 14,
    color: COLORS.darkText,
    opacity: 0.7,
    textAlign: 'center',
  },
});

export default HomeScreen;