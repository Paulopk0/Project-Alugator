import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  FlatList,
} from 'react-native';

const COLORS = {
  background: '#F0FFF0',
  primary: '#1DE9B6',
  lightGreen: '#B8F3D8',
  darkText: '#444444ff',
  white: '#FFFFFF',
  shadow: '#00000026',
};

/**
 * Calendário simples em grid
 * Substitui react-native-calendars para evitar conflito de dependências
 */
const CalendarScreen = ({ navigation, route }) => {
  const screenHeight = Dimensions.get('window').height;
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  // Gera array de dias do mês
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  // Adiciona dias vazios do mês anterior
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Adiciona dias do mês atual
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleSelectDate = (day) => {
    if (day) {
      const selected = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateString = selected.toISOString().split('T')[0];
      setSelectedDate(dateString);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background verde */}
      <View style={[styles.background, { height: screenHeight * 0.18 }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Calendário</Text>
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
          {/* Calendário Customizado */}
          <View style={styles.calendarContainer}>
            {/* Header com mês/ano e botões de navegação */}
            <View style={styles.monthHeader}>
              <TouchableOpacity onPress={handlePrevMonth} style={styles.monthButton}>
                <Text style={styles.monthButtonText}>←</Text>
              </TouchableOpacity>
              <Text style={styles.monthTitle}>
                {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </Text>
              <TouchableOpacity onPress={handleNextMonth} style={styles.monthButton}>
                <Text style={styles.monthButtonText}>→</Text>
              </TouchableOpacity>
            </View>

            {/* Dias da semana */}
            <View style={styles.weekDays}>
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map((day, idx) => (
                <Text key={idx} style={styles.weekDay}>
                  {day}
                </Text>
              ))}
            </View>

            {/* Grid de dias */}
            <View style={styles.daysGrid}>
              {days.map((day, idx) => {
                const dayDateString = day 
                  ? `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                  : null;
                const isSelected = day && selectedDate === dayDateString;
                
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.dayCell,
                      !day && styles.emptyCell,
                      isSelected && styles.selectedCell,
                    ]}
                    onPress={() => handleSelectDate(day)}
                    disabled={!day}
                  >
                    {day && (
                      <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>
                        {day}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Informações da data selecionada */}
          {selectedDate && (
            <View style={styles.selectedDateInfo}>
              <Text style={styles.selectedDateTitle}>Data Selecionada:</Text>
              <Text style={styles.selectedDate}>
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>

              {/* Botão para confirmar seleção */}
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => {
                  // Passa a data de volta e fecha o modal
                  if (route.params?.onSelectDate) {
                    route.params.onSelectDate(selectedDate);
                  }
                  navigation.goBack();
                }}
              >
                <Text style={styles.confirmButtonText}>Confirmar Data</Text>
              </TouchableOpacity>
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
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    zIndex: 1,
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
  calendarContainer: {
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: COLORS.lightGreen,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
    padding: 15,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  monthButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    minWidth: 40,
    alignItems: 'center',
  },
  monthButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.darkText,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkText,
    textTransform: 'capitalize',
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  weekDay: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.darkText,
    width: '14.28%',
    textAlign: 'center',
    paddingVertical: 8,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  emptyCell: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  selectedCell: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.darkText,
  },
  selectedDayText: {
    color: COLORS.white,
    fontWeight: '700',
  },
  selectedDateInfo: {
    padding: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    marginBottom: 20,
  },
  selectedDateTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  selectedDate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkText,
    textTransform: 'capitalize',
    marginBottom: 30,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.darkText,
  },
});

export default CalendarScreen;
