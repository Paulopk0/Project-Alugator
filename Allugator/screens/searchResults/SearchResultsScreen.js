import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { getItemImage } from '../../assets/images/imageMap';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const COLORS = {
  primary: '#1DE9B6',
  background: '#F0FFF0',
  darkText: '#444444ff',
  white: '#FFFFFF',
  lightGray: '#E0E0E0',
};

const SearchResultsScreen = ({ navigation, route }) => {
  const { items = [], filters = {} } = route.params || {};

  const formatPrice = (price) => {
    return `R$ ${parseFloat(price).toFixed(2)}/dia`;
  };

  return (
    <View style={styles.container}>
      {/* Background verde */}
      <View style={styles.backgroundGreen} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card branco com conteúdo */}
        <View style={styles.contentCard}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Resultados da Busca</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Informação sobre os filtros aplicados */}
          {filters.searchText && (
            <View style={styles.filterInfo}>
              <Text style={styles.filterLabel}>Buscando por:</Text>
              <Text style={styles.filterValue}>"{filters.searchText}"</Text>
            </View>
          )}

          {/* Contador de resultados */}
          <View style={styles.resultsCounter}>
            <Text style={styles.resultsText}>
              {items.length === 0
                ? 'Nenhum resultado encontrado'
                : `${items.length} ${items.length === 1 ? 'item encontrado' : 'itens encontrados'}`}
            </Text>
          </View>

          {/* Lista de itens */}
          {items.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>Nenhum item encontrado</Text>
              <Text style={styles.emptyDescription}>
                Tente ajustar os filtros de busca para encontrar o que procura
              </Text>
              <TouchableOpacity
                style={styles.newSearchButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.newSearchButtonText}>Nova Busca</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.itemsGrid}>
              {items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.itemCard}
                  onPress={() => {
                    // TODO: Navegar para detalhes do item
                    console.log('Item selecionado:', item.id);
                  }}
                >
                  <Image
                    source={getItemImage(item.photos)}
                    style={styles.itemImage}
                    resizeMode="cover"
                  />
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
  backgroundGreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: screenHeight * 0.18,
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
    minHeight: screenHeight * 0.82,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
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
  filterInfo: {
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 12,
    color: COLORS.darkText,
    opacity: 0.7,
    marginBottom: 4,
  },
  filterValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkText,
  },
  resultsCounter: {
    marginBottom: 20,
  },
  resultsText: {
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
  newSearchButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
  },
  newSearchButtonText: {
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: 140,
    backgroundColor: COLORS.lightGray,
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

export default SearchResultsScreen;
