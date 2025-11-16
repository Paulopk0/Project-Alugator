/**
 * PrivacyPolicyScreen - Tela de Políticas de Privacidade
 * (Texto zueiro conforme solicitado)
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
  inputBg: '#E8F5E9',
};

export default function PrivacyPolicyScreen({ navigation }) {

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Políticas de Privacidade</Text>
      </View>
      
      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 30, paddingBottom: 100 }}>
          
          <View style={styles.termsContainer}>
            <Text style={styles.termsTitle}>Nossa Política (ou a falta dela)</Text>
            <Text style={styles.termsText}>
              Sua privacidade é muito importante... para você. Para nós? Nem tanto. Estamos brincando (sério).
              {'\n\n'}
              <Text style={{fontWeight: 'bold'}}>1. Dados que Coletamos:</Text>
              {'\n'}
              Coletamos seu nome, e-mail e quantas vezes você olhou aquele item antes de decidir alugar. Também coletamos seus medos mais profundos, mas só para garantir que o jacaré não te assuste.
              {'\n\n'}
              <Text style={{fontWeight: 'bold'}}>2. Como Usamos seus Dados:</Text>
              {'\n'}
              - Para te mandar e-mails que você provavelmente vai ignorar.
              {'\n'}
              - Para treinar nossos algoritmos a sugerir coisas que você não sabia que precisava (e provavelmente não precisa).
              {'\n'}
              - Não vendemos seus dados. Nós os *alugamos*. É o nosso negócio, afinal.
              {'\n\n'}
              <Text style={{fontWeight: 'bold'}}>3. Cookies:</Text>
              {'\n'}
              Usamos cookies. Não os comestíveis, infelizmente. Aceite-os. A resistência é fútil.
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