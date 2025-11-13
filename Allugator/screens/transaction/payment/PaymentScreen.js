/**
 * PaymentScreen - Tela de Resumo Final e Checkout
 * 
 * Tela completa de revisão antes do pagamento com:
 * - Resumo da reserva (item, período, localização)
 * - Detalhamento de custos (aluguel, taxa de serviço, seguro, total)
 * - Seletor de método de pagamento
 * - Informações de contato
 * 
 * Fluxo: ItemDetails → Payment (Checkout) → ProcessingPayment → RentalTracking
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
  TextInput,
} from 'react-native';
import { getItemImage } from '../../../assets/images/imageMap';

// Paleta de cores do aplicativo
const COLORS = {
  background: '#F0FFF0',
  primary: '#1DE9B6',
  darkText: '#444444ff',
  white: '#FFFFFF',
  lightGray: '#E0E0E0',
  gray: '#888888',
  lightGreen: '#E8F5E9',
  error: '#FF5252',
  warning: '#FFA726',
};

const PaymentScreen = ({ route, navigation }) => {
  const screenHeight = Dimensions.get('window').height;
  
  // Recebe dados da navegação (de ItemDetails)
  const { item, days, totalPrice } = route.params;
  
  // Estados
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('pix'); // 'pix', 'credit_card', 'add_card'
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  // CÁLCULOS DE VALORES DETALHADOS
  const pricePerDay = parseFloat(item.priceDaily || 0);
  const rentalValue = pricePerDay * days; // Valor do aluguel
  const serviceFeePercentage = 0.10; // 10% de taxa de serviço
  const serviceFee = rentalValue * serviceFeePercentage; // Taxa de serviço
  const insuranceValue = 15.00; // Valor fixo do seguro/caução (opcional)
  const total = rentalValue + serviceFee + insuranceValue; // TOTAL FINAL

  // Métodos de pagamento disponíveis
  const paymentMethods = [
    { id: 'pix', name: 'PIX', icon: '💳', subtitle: 'Aprovação instantânea' },
    { id: 'credit_card', name: 'Cartão de Crédito', icon: '💳', subtitle: '**** **** **** 1234' },
    { id: 'add_card', name: 'Adicionar Novo Cartão', icon: '➕', subtitle: 'Cadastrar novo cartão' },
  ];

  /**
   * Valida informações e navega para tela de processamento de pagamento
   */
  const handleProceedToPayment = () => {
    // Validação básica
    if (!selectedPaymentMethod) {
      Alert.alert('Atenção', 'Por favor, selecione um método de pagamento.');
      return;
    }

    if (contactPhone && contactPhone.length < 10) {
      Alert.alert('Atenção', 'Por favor, insira um telefone válido.');
      return;
    }

    if (contactEmail && !contactEmail.includes('@')) {
      Alert.alert('Atenção', 'Por favor, insira um e-mail válido.');
      return;
    }

    // Navega para ProcessingPayment com todos os dados
    navigation.navigate('ProcessingPayment', {
      item: item,
      days: days,
      totalPrice: total,
      paymentMethod: selectedPaymentMethod,
      contactInfo: {
        phone: contactPhone,
        email: contactEmail
      },
      breakdown: {
        rentalValue,
        serviceFee,
        insuranceValue,
        total
      }
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background verde */}
      <View style={[styles.background, { height: screenHeight * 0.18 }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Resumo Final</Text>
          <Text style={styles.headerSubtitle}>Revise antes de prosseguir</Text>
        </View>
      </View>

      {/* Botão de voltar */}
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
        <View style={[styles.contentCard, { minHeight: screenHeight * 0.82 }]}>

          {/* ========== SEÇÃO 1: RESUMO DA RESERVA ========== */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>📋</Text>
              <Text style={styles.sectionTitle}>Resumo da Reserva</Text>
            </View>

            <View style={styles.reservationCard}>
              {/* Imagem do item */}
              <View style={styles.itemImageContainer}>
                <Image
                  source={getItemImage(item.photos || item.photo)}
                  style={styles.itemImage}
                  resizeMode="cover"
                />
              </View>

              {/* Informações do item */}
              <View style={styles.itemInfoContainer}>
                <Text style={styles.itemName}>{item.title || item.name}</Text>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoIcon}>📅</Text>
                  <Text style={styles.infoText}>{days} Dias</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoIcon}>📍</Text>
                  <Text style={styles.infoText}>
                    {item.location || 'Curitiba, PR'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* ========== SEÇÃO 2: DETALHAMENTO DE CUSTOS ========== */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>💰</Text>
              <Text style={styles.sectionTitle}>Detalhamento de Custos</Text>
            </View>

            <View style={styles.costsCard}>
              {/* Valor do Aluguel */}
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Valor do Aluguel</Text>
                <Text style={styles.costValue}>R$ {rentalValue.toFixed(2)}</Text>
              </View>
              <Text style={styles.costDetail}>
                R$ {pricePerDay.toFixed(2)} × {days} dias
              </Text>

              {/* Taxa de Serviço */}
              <View style={[styles.costRow, { marginTop: 12 }]}>
                <Text style={styles.costLabel}>Taxa de Serviço (10%)</Text>
                <Text style={styles.costValue}>+ R$ {serviceFee.toFixed(2)}</Text>
              </View>

              {/* Seguro/Caução */}
              <View style={styles.costRow}>
                <View style={styles.costLabelWithBadge}>
                  <Text style={styles.costLabel}>Valor do Seguro</Text>
                  <View style={styles.optionalBadge}>
                    <Text style={styles.optionalText}>Opcional</Text>
                  </View>
                </View>
                <Text style={styles.costValue}>+ R$ {insuranceValue.toFixed(2)}</Text>
              </View>
              <Text style={styles.costDetail}>
                Proteção contra danos e imprevistos
              </Text>

              {/* Linha separadora */}
              <View style={styles.divider} />

              {/* TOTAL FINAL */}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>TOTAL FINAL</Text>
                <Text style={styles.totalValue}>R$ {total.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          {/* ========== SEÇÃO 3: MÉTODO DE PAGAMENTO ========== */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>💳</Text>
              <Text style={styles.sectionTitle}>Método de Pagamento</Text>
            </View>

            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethodCard,
                  selectedPaymentMethod === method.id && styles.paymentMethodCardActive
                ]}
                onPress={() => setSelectedPaymentMethod(method.id)}
              >
                <View style={styles.paymentMethodContent}>
                  <View style={styles.paymentMethodLeft}>
                    <Text style={styles.paymentMethodIcon}>{method.icon}</Text>
                    <View style={styles.paymentMethodInfo}>
                      <Text style={styles.paymentMethodName}>{method.name}</Text>
                      <Text style={styles.paymentMethodSubtitle}>{method.subtitle}</Text>
                    </View>
                  </View>
                  
                  {/* Radio button */}
                  <View style={[
                    styles.radioButton,
                    selectedPaymentMethod === method.id && styles.radioButtonActive
                  ]}>
                    {selectedPaymentMethod === method.id && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* ========== SEÇÃO 4: INFORMAÇÕES DE CONTATO ========== */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>📞</Text>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>Informações de Contato</Text>
                <View style={styles.optionalBadge}>
                  <Text style={styles.optionalText}>Opcional</Text>
                </View>
              </View>
            </View>

            <Text style={styles.contactDescription}>
              Para facilitar o contato sobre retirada/entrega
            </Text>

            {/* Campo Telefone */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Telefone</Text>
              <TextInput
                style={styles.input}
                placeholder="(XX) XXXXX-XXXX"
                placeholderTextColor={COLORS.gray}
                keyboardType="phone-pad"
                value={contactPhone}
                onChangeText={setContactPhone}
                maxLength={15}
              />
            </View>

            {/* Campo E-mail */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>E-mail</Text>
              <TextInput
                style={styles.input}
                placeholder="seu@email.com"
                placeholderTextColor={COLORS.gray}
                keyboardType="email-address"
                autoCapitalize="none"
                value={contactEmail}
                onChangeText={setContactEmail}
              />
            </View>
          </View>

          {/* ========== BOTÃO PRINCIPAL ========== */}
          <TouchableOpacity
            style={styles.mainButton}
            onPress={handleProceedToPayment}
            activeOpacity={0.8}
          >
            <Text style={styles.mainButtonText}>
              PROSSEGUIR PARA PAGAMENTO
            </Text>
            <Text style={styles.mainButtonSubtext}>
              R$ {total.toFixed(2)}
            </Text>
          </TouchableOpacity>

          {/* Mensagem de segurança */}
          <View style={styles.securityMessage}>
            <Text style={styles.securityIcon}>🔒</Text>
            <Text style={styles.securityText}>
              Seus dados estão protegidos com criptografia de ponta a ponta
            </Text>
          </View>

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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.darkText,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.darkText,
    opacity: 0.7,
    marginTop: 4,
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
  scrollContainer: {},
  contentCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 40,
    shadowColor: '#00000026',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  
  // Seções
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkText,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  
  // Card de Reserva
  reservationCard: {
    backgroundColor: COLORS.background,
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    gap: 15,
  },
  itemImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.lightGray,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemInfoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  infoIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  
  // Card de Custos
  costsCard: {
    backgroundColor: COLORS.background,
    borderRadius: 15,
    padding: 18,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  costLabelWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  costLabel: {
    fontSize: 15,
    color: COLORS.darkText,
  },
  costValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.darkText,
  },
  costDetail: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 8,
  },
  optionalBadge: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  optionalText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: 15,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkText,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  
  // Método de Pagamento
  paymentMethodCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  paymentMethodCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.lightGreen,
  },
  paymentMethodContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginBottom: 2,
  },
  paymentMethodSubtitle: {
    fontSize: 13,
    color: COLORS.gray,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonActive: {
    borderColor: COLORS.primary,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  
  // Informações de Contato
  contactDescription: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkText,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: COLORS.darkText,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  
  // Botão Principal
  mainButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 25,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  mainButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  mainButtonSubtext: {
    fontSize: 13,
    color: COLORS.white,
    marginTop: 2,
    opacity: 0.9,
  },
  
  // Mensagem de Segurança
  securityMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: COLORS.background,
    borderRadius: 10,
    gap: 8,
  },
  securityIcon: {
    fontSize: 16,
  },
  securityText: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
    flex: 1,
  },
});

export default PaymentScreen;
