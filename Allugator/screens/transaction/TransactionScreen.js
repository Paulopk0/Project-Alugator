/**
 * TransactionScreen - Tela de Transações
 * 
 * Exibe as transações do usuário divididas em duas abas:
 * 
 * 📦 MEUS ITENS: 
 *    - TODOS os itens que EU SOU DONO (anunciados)
 *    - API: getMyItems() - busca items onde ownerId = userId
 *    - Mostra status: available, rented, etc.
 * 
 * 📝 MEUS ALUGUÉIS:
 *    - Itens que EU ESTOU ALUGANDO de outras pessoas
 *    - API: getUserRentals() - filtra por renterId
 *    - Mostra informações do aluguel ativo
 * 
 * Funcionalidades:
 * - Toggle entre as duas abas
 * - Lista de itens com status e informações
 * - Pull-to-refresh
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { getItemImage } from '../../assets/images/imageMap';
import { getUserRentals, confirmReturn } from '../../apis/RentalApi';
import { getMyItems } from '../../apis/ItemApi';
import { deleteItem } from '../../apis/ItemManagementApi';
import MessageDisplay from '../../components/MessageDisplay/MessageDisplay';

// Paleta de cores do aplicativo
const COLORS = {
  background: '#F0FFF0',
  primary: '#1DE9B6',
  darkText: '#444444ff',
  white: '#FFFFFF',
  lightGray: '#E0E0E0',
  gray: '#888888',
  lightGreen: '#D4F4DD',
  green: '#1DE9B6',
  red: '#FF5252',
  shadow: '#00000026',
};

const TransactionScreen = ({ navigation }) => {
  const { height: screenHeight } = Dimensions.get('window');
  
  // Estado: aba selecionada ('myItems' ou 'myRentals')
  const [selectedTab, setSelectedTab] = useState('myItems');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Estados para dados
  const [myItems, setMyItems] = useState([]);
  const [myRentals, setMyRentals] = useState([]);
  
  // Estados para mensagens
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');
  
  // Estado para confirmação de delete
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  // Carrega dados ao montar o componente
  useEffect(() => {
    loadTransactions();
  }, []);

  // Atualiza quando a tab é clicada
  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [])
  );

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setMessage('');
      
      const rentalsResponse = await getUserRentals();
      const myItemsResponse = await getMyItems();
      
      // Processa "Meus Aluguéis" - itens que EU estou alugando de outras pessoas
      if (rentalsResponse.rentals) {
        const formattedRentals = rentalsResponse.rentals.map(rental => ({
          id: rental.id,
          rentalId: rental.id,
          name: rental.itemTitle,
          image: rental.itemPhoto ? rental.itemPhoto.split(',')[0] : 'default',
          pricePerDay: rental.pricePerDay,
          rentedUntil: formatDate(rental.endDate),
          status: getStatusFromRental(rental.status),
          rawStatus: rental.status,
        }));
        setMyRentals(formattedRentals);
      }
      
      // Processa "Meus Itens" - TODOS os itens que EU criei
      if (myItemsResponse.items) {
        const formattedItems = myItemsResponse.items.map(item => {
          // Pega a primeira foto do array
          const firstPhoto = Array.isArray(item.photos) && item.photos.length > 0 
            ? item.photos[0] 
            : 'default';
            
          return {
            id: item.id,
            name: item.title,
            image: firstPhoto,
            pricePerDay: item.priceDaily,
            status: getStatusFromItem(item.status), // Nova função para status de item
            rawStatus: item.status,
            category: item.category,
            condition: item.condition,
            publishDate: formatDate(item.publishDate),
            description: item.description,
            location: item.location,
            securityDeposit: item.securityDeposit,
            // Informações do aluguel ativo (se existir)
            rentalId: item.activeRental?.id,
            renterName: item.activeRental?.renter?.name,
            renterEmail: item.activeRental?.renter?.email,
            rentalStartDate: item.activeRental?.startDate,
            rentalEndDate: item.activeRental?.endDate,
          };
        });
        setMyItems(formattedItems);
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar transações:', error);
      setMessage('Erro ao carregar transações: ' + error.message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // Formata data para DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return 'Data não disponível';
    
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  // Mapeia status do banco para status visual (para aluguéis)
  const getStatusFromRental = (status) => {
    switch (status) {
      case 'completed':
      case 'returned':
        return 'devolvido';
      case 'active':
      case 'confirmed':
        return 'em_uso';
      case 'pending':
        return 'aguardando';
      default:
        return 'em_uso';
    }
  };

  // Mapeia status do item (para meus itens criados)
  const getStatusFromItem = (status) => {
    switch (status) {
      case 'available':
        return 'disponivel';
      case 'rented':
        return 'alugado';
      case 'unavailable':
        return 'indisponivel';
      default:
        return 'disponivel';
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const handleReturn = async (rentalId) => {
    try {
      console.log('🔄 Devolvendo item, rentalId:', rentalId);
      
      const response = await confirmReturn(rentalId);
      
      if (response.status === 200) {
        setMessage('Item devolvido com sucesso!');
        setMessageType('success');
        await loadTransactions();
      } else {
        setMessage(response.message || 'Erro ao devolver item');
        setMessageType('error');
      }
    } catch (error) {
      console.error('❌ Erro ao devolver item:', error);
      setMessage('Erro ao devolver item: ' + error.message);
      setMessageType('error');
    }
  };

  // Navega para tela de edição do item
  const handleEditItem = (item) => {
    console.log('✏️ Editando item:', item.id);
    
    try {
      navigation.navigate('EditItem', { 
        item: {
          id: item.id,
          title: item.name,
          priceDaily: item.pricePerDay,
          category: item.category,
          condition: item.condition,
          status: item.rawStatus,
          photos: item.image,
          description: item.description || '',
          location: item.location || '',
          securityDeposit: item.securityDeposit || 0,
        }
      });
      console.log('✅ Navegação para EditItem iniciada');
    } catch (error) {
      console.error('❌ Erro ao navegar para EditItem:', error);
      Alert.alert('Erro', 'Não foi possível abrir a tela de edição: ' + error.message);
    }
  };

  // Deleta um item
  const handleDeleteItem = async (item) => {
    // Abre o modal de confirmação
    setDeleteConfirmation(item);
  };

  // Confirma e executa a deleção
  const confirmDelete = async () => {
    if (!deleteConfirmation) return;
    
    const item = deleteConfirmation;
    
    try {
      const response = await deleteItem(item.id);
      
      // Verifica se a deleção foi bem-sucedida
      if (response && (response.status === 200 || response.message === 'Item deletado com sucesso!' || response.success === true)) {
        setMessage('Item excluído com sucesso!');
        setMessageType('success');
        setDeleteConfirmation(null);
        await loadTransactions();
      } else {
        const errorMsg = response?.message || 'Erro ao excluir item';
        setMessage(errorMsg);
        setMessageType('error');
        setDeleteConfirmation(null);
      }
    } catch (error) {
      const errorMsg = 'Erro ao excluir item: ' + error.message;
      setMessage(errorMsg);
      setMessageType('error');
      setDeleteConfirmation(null);
    }
  };

  // Cancela a deleção
  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

  const renderItemCard = (item) => {
    // Verifica se é um item (tem publishDate) ou um aluguel (tem rentedUntil)
    const isMyItem = item.publishDate !== undefined;
    const isRental = item.rentedUntil !== undefined;
    
    // Status para itens
    const isAvailable = item.status === 'disponivel';
    const isRented = item.status === 'alugado';
    const isUnavailable = item.status === 'indisponivel';
    
    // Status para aluguéis
    const isReturned = item.status === 'devolvido';
    const isInUse = item.status === 'em_uso';

    return (
      <View key={item.id} style={styles.itemCard}>
        {/* Imagem e Informações */}
        <View style={styles.itemContent}>
          <Image
            source={getItemImage(item.image)}
            style={styles.itemImage}
            resizeMode="cover"
          />
          
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>
              R${item.pricePerDay.toFixed(2)}/Dia
            </Text>
            
            {isMyItem && (
              <>
                <Text style={styles.itemDate}>
                  Publicado em {item.publishDate}
                </Text>
                
                {/* Mostra informações do aluguel se o item estiver alugado */}
                {isRented && item.renterName && (
                  <View style={styles.rentalInfoBox}>
                    <Text style={styles.rentalLabel}>🧑 Alugado por:</Text>
                    <Text style={styles.rentalValue}>{item.renterName}</Text>
                    <Text style={styles.rentalEmail}>{item.renterEmail}</Text>
                    {item.rentalStartDate && item.rentalEndDate && (
                      <Text style={styles.rentalDates}>
                        📅 {item.rentalStartDate} até {item.rentalEndDate}
                      </Text>
                    )}
                  </View>
                )}
              </>
            )}
            
            {isRental && (
              <Text style={styles.itemDate}>
                Até {item.rentedUntil}
              </Text>
            )}
          </View>
        </View>

        {/* Status e Botões para ITENS */}
        {isMyItem && (
          <View style={styles.itemActions}>
            {/* Badge de Status */}
            <View style={styles.statusBadge}>
              {isAvailable && <Text style={[styles.statusText, { color: COLORS.green }]}>Disponível</Text>}
              {isRented && <Text style={[styles.statusText, { color: COLORS.primary }]}>Alugado</Text>}
              {isUnavailable && <Text style={[styles.statusText, { color: COLORS.gray }]}>Indisponível</Text>}
            </View>
            
            {/* Botões quando disponível */}
            {isAvailable && (
              <>
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => handleEditItem(item)}
                >
                  <Text style={styles.editButtonText}>✏️ Editar</Text>
                </TouchableOpacity>

                {/* Botão de Deletar - só aparece quando disponível */}
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDeleteItem(item)}
                >
                  <Text style={styles.deleteButtonText}>✕</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Botão de Acompanhar quando alugado */}
            {isRented && item.rentalId && (
              <TouchableOpacity 
                style={styles.trackButton}
                onPress={() => navigation.navigate('RentalTracking', { rentalId: item.rentalId })}
              >
                <Text style={styles.trackButtonText}>📍 Acompanhar</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Status e Botões para ALUGUÉIS */}
        {isRental && isReturned && (
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Devolvido</Text>
          </View>
        )}

        {isRental && isInUse && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.inUseButton}
              onPress={() => navigation.navigate('RentalTracking', { rentalId: item.rentalId })}
            >
              <Text style={styles.inUseButtonText}>📍 Acompanhar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.returnButton}
              onPress={() => handleReturn(item.rentalId)}
            >
              <Text style={styles.returnButtonText}>Devolver</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {/* ScrollView que empurra o conteúdo */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        bounces={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Background verde com header e tabs - DENTRO do ScrollView */}
        <View style={[styles.backgroundGreen, { height: screenHeight * 0.35 }]}>
          <View style={styles.headerContent}>
            {/* Toggle Tabs no header */}
            <View style={styles.tabsContainer}>
              {/* Tab: Meus Itens */}
              <TouchableOpacity
                style={[
                  styles.tab,
                  selectedTab === 'myItems' && styles.tabActive
                ]}
                onPress={() => setSelectedTab('myItems')}
                activeOpacity={0.7}
              >
                <Text style={styles.tabIcon}>📦</Text>
                <Text style={[
                  styles.tabText,
                  selectedTab === 'myItems' && styles.tabTextActive
                ]}>
                  Meus Itens
                </Text>
                <View style={[
                  styles.tabBadge,
                  selectedTab === 'myItems' && styles.tabBadgeActive
                ]}>
                  <Text style={[
                    styles.tabBadgeText,
                    selectedTab === 'myItems' && styles.tabBadgeTextActive
                  ]}>
                    {myItems.length}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Tab: Meus Aluguéis */}
              <TouchableOpacity
                style={[
                  styles.tab,
                  selectedTab === 'myRentals' && styles.tabActive
                ]}
                onPress={() => setSelectedTab('myRentals')}
                activeOpacity={0.7}
              >
                <Text style={styles.tabIcon}>📝</Text>
                <Text style={[
                  styles.tabText,
                  selectedTab === 'myRentals' && styles.tabTextActive
                ]}>
                  Meus Aluguéis
                </Text>
                <View style={[
                  styles.tabBadge,
                  selectedTab === 'myRentals' && styles.tabBadgeActive
                ]}>
                  <Text style={[
                    styles.tabBadgeText,
                    selectedTab === 'myRentals' && styles.tabBadgeTextActive
                  ]}>
                    {myRentals.length}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Card branco - empurra o verde para cima quando rola */}
        <View style={styles.contentCard}>
          {/* 📦 MEUS ITENS - TODOS os itens que EU criei/anunciei */}
          {selectedTab === 'myItems' && (
            <>
              {myItems.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>📦</Text>
                  <Text style={styles.emptyText}>
                    Você ainda não anunciou nenhum item
                  </Text>
                  <Text style={styles.emptySubtext}>
                    Crie seu primeiro anúncio e comece a ganhar dinheiro!
                  </Text>
                </View>
              ) : (
                myItems.map(renderItemCard)
              )}
            </>
          )}

          {/* 📝 MEUS ALUGUÉIS - Itens que EU ESTOU ALUGANDO de outros */}
          {selectedTab === 'myRentals' && (
            <>
              {myRentals.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>�</Text>
                  <Text style={styles.emptyText}>
                    Você ainda não alugou nenhum item
                  </Text>
                  <Text style={styles.emptySubtext}>
                    Explore itens disponíveis e faça sua primeira reserva!
                  </Text>
                </View>
              ) : (
                myRentals.map(renderItemCard)
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Mensagem de Sucesso/Erro */}
      {message && (
        <MessageDisplay 
          message={message} 
          type={messageType}
          onClose={() => setMessage('')}
        />
      )}

      {/* Modal de confirmação de delete */}
      {deleteConfirmation && (
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModal}>
            <Text style={styles.deleteModalTitle}>Excluir Item</Text>
            <Text style={styles.deleteModalMessage}>
              Tem certeza que deseja excluir "{deleteConfirmation.name}"? Esta ação não pode ser desfeita.
            </Text>
            
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity 
                style={styles.deleteModalCancelButton}
                onPress={cancelDelete}
              >
                <Text style={styles.deleteModalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.deleteModalConfirmButton}
                onPress={confirmDelete}
              >
                <Text style={styles.deleteModalConfirmText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Botão flutuante para adicionar item — aparece apenas em 'Meus Itens' */}
      {selectedTab === 'myItems' && (
        <TouchableOpacity
          style={styles.fabButton}
          onPress={() => navigation.navigate('AddItem')}
          activeOpacity={0.8}
        >
          <Text style={styles.fabButtonText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  backgroundGreen: {
    backgroundColor: COLORS.primary,
    paddingBottom: 0,
  },
  headerContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.darkText,
    textAlign: 'center',
    marginBottom: 20,
  },
  
  // Tabs Container
  tabsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  tab: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 15,
    padding: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  tabActive: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabIcon: {
    fontSize: 20,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(68, 68, 68, 0.6)',
  },
  tabTextActive: {
    color: COLORS.darkText,
  },
  tabBadge: {
    backgroundColor: 'rgba(68, 68, 68, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  tabBadgeActive: {
    backgroundColor: COLORS.primary,
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.darkText,
  },
  tabBadgeTextActive: {
    color: COLORS.white,
  },
  
  // Content Card
  contentCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
    minHeight: Dimensions.get('window').height * 0.85,
    marginTop: -50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  
  // Card de Item
  itemCard: {
    backgroundColor: COLORS.lightGreen,
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemContent: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.darkText,
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  
  // Rental Info Box (quando item está alugado)
  rentalInfoBox: {
    backgroundColor: '#FFF8E1',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  rentalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.darkText,
    marginBottom: 2,
  },
  rentalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginBottom: 2,
  },
  rentalEmail: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 4,
  },
  rentalDates: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  
  // Status Badge e Actions
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusBadge: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray,
  },
  
  // Edit Button
  editButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
  },

  // Track Button (Acompanhar)
  trackButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
  },
  trackButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
  },

  // Delete Button
  deleteButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.red,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  inUseButton: {
    flex: 1,
    backgroundColor: COLORS.green,
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
  },
  inUseButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  returnButton: {
    flex: 1,
    backgroundColor: COLORS.red,
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
  },
  returnButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.darkText,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  fabButton: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  fabButtonText: {
    fontSize: 32,
    color: COLORS.white,
    fontWeight: 'bold',
    lineHeight: 32,
  },

  // Modal de confirmação de delete
  deleteModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  deleteModal: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    width: '80%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginBottom: 12,
  },
  deleteModalMessage: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
    marginBottom: 24,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  deleteModalCancelButton: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  deleteModalCancelText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.darkText,
  },
  deleteModalConfirmButton: {
    flex: 1,
    backgroundColor: COLORS.red,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  deleteModalConfirmText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});

export default TransactionScreen;