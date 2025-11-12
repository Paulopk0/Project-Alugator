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
import { getItemImage } from '../../../assets/images/imageMap';
import { translateItemStatus } from '../../../utils/translationHelpers';

const COLORS = {
  primary: '#1DE9B6',
  background: '#F0FFF0',
  darkText: '#444444ff',
  white: '#FFFFFF',
  lightGray: '#E0E0E0',
};

const SearchResultsScreen = ({ navigation, route }) => {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const { items = [], filters = {} } = route.params || {};

  const formatPrice = (price) => {
    return `R$ ${parseFloat(price).toFixed(2)}/dia`;
  };

  return (
    <View style={styles.container}>
      {/* Background verde */}
      <View style={[styles.backgroundGreen, { height: screenHeight * 0.18 }]} />

      {/* Botão de voltar (acima de tudo) */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card branco com conteúdo */}
        <View style={[styles.contentCard, { minHeight: screenHeight * 0.82 }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Resultados da Busca</Text>
          </View>

          {/* Informação sobre os filtros aplicados */}
          {(filters.title || filters.category || filters.condition || filters.publishDate) && (
            <View style={styles.filterInfo}>
              <Text style={styles.filterLabel}>Filtros aplicados:</Text>
              {filters.title && (
                <Text style={styles.filterValue}>• Título: "{filters.title}"</Text>
              )}
              {filters.category && (
                <Text style={styles.filterValue}>• Categoria: {filters.category}</Text>
              )}
              {filters.condition && (
                <Text style={styles.filterValue}>• Condição: {filters.condition}</Text>
              )}
              {filters.publishDate && (
                <Text style={styles.filterValue}>
                  • Publicado a partir de: {new Date(filters.publishDate).toLocaleDateString('pt-BR')}
                </Text>
              )}
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
                  onPress={() => navigation.navigate('ItemDetails', { item })}
                >
                  <Image
                    source={getItemImage(item.photos)}
                    style={styles.itemImage}
                    resizeMode="cover"
                  />
                  <View style={styles.itemInfo}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemTitle} numberOfLines={2}>
                        {item.title}
                      </Text>
                      {item.status && (
                        <View style={styles.statusBadge}>
                          <Text style={styles.statusText}>{translateItemStatus(item.status)}</Text>
                        </View>
                      )}
                    </View>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  backButton: {
    position: 'absolute',
    top: 15,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.darkText,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.darkText,
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
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
    gap: 8,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.darkText,
    flex: 1,
    minHeight: 36,
  },
  statusBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.darkText,
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
