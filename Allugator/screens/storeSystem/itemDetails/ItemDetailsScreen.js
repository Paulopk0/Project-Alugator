/**
 * ItemDetailsScreen - Tela de detalhes do item
 * 
 * Exibe informações completas sobre um item e permite:
 * - Visualizar fotos, descrição, preço
 * - Selecionar quantidade de dias para aluguel
 * - Verificar disponibilidade em tempo real
 * - Confirmar reserva e ir para pagamento
 * 
 * Fluxo: Store/Search → ItemDetails → Payment → RentalTracking
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { getItemImage } from '../../../assets/images/imageMap';
import { checkItemAvailability } from '../../../apis/RentalApi';

// Paleta de cores do aplicativo
const COLORS = {
  background: '#F0FFF0',
  primary: '#1DE9B6',
  darkText: '#444444ff',
  white: '#FFFFFF',
  lightGray: '#E0E0E0',
  gray: '#888888',
  lightGreen: '#E8F5E9',
  shadow: '#00000026',
};

const ItemDetailsScreen = ({ route, navigation }) => {
  // Dimensões da tela
  const screenHeight = Dimensions.get('window').height;
  const screenWidth = Dimensions.get('window').width;
  
  // Recebe item da navegação (vindo de Store ou Search)
  const { item } = route.params;
  
  // ESTADOS DO COMPONENTE
  const [selectedDays, setSelectedDays] = useState(3); // Quantidade de dias para aluguel (padrão: 3)
  const [totalPrice, setTotalPrice] = useState(0); // Preço total calculado (dias × preço/dia)
  const [isAvailable, setIsAvailable] = useState(true); // Item está disponível?
  const [checkingAvailability, setCheckingAvailability] = useState(true); // Verificando disponibilidade?
  const [currentRental, setCurrentRental] = useState(null); // Aluguel atual (se item estiver alugado)

  /**
   * Verifica disponibilidade do item via API ao carregar a tela
   * Consulta se o item está em uso por outro usuário
   */
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setCheckingAvailability(true);
        const response = await checkItemAvailability(item.id);
        setIsAvailable(response.available);
        setCurrentRental(response.currentRental); // Dados do aluguel atual, se existir
      } catch (error) {
        console.error('Erro ao verificar disponibilidade:', error);
        // Em caso de erro na API, usa o status do item como fallback
        setIsAvailable(item.status === 'available');
      } finally {
        setCheckingAvailability(false);
      }
    };
    
    fetchAvailability();
  }, [item.id]);

  /**
   * Recalcula o preço total sempre que os dias mudam
   * Preço total = preço por dia × quantidade de dias
   */
  useEffect(() => {
    const pricePerDay = parseFloat(item.priceDaily || item.price_per_day || item.price || 0);
    setTotalPrice(pricePerDay * selectedDays);
  }, [selectedDays, item]);

  /**
   * Incrementa quantidade de dias
   * Sem limite superior
   */
  const incrementDays = () => {
    setSelectedDays(prev => prev + 1);
  };

  /**
   * Decrementa quantidade de dias
   * Mínimo: 1 dia
   */
  const decrementDays = () => {
    if (selectedDays > 1) {
      setSelectedDays(prev => prev - 1);
    }
  };

  /**
   * Confirma reserva e navega para tela de pagamento
   * Passa item, dias e preço total calculado
   */
  const handleConfirm = () => {
    navigation.navigate('Payment', {
      item: item,
      days: selectedDays,
      totalPrice: totalPrice,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background verde */}
      <View style={[styles.background, { height: screenHeight * 0.18 }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Informações</Text>
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

          {/* Informações básicas */}
          <View style={styles.infoSection}>
            <Text style={styles.itemTitle}>{item.title || item.name}</Text>
            <Text style={styles.itemDescription}>
              {item.description || 'Descrição não disponível'}
            </Text>
          </View>

          {/* Configuração de Período */}
          <View style={styles.periodSection}>
            <Text style={styles.sectionTitle}>Configure o Período do Aluguel</Text>
            
            <View style={styles.periodConfig}>
              <View style={styles.periodInfo}>
                <Text style={styles.periodLabel}>Período por dias</Text>
                <View style={styles.periodControl}>
                  <TouchableOpacity 
                    style={styles.periodButton}
                    onPress={decrementDays}
                  >
                    <Text style={styles.periodButtonText}>−</Text>
                  </TouchableOpacity>
                  
                  <View style={styles.daysDisplay}>
                    <Text style={styles.daysNumber}>{selectedDays}</Text>
                    <Text style={styles.daysLabel}>Dias</Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.periodButton}
                    onPress={incrementDays}
                  >
                    <Text style={styles.periodButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.priceInfo}>
                <Text style={styles.priceLabel}>Preço Total</Text>
                <Text style={styles.priceValue}>
                  R$ {totalPrice.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>

          {/* Disponibilidade do Item */}
          <View style={styles.availabilitySection}>
            <Text style={styles.sectionTitle}>Disponibilidade do Item</Text>
            
            {checkingAvailability ? (
              <View style={styles.availabilityCard}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.checkingText}>Verificando disponibilidade...</Text>
              </View>
            ) : (
              <View style={[
                styles.availabilityCard,
                isAvailable ? styles.availableCard : styles.unavailableCard
              ]}>
                <View style={styles.availabilityContent}>
                  <View style={[
                    styles.statusIndicator,
                    isAvailable ? styles.availableIndicator : styles.unavailableIndicator
                  ]} />
                  <View style={styles.availabilityText}>
                    <Text style={styles.availabilityTitle}>
                      {isAvailable ? 'Disponível' : 'Em uso'}
                    </Text>
                    <Text style={styles.availabilityDescription}>
                      {isAvailable 
                        ? 'Este item está disponível para aluguel' 
                        : currentRental 
                          ? `Alugado até ${new Date(currentRental.endDate).toLocaleDateString('pt-BR')}`
                          : 'Este item está sendo usado por outro usuário'}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Descrição do Item */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Descrição do Item</Text>
            <Text style={styles.descriptionText}>
              {item.description || 'Item sem descrição detalhada no momento.'}
            </Text>
            
            {/* Informações adicionais */}
            {item.category && (
              <View style={styles.additionalInfo}>
                <Text style={styles.infoLabel}>Categoria:</Text>
                <Text style={styles.infoValue}>{item.category}</Text>
              </View>
            )}
            {item.location && (
              <View style={styles.additionalInfo}>
                <Text style={styles.infoLabel}>Localização:</Text>
                <Text style={styles.infoValue}>{item.location}</Text>
              </View>
            )}
          </View>

          {/* Botão Confirmar Solicitação */}
          <TouchableOpacity
            style={[
              styles.confirmButton,
              !isAvailable && styles.confirmButtonDisabled
            ]}
            onPress={handleConfirm}
            disabled={!isAvailable}
          >
            <Text style={styles.confirmButtonText}>
              {isAvailable ? 'CONFIRMAR RESERVA E PAGAR' : 'ITEM INDISPONÍVEL'}
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
    zIndex: 0,
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
    boxShadow: `0px -3px 10px ${COLORS.shadow}`,
    elevation: 10,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: COLORS.lightGray,
    marginBottom: 20,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  infoSection: {
    marginBottom: 25,
  },
  itemTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginBottom: 8,
  },
  itemDescription: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
  },
  periodSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginBottom: 15,
  },
  periodConfig: {
    backgroundColor: COLORS.lightGreen,
    borderRadius: 20,
    padding: 20,
  },
  periodInfo: {
    marginBottom: 20,
  },
  periodLabel: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 15,
  },
  periodControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  periodButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  periodButtonText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.darkText,
  },
  daysDisplay: {
    alignItems: 'center',
  },
  daysNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.darkText,
  },
  daysLabel: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
  },
  priceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  priceLabel: {
    fontSize: 16,
    color: COLORS.gray,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  availabilitySection: {
    marginBottom: 25,
  },
  availabilityCard: {
    borderRadius: 15,
    padding: 20,
  },
  availableCard: {
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  unavailableCard: {
    backgroundColor: '#FFEBEE',
    borderWidth: 2,
    borderColor: '#EF5350',
  },
  availabilityContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 15,
  },
  availableIndicator: {
    backgroundColor: COLORS.primary,
  },
  unavailableIndicator: {
    backgroundColor: '#EF5350',
  },
  availabilityText: {
    flex: 1,
  },
  availabilityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginBottom: 4,
  },
  availabilityDescription: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
  },
  checkingText: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 10,
    textAlign: 'center',
  },
  descriptionSection: {
    marginBottom: 30,
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.darkText,
    lineHeight: 22,
    marginBottom: 15,
  },
  additionalInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginRight: 8,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.gray,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 25,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 10,
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.2)',
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

export default ItemDetailsScreen;
