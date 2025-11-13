import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getUserFavorites, toggleFavorite } from '../../apis/FavoriteApi';
import { getItemImage } from '../../assets/images/imageMap';

const COLORS = {
  primary: '#1DE9B6',
  background: '#F0FFF0',
  darkText: '#444444ff',
  white: '#FFFFFF',
  lightGray: '#E0E0E0',
};

const FavoritesScreen = ({ navigation }) => {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Recarrega favoritos sempre que a tela ganhar foco
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const response = await getUserFavorites();
      
      if (response.favorites) {
        setFavorites(response.favorites);
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  };

  const handleRemoveFavorite = async (itemId) => {
    try {
      await toggleFavorite(itemId, true); // true = está favoritado, então remove
      // Remove da lista local
      setFavorites(prev => prev.filter(fav => fav.id !== itemId));
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
    }
  };

  const handleItemPress = (item) => {
    // TODO: Navegar para detalhes do item
    console.log('Item selecionado:', item.id);
  };

  const formatPrice = (price) => {
    return `R$ ${parseFloat(price).toFixed(2)}/dia`;
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
      {/* Background verde */}
      <View style={[styles.backgroundGreen, { height: screenHeight * 0.18 }]} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Card branco com conteúdo */}
        <View style={[styles.contentCard, { minHeight: screenHeight * 0.82 }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Meus Favoritos</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Contador de favoritos */}
          <View style={styles.counterContainer}>
            <Text style={styles.counterText}>
              {favorites.length === 0
                ? 'Você ainda não tem favoritos'
                : `${favorites.length} ${favorites.length === 1 ? 'item favoritado' : 'itens favoritados'}`}
            </Text>
          </View>

          {/* Lista de favoritos */}
          {favorites.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>♡</Text>
              <Text style={styles.emptyTitle}>Nenhum favorito ainda</Text>
              <Text style={styles.emptyDescription}>
                Adicione itens aos favoritos para encontrá-los facilmente aqui
              </Text>
              <TouchableOpacity
                style={styles.browseButton}
                onPress={() => navigation.navigate('Store')}
              >
                <Text style={styles.browseButtonText}>Explorar Itens</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.itemsGrid}>
              {favorites.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.itemCard}
                  onPress={() => handleItemPress(item)}
                >
                  <Image
                    source={getItemImage(item.photos)}
                    style={styles.itemImage}
                    resizeMode="cover"
                  />
                  
                  {/* Botão de remover favorito */}
                  <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={() => handleRemoveFavorite(item.id)}
                  >
                    <Text style={styles.favoriteIcon}>♥</Text>
                  </TouchableOpacity>

                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={styles.itemCategory}>{item.category}</Text>
                    <View style={styles.itemFooter}>
                      <Text style={styles.itemPrice}>{formatPrice(item.priceDaily)}</Text>
                      {item.location && (
                        <View style={styles.locationBadge}>
                          <Text style={styles.locationIcon}>📍</Text>
                          <Text style={styles.locationText} numberOfLines={1}>
                            {item.location}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  scrollView: {
    flex: 1,
    zIndex: 2,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 20,
  },
  contentCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 40,
    boxShadow: '0px -2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.darkText,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.darkText,
  },
  placeholder: {
    width: 40,
  },
  counterContainer: {
    marginBottom: 20,
  },
  counterText: {
    fontSize: 14,
    color: COLORS.darkText,
    opacity: 0.8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 80,
    color: COLORS.lightGray,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginTop: 20,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: COLORS.darkText,
    opacity: 0.7,
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
  },
  browseButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.darkText,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  itemCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 16,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  itemImage: {
    width: '100%',
    height: 140,
    backgroundColor: COLORS.lightGray,
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 2px 3px rgba(0, 0, 0, 0.2)',
    elevation: 3,
  },
  favoriteIcon: {
    fontSize: 18,
    color: '#FF4444',
  },
  itemInfo: {
    padding: 12,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginBottom: 4,
    minHeight: 36,
  },
  itemCategory: {
    fontSize: 11,
    color: COLORS.darkText,
    opacity: 0.6,
    marginBottom: 8,
  },
  itemFooter: {
    flexDirection: 'column',
    gap: 6,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationIcon: {
    fontSize: 12,
  },
  locationText: {
    fontSize: 10,
    color: COLORS.darkText,
    opacity: 0.7,
    flex: 1,
  },
});

export default FavoritesScreen;
