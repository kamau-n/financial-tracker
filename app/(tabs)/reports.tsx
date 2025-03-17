"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { useTheme } from "../context/ThemeContext"
import { useFinance } from "../context/FinanceContext"
import Chart from "../components/Chart"
import { formatCurrency } from "../utils/formatters"
import { SafeAreaView } from "react-native-safe-area-context"

const Reports = () => {
  const { colors } = useTheme()
  const { transactions, totalIncome, totalExpenses, balance } = useFinance()
  const [period, setPeriod] = useState<"week" | "month" | "year">("month")

  // Calculate savings
  const savings = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0

  // Get transactions for the selected period
  const getFilteredTransactions = () => {
    return transactions.filter((t) => {
      const transactionDate = new Date(t.date)
      const now = new Date()

      if (period === "week") {
        const weekAgo = new Date()
        weekAgo.setDate(now.getDate() - 7)
        return transactionDate >= weekAgo
      } else if (period === "month") {
        const monthAgo = new Date()
        monthAgo.setMonth(now.getMonth() - 1)
        return transactionDate >= monthAgo
      } else if (period === "year") {
        const yearAgo = new Date()
        yearAgo.setFullYear(now.getFullYear() - 1)
        return transactionDate >= yearAgo
      }

      return true
    })
  }

  const filteredTransactions = getFilteredTransactions()
  const periodIncome = filteredTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
  const periodExpenses = filteredTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
  const periodSavings = periodIncome - periodExpenses
  const periodSavingsRate = periodIncome > 0 ? (periodSavings / periodIncome) * 100 : 0

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 16,
    },
    header: {
      marginBottom: 24,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.text + "99", // Adding transparency
    },
    periodSelector: {
      flexDirection: "row",
      backgroundColor: colors.card,
      borderRadius: 8,
      marginBottom: 16,
      overflow: "hidden",
    },
    periodButton: {
      flex: 1,
      paddingVertical: 12,
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
    summaryContainer: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
    },
    summaryTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 16,
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    summaryLabel: {
      fontSize: 16,
      color: colors.text,
    },
    summaryValue: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.text,
    },
    incomeValue: {
      color: colors.success,
    },
    expenseValue: {
      color: colors.danger,
    },
    savingsValue: {
      color: colors.primary,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 12,
    },
    savingsRateContainer: {
      alignItems: "center",
      marginTop: 16,
    },
    savingsRateLabel: {
      fontSize: 14,
      color: colors.text + "99", // Adding transparency
      marginBottom: 4,
    },
    savingsRateValue: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.primary,
    },
  })

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Financial Reports</Text>
            <Text style={styles.subtitle}>Track your financial progress</Text>
          </View>

          <View style={styles.periodSelector}>
            <TouchableOpacity
              style={[styles.periodButton, period === "week" && styles.periodButtonActive]}
              onPress={() => setPeriod("week")}
            >
              <Text style={[styles.periodButtonText, period === "week" && styles.periodButtonTextActive]}>
                This Week
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.periodButton, period === "month" && styles.periodButtonActive]}
              onPress={() => setPeriod("month")}
            >
              <Text style={[styles.periodButtonText, period === "month" && styles.periodButtonTextActive]}>
                This Month
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.periodButton, period === "year" && styles.periodButtonActive]}
              onPress={() => setPeriod("year")}
            >
              <Text style={[styles.periodButtonText, period === "year" && styles.periodButtonTextActive]}>
                This Year
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Summary</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Income</Text>
              <Text style={[styles.summaryValue, styles.incomeValue]}>{formatCurrency(periodIncome)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Expenses</Text>
              <Text style={[styles.summaryValue, styles.expenseValue]}>{formatCurrency(periodExpenses)}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Savings</Text>
              <Text style={[styles.summaryValue, styles.savingsValue]}>{formatCurrency(periodSavings)}</Text>
            </View>

            <View style={styles.savingsRateContainer}>
              <Text style={styles.savingsRateLabel}>Savings Rate</Text>
              <Text style={styles.savingsRateValue}>{periodSavingsRate.toFixed(1)}%</Text>
            </View>
          </View>

          <Chart title="Income" type="income" period={period} />
          <Chart title="Expenses" type="expense" period={period} />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Reports

