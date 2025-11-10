import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const COLORS = {
  background: '#F0FFF0',
  primary: '#1DE9B6',
  lightGreen: '#B8F3D8',
  darkText: '#444444',
  white: '#FFFFFF',
};

const CATEGORIES = [
  'Ferramentas',
  'Móveis',
  'Eletrônicos',
  'Esportes',
  'Camping',
  'Veículos',
];

const SearchScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [timeFilter, setTimeFilter] = useState(''); // 'Diário', 'Semanal', 'Mensal'

  const handleSearch = () => {
    // TODO: Implementar lógica de busca
  };

  const handleCategoryPress = (category) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buscar</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
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
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowStartPicker(true)}
          >
            <Text style={styles.dateText}>
              {startDate.toLocaleDateString('pt-BR')}
            </Text>
            <Text style={styles.calendarIcon}>📅</Text>
          </TouchableOpacity>

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
        >
          <Text style={styles.searchButtonText}>Buscar</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  backIcon: {
    fontSize: 24,
    color: COLORS.darkText,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.darkText,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
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
  calendarIcon: {
    fontSize: 18,
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
    backgroundColor: COLORS.white,
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
    gap: 10,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGreen,
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
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 15,
  },
  dateText: {
    fontSize: 16,
    color: COLORS.darkText,
  },
  timeFilterContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  timeFilterButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.white,
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
