import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Alert
} from 'react-native';
import { getRentalById, confirmPickup, confirmReturn } from '../../../apis/RentalApi';
import imageMap from '../../../assets/images/imageMap';

const RentalTrackingScreen = ({ route, navigation }) => {
    const { rentalId, isNewRental } = route.params;
    const [rental, setRental] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [confirmationModal, setConfirmationModal] = useState(null); // { type: 'pickup' | 'return', stepTitle: string }

    useEffect(() => {
        loadRentalDetails();
        
        // Mostra mensagem de sucesso se for um novo aluguel
        if (isNewRental) {
            setTimeout(() => {
                Alert.alert(
                    '🎉 Pagamento Confirmado!',
                    'Seu aluguel foi realizado com sucesso. Você pode acompanhar o status aqui.',
                    [{ text: 'OK' }]
                );
            }, 500);
        }
    }, []);

    const loadRentalDetails = async () => {
        try {
            setLoading(true);
            const response = await getRentalById(rentalId);
            if (response.status === 200) {
                // Transforma os dados do backend para o formato esperado
                const rentalData = {
                    ...response.data,
                    item: {
                        id: response.data.itemId,
                        title: response.data.itemTitle,
                        photos: response.data.itemPhoto,
                        description: response.data.itemDescription,
                        priceDaily: response.data.itemPriceDaily
                    }
                };
                setRental(rentalData);
            }
        } catch (error) {
            console.error('Erro ao carregar detalhes do aluguel:', error);
            Alert.alert('Erro', 'Não foi possível carregar os detalhes do aluguel');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmPickup = async () => {
        setConfirmationModal({
            type: 'pickup',
            stepTitle: 'Retirada Do Item',
            message: 'Deseja confirmar que retirou o item?'
        });
    };

    const handleConfirmReturn = async () => {
        setConfirmationModal({
            type: 'return',
            stepTitle: 'Devolução Do Item',
            message: 'Deseja confirmar a devolução do item?'
        });
    };

    const executeConfirmation = async () => {
        if (!confirmationModal) return;
        
        const { type } = confirmationModal;
        
        try {
            setActionLoading(true);
            
            let response;
            if (type === 'pickup') {
                response = await confirmPickup(rentalId);
            } else if (type === 'return') {
                response = await confirmReturn(rentalId);
            }
            
            if (response.status === 200) {
                // Fecha o modal
                setConfirmationModal(null);
                
                // Recarrega os dados do aluguel (atualização do estado)
                await loadRentalDetails();
                
                // Mostra mensagem de sucesso
                const successMessage = type === 'pickup' 
                    ? '✅ Retirada confirmada com sucesso!' 
                    : '✅ Devolução confirmada com sucesso!';
                
                Alert.alert('Sucesso!', successMessage);
                
                // Se foi devolução, redireciona após 2 segundos
                if (type === 'return') {
                    setTimeout(() => {
                        navigation.navigate('StoreMain');
                    }, 2000);
                }
            } else {
                Alert.alert('Erro', response.message || 'Não foi possível confirmar a ação');
            }
        } catch (error) {
            console.error('Erro ao confirmar ação:', error);
            Alert.alert('Erro', 'Não foi possível confirmar a ação: ' + error.message);
        } finally {
            setActionLoading(false);
        }
    };

    const cancelConfirmation = () => {
        setConfirmationModal(null);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    };

    const getTrackingSteps = () => {
        if (!rental) return [];

        const startDate = new Date(rental.startDate);
        const endDate = new Date(rental.endDate);
        const now = new Date();

        // Calcula as datas de cada etapa
        const reservationDate = startDate;
        const pickupDate = startDate;
        const activeUntilDate = endDate;
        const returnDate = new Date(endDate);
        returnDate.setDate(returnDate.getDate() + 1);

        // Define o status de cada etapa
        const steps = [
            {
                id: 1,
                title: 'Reserva Confirmada',
                date: formatDate(reservationDate),
                completed: true,
                status: 'Confirmado',
                action: null
            },
            {
                id: 2,
                title: 'Retirada Do Item',
                date: formatDate(pickupDate),
                completed: rental.status === 'active' || rental.status === 'completed',
                status: rental.status === 'active' || rental.status === 'completed' ? 'Confirmado' : 'Confirmar',
                action: (rental.status === 'pending' || rental.status === 'confirmed') ? handleConfirmPickup : null
            },
            {
                id: 3,
                title: 'Aluguel Ativo',
                date: `Até ${formatDate(activeUntilDate)}`,
                completed: rental.status === 'active' || rental.status === 'completed',
                status: rental.status === 'active' ? 'Ativo' : rental.status === 'completed' ? 'Finalizado' : 'Pendente',
                action: null
            },
            {
                id: 4,
                title: 'Pendente Para Devolução',
                date: formatDate(returnDate),
                completed: rental.status === 'completed',
                status: rental.status === 'completed' ? 'Confirmado' : 'Confirmar',
                action: rental.status === 'active' ? handleConfirmReturn : null
            }
        ];

        return steps;
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00CBA9" />
                <Text style={styles.loadingText}>Carregando...</Text>
            </View>
        );
    }

    if (!rental) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Aluguel não encontrado</Text>
            </View>
        );
    }

    const steps = getTrackingSteps();
    const itemImage = rental.item?.photos ? imageMap[rental.item.photos.split(',')[0]] : null;

    return (
        <View style={styles.container}>
            {/* Background verde com header */}
            <View style={styles.backgroundGreen}>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Acompanhamento</Text>
                </View>
            </View>

            {/* Botão de voltar (flutuante) */}
            <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>

            {/* ScrollView com conteúdo */}
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Card branco com conteúdo */}
                <View style={styles.contentCard}>
                    {/* Item Info Card */}
                    <View style={styles.itemInfoCard}>
                        <Text style={styles.itemName}>{rental.item?.title || 'Item'}</Text>
                        {itemImage && (
                            <Image source={itemImage} style={styles.itemImage} resizeMode="contain" />
                        )}
                    </View>

                    {/* Tracking Steps */}
                    <View style={styles.trackingContainer}>
                        {steps.map((step, index) => (
                            <View key={step.id} style={styles.stepContainer}>
                                <View style={styles.stepLeft}>
                                    <View style={[
                                        styles.stepCircle,
                                        step.completed && styles.stepCircleCompleted
                                    ]}>
                                        {step.completed && (
                                            <Text style={styles.checkmark}>✓</Text>
                                        )}
                                    </View>
                                    {index < steps.length - 1 && (
                                        <View style={[
                                            styles.stepLine,
                                            step.completed && styles.stepLineCompleted
                                        ]} />
                                    )}
                                </View>

                                <View style={styles.stepRight}>
                                    <View style={styles.stepContent}>
                                        <Text style={styles.stepTitle}>{step.title}</Text>
                                        <Text style={styles.stepDate}>({step.date})</Text>
                                    </View>
                                    {step.action ? (
                                        <TouchableOpacity
                                            style={styles.actionButton}
                                            onPress={step.action}
                                        >
                                            <Text style={styles.actionButtonText}>{step.status}</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <View style={[
                                            styles.statusBadge,
                                            step.completed && styles.statusBadgeCompleted
                                        ]}>
                                            <Text style={[
                                                styles.statusText,
                                                step.completed && styles.statusTextCompleted
                                            ]}>
                                                {step.status}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Modal de confirmação de ação */}
            {confirmationModal && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>{confirmationModal.stepTitle}</Text>
                        <Text style={styles.modalMessage}>{confirmationModal.message}</Text>
                        
                        {actionLoading ? (
                            <ActivityIndicator size="large" color="#1DE9B6" style={{ marginTop: 20 }} />
                        ) : (
                            <View style={styles.modalButtons}>
                                <TouchableOpacity 
                                    style={styles.modalCancelButton}
                                    onPress={cancelConfirmation}
                                >
                                    <Text style={styles.modalCancelText}>Cancelar</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={styles.modalConfirmButton}
                                    onPress={executeConfirmation}
                                >
                                    <Text style={styles.modalConfirmText}>Confirmar</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0FFF0',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1DE9B6',
    },
    loadingText: {
        marginTop: 10,
        color: '#FFF',
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1DE9B6',
    },
    errorText: {
        color: '#FFF',
        fontSize: 16,
    },
    
    // Background verde
    backgroundGreen: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 180,
        backgroundColor: '#1DE9B6',
        zIndex: 0,
    },
    headerContent: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#444444ff',
    },
    
    // Botão de voltar (flutuante)
    backButton: {
        position: 'absolute',
        top: 15,
        left: 20,
        zIndex: 999,
        padding: 5,
    },
    backButtonText: {
        fontSize: 28,
        color: '#444444ff',
        fontWeight: 'bold',
    },
    
    // ScrollView
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 160,
        paddingBottom: 40,
    },
    
    // Card branco com conteúdo
    contentCard: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 60,
        borderTopRightRadius: 60,
        paddingTop: 30,
        paddingHorizontal: 20,
        minHeight: 600,
        boxShadowColor: '#00000026',
        boxShadowOffset: { width: 0, height: -3 },
        boxShadowOpacity: 0.15,
        boxShadowRadius: 10,
        elevation: 10,
    },
    
    // Item Info Card
    itemInfoCard: {
        backgroundColor: '#E8F5F3',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 30,
    },
    itemName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#444444ff',
        marginBottom: 10,
        alignSelf: 'flex-start',
    },
    itemImage: {
        width: '100%',
        height: 150,
        marginTop: 10,
        borderRadius: 8,
    },
    
    // Tracking Steps
    trackingContainer: {
        paddingHorizontal: 10,
    },
    stepContainer: {
        flexDirection: 'row',
        marginBottom: 25,
    },
    stepLeft: {
        alignItems: 'center',
        marginRight: 15,
    },
    stepCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepCircleCompleted: {
        backgroundColor: '#1DE9B6',
    },
    checkmark: {
        fontSize: 22,
        color: '#FFF',
        fontWeight: 'bold',
    },
    stepLine: {
        width: 2,
        flex: 1,
        backgroundColor: '#E0E0E0',
        marginTop: 5,
    },
    stepLineCompleted: {
        backgroundColor: '#1DE9B6',
    },
    stepRight: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    stepContent: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#444444ff',
        marginBottom: 5,
    },
    stepDate: {
        fontSize: 14,
        color: '#666666',
    },
    statusBadge: {
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
    },
    statusBadgeCompleted: {
        backgroundColor: '#E8F5F3',
    },
    statusText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666666',
    },
    statusTextCompleted: {
        color: '#1DE9B6',
    },
    actionButton: {
        backgroundColor: '#1DE9B6',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        boxShadowColor: '#1DE9B6',
        boxShadowOffset: { width: 0, height: 2 },
        boxShadowOpacity: 0.25,
        boxShadowRadius: 4,
        elevation: 3,
    },
    actionButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#FFF',
    },
    bottomSpacing: {
        height: 100,
    },

    // Modal de confirmação
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modalContainer: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 24,
        width: '80%',
        maxWidth: 350,
        boxShadowColor: '#000',
        boxShadowOffset: { width: 0, height: 4 },
        boxShadowOpacity: 0.3,
        boxShadowRadius: 8,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#444444ff',
        marginBottom: 12,
    },
    modalMessage: {
        fontSize: 14,
        color: '#666666',
        lineHeight: 20,
        marginBottom: 24,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    modalCancelButton: {
        flex: 1,
        backgroundColor: '#E0E0E0',
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
    },
    modalCancelText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#666666',
    },
    modalConfirmButton: {
        flex: 1,
        backgroundColor: '#1DE9B6',
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
        boxShadowColor: '#1DE9B6',
        boxShadowOffset: { width: 0, height: 2 },
        boxShadowOpacity: 0.25,
        boxShadowRadius: 4,
        elevation: 3,
    },
    modalConfirmText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFF',
    },
});

export default RentalTrackingScreen;
