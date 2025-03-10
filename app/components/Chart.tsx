import type React from "react"
import { View, Text, StyleSheet, Dimensions } from "react-native"
import { PieChart } from "react-native-chart-kit"
import { useTheme } from "../context/ThemeContext"
import { useFinance } from "../context/FinanceContext"
import { formatCurrency } from "../utils/formatters"

interface ChartProps {
  title: string
  type: "income" | "expense"
  period: "week" | "month" | "year"
}

const Chart: React.FC<ChartProps> = ({ title, type, period }) => {
  const { colors, isDark } = useTheme()
  const { transactions, categories } = useFinance()

  // Filter transactions by type and period
  const filteredTransactions = transactions.filter((t) => {
    if (t.type !== type) return false

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

  // Group transactions by category
  const categoryTotals: Record<string, number> = {}

  filteredTransactions.forEach((transaction) => {
    if (transaction.categoryId) {
      if (!categoryTotals[transaction.categoryId]) {
        categoryTotals[transaction.categoryId] = 0
      }
      categoryTotals[transaction.categoryId] += transaction.amount
    }
  })

  // Prepare data for pie chart
  const chartData = Object.entries(categoryTotals)
    .map(([categoryId, amount]) => {
      const category = categories.find((c) => c.id === categoryId)
      return {
        name: category?.name || "Unknown",
        amount,
        color: category?.color || "#999999",
        legendFontColor: colors.text,
        legendFontSize: 12,
      }
    })
    .sort((a, b) => b.amount - a.amount)

  // Calculate total
  const total = chartData.reduce((sum, item) => sum + item.amount, 0)

  const styles = StyleSheet.create({
    container: {
      marginBottom: 24,
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      shadowColor: colors.text,
      shadowOpacity: 0.1,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
    },
    total: {
      fontSize: 18,
      fontWeight: "600",
      color: type === "income" ? colors.success : colors.danger,
    },
    chartContainer: {
      alignItems: "center",
      justifyContent: "center",
    },
    noDataContainer: {
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    },
    noDataText: {
      fontSize: 16,
      color: colors.text + "80",
      textAlign: "center",
    },
    legendContainer: {
      marginTop: 16,
    },
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    legendColor: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 8,
    },
    legendText: {
      fontSize: 14,
      color: colors.text,
      flex: 1,
    },
    legendAmount: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.text,
    },
    legendPercentage: {
      fontSize: 12,
      color: colors.text + "80",
      marginLeft: 4,
    },
  })

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.total}>{formatCurrency(total)}</Text>
      </View>

      {chartData.length > 0 ? (
        <>
          <View style={styles.chartContainer}>
            <PieChart
              data={chartData}
              width={Dimensions.get("window").width - 64}
              height={180}
              chartConfig={{
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => colors.text,
                style: {
                  borderRadius: 16,
                },
                backgroundColor: colors.card,
              }}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="0"
              absolute
            />
          </View>

          <View style={styles.legendContainer}>
            {chartData.map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>{item.name}</Text>
                <Text style={styles.legendAmount}>{formatCurrency(item.amount)}</Text>
                <Text style={styles.legendPercentage}>
                  {total > 0 ? `${Math.round((item.amount / total) * 100)}%` : "0%"}
                </Text>
              </View>
            ))}
          </View>
        </>
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No data available for this period</Text>
        </View>
      )}
    </View>
  )
}

export default Chart

