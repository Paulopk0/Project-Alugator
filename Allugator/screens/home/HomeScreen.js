import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import useAuth from '../../hooks/useAuth';
import { getMyRentedOutItems, getUserRentals } from '../../apis/RentalApi';

const COLORS = {
  primaryGreen: '#1DE9B6',
  green: '#3e7b74',
  lightGreen: '#D4F4DD',
  darkGreen: "#00352c",
  background: '#F0FFF0',
  darkColor: "#052224",
  expenseColor: '#aa0505',
  expenseBlue: '#0046FF'
};

const HomeScreen = ({ navigation }) => {
  const { height: screenHeight } = Dimensions.get('window');

  const { user: currentUser } = useAuth();

  // Estado: aba selecionada ('daily', 'weekly', 'monthly')
  const [selectedTab, setSelectedTab] = useState('daily');

  const [totalEarning, setTotalEarning] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  const [weeklyEarning, setWeeklyEarning] = useState(0);
  const [weeklyExpense, setWeeklyExpense] = useState(0);

  const [monthlyEarning, setMonthlyEarning] = useState(0);
  const [monthlyExpense, setMonthlyExpense] = useState(0);

  const [transactions, setTransactions] = useState([]);

  useEffect(() => { loadTransactions() }, []);

  const loadTransactions = async () => {
    try {
      const userRentals = await getUserRentals();
      const rentedOutItems = await getMyRentedOutItems();
      const formattedTransactions = [];

      if (userRentals.rentals) {
        setTotalExpense(userRentals.rentals.reduce((sum, rental) => sum + rental.totalPrice, 0).toFixed(2));
        setWeeklyExpense((userRentals.rentals.filter(rental => {
          const startDate = new Date(rental.startDate);
          const now = new Date();
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(now.getDate() - 7);
          return startDate >= oneWeekAgo && startDate <= now;
        }).reduce((sum, rental) => sum + rental.totalPrice, 0).toFixed(2)));
        setMonthlyExpense((userRentals.rentals.filter(rental => {
          const startDate = new Date(rental.startDate);
          const now = new Date();
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(now.getMonth() - 1);
          return startDate >= oneMonthAgo && startDate <= now;
        }).reduce((sum, rental) => sum + rental.totalPrice, 0).toFixed(2)));

        formattedTransactions.push(userRentals.rentals.map(rental => ({
          id: rental.id,
          type: 'expense',
          date: formatDate(rental.startDate),
          name: rental.itemTitle,
          totalPrice: rental.totalPrice,
          startDate: rental.startDate,
          endDate: rental.endDate,
        })));
      }

      if (rentedOutItems.rentals) {
        setTotalEarning(rentedOutItems.rentals.reduce((sum, rental) => sum + rental.totalPrice, 0).toFixed(2));
        setWeeklyEarning(rentedOutItems.rentals.filter(rental => {
          const startDate = new Date(rental.startDate);
          const now = new Date();
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(now.getDate() - 7);
          return startDate >= oneWeekAgo && startDate <= now;
        }).reduce((sum, rental) => sum + rental.totalPrice, 0).toFixed(2));
        setMonthlyEarning(rentedOutItems.rentals.filter(rental => {
          const startDate = new Date(rental.startDate);
          const now = new Date();
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(now.getMonth() - 1);
          return startDate >= oneMonthAgo && startDate <= now;
        }).reduce((sum, rental) => sum + rental.totalPrice, 0).toFixed(2));

        formattedTransactions.push(rentedOutItems.rentals.map(rental => ({
          type: 'earning',
          date: formatDate(rental.startDate),
          name: rental.itemTitle,
          totalPrice: rental.totalPrice,
          startDate: rental.startDate,
          endDate: rental.endDate,
        })));
      }
      setTransactions(formattedTransactions.flat());

    } catch (error) {
      console.error('❌ Erro ao carregar transações:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Data indisponível';

    const date = new Date(dateString);
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const day = date.getDate();

    return `${time} - Dia ${day}/${date.getMonth() + 1}`;
  };

  const calculatePrice = (totalPrice, startDate, endDate) => {
    let days = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
    switch (selectedTab) {
      case 'weekly':
        if (days < 7) return totalPrice;
        days = days / 7;
        break;
      case 'monthly':
        if (days < 30) return totalPrice;
        days /= 30;
        break;
    }
    return totalPrice / days;
  };

  const renderTransactionItem = (tx) => {
    const price = calculatePrice(tx.totalPrice, tx.startDate, tx.endDate);
    const priceFormatted = (Number.isNaN(price) ? 0 : price).toFixed(2);

    return (
      <View key={tx.id} style={styles.transactionItem}>
        <View style={[
          styles.txIcon,
          { backgroundColor: tx.type === 'earning' ? "#4caf50" : "#ff5252" }
        ]}>
          <Text style={styles.txIconText}>
            {tx.type === 'earning' ? '+' : '-'}
          </Text>
        </View>
        <View style={styles.txInfo}>
          <Text style={styles.txTitle}>{tx.name}</Text>
          <Text style={styles.txSubtitle}>{tx.date}</Text>
        </View>
        <Text style={tx.type === 'earning' ? styles.txAmount : styles.txAmountNegative}>
          {tx.type === 'earning' ? `R$${priceFormatted}` : `- R$${priceFormatted}`}
        </Text>
      </View>
    )
  };

  return (
    <View style={styles.container}>
      <StatusBar style='auto' />
      <View style={{ height: screenHeight * 0.35 }}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>Bem vindo {currentUser.name}</Text>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.totalsRow}>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total Obtido</Text>
            <Text style={styles.totalValue}>R${totalEarning}</Text>
          </View>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total Gasto</Text>
            <Text style={[styles.totalValue, { color: COLORS.expenseBlue}]}>- R${totalExpense}</Text>
          </View>
        </View>

        <View style={styles.cardsRow}>
          <View style={styles.card}>
            <Text style={styles.smallText}>Ganho da semana</Text>
            <Text style={styles.cardValue}>R${weeklyEarning}</Text>
            <Text style={styles.smallText}>Gasto da semana</Text>
            <Text style={[styles.cardValue, { color: COLORS.expenseColor }]}>- R${weeklyExpense}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.smallText}>Ganho do mês</Text>
            <Text style={styles.cardValue}>R${monthlyEarning}</Text>
            <Text style={styles.smallText}>Gasto do mês</Text>
            <Text style={[styles.cardValue, { color: COLORS.expenseColor }]}>- R${monthlyExpense}</Text>
          </View>
        </View>
      </View>

      <View style={styles.transactionsSection}>
        <Text style={styles.transactionsTitle}>Transações</Text>
        <View style={styles.segmentsContainer}>
          <TouchableOpacity
            style={selectedTab === 'daily' ? styles.segmentActive : styles.segmentInactive}
            onPress={() => setSelectedTab('daily')}
          >
            <Text style={styles.segmentText}>Dia</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={selectedTab === 'weekly' ? styles.segmentActive : styles.segmentInactive}
            onPress={() => setSelectedTab('weekly')}>
            <Text style={styles.segmentText}>Semana</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={selectedTab === 'monthly' ? styles.segmentActive : styles.segmentInactive}
            onPress={() => setSelectedTab('monthly')}>
            <Text style={styles.segmentText}>Mês</Text>
          </TouchableOpacity>
        </View>
        <ScrollView>
          {transactions.length === 0 ? (
            <View style={styles.transactionItem}>
              <View style={[styles.txIcon, { backgroundColor: "#0046FF" }]} />
              <View style={styles.txInfo}>
                <Text style={styles.txTitle}>Nenhuma transação</Text>
                <Text style={styles.txSubtitle}>Suas transações aparecerão aqui</Text>
              </View>
              <Text style={styles.txAmount}>
                {`R$0.00`}
              </Text>
            </View>
          ) : transactions.map(renderTransactionItem)}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.primaryGreen
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18
  },
  greeting: {
    color: COLORS.darkGreen,
    fontSize: 20,
    fontWeight: "700"
  },
  logo: {
    width: 70,
    height: 70,
    marginBottom: 2,
    borderRadius: 100,
    backgroundColor: COLORS.lightGreen,
    padding: 4
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14
  },
  totalBox: {
    flex: 1,
    padding: 12,
    marginRight: 8,
    borderRadius: 10
  },
  totalLabel: {
    color: COLORS.darkColor,
    fontSize: 12
  },
  totalValue: {
    color: COLORS.darkGreen,
    fontSize: 20,
    fontWeight: "800",
    marginTop: 6
  },
  cardsRow: {
    flexDirection: "row",
    marginBottom: 18,
    alignItems: "center"
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 12,
    marginRight: 10,
    borderRadius: 14
  },
  cardValue: {
    color: "#00332b",
    fontWeight: "700",
    marginBottom: 8
  },
  smallText: {
    color: "#6b8f86",
    fontSize: 12
  },
  // grudar sessão de transações no rodapé
  transactionsSection: {
    marginTop: 6,
    backgroundColor: COLORS.background,
    flex: 1,
    marginHorizontal: -20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30
  },
  transactionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },
  transactionsTitle: {
    color: COLORS.darkGreen,
    fontSize: 18,
    fontWeight: "800"
  },
  segmentsContainer: {
    flexDirection: "row",
    paddingVertical: 6,
    marginBottom: 12,
    justifyContent: "space-around",
    backgroundColor: "#DFF7E2",
    borderRadius: 14
  },
  segmentInactive: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: "#C1F5C7",
    borderRadius: 12,
    marginHorizontal: 6,
    fontWeight: "0",
  },
  segmentActive: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: COLORS.primaryGreen,
    borderRadius: 12,
    marginHorizontal: 6,
  },
  segmentText: {
    textAlign: "center",
    color: COLORS.darkGreen,
    fontWeight: "700"
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 10
  },
  txIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    marginRight: 12,
    justifyContent: "center",
  },
  txIconText: {
    textAlign: "center",
    color: "#FFF",
    fontSize: 24,
    fontWeight: "700"
  },
  txInfo: {
    flex: 1
  },
  txTitle: {
    color: COLORS.darkColor,
    fontWeight: "700"
  },
  txSubtitle: {
    color: COLORS.green,
    fontSize: 12
  },
  txAmount: {
    color: COLORS.darkGreen,
    fontWeight: "800"
  },
  txAmountNegative: {
    color: COLORS.expenseColor,
    fontWeight: "800"
  }
});

export default HomeScreen;