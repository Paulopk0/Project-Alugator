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
import { Calendar } from 'react-native-calendars';

const COLORS = {
  background: '#F0FFF0',
  primary: '#1DE9B6',
  lightGreen: '#B8F3D8',
  darkText: '#444444ff',
  white: '#FFFFFF',
  shadow: '#00000026',
};

const screenHeight = Dimensions.get('window').height;

const CalendarScreen = ({ navigation, route }) => {
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
      <StatusBar barStyle="light-content" />
      
      {/* Background verde */}
      <View style={styles.background}>
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
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.contentCard}>
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
              {new Date(selected + 'T00:00:00').toLocaleDateString('pt-BR', {
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
    height: screenHeight * 0.18,
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
  calendarContainer: {
    marginBottom: 20,
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
