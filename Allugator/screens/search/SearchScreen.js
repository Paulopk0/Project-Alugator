import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { searchItems } from '../../apis/ItemApi';

const COLORS = {
  background: '#F0FFF0',
  primary: '#1DE9B6',
  lightGreen: '#B8F3D8',
  darkText: '#444444ff',
  white: '#FFFFFF',
  lightGray: '#E0E0E0',
  shadow: '#00000026',
};

const screenHeight = Dimensions.get('window').height;

const CATEGORIES = [
  'Ferramentas',
  'Móveis',
  'Eletrônicos',
  'Esportes',
  'Camping',
  'Veículos',
];

const SearchScreen = ({ navigation, route }) => {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [timeFilter, setTimeFilter] = useState(''); // 'Diário', 'Semanal', 'Mensal'
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    try {
      setIsLoading(true);
      
      // Montar filtros
      const filters = {};
      if (searchText.trim()) filters.searchText = searchText.trim();
      if (selectedCategory) filters.category = selectedCategory;
      if (startDate) filters.startDate = startDate.toISOString().split('T')[0];
      if (timeFilter) filters.timeFilter = timeFilter;

      // Fazer busca na API
      const result = await searchItems(filters);
      
      setIsLoading(false);

      // Navegar para tela de resultados (com ou sem itens)
      navigation.navigate('SearchResults', { 
        items: result.items || [], 
        filters: filters 
      });
    } catch (error) {
      setIsLoading(false);
      Alert.alert(
        'Erro na Busca',
        'Não foi possível realizar a busca. Tente novamente.',
        [{ text: 'OK' }]
      );
      console.error('Erro ao buscar:', error);
    }
  };

  const handleCategoryPress = (category) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
  };

  const handleSelectDate = (selectedDate) => {
    // Adiciona horário para evitar problemas de timezone
    const dateString = selectedDate + 'T12:00:00';
    setStartDate(new Date(dateString));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background verde com header */}
      <View style={styles.background}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Buscar</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.contentCard}>
          {/* Campo de Busca */}
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar..."
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor="#999"
            />
          </View>

          {/* Categoria */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categoria</Text>
            <View style={styles.dropdown}>
              <Text style={[styles.dropdownText, !selectedCategory && styles.placeholderText]}>
                {selectedCategory || 'Selecione a categoria'}
              </Text>
              <Text style={styles.chevronIcon}>▼</Text>
            </View>
            
            {/* Lista de Categorias */}
            <View style={styles.categoriesContainer}>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category && styles.categoryChipActive,
                  ]}
                  onPress={() => handleCategoryPress(category)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === category && styles.categoryTextActive,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Data Da Publicação */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Da Publicação</Text>
            <View style={styles.dateContainer}>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowStartPicker(true)}
              >
                <Text style={styles.dateText}>
                  {startDate.toLocaleDateString('pt-BR')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.calendarButton}
                onPress={() => navigation.navigate('Calendar', { 
                  from: 'Search',
                  onSelectDate: handleSelectDate 
                })}
              >
                <Text style={styles.calendarIcon}>📅</Text>
              </TouchableOpacity>
            </View>

            {showStartPicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowStartPicker(false);
                  if (selectedDate) {
                    setStartDate(selectedDate);
                  }
                }}
              />
            )}
          </View>

          {/* Tempo De Uso */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tempo De Uso</Text>
            <View style={styles.timeFilterContainer}>
              {['Diário', 'Semanal', 'Mensal'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.timeFilterButton,
                    timeFilter === option && styles.timeFilterButtonActive,
                  ]}
                  onPress={() => setTimeFilter(option === timeFilter ? '' : option)}
                >
                  <Text
                    style={[
                      styles.timeFilterText,
                      timeFilter === option && styles.timeFilterTextActive,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Botão Buscar */}
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.darkText} />
            ) : (
              <Text style={styles.searchButtonText}>Buscar</Text>
            )}
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
    height: screenHeight * 0.18,
    backgroundColor: COLORS.primary,
    zIndex: 1,
  },
  headerContent: {
    paddingTop: 15,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
    zIndex: 10,
  },
  backIcon: {
    fontSize: 28,
    color: COLORS.darkText,
    fontWeight: 'bold',
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.darkText,
  },
  scrollContainer: {
    paddingTop: screenHeight * 0.18,
  },
  contentCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 30,
    minHeight: screenHeight * 0.82,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 25,
    height: 50,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  chevronIcon: {
    fontSize: 10,
    color: COLORS.darkText,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.darkText,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkText,
    marginBottom: 10,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    padding: 15,
  },
  dropdownText: {
    fontSize: 16,
    color: COLORS.darkText,
  },
  placeholderText: {
    color: '#999',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    margin: 10,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.darkText,
  },
  categoryTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  dateContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    padding: 15,
  },
  dateText: {
    fontSize: 16,
    color: COLORS.darkText,
  },
  calendarButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    width: 55,
  },
  calendarIcon: {
    fontSize: 20,
  },
  timeFilterContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  timeFilterButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
  },
  timeFilterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  timeFilterText: {
    fontSize: 14,
    color: COLORS.darkText,
  },
  timeFilterTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.darkText,
  },
});

export default SearchScreen;
