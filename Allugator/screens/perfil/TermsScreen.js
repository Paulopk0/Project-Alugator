/**
 * TermsScreen - Tela de Termos e Condições
 * Design: 8.2 - D - Termos E Condições
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

const COLORS = {
  background: '#1DE9B6',
  headerText: '#444444',
  card: '#FFFFFF',
  darkText: '#444444',
  inputBg: '#E8F5E9',
};

export default function TermsScreen({ navigation }) {

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Termos E Condições</Text>
      </View>
      
      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 30, paddingBottom: 100 }}>
          
          <View style={styles.termsContainer}>
            <Text style={styles.termsTitle}>Os Termos de Uso (que ninguém lê)</Text>
            <Text style={styles.termsText}>
              Basicamente, ao usar o Allugator, você concorda em não nos culpar por nada. Nunca. Jamais.
              {'\n\n'}
              <Text style={{fontWeight: 'bold'}}>1. Sua Alma (opcional, por enquanto):</Text>
              {'\n'}
              Ao usar, você nos concede uma licença perpétua, irrevogável e transferível para usar seu nome, sua foto e suas piadas ruins em nosso material de marketing.
              {'\n\n'}
              <Text style={{fontWeight: 'bold'}}>2. O Jacaré:</Text>
              {'\n'}
              Nosso mascote é legal, mas não nos responsabilizamos se ele morder. Mantenha distância segura.
              {'\n\n'}
              <Text style={{fontWeight: 'bold'}}>3. Coisas Sérias (ou quase):</Text>
              {'\n'}
              - Não alugue uma furadeira para fins malignos.
              {'\n'}
              - Devolva as coisas no prazo. Cobramos juros em almas (ver item 1).
              {'\n'}
              - Podemos mudar estes termos a qualquer momento, provavelmente na calada da noite, sem te avisar.
            </Text>
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
    fontSize: 22, 
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
  termsContainer: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  termsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginBottom: 10,
  },
  termsText: {
    fontSize: 14,
    color: COLORS.darkText,
    lineHeight: 20,
  },
});