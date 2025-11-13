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
        Alert.alert(
            'Confirmar Retirada',
            'Deseja confirmar que retirou o item?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel'
                },
                {
                    text: 'Confirmar',
                    onPress: async () => {
                        try {
                            const response = await confirmPickup(rentalId);
                            if (response.status === 200) {
                                Alert.alert('Sucesso!', 'Retirada confirmada com sucesso!');
                                loadRentalDetails();
                            }
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível confirmar a retirada');
                        }
                    }
                }
            ]
        );
    };

    const handleConfirmReturn = async () => {
        Alert.alert(
            'Confirmar Devolução',
            'Deseja confirmar a devolução do item?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel'
                },
                {
                    text: 'Confirmar',
                    onPress: async () => {
                        try {
                            const response = await confirmReturn(rentalId);
                            if (response.status === 200) {
                                Alert.alert('Sucesso!', 'Devolução confirmada com sucesso!', [
                                    {
                                        text: 'OK',
                                        onPress: () => navigation.navigate('StoreMain')
                                    }
                                ]);
                            }
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível confirmar a devolução');
                        }
                    }
                }
            ]
        );
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
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Acompanhamento{'\n'}Do Aluguel</Text>
            </View>

            {/* Item Info Card */}
            <View style={styles.itemCard}>
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

            {/* Bottom Spacing */}
            <View style={styles.bottomSpacing} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#00CBA9',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#00CBA9',
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
        backgroundColor: '#00CBA9',
    },
    errorText: {
        color: '#FFF',
        fontSize: 16,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    backButton: {
        marginBottom: 10,
    },
    backButtonText: {
        fontSize: 28,
        color: '#000',
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        lineHeight: 30,
    },
    itemCard: {
        backgroundColor: '#E8F5F3',
        marginHorizontal: 20,
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 10,
        alignSelf: 'flex-start',
    },
    itemImage: {
        width: '100%',
        height: 150,
        marginTop: 10,
    },
    trackingContainer: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 30,
        paddingTop: 30,
        minHeight: 400,
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
        backgroundColor: '#00CBA9',
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
        backgroundColor: '#00CBA9',
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
        color: '#000',
        marginBottom: 5,
    },
    stepDate: {
        fontSize: 14,
        color: '#666',
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
        color: '#666',
    },
    statusTextCompleted: {
        color: '#00CBA9',
    },
    actionButton: {
        backgroundColor: '#00CBA9',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
    },
    actionButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#FFF',
    },
    bottomSpacing: {
        height: 100,
    },
});

export default RentalTrackingScreen;
