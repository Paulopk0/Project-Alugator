/**
 * PaymentScreen - Tela de confirmação de pagamento
 * 
 * Exibe resumo do aluguel e processa o pagamento.
 * Fluxo: ItemDetails → Payment → RentalTracking
 * 
 * Funcionalidades:
 * - Exibe resumo: item, período, valores
 * - Calcula preço total (subtotal - descontos)
 * - Cria aluguel no banco via API
 * - Navega para acompanhamento do aluguel
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  Dimensions,
} from 'react-native';
import { getItemImage } from '../../../assets/images/imageMap';
import { createRental } from '../../../apis/RentalApi';

// Paleta de cores do aplicativo
const COLORS = {
  background: '#F0FFF0',
  primary: '#1DE9B6',
  darkText: '#444444ff',
  white: '#FFFFFF',
  lightGray: '#E0E0E0',
  gray: '#888888',
  lightGreen: '#E8F5E9',
};

const PaymentScreen = ({ route, navigation }) => {
  const screenHeight = Dimensions.get('window').height;
  
  // Recebe dados da navegação (de ItemDetails)
  const { item, days, totalPrice } = route.params;
  
  // Estado de processamento do pagamento
  const [isProcessing, setIsProcessing] = useState(false);

  // CÁLCULOS DE VALORES
  const pricePerDay = parseFloat(item.priceDaily || 0); // Preço por dia
  const subtotal = pricePerDay * days; // Subtotal sem descontos
  const couponDiscount = 0; // Desconto de cupom (não implementado ainda)
  const total = subtotal - couponDiscount; // Total final

  /**
   * Confirma pagamento e cria aluguel no banco
   * 
   * Processo:
   * 1. Calcula data de início (hoje) e data de fim (hoje + dias)
   * 2. Monta objeto com dados do aluguel
   * 3. Envia para API criar registro no banco
   * 4. Se sucesso → navega para RentalTracking
   * 5. Se item indisponível (409) → mostra alerta e volta
   * 6. Se erro → mostra mensagem de erro
   */
  const handleConfirmPayment = async () => {
    try {
      setIsProcessing(true);
      
      // Calcula datas de início e fim do aluguel
      const startDate = new Date(); // Data de hoje
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days); // Adiciona quantidade de dias
      
      // Monta objeto com dados do aluguel
      const rentalData = {
        itemId: item.id,
        startDate: startDate.toISOString(), // Formato ISO 8601
        endDate: endDate.toISOString(),
        days: days,
        pricePerDay: pricePerDay,
        totalPrice: total
      };
      
      // Cria aluguel via API
      const response = await createRental(rentalData);
      
      if (response.status === 201) {
        // Sucesso: navega para tela de acompanhamento
        // replace() remove Payment do histórico (não pode voltar)
        navigation.replace('RentalTracking', { 
          rentalId: response.data.id 
        });
      } else if (response.status === 409) {
        // Item foi alugado por outro usuário entre a verificação e o pagamento
        Alert.alert(
          'Item Indisponível',
          'Este item não está mais disponível para aluguel.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        // Outro erro
        throw new Error(response.message || 'Erro ao criar aluguel');
      }
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      Alert.alert(
        'Erro',
        'Não foi possível processar o pagamento. Tente novamente.',
        [
          {
            text: 'OK'
          }
        ]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background verde */}
      <View style={[styles.background, { height: screenHeight * 0.18 }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Pagamento</Text>
        </View>
      </View>

      {/* Botão de voltar (acima de tudo) */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContainer, { paddingTop: screenHeight * 0.18 }]}
      >
        {/* Card branco com conteúdo */}
        <View style={[styles.contentCard, { minHeight: screenHeight * 0.82 }]}>

          {/* Imagem do item */}
          <View style={styles.imageContainer}>
            <Image
              source={getItemImage(item.photos || item.photo)}
              style={styles.itemImage}
              resizeMode="cover"
            />
          </View>

          {/* Resumo do Aluguel */}
          <View style={styles.summarySection}>
            <Text style={styles.summaryTitle}>Resumo Do Aluguel</Text>
            <Text style={styles.itemName}>{item.title || item.name}</Text>
          </View>

          {/* Período */}
          <View style={styles.periodSection}>
            <Text style={styles.periodLabel}>Período:</Text>
            <Text style={styles.periodValue}>{days} Dias</Text>
          </View>

          {/* Valores */}
          <View style={styles.valuesSection}>
            <View style={styles.valueRow}>
              <Text style={styles.valueLabel}>Subtotal por Dia/dia:</Text>
              <Text style={styles.valueAmount}>R${pricePerDay.toFixed(2)}</Text>
            </View>
            
            <View style={styles.valueRow}>
              <Text style={styles.valueLabel}>Total Do Aluguel (por {days} dias):</Text>
              <Text style={styles.valueAmount}>R${subtotal.toFixed(2)}</Text>
            </View>
            
            <View style={styles.valueRow}>
              <Text style={styles.valueLabel}>Valor Do Cupom: (desconsidere):</Text>
              <Text style={styles.valueAmount}>R${couponDiscount.toFixed(2)}</Text>
            </View>
            
            <View style={[styles.valueRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalAmount}>R${total.toFixed(2)}</Text>
            </View>
          </View>

          {/* Método de Pagamento */}
          <View style={styles.paymentMethodSection}>
            <Text style={styles.sectionTitle}>Método De Pagamento</Text>
            
            <View style={styles.pixCard}>
              <View style={styles.pixHeader}>
                <View style={styles.pixIconContainer}>
                  <Text style={styles.pixIcon}>💳</Text>
                </View>
                <View style={styles.pixInfo}>
                  <Text style={styles.pixTitle}>Pix</Text>
                  <Text style={styles.pixDescription}>Pagamento Mais Fácil</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Botão Confirmar Pagamento */}
          <TouchableOpacity
            style={[
              styles.confirmButton,
              isProcessing && styles.confirmButtonDisabled
            ]}
            onPress={handleConfirmPayment}
            disabled={isProcessing}
          >
            <Text style={styles.confirmButtonText}>
              {isProcessing ? 'PROCESSANDO...' : 'CONFIRMAR PAGAMENTO'}
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
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
  },
  headerContent: {
    paddingTop: 15,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 15,
    left: 20,
    zIndex: 999,
    padding: 5,
  },
  backIcon: {
    fontSize: 28,
    color: COLORS.darkText,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.darkText,
  },
  scrollContainer: {
  },
  contentCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 100,
    shadowColor: '#00000026',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  printerButton: {
    backgroundColor: COLORS.lightGreen,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  printerIcon: {
    fontSize: 20,
  },
  printerText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkText,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: COLORS.lightGray,
    marginBottom: 20,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  summarySection: {
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    color: COLORS.gray,
  },
  periodSection: {
    marginBottom: 20,
  },
  periodLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginBottom: 4,
  },
  periodValue: {
    fontSize: 16,
    color: COLORS.gray,
  },
  valuesSection: {
    marginBottom: 25,
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  valueLabel: {
    fontSize: 14,
    color: COLORS.gray,
    flex: 1,
  },
  valueAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkText,
  },
  totalRow: {
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkText,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  paymentMethodSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginBottom: 15,
  },
  pixCard: {
    backgroundColor: COLORS.lightGreen,
    borderRadius: 15,
    padding: 20,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  pixHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pixIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  pixIcon: {
    fontSize: 24,
  },
  pixInfo: {
    flex: 1,
  },
  pixTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginBottom: 4,
  },
  pixDescription: {
    fontSize: 14,
    color: COLORS.gray,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 25,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  confirmButtonDisabled: {
    backgroundColor: COLORS.lightGray,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
});

export default PaymentScreen;
