import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Calendar } from 'react-native-calendars';

const COLORS = {
  background: '#F0FFF0',
  primary: '#1DE9B6',
  lightGreen: '#B8F3D8',
  darkText: '#444444',
  white: '#FFFFFF',
};

const CalendarScreen = ({ navigation }) => {
  const [selected, setSelected] = useState('');
  const [markedDates, setMarkedDates] = useState({});

  const handleDayPress = (day) => {
    setSelected(day.dateString);
    
    // Marcar a data selecionada
    const newMarked = {
      [day.dateString]: {
        selected: true,
        selectedColor: COLORS.primary,
      },
    };
    setMarkedDates(newMarked);
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
        <Text style={styles.headerTitle}>Calendário</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Calendário */}
        <View style={styles.calendarContainer}>
          <Calendar
            onDayPress={handleDayPress}
            markedDates={markedDates}
            theme={{
              backgroundColor: COLORS.lightGreen,
              calendarBackground: COLORS.lightGreen,
              textSectionTitleColor: COLORS.darkText,
              selectedDayBackgroundColor: COLORS.primary,
              selectedDayTextColor: COLORS.white,
              todayTextColor: COLORS.primary,
              dayTextColor: COLORS.darkText,
              textDisabledColor: '#d9e1e8',
              arrowColor: COLORS.darkText,
              monthTextColor: COLORS.darkText,
              indicatorColor: COLORS.primary,
              textDayFontWeight: '400',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '500',
              textDayFontSize: 14,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 12,
            }}
            style={styles.calendar}
          />
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
            
            <View style={styles.eventsContainer}>
              <Text style={styles.eventsTitle}>Agendamentos:</Text>
              <Text style={styles.noEvents}>Nenhum agendamento para esta data</Text>
            </View>
          </View>
        )}
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
  },
  calendarContainer: {
    margin: 20,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: COLORS.lightGreen,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calendar: {
    borderRadius: 15,
  },
  selectedDateInfo: {
    margin: 20,
    padding: 20,
    backgroundColor: COLORS.white,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    marginBottom: 20,
  },
  eventsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  eventsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkText,
    marginBottom: 10,
  },
  noEvents: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default CalendarScreen;
