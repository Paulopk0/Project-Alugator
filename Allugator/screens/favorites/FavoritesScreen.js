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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();
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
    navigation.navigate('ItemDetails', { item });
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
      <View style={styles.backgroundGreen}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Meus Favoritos</Text>
        </View>
      </View>

      {/* Botão de voltar (flutuante) */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
        ]}
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
        <View style={[styles.contentCard]}>

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

  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 180,
    paddingBottom: 0,

  },
  contentCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 400,
    boxShadow: '0px -2px 8px rgba(0, 0, 0, 0.1)',
    alignSelf: 'stretch',
    minHeight: 0,
    elevation: 5,
  },
  backgroundGreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 220,
    backgroundColor: COLORS.primary,
    zIndex: 0,
  },
  headerContent: {
    paddingTop: 65,
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.darkText,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 30,
    zIndex: 999,
    padding: 5,
  },
  backButtonText: {
    fontSize: 28,
    color: COLORS.darkText,
    fontWeight: 'bold',
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
