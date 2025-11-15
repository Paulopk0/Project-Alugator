/**
 * SearchScreen - Tela de busca avançada de itens
 * 
 * Permite ao usuário filtrar itens por múltiplos critérios:
 * - Título (busca parcial)
 * - Categoria
 * - Condição do item
 * - Data de publicação (itens publicados a partir de uma data)
 * 
 * Os filtros são enviados para a API e os resultados são exibidos
 * na tela SearchResultsScreen.
 */

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
import MessageDisplay from '../../components/MessageDisplay/MessageDisplay';

// Paleta de cores do aplicativo
const COLORS = {
  background: '#F0FFF0',
  primary: '#1DE9B6',
  lightGreen: '#B8F3D8',
  darkText: '#444444ff',
  white: '#FFFFFF',
  lightGray: '#E0E0E0',
  shadow: '#00000026',
};

// Categorias disponíveis para filtro (devem corresponder às do banco de dados)
const CATEGORIES = [
  'Ferramentas',
  'Móveis',
  'Esportes',
  'Camping',
  'Eletrônicos',
  'Veículos',
  'Eventos',
  'Outros',
];

// Condições disponíveis para filtro (devem corresponder às do banco de dados)
const CONDITIONS = [
  'Excelente',
  'Bom',
];

const SearchScreen = ({ navigation, route }) => {
  // Altura da tela para cálculos de layout
  const screenHeight = Dimensions.get('window').height;
  
  // ESTADOS DOS FILTROS
  const [title, setTitle] = useState(''); // Busca por título (parcial)
  const [selectedCategory, setSelectedCategory] = useState(''); // Categoria selecionada
  const [selectedCondition, setSelectedCondition] = useState(''); // Condição selecionada
  const [publishDate, setPublishDate] = useState(null); // Data de publicação (itens >= esta data)
  const [showDatePicker, setShowDatePicker] = useState(false); // Controla visibilidade do date picker
  
  // ESTADOS DE UI
  const [isLoading, setIsLoading] = useState(false); // Indicador de busca em andamento
  const [message, setMessage] = useState(''); // Mensagem de erro/sucesso
  const [messageType, setMessageType] = useState('error'); // Tipo da mensagem

  /**
   * Executa a busca com os filtros selecionados
   * Envia para API apenas os filtros preenchidos
   * Navega para SearchResultsScreen com os resultados
   */
  const handleSearch = async () => {
    try {
      setIsLoading(true);
      setMessage(''); // Limpa mensagens anteriores
      
      // Monta objeto de filtros apenas com campos preenchidos
      const filters = {};
      if (title.trim()) filters.title = title.trim();
      if (selectedCategory) filters.category = selectedCategory;
      if (selectedCondition) filters.condition = selectedCondition;
      if (publishDate) filters.publishDate = publishDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD

      console.log('🔍 Iniciando busca com filtros:', filters);

      // Chama API de busca
      const result = await searchItems(filters);
      
      console.log('✅ Resultado da busca:', result);
      console.log(`📊 ${result.items?.length || 0} itens encontrados`);
      
      setIsLoading(false);

      // Navega para resultados (mesmo se vazio)
      navigation.navigate('SearchResults', { 
        items: result.items || [], 
        filters: filters 
      });
    } catch (error) {
      setIsLoading(false);
      console.error('❌ Erro completo ao buscar:', error);
      setMessage('Não foi possível realizar a busca. Tente novamente.');
      setMessageType('error');
    }
  };

  /**
   * Toggle de seleção de categoria
   * Clique novamente na mesma categoria desmarca
   */
  const handleCategoryPress = (category) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
  };

  /**
   * Toggle de seleção de condição
   * Clique novamente na mesma condição desmarca
   */
  const handleConditionPress = (condition) => {
    setSelectedCondition(condition === selectedCondition ? '' : condition);
  };

  const handleSelectDate = (selectedDate) => {
    // Adiciona horário para evitar problemas de timezone
    const dateString = selectedDate + 'T12:00:00';
    setPublishDate(new Date(dateString));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Mensagem de feedback */}
      <MessageDisplay 
        message={message} 
        type={messageType}
        onHide={() => setMessage('')}
      />
      
      {/* Background verde */}
      <View style={[styles.background, { height: screenHeight * 0.18 }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Buscar</Text>
        </View>
      </View>

      {/* Botão de voltar (acima de tudo) */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContainer, { paddingTop: screenHeight * 0.18 }]}
      >
        <View style={[styles.contentCard, { minHeight: screenHeight * 0.82 }]}>
          {/* Campo de Busca por Título */}
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por título..."
              value={title}
              onChangeText={setTitle}
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

          {/* Estado/Condição */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Condição do Item</Text>
            <View style={styles.categoriesContainer}>
              {CONDITIONS.map((condition) => (
                <TouchableOpacity
                  key={condition}
                  style={[
                    styles.categoryChip,
                    selectedCondition === condition && styles.categoryChipActive,
                  ]}
                  onPress={() => handleConditionPress(condition)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCondition === condition && styles.categoryTextActive,
                    ]}
                  >
                    {condition}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Data de Publicação */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data de Publicação</Text>
            <View style={styles.dateContainer}>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {publishDate ? publishDate.toLocaleDateString('pt-BR') : 'Selecione uma data'}
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
              {publishDate && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => setPublishDate(null)}
                >
                  <Text style={styles.clearButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={publishDate || new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setPublishDate(selectedDate);
                  }
                }}
              />
            )}
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
    backgroundColor: COLORS.primary,
    zIndex: 0,
  },
  headerContent: {
    paddingTop: 65,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 30,
    zIndex: 999,
    padding: 5,
  },
  backIcon: {
    fontSize: 28,
    color: COLORS.darkText,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.darkText,
  },
  scrollContainer: {
  },
  contentCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 30,
    boxShadow: '0px -3px 10px rgba(0, 0, 0, 0.15)',
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
  clearButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    width: 55,
  },
  clearButtonText: {
    fontSize: 18,
    color: COLORS.white,
    fontWeight: 'bold',
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
