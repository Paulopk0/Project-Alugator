import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ActivityIndicator,
  Share,
  Alert,
  Image,
} from 'react-native';
import ItemCard from '../../components/ItemCard/ItemCard';
import { getAllItems } from '../../apis/ItemApi';
import { getItemImage } from '../../assets/images/imageMap';
import AuthStorage from '../../services/AuthStorage';

const COLORS = {
  background: '#F0FFF0',
  primary: '#1DE9B6',
  darkText: '#444444',
  white: '#FFFFFF',
};

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
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Loja</Text>
          {currentUser && (
            <Text style={styles.headerSubtitle}>Olá, {currentUser.name}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => navigation.navigate('Search')}
        >
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

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
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>📭</Text>
            <Text style={styles.emptyTitle}>Nenhum item encontrado</Text>
            <Text style={styles.emptySubtitle}>
              Execute o seeder para adicionar items de exemplo
            </Text>
          </View>
        }
      />
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
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.darkText,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.darkText,
    marginTop: 4,
  },
  infoBar: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  infoText: {
    fontSize: 14,
    color: COLORS.darkText,
    fontWeight: '600',
  },
  refreshText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIcon: {
    fontSize: 20,
  },
  listContent: {
    padding: 20,
  },
  itemContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: 200,
  },
  itemContent: {
    padding: 15,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  itemId: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  itemStatus: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    backgroundColor: '#E8F9F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginBottom: 12,
  },
  itemInfo: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  itemLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    width: 120,
  },
  itemValue: {
    fontSize: 14,
    color: COLORS.darkText,
    flex: 1,
  },
  itemPrice: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: 'bold',
    flex: 1,
  },
  itemDescription: {
    fontSize: 14,
    color: COLORS.darkText,
    flex: 1,
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
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
  },
});

export default StoreScreen;
