"use client";

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";
import { formatCurrency, getCurrentMonthYear } from "../utils/formatters";
import TransactionItem from "../components/TransactionItem";
import { useFinance } from "../context/FinanceContext";
import Chart from "../components/Chart";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
//import BannerAdComponent from "../utils/ads";
import { Transaction } from "../utils/types";

const HomeScreen = () => {
  const { colors } = useTheme();
  const { transactions, totalIncome, totalExpenses, balance } = useFinance();
  const [period, setPeriod] = useState<"day" | "week" | "month" | "year">(
    "day"
  );
  const router = useRouter();

  // Filter transactions based on selected period
  const getFilteredTransactions = () => {
    const now = new Date();
    return transactions.filter((t) => {
      const transactionDate = new Date(t.date);

      if (period === "day") {
        return (
          transactionDate.getDate() === now.getDate() &&
          transactionDate.getMonth() === now.getMonth() &&
          transactionDate.getFullYear() === now.getFullYear()
        );
      } else if (period === "week") {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return transactionDate >= weekAgo;
      } else if (period === "month") {
        return (
          transactionDate.getMonth() === now.getMonth() &&
          transactionDate.getFullYear() === now.getFullYear()
        );
      } else {
        return transactionDate.getFullYear() === now.getFullYear();
      }
    });
  };

  const filteredTransactions = getFilteredTransactions();

  const handleAddTransaction = () => {
    router.push("transactions");
  };

  const handleViewAllTransactions = () => {
    router.push("transactions");
  };

  const handleTransactionPress = (transaction: Partial<Transaction>) => {
    router.push({
      pathname: "Transactions",
      params: { editTransaction: transaction?.id },
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    header: {
      padding: 16,
      backgroundColor: colors.primary,
    },
    monthYear: {
      fontSize: 14,
      color: colors.card + "CC",
      marginBottom: 8,
    },
    balanceContainer: {
      marginBottom: 16,
    },
    balanceLabel: {
      fontSize: 14,
      color: colors.card + "CC",
    },
    balanceAmount: {
      fontSize: 32,
      fontWeight: "bold",
      color: colors.card,
    },
    statsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    statItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    statIcon: {
      marginRight: 8,
      backgroundColor: colors.card + "33",
      padding: 4,
      borderRadius: 8,
    },
    statText: {
      color: colors.card,
    },
    statAmount: {
      fontWeight: "600",
    },
    content: {
      padding: 16,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
    },
    viewAllButton: {
      flexDirection: "row",
      alignItems: "center",
    },
    viewAllText: {
      fontSize: 14,
      color: colors.primary,
      marginRight: 4,
    },
    periodSelector: {
      flexDirection: "row",
      backgroundColor: colors.background,
      borderRadius: 8,
      marginBottom: 16,
      overflow: "hidden",
    },
    periodButton: {
      flex: 1,
      paddingVertical: 8,
      alignItems: "center",
    },
    periodButtonActive: {
      backgroundColor: colors.primary,
    },
    periodButtonText: {
      color: colors.text,
    },
    periodButtonTextActive: {
      color: colors.card,
      fontWeight: "500",
    },
    addButton: {
      position: "absolute",
      bottom: 24,
      right: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: colors.text,
      shadowOpacity: 0.2,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 4,
    },
    noTransactionsContainer: {
      padding: 24,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.card,
      borderRadius: 8,
    },
    noTransactionsText: {
      fontSize: 16,
      color: colors.text + "80",
      textAlign: "center",
      marginBottom: 16,
    },
    adContainer: {
      alignItems: "center",
      marginVertical: 10,
      backgroundColor: colors.background,
    },
  });

  return (
    <>
      <StatusBar style="inverted" backgroundColor={colors.primary} />
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <Text style={styles.monthYear}>{getCurrentMonthYear()}</Text>

            <View style={styles.balanceContainer}>
              <Text style={styles.balanceLabel}>Current Balance</Text>
              <Text style={styles.balanceAmount}>
                {balance ?? formatCurrency(balance)}
              </Text>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <View style={styles.statIcon}>
                  <TrendingUp size={16} color={colors.card} />
                </View>
                <View>
                  <Text style={styles.statText}>Income</Text>
                  <Text style={[styles.statText, styles.statAmount]}>
                    {balance ?? formatCurrency(totalIncome)}
                  </Text>
                </View>
              </View>

              <View style={styles.statItem}>
                <View style={styles.statIcon}>
                  <TrendingDown size={16} color={colors.card} />
                </View>
                <View>
                  <Text style={styles.statText}>Expenses</Text>
                  <Text style={[styles.statText, styles.statAmount]}>
                    {balance ?? formatCurrency(totalExpenses)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.content}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Expense Breakdown</Text>
            </View>

            <View style={styles.periodSelector}>
              {/* <TouchableOpacity
                style={[
                  styles.periodButton,
                  period === "day" && styles.periodButtonActive,
                ]}
                onPress={() => setPeriod("day")}>
                <Text
                  style={[
                    styles.periodButtonText,
                    period === "day" && styles.periodButtonTextActive,
                  ]}>
                  Day
                </Text>
              </TouchableOpacity> */}

              <TouchableOpacity
                style={[
                  styles.periodButton,
                  period === "week" && styles.periodButtonActive,
                ]}
                onPress={() => setPeriod("week")}>
                <Text
                  style={[
                    styles.periodButtonText,
                    period === "week" && styles.periodButtonTextActive,
                  ]}>
                  Week
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.periodButton,
                  period === "month" && styles.periodButtonActive,
                ]}
                onPress={() => setPeriod("month")}>
                <Text
                  style={[
                    styles.periodButtonText,
                    period === "month" && styles.periodButtonTextActive,
                  ]}>
                  Month
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.periodButton,
                  period === "year" && styles.periodButtonActive,
                ]}
                onPress={() => setPeriod("year")}>
                <Text
                  style={[
                    styles.periodButtonText,
                    period === "year" && styles.periodButtonTextActive,
                  ]}>
                  Year
                </Text>
              </TouchableOpacity>
            </View>

            <Chart title="Expenses" type="expense" period={period} />

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Transactions</Text>
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={handleViewAllTransactions}>
                <Text style={styles.viewAllText}>View All</Text>
                <ArrowRight size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  onPress={handleTransactionPress}
                />
              ))
            ) : (
              <View style={styles.noTransactionsContainer}>
                <Text style={styles.noTransactionsText}>
                  No transactions found for this period.
                </Text>
              </View>
            )}

            <View style={styles.adContainer}>
              {/* <BannerAdComponent /> */}
            </View>
          </View>
        </ScrollView>

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddTransaction}>
          <Plus size={24} color={colors.card} />
        </TouchableOpacity>
      </SafeAreaView>
    </>
  );
};

export default HomeScreen;
