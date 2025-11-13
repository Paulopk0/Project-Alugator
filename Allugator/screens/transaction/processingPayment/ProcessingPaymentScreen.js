/**
 * ProcessingPaymentScreen - Tela de processamento de pagamento
 * 
 * Exibe animação de loading enquanto processa o pagamento do aluguel.
 * Após criar o aluguel com sucesso, navega para RentalTracking.
 * 
 * Fluxo: Payment → ProcessingPayment → RentalTracking
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Animated,
  StatusBar,
  Alert,
} from 'react-native';
import { createRental } from '../../../apis/RentalApi';

// Paleta de cores do aplicativo
const COLORS = {
  background: '#F0FFF0',
  primary: '#1DE9B6',
  darkText: '#444444ff',
  white: '#FFFFFF',
  lightGray: '#E0E0E0',
  gray: '#888888',
  success: '#4CAF50',
};

const ProcessingPaymentScreen = ({ route, navigation }) => {
  const screenHeight = Dimensions.get('window').height;
  
  // Recebe dados do pagamento da tela anterior
  const { item, days, totalPrice } = route.params;
  
  // Estados de processamento
  const [processingStep, setProcessingStep] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  
  // Mensagens de processamento para feedback visual
  const processingMessages = [
    'Processando pagamento...',
    'Verificando disponibilidade...',
    'Confirmando reserva...',
    'Finalizando...'
  ];

  /**
   * Anima a mensagem de processamento (fade in/out)
   */
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  /**
   * Simula steps de processamento e executa o pagamento
   */
  useEffect(() => {
    processPayment();
  }, []);

  /**
   * Processa o pagamento e cria o aluguel
   * Simula steps visuais para melhor UX
   */
  const processPayment = async () => {
    try {
      // Step 1: Processando pagamento
      setProcessingStep(0);
      await delay(1500);
      
      // Step 2: Verificando disponibilidade
      setProcessingStep(1);
      await delay(1000);
      
      // Calcula datas de início e fim do aluguel
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);
      
      // Monta objeto com dados do aluguel
      const rentalData = {
        itemId: item.id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        days: days,
        pricePerDay: parseFloat(item.priceDaily || 0),
        totalPrice: totalPrice
      };
      
      // Step 3: Confirmando reserva (chamada API)
      setProcessingStep(2);
      const response = await createRental(rentalData);
      
      if (response.status === 201) {
        // Step 4: Finalizado
        setProcessingStep(3);
        await delay(800);
        
        // Sucesso: navega para tela de acompanhamento
        // replace() remove histórico de pagamento
        navigation.replace('RentalTracking', { 
          rentalId: response.data.id,
          isNewRental: true // Flag para mostrar mensagem de sucesso
        });
      } else if (response.status === 409) {
        // Item foi alugado por outro usuário
        Alert.alert(
          'Item Indisponível',
          'Este item não está mais disponível para aluguel.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Store')
            }
          ]
        );
      } else {
        throw new Error(response.message || 'Erro ao criar aluguel');
      }
    } catch (error) {
      console.error('❌ Erro ao processar pagamento:', error);
      Alert.alert(
        'Erro no Pagamento',
        'Não foi possível processar o pagamento. Tente novamente.',
        [
          {
            text: 'Tentar Novamente',
            onPress: () => navigation.goBack()
          },
          {
            text: 'Cancelar',
            onPress: () => navigation.navigate('Store'),
            style: 'cancel'
          }
        ]
      );
    }
  };

  /**
   * Função auxiliar para delay
   */
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* Background verde */}
      <View style={[styles.background, { height: screenHeight * 0.4 }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Processando</Text>
          <Text style={styles.headerSubtitle}>Aguarde um momento...</Text>
        </View>
      </View>

      {/* Card branco com conteúdo */}
      <View style={[styles.contentCard, { minHeight: screenHeight * 0.6 }]}>
        
        {/* Loading indicator animado */}
        <View style={styles.loadingContainer}>
          <Animated.View style={[styles.loadingCircle, { opacity: fadeAnim }]}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </Animated.View>
        </View>

        {/* Mensagem de processamento atual */}
        <Animated.Text style={[styles.processingText, { opacity: fadeAnim }]}>
          {processingMessages[processingStep]}
        </Animated.Text>

        {/* Informações do item */}
        <View style={styles.itemInfoContainer}>
          <View style={styles.itemInfoRow}>
            <Text style={styles.itemInfoLabel}>Item:</Text>
            <Text style={styles.itemInfoValue}>{item.title}</Text>
          </View>
          
          <View style={styles.itemInfoRow}>
            <Text style={styles.itemInfoLabel}>Período:</Text>
            <Text style={styles.itemInfoValue}>{days} {days === 1 ? 'dia' : 'dias'}</Text>
          </View>
          
          <View style={styles.itemInfoRow}>
            <Text style={styles.itemInfoLabel}>Total:</Text>
            <Text style={styles.itemInfoValueHighlight}>
              R$ {totalPrice.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Indicador de progresso visual */}
        <View style={styles.progressContainer}>
          {processingMessages.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                processingStep >= index && styles.progressDotActive
              ]}
            />
          ))}
        </View>

        {/* Mensagem de segurança */}
        <Text style={styles.securityText}>
          🔒 Transação segura e criptografada
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.darkText,
    opacity: 0.8,
  },
  contentCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    paddingTop: 50,
    paddingHorizontal: 30,
    paddingBottom: 40,
    shadowColor: COLORS.darkText,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
    alignItems: 'center',
  },
  loadingContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  loadingCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.darkText,
    marginBottom: 40,
    textAlign: 'center',
  },
  itemInfoContainer: {
    width: '100%',
    backgroundColor: COLORS.background,
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  itemInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemInfoLabel: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
  },
  itemInfoValue: {
    fontSize: 14,
    color: COLORS.darkText,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  itemInfoValueHighlight: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    gap: 12,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.lightGray,
  },
  progressDotActive: {
    backgroundColor: COLORS.primary,
    transform: [{ scale: 1.2 }],
  },
  securityText: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 10,
  },
});

export default ProcessingPaymentScreen;
