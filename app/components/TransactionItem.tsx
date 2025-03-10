import type React from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { Trash2 } from "lucide-react-native"
import { useTheme } from "../context/ThemeContext"
import { type Transaction, useFinance } from "../context/FinanceContext"
import { formatCurrency, formatDate } from "../utils/formatters"

interface TransactionItemProps {
  transaction: Transaction
  onPress: (transaction: Transaction) => void
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onPress }) => {
  const { colors } = useTheme()
  const { categories, deleteTransaction } = useFinance()

  // Find category and subcategory names
  const category = categories.find((c) => c.id === transaction.categoryId)
  const subCategory = category?.subCategories.find((sc) => sc.id === transaction.subCategoryId)

  const handleDelete = () => {
    deleteTransaction(transaction.id)
  }

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      backgroundColor: colors.card,
      borderRadius: 8,
      marginBottom: 8,
      shadowColor: colors.text,
      shadowOpacity: 0.1,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    contentContainer: {
      flex: 1,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    description: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.text,
      marginBottom: 4,
    },
    details: {
      fontSize: 14,
      color: colors.text + "99", // Adding transparency
    },
    amount: {
      fontSize: 16,
      fontWeight: "600",
      color: transaction.type === "income" ? colors.success : colors.danger,
    },
    date: {
      fontSize: 12,
      color: colors.text + "80", // Adding transparency
      marginTop: 4,
    },
    categoryContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 4,
    },
    categoryDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 6,
    },
    categoryText: {
      fontSize: 12,
      color: colors.text + "99", // Adding transparency
    },
    deleteButton: {
      marginLeft: 12,
    },
  })

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(transaction)}>
      <View style={styles.contentContainer}>
        <View style={styles.row}>
          <Text style={styles.description}>{transaction.description}</Text>
          <Text style={styles.amount}>
            {transaction.type === "income" ? "+" : "-"} {formatCurrency(transaction.amount)}
          </Text>
        </View>

        <Text style={styles.date}>{formatDate(transaction.date)}</Text>

        {category && (
          <View style={styles.categoryContainer}>
            <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
            <Text style={styles.categoryText}>
              {category.name}
              {subCategory ? ` › ${subCategory.name}` : ""}
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Trash2 size={18} color={colors.danger} />
      </TouchableOpacity>
    </TouchableOpacity>
  )
}

export default TransactionItem

