/**
 * EditItemScreen - Tela de edição de item
 * 
 * Permite ao proprietário editar as informações do seu item quando está disponível
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { updateItem } from '../../../apis/ItemManagementApi';

// Paleta de cores do aplicativo
const COLORS = {
  background: '#F0FFF0',
  primary: '#1DE9B6',
  darkText: '#444444ff',
  white: '#FFFFFF',
  lightGray: '#E0E0E0',
  gray: '#888888',
  shadow: '#00000026',
  error: '#FF4444',
};

const EditItemScreen = ({ route, navigation }) => {
  const { item } = route.params;
  const screenHeight = Dimensions.get('window').height;
  
  // ESTADOS DO FORMULÁRIO
  const [title, setTitle] = useState(item.title || '');
  const [priceDaily, setPriceDaily] = useState(item.priceDaily?.toString() || '');
  const [description, setDescription] = useState(item.description || '');
  const [category, setCategory] = useState(item.category || '');
  const [condition, setCondition] = useState(item.condition || '');
  const [location, setLocation] = useState(item.location || '');
  const [securityDeposit, setSecurityDeposit] = useState(item.securityDeposit?.toString() || '0');
  const [loading, setLoading] = useState(false);

  // Categorias disponíveis
  const categories = [
    'Ferramentas',
    'Eletrônicos',
    'Esportes',
    'Jardinagem',
    'Festas',
    'Outros',
  ];

  // Condições disponíveis
  const conditions = [
    'Novo',
    'Excelente',
    'Bom',
    'Regular',
  ];

  /**
   * Valida e submete o formulário
   */
  const handleSubmit = async () => {
    // Validações
    if (!title.trim()) {
      Alert.alert('Erro', 'Por favor, preencha o título do item');
      return;
    }
    if (!priceDaily || parseFloat(priceDaily) <= 0) {
      Alert.alert('Erro', 'Por favor, informe um preço válido');
      return;
    }
    if (!category) {
      Alert.alert('Erro', 'Por favor, selecione uma categoria');
      return;
    }
    if (!condition) {
      Alert.alert('Erro', 'Por favor, selecione uma condição');
      return;
    }

    try {
      setLoading(true);
      
      const itemData = {
        title: title.trim(),
        priceDaily: parseFloat(priceDaily),
        description: description.trim(),
        category,
        condition,
        location: location.trim(),
        securityDeposit: parseFloat(securityDeposit) || 0,
        photos: item.photos, // Mantém as fotos originais
        status: item.status, // Mantém o status original
      };

      console.log('📤 Enviando atualização do item:', item.id);
      console.log('📦 Dados do item:', itemData);
      
      const response = await updateItem(item.id, itemData);
      
      console.log('📥 Resposta da API:', response);

      if (response.status === 200) {
        console.log('✅ Item atualizado com sucesso!');
        Alert.alert('Sucesso', 'Item atualizado com sucesso!', [
          {
            text: 'OK',
            onPress: () => {
              console.log('⬅️ Voltando para tela anterior');
              navigation.goBack();
            },
          },
        ]);
      } else {
        console.error('❌ Erro na resposta:', response);
        Alert.alert('Erro', response.message || 'Não foi possível atualizar o item');
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar item:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o item: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background verde com header */}
      <View style={[styles.background, { paddingTop: screenHeight * 0.02 }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Editar Item</Text>
        </View>
      </View>

      {/* Botão de voltar (acima de tudo) */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      {/* Card branco com formulário */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContainer, { paddingTop: screenHeight * 0.18 }]}
      >
        <View style={styles.contentCard}>
          {/* Título */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Título *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Furadeira Profissional"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor={COLORS.gray}
            />
          </View>

          {/* Preço por Dia */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Preço por Dia (R$) *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 25.00"
              value={priceDaily}
              onChangeText={setPriceDaily}
              keyboardType="decimal-pad"
              placeholderTextColor={COLORS.gray}
            />
          </View>

          {/* Categoria */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Categoria *</Text>
            <View style={styles.optionsContainer}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.optionButton,
                    category === cat && styles.optionButtonSelected,
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      category === cat && styles.optionTextSelected,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Condição */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Condição *</Text>
            <View style={styles.optionsContainer}>
              {conditions.map((cond) => (
                <TouchableOpacity
                  key={cond}
                  style={[
                    styles.optionButton,
                    condition === cond && styles.optionButtonSelected,
                  ]}
                  onPress={() => setCondition(cond)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      condition === cond && styles.optionTextSelected,
                    ]}
                  >
                    {cond}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Descrição */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descreva seu item..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor={COLORS.gray}
            />
          </View>

          {/* Localização */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Localização</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: São Paulo, SP"
              value={location}
              onChangeText={setLocation}
              placeholderTextColor={COLORS.gray}
            />
          </View>

          {/* Caução */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Caução (R$)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 50.00"
              value={securityDeposit}
              onChangeText={setSecurityDeposit}
              keyboardType="decimal-pad"
              placeholderTextColor={COLORS.gray}
            />
          </View>

          {/* Botão de Salvar */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.submitButtonText}>Salvar Alterações</Text>
            )}
          </TouchableOpacity>

          {/* Info */}
          <Text style={styles.infoText}>* Campos obrigatórios</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    zIndex: 0,
  },
  headerContent: {
    paddingTop: 10,
  },
  backButton: {
    position: 'absolute',
    top: 15,
    left: 20,
    zIndex: 999,
    padding: 5,
  },
  backButtonText: {
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
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkText,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    color: COLORS.darkText,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 15,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
  },
  optionButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkText,
  },
  optionTextSelected: {
    color: COLORS.white,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 13,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 15,
  },
});

export default EditItemScreen;
