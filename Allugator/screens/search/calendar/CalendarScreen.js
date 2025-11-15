import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';

const COLORS = {
  background: '#F0FFF0',
  primary: '#1DE9B6',
  lightGreen: '#B8F3D8',
  darkText: '#444444ff',
  white: '#FFFFFF',
  shadow: '#00000026',
};

const CalendarScreen = ({ navigation, route }) => {
  const screenHeight = Dimensions.get('window').height;
  
  const [selected, setSelected] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handleDayPress = (dateString) => {
    setSelected(dateString);
  };

  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < 42; i++) { // 6 semanas * 7 dias
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const days = generateCalendar();
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

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
        {/* Calendário */}
        <View style={styles.calendarContainer}>
          {/* Cabeçalho do mês */}
          <View style={styles.monthHeader}>
            <TouchableOpacity onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}>
              <Text style={styles.arrow}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.monthTitle}>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</Text>
            <TouchableOpacity onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Dias da semana */}
          <View style={styles.weekDays}>
            {dayNames.map(day => (
              <Text key={day} style={styles.weekDay}>{day}</Text>
            ))}
          </View>

          {/* Dias do mês */}
          <View style={styles.daysGrid}>
            {days.map((day, index) => {
              const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
              const isSelected = selected === day.toISOString().split('T')[0];
              const isToday = day.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.day,
                    !isCurrentMonth && styles.otherMonthDay,
                    isSelected && styles.selectedDay,
                    isToday && styles.today
                  ]}
                  onPress={() => handleDayPress(day.toISOString().split('T')[0])}
                >
                  <Text style={[
                    styles.dayText,
                    isSelected && styles.selectedDayText,
                    isToday && styles.todayText,
                    !isCurrentMonth && styles.otherMonthText
                  ]}>
                    {day.getDate()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Informações da data selecionada */}
        {selected && (
          <View style={styles.selectedDateInfo}>
            <Text style={styles.selectedDateTitle}>Data Selecionada:</Text>
            <Text style={styles.selectedDate}>
              {new Date(selected).toLocaleDateString('pt-BR', {
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
                  route.params.onSelectDate(selected);
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
    marginBottom: 15,
  },
  arrow: {
    fontSize: 24,
    color: COLORS.darkText,
    fontWeight: 'bold',
    paddingHorizontal: 10,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkText,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  weekDay: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.darkText,
    width: 40,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  day: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    borderRadius: 20,
  },
  dayText: {
    fontSize: 14,
    color: COLORS.darkText,
  },
  selectedDay: {
    backgroundColor: COLORS.primary,
  },
  selectedDayText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  today: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  todayText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  otherMonthDay: {
    opacity: 0.3,
  },
  otherMonthText: {
    color: COLORS.darkText,
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
