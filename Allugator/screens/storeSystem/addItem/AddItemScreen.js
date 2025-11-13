/**
 * AddItemScreen - Tela de cadastro de novos itens
 * 
 * Permite usuários cadastrarem seus próprios itens para aluguel.
 * 
 * Campos obrigatórios (*):
 * - Título*
 * - Descrição*
 * - Preço diário*
 * - Categoria* (seleção)
 * - Condição* (seleção)
 * - Localização*
 * 
 * Campos opcionais:
 * - Caução (valor de segurança)
 * - Nome da foto (padrão: 'default')
 * 
 * IMPORTANTE: Valores de category e condition devem corresponder
 * exatamente aos valores do banco de dados (case-sensitive).
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Dimensions,
    StatusBar
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { createItem } from '../../../apis/ItemManagementApi';
import MessageDisplay from '../../../components/MessageDisplay/MessageDisplay';
import { translateItemStatus } from '../../../utils/translationHelpers';

// Paleta de cores do aplicativo
const COLORS = {
    background: '#F0FFF0',
    primary: '#1DE9B6',
    darkText: '#444444ff',
    white: '#FFFFFF',
    lightGray: '#E0E0E0',
    gray: '#888888',
    lightGreen: '#E8F5E9',
    shadow: '#00000026',
};

const AddItemScreen = ({ navigation }) => {
    const screenHeight = Dimensions.get('window').height;
    
    // ESTADOS DO FORMULÁRIO
    const [title, setTitle] = useState(''); // Título do item
    const [description, setDescription] = useState(''); // Descrição detalhada
    const [priceDaily, setPriceDaily] = useState(''); // Preço por dia (string para input)
    const [category, setCategory] = useState('Eletrônicos'); // Categoria (valor padrão)
    const [condition, setCondition] = useState('Excelente'); // Condição (valor padrão)
    const [location, setLocation] = useState(''); // Localização do item
    const [securityDeposit, setSecurityDeposit] = useState(''); // Caução (opcional)
    const [photos, setPhotos] = useState(''); // Nome da foto (opcional, padrão: 'default')
    
    // ESTADOS DE UI
    const [loading, setLoading] = useState(false); // Indicador de envio
    const [message, setMessage] = useState(''); // Mensagem de feedback
    const [messageType, setMessageType] = useState('error'); // Tipo da mensagem (error/success)

    /**
     * Categorias disponíveis
     * ATENÇÃO: Valores devem corresponder exatamente ao banco de dados
     * (incluindo acentuação e capitalização)
     */
    const categories = [
        { label: 'Eletrônicos', value: 'Eletrônicos' },
        { label: 'Ferramentas', value: 'Ferramentas' },
        { label: 'Veículos', value: 'Veículos' },
        { label: 'Móveis', value: 'Móveis' },
        { label: 'Esportes', value: 'Esportes' },
        { label: 'Camping', value: 'Camping' },
        { label: 'Eventos', value: 'Eventos' },
        { label: 'Outros', value: 'Outros' }
    ];

    /**
     * Condições disponíveis
     * ATENÇÃO: Valores devem corresponder exatamente ao banco de dados
     */
    const conditions = [
        { label: 'Excelente', value: 'Excelente' },
        { label: 'Bom', value: 'Bom' }
    ];

    /**
     * Exibe mensagem de feedback para o usuário
     * @param {string} text - Texto da mensagem
     * @param {string} type - Tipo: 'error' ou 'success'
     */
    const showMessage = (text, type = 'error') => {
        setMessage(text);
        setMessageType(type);
    };

    /**
     * Valida e envia formulário para criar novo item
     * 
     * Validações:
     * 1. Título obrigatório
     * 2. Descrição obrigatória
     * 3. Preço válido (> 0)
     * 4. Localização obrigatória
     * 
     * Se sucesso: mostra mensagem e volta para tela anterior após 2s
     * Se erro: exibe mensagem de erro
     */
    const handleSubmit = async () => {
        // VALIDAÇÕES DE CAMPOS OBRIGATÓRIOS
        if (!title.trim()) {
            showMessage('Por favor, informe o título do item');
            return;
        }

        if (!description.trim()) {
            showMessage('Por favor, informe a descrição do item');
            return;
        }

        if (!priceDaily || parseFloat(priceDaily) <= 0) {
            showMessage('Por favor, informe um preço válido');
            return;
        }

        if (!location.trim()) {
            showMessage('Por favor, informe a localização');
            return;
        }

        try {
            setLoading(true);
            console.log('📤 Enviando item para API...');

            // Monta objeto com dados do item
            const itemData = {
                title,
                description,
                priceDaily: parseFloat(priceDaily), // Converte para número
                category, // Valor exato do banco
                condition, // Valor exato do banco
                location,
                securityDeposit: securityDeposit ? parseFloat(securityDeposit) : 0,
                photos: photos || 'default' // Se vazio, usa 'default'
            };

            console.log('📦 Dados do item:', itemData);

            // Envia para API
            const response = await createItem(itemData);
            
            console.log('📥 Resposta da API:', response);

            // Verifica sucesso
            if (response.status === 201 || response.data?.id) {
                showMessage('Item cadastrado com sucesso! 🎉', 'success');
                
                // Aguarda 2 segundos para mostrar mensagem, depois volta
                setTimeout(() => {
                    navigation.goBack();
                }, 2000);
            } else {
                showMessage(response.message || 'Não foi possível cadastrar o item');
            }

        } catch (error) {
            console.error('❌ Erro ao cadastrar item:', error);
            showMessage('Não foi possível cadastrar o item. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Mensagem de feedback */}
            <MessageDisplay 
                message={message} 
                type={messageType}
                onHide={() => setMessage('')}
            />

            {/* Background verde */}
            <View style={[styles.background, { height: screenHeight * 0.18 }]}>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Cadastrar Item</Text>
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
                {/* Título */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Título do Item *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ex: Furadeira Profissional"
                        placeholderTextColor={COLORS.gray}
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                {/* Descrição */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Descrição *</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Descreva seu item em detalhes..."
                        placeholderTextColor={COLORS.gray}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </View>

                {/* Preço Diário */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Preço Diário (R$) *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="0.00"
                        placeholderTextColor={COLORS.gray}
                        value={priceDaily}
                        onChangeText={setPriceDaily}
                        keyboardType="decimal-pad"
                    />
                </View>

                {/* Categoria */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Categoria *</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={category}
                            onValueChange={setCategory}
                            style={styles.picker}
                        >
                            {categories.map((cat) => (
                                <Picker.Item 
                                    key={cat.value} 
                                    label={cat.label} 
                                    value={cat.value} 
                                />
                            ))}
                        </Picker>
                    </View>
                </View>

                {/* Estado/Condição */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Estado do Item *</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={condition}
                            onValueChange={setCondition}
                            style={styles.picker}
                        >
                            {conditions.map((cond) => (
                                <Picker.Item 
                                    key={cond.value} 
                                    label={cond.label} 
                                    value={cond.value} 
                                />
                            ))}
                        </Picker>
                    </View>
                </View>

                {/* Localização */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Localização *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ex: São Paulo - SP"
                        placeholderTextColor={COLORS.gray}
                        value={location}
                        onChangeText={setLocation}
                    />
                </View>

                {/* Caução */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Caução (R$)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="0.00"
                        placeholderTextColor={COLORS.gray}
                        value={securityDeposit}
                        onChangeText={setSecurityDeposit}
                        keyboardType="decimal-pad"
                    />
                    <Text style={styles.helperText}>Opcional - Valor retornável após devolução</Text>
                </View>

                {/* Fotos (nome da imagem) */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nome da Foto</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ex: furadeira1"
                        placeholderTextColor={COLORS.gray}
                        value={photos}
                        onChangeText={setPhotos}
                    />
                    <Text style={styles.helperText}>
                        Informe o nome da imagem que já está no projeto
                    </Text>
                </View>

                {/* Botão Cadastrar */}
                <TouchableOpacity 
                    style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                        <Text style={styles.submitButtonText}>Cadastrar Item</Text>
                    )}
                </TouchableOpacity>

                    <View style={styles.bottomSpacing} />
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
        paddingTop: 15,
        paddingBottom: 20,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 15,
        left: 20,
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
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.darkText,
        marginBottom: 8,
    },
    input: {
        backgroundColor: COLORS.lightGreen,
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        color: COLORS.darkText,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
    },
    textArea: {
        height: 100,
        paddingTop: 15,
    },
    pickerContainer: {
        backgroundColor: COLORS.lightGreen,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        overflow: 'hidden',
    },
    picker: {
        height: 50,
    },
    helperText: {
        fontSize: 12,
        color: COLORS.gray,
        marginTop: 5,
        fontStyle: 'italic',
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 25,
        padding: 18,
        alignItems: 'center',
        marginTop: 20,
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
        boxShadowRadius: 3.84,
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
    bottomSpacing: {
        height: 40,
    },
});

export default AddItemScreen;
