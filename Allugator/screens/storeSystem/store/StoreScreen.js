/**
 * StoreScreen - Tela principal da loja
 * 
 * Esta tela exibe todos os itens disponíveis para aluguel.
 * Permite ao usuário:
 * - Visualizar itens disponíveis
 * - Favoritar itens
 * - Navegar para detalhes do item
 * - Buscar itens (via botão de pesquisa)
 * - Adicionar novos itens (via botão FAB)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getItemImage } from '../../../assets/images/imageMap';
import { translateItemStatus } from '../../../utils/translationHelpers';
import { useAuth } from '../../../hooks/useAuth';
import { useItems } from '../../../hooks/useItems';

// Paleta de cores do aplicativo
const COLORS = {
  background: '#F0FFF0',
  primary: '#1DE9B6',
  darkText: '#444444ff',
  white: '#FFFFFF',
  lightGray: '#E0E0E0',
  shadow: '#00000026',
};

const StoreScreen = ({ navigation }) => {
  // Altura da tela para cálculos de layout (movido para dentro do componente)
  const screenHeight = Dimensions.get('window').height;
  
  // ✅ Novo: Hooks dos contextos
  const { user: currentUser } = useAuth();
  const { 
    items, 
    myItems, 
    loading, 
    refreshing,
    favorites,
    selectedCategory,
    filteredItems,
    loadItems,
    loadMyItems,
    loadFavorites,
    handleCategoryFilter,
    handleToggleFavorite,
    onRefresh,
    getCategories,
    isNewItem,
    getRentedCount,
    isFavorite,
  } = useItems();
  
  // Estado local apenas para UI
  const [showingMyItems, setShowingMyItems] = useState(false);

  /**
   * Filtra itens: exclui meus itens e retorna apenas disponíveis/alugados
   */
  const getOthersAllItems = () => {
    if (!Array.isArray(items)) return [];
    if (!Array.isArray(myItems)) return items; // Se não tiver myItems, retorna todos
    
    const myItemIds = myItems.map(item => item.id);
    return items.filter(item => !myItemIds.includes(item.id));
  };

  /**
   * Filtra apenas itens alugáveis de outras pessoas (disponíveis)
   */
  const getOthersRentableItems = () => {
    if (!Array.isArray(items)) return [];
    if (!Array.isArray(myItems)) return items.filter(item => item.status === 'available');
    
    const myItemIds = myItems.map(item => item.id);
    return items.filter(item => 
      !myItemIds.includes(item.id) && 
      item.status === 'available'
    );
  };

  /**
   * Retorna os itens a exibir baseado na aba selecionada
   */
  const getDisplayItems = () => {
    return showingMyItems ? getOthersRentableItems() : getOthersAllItems();
  };

  /**
   * Carrega dados iniciais ao montar o componente
   */
  useEffect(() => {
    loadItems();
    loadMyItems();
    loadFavorites();
  }, []); // Array vazio = executa uma única vez

  /**
   * Alterna entre mostrar todos os itens e apenas os meus itens
   */
  const toggleView = () => {
    setShowingMyItems(!showingMyItems);
    handleCategoryFilter(null); // Reseta filtro de categoria ao alternar view
  };



  /**
   * Navega para tela de detalhes do item
   * @param {Object} item - Item selecionado
   */
  const handleItemPress = (item) => {
    navigation.navigate('ItemDetails', { item });
  };

  /**
   * Navega para tela de edição do item
   * @param {Object} item - Item a ser editado
   */
  const handleEditItem = (item) => {
    navigation.navigate('EditItem', { item });
  };

  const handleShare = async (item) => {
    try {
      await Share.share({
        message: `Confira este item: ${item.title} por R$${item.priceDaily.toFixed(2)}/dia`,
        title: item.title,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const renderItem = ({ item }) => {
    // Busca a imagem usando o nome da foto (string) que vem da API
    const itemImage = getItemImage(item.photos);
    
    return (
      <View style={styles.itemContainer}>
        {/* Imagem do Item */}
        {itemImage && (
          <Image 
            source={itemImage} 
            style={styles.itemImage}
            resizeMode="cover"
          />
        )}
        
        <View style={styles.itemContent}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemId}>ID: {item.id}</Text>
            <Text style={styles.itemStatus}>{translateItemStatus(item.status)}</Text>
          </View>
          
          <View style={styles.titleRow}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <View style={styles.actions}>
              <TouchableOpacity 
                style={[styles.iconButton, favorites.includes(item.id) && styles.iconButtonActive]}
                onPress={() => handleToggleFavorite(item.id)}
              >
                <Text style={[styles.icon, favorites.includes(item.id) && styles.iconActive]}>
                  {favorites.includes(item.id) ? '♥' : '♡'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.itemInfo}>
            <Text style={styles.itemLabel}>Categoria:</Text>
            <Text style={styles.itemValue}>{item.category}</Text>
          </View>
          
          <View style={styles.itemInfo}>
            <Text style={styles.itemLabel}>Preço/Dia:</Text>
            <Text style={styles.itemPrice}>R$ {item.priceDaily?.toFixed(2)}</Text>
          </View>
          
          <View style={styles.itemInfo}>
            <Text style={styles.itemLabel}>Condição:</Text>
            <Text style={styles.itemValue}>{item.condition}</Text>
          </View>
          
          {item.description && (
            <View style={styles.itemInfo}>
              <Text style={styles.itemLabel}>Descrição:</Text>
              <Text style={styles.itemDescription}>{item.description}</Text>
            </View>
          )}
          
          {item.location && (
            <View style={styles.itemInfo}>
              <Text style={styles.itemLabel}>Localização:</Text>
              <Text style={styles.itemValue}>{item.location}</Text>
            </View>
          )}
          
          <View style={styles.itemInfo}>
            <Text style={styles.itemLabel}>Foto:</Text>
            <Text style={styles.itemValue}>{item.photos || 'default'}</Text>
          </View>
          
          <View style={styles.itemInfo}>
            <Text style={styles.itemLabel}>Data Publicação:</Text>
            <Text style={styles.itemValue}>
              {item.publishDate ? new Date(item.publishDate).toLocaleDateString('pt-BR') : 'N/A'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background verde com header */}
      <View style={[styles.background, { paddingTop: screenHeight * 0.02 }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Loja</Text>
            {currentUser && (
              <Text style={styles.headerSubtitle}>Olá, {currentUser.name}</Text>
            )}
          </View>
        </View>
      </View>

      {/* Botão de pesquisa separado (acima de tudo) */}
      <TouchableOpacity
        style={[styles.searchButton, { top: screenHeight * 0.08 }]}
        onPress={() => navigation.navigate('Search')}
        activeOpacity={0.7}
      >
        <Text style={styles.searchIcon}>🔍</Text>
      </TouchableOpacity>

      {/* Botão de favoritos */}
      <TouchableOpacity
        style={[styles.heartButton, { top: screenHeight * 0.08 }]}
        onPress={() => navigation.navigate('Favorites')}
        activeOpacity={0.7}
      >
        <Text style={styles.heartIcon}>♥</Text>
        {favorites.length > 0 && (
          <View style={styles.favoriteBadge}>
            <Text style={styles.favoriteBadgeText}>{favorites.length}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Botão para alternar visualização - Melhorado com Label */}
      <TouchableOpacity
        style={[
          styles.toggleButton,
          { top: screenHeight * 0.08 },
          showingMyItems && styles.toggleButtonActive
        ]}
        onPress={toggleView}
        activeOpacity={0.7}
      >
        <Text style={styles.toggleIcon}>{showingMyItems ? '📦' : '🏪'}</Text>
        <Text style={[
          styles.toggleLabel,
          showingMyItems && styles.toggleLabelActive
        ]}>
          {showingMyItems ? 'Alugáveis' : 'Todos'}
        </Text>
      </TouchableOpacity>

      {/* Card branco com conteúdo */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContainer, { paddingTop: screenHeight * 0.18 }]}
      >
        <View style={styles.contentCard}>
          {/* Info bar com contagem e resumo */}
          <View style={styles.infoBar}>
            <Text style={styles.infoText}>
              {showingMyItems ? '📦 Itens Alugáveis' : '🏪 Todos os Itens'} ({getDisplayItems().length})
            </Text>
          </View>

          {/* Chips de categoria rápidos */}
          {showingMyItems && myItems.length > 0 && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoryChipsContainer}
            >
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  selectedCategory === null && styles.categoryChipActive
                ]}
                onPress={() => handleCategoryFilter(null)}
              >
                <Text style={[
                  styles.categoryChipText,
                  selectedCategory === null && styles.categoryChipTextActive
                ]}>
                  Todos
                </Text>
              </TouchableOpacity>

              {getCategories().map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category && styles.categoryChipActive
                  ]}
                  onPress={() => handleCategoryFilter(category)}
                >
                  <Text style={[
                    styles.categoryChipText,
                    selectedCategory === category && styles.categoryChipTextActive
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {items.length === 0 && !showingMyItems && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoryChipsContainer}
            >
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  selectedCategory === null && styles.categoryChipActive
                ]}
                onPress={() => handleCategoryFilter(null)}
              >
                <Text style={[
                  styles.categoryChipText,
                  selectedCategory === null && styles.categoryChipTextActive
                ]}>
                  Todos
                </Text>
              </TouchableOpacity>

              {getCategories().map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category && styles.categoryChipActive
                  ]}
                  onPress={() => handleCategoryFilter(category)}
                >
                  <Text style={[
                    styles.categoryChipText,
                    selectedCategory === category && styles.categoryChipTextActive
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Lista de Items */}
          {getDisplayItems().length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>📭</Text>
              <Text style={styles.emptyTitle}>Nenhum item encontrado</Text>
              <Text style={styles.emptySubtitle}>
                {showingMyItems 
                  ? 'Nenhum item alugável disponível no momento'
                  : 'Nenhum item disponível'
                }
              </Text>
            </View>
          ) : (
            (getDisplayItems()).map((item) => {
              const isMyItem = showingMyItems;
              const hasActiveRental = item.activeRental;
              const isRented = item.status === 'rented' || hasActiveRental;
              const isAvailable = item.status === 'available' && !hasActiveRental;
              const isNew = isNewItem(item.publishDate);
              
              return (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.itemContainer}
                  onPress={() => handleItemPress(item)}
                  activeOpacity={0.7}
                >
                  {/* Imagem do Item */}
                  {getItemImage(item.photos) && (
                    <View style={styles.imageContainer}>
                      <Image 
                        source={getItemImage(item.photos)} 
                        style={styles.itemImage}
                        resizeMode="cover"
                      />
                      
                      {/* Badge "NOVO" se item foi publicado a menos de 7 dias */}
                      {isNew && (
                        <View style={styles.newBadge}>
                          <Text style={styles.newBadgeText}>✨ NOVO</Text>
                        </View>
                      )}
                      
                      {/* Badge de status */}
                      <View style={[
                        styles.statusBadge,
                        isRented && styles.statusBadgeRented
                      ]}>
                        <Text style={styles.statusBadgeText}>
                          {isRented ? '🔴 ALUGADO' : '🟢 DISPONÍVEL'}
                        </Text>
                      </View>
                    </View>
                  )}
                  
                  <View style={styles.itemContent}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                    </View>
                    
                    <View style={styles.priceAndFavoriteRow}>
                      <Text style={styles.itemPrice}>R$ {item.priceDaily?.toFixed(2)}/dia</Text>
                      {!isMyItem && (
                        <TouchableOpacity 
                          style={[styles.favoriteButton, favorites.includes(item.id) && styles.favoriteButtonActive]}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(item.id);
                          }}
                        >
                          <Text style={[styles.favoriteIcon, favorites.includes(item.id) && styles.favoriteIconActive]}>
                            {favorites.includes(item.id) ? '♥' : '♡'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    
                    <View style={styles.itemDetails}>
                      <View style={styles.itemBadge}>
                        <Text style={styles.itemBadgeText}>{item.category}</Text>
                      </View>
                      <View style={styles.itemBadge}>
                        <Text style={styles.itemBadgeText}>{item.condition}</Text>
                      </View>
                    </View>
                    
                    {item.description && (
                      <Text style={styles.itemDescription} numberOfLines={2}>
                        {item.description}
                      </Text>
                    )}
                    
                    {/* Se for meu item e estiver alugado, mostrar quem está alugando */}
                    {isMyItem && hasActiveRental && (
                      <View style={styles.rentalInfo}>
                        <Text style={styles.rentalInfoTitle}>👤 Alugado por:</Text>
                        <Text style={styles.rentalInfoName}>{item.activeRental.renter.name}</Text>
                        <Text style={styles.rentalInfoEmail}>{item.activeRental.renter.email}</Text>
                        <Text style={styles.rentalInfoDates}>
                          📅 {new Date(item.activeRental.startDate).toLocaleDateString('pt-BR')} até{' '}
                          {new Date(item.activeRental.endDate).toLocaleDateString('pt-BR')}
                        </Text>
                      </View>
                    )}
                    
                    {item.location && (
                      <View style={styles.locationRow}>
                        <Text style={styles.itemLocation}>📍 {item.location}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Botão de adicionar removido — agora exibido em TransactionScreen quando em 'Meus Itens' */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    zIndex: 0,
  },
  headerContent: {
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.darkText,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.darkText,
    marginTop: 4,
    opacity: 0.8,
  },
  searchButton: {
    position: 'absolute',
    right: 15,
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 2px 3px rgba(0, 0, 0, 0.15)',
    elevation: 5,
    zIndex: 999,
  },
  searchIcon: {
    fontSize: 20,
  },
  heartButton: {
    position: 'absolute',
    right: 70,
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 2px 3px rgba(0, 0, 0, 0.15)',
    elevation: 5,
    zIndex: 999,
  },
  heartIcon: {
    fontSize: 20,
    color: '#FF4444',
  },
  favoriteBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  favoriteBadgeText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  toggleButton: {
    position: 'absolute',
    right: 125,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8F9F5',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 2px 3px rgba(0, 0, 0, 0.15)',
    elevation: 5,
    zIndex: 999,
    borderWidth: 2,
    borderColor: '#D0E8E3',
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  toggleIcon: {
    fontSize: 20,
  },
  toggleLabel: {
    fontSize: 9,
    color: COLORS.darkText,
    fontWeight: 'bold',
    marginTop: 2,
  },
  toggleLabelActive: {
    color: COLORS.white,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  contentCard: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  infoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  infoText: {
    fontSize: 15,
    color: COLORS.darkText,
    fontWeight: '600',
  },
  refreshText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  itemContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginBottom: 20,
    boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.15)',
    elevation: 4,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: 220,
  },
  itemContent: {
    padding: 20,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.darkText,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonActive: {
    backgroundColor: '#FFE5E5',
  },
  icon: {
    fontSize: 18,
    color: COLORS.darkText,
  },
  iconActive: {
    color: '#FF4444',
  },
  itemStatus: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
    backgroundColor: '#E8F9F5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    textTransform: 'uppercase',
  },
  itemStatusRented: {
    color: '#FF6B6B',
    backgroundColor: '#FFE5E5',
  },
  itemPrice: {
    fontSize: 24,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  priceAndFavoriteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemDetails: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  itemBadge: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    marginRight: 8,
  },
  itemBadgeText: {
    fontSize: 12,
    color: COLORS.darkText,
    fontWeight: '600',
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  itemLocation: {
    fontSize: 13,
    color: '#888',
    fontWeight: '500',
    flex: 1,
  },
  favoriteButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  favoriteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.lightGray,
  },
  favoriteButtonActive: {
    backgroundColor: '#FFE5E5',
    borderColor: '#FF4444',
  },
  favoriteIcon: {
    fontSize: 20,
    color: COLORS.darkText,
  },
  favoriteIconActive: {
    color: '#FF4444',
  },
  favoriteButtonLabel: {
    fontSize: 13,
    color: COLORS.darkText,
    fontWeight: '600',
  },
  rentalInfo: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  rentalInfoTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginBottom: 6,
  },
  rentalInfoName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.darkText,
    marginBottom: 2,
  },
  rentalInfoEmail: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  rentalInfoDates: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
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
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.3)',
    boxShadowOffset: {
      width: 0,
      height: 4,
    },
    boxShadowOpacity: 0.3,
    boxShadowRadius: 4.65,
    elevation: 8,
  },
  fabButtonText: {
    fontSize: 32,
    color: COLORS.white,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  
  // Novos estilos - Melhorias de qualidade de vida
  categoryChipsContainer: {
    marginBottom: 20,
    marginHorizontal: -20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#F0FFF0',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E8F9F5',
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: 13,
    color: COLORS.darkText,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: COLORS.white,
  },
  
  rentedBadge: {
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  rentedBadgeText: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '700',
  },
  
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 220,
  },
  
  newBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FFD700',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    boxShadowColor: '#000',
    boxShadowOffset: { width: 0, height: 2 },
    boxShadowOpacity: 0.25,
    boxShadowRadius: 3,
    elevation: 4,
  },
  newBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333',
  },
  
  statusBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: '#E8F9F5',
    borderWidth: 2,
    borderColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusBadgeRented: {
    backgroundColor: '#FFE5E5',
    borderColor: '#FF6B6B',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});

export default StoreScreen;
