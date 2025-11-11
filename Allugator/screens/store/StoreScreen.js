import React, { useState, useEffect } from 'react';
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
import { getAllItems } from '../../apis/ItemApi';
import { getItemImage } from '../../assets/images/imageMap';
import AuthStorage from '../../services/AuthStorage';

const COLORS = {
  background: '#F0FFF0',
  primary: '#1DE9B6',
  darkText: '#444444ff',
  white: '#FFFFFF',
  lightGray: '#E0E0E0',
  shadow: '#00000026',
};

const screenHeight = Dimensions.get('window').height;

const StoreScreen = ({ navigation }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadUserData();
    loadItems();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await AuthStorage.getUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    }
  };

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await getAllItems();
      
      setItems(response.items);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os items: ' + error.message);
      console.error('❌ Erro completo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadItems();
    setRefreshing(false);
  };

  const handleItemPress = (item) => {
    navigation.navigate('ItemDetails', { item });
  };

  const handleFavorite = (itemId) => {
    setFavorites(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      }
      return [...prev, itemId];
    });
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
            <Text style={styles.itemStatus}>{item.status}</Text>
          </View>
          
          <Text style={styles.itemTitle}>{item.title}</Text>
          
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
      <View style={styles.background}>
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
        style={styles.searchButton}
        onPress={() => navigation.navigate('Search')}
        activeOpacity={0.7}
      >
        <Text style={styles.searchIcon}>🔍</Text>
      </TouchableOpacity>

      {/* Card branco com conteúdo */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.contentCard}>
          {/* Info bar */}
          <View style={styles.infoBar}>
            <Text style={styles.infoText}>
              📦 {items.length} {items.length === 1 ? 'item disponível' : 'itens disponíveis'}
            </Text>
            <TouchableOpacity onPress={handleRefresh}>
              <Text style={styles.refreshText}>🔄 Atualizar</Text>
            </TouchableOpacity>
          </View>

          {/* Lista de Items */}
          {items.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>📭</Text>
              <Text style={styles.emptyTitle}>Nenhum item encontrado</Text>
              <Text style={styles.emptySubtitle}>
                Execute o seeder para adicionar items de exemplo
              </Text>
            </View>
          ) : (
            items.map((item) => (
              <View key={item.id} style={styles.itemContainer}>
                {/* Imagem do Item */}
                {getItemImage(item.photos) && (
                  <Image 
                    source={getItemImage(item.photos)} 
                    style={styles.itemImage}
                    resizeMode="cover"
                  />
                )}
                
                <View style={styles.itemContent}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemStatus}>{item.status}</Text>
                  </View>
                  
                  <Text style={styles.itemPrice}>R$ {item.priceDaily?.toFixed(2)}/dia</Text>
                  
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
                  
                  {item.location && (
                    <Text style={styles.itemLocation}>📍 {item.location}</Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
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
    paddingTop: screenHeight * 0.02,
    paddingHorizontal: 20,
    zIndex: 0,
  },
  headerContent: {
    paddingTop: 10,
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
    top: screenHeight * 0.05,
    right: 20,
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 999,
  },
  searchIcon: {
    fontSize: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: screenHeight * 0.18,
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
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
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
  itemTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.darkText,
    flex: 1,
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
  itemPrice: {
    fontSize: 24,
    color: COLORS.primary,
    fontWeight: 'bold',
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
  itemLocation: {
    fontSize: 13,
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
});

export default StoreScreen;
