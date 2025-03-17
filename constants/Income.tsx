"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from "react-native"
import { Calendar, Check } from "lucide-react-native"
import DateTimePicker from "@react-native-community/datetimepicker"
import { useTheme } from "../app/context/ThemeContext"
import { useFinance } from "../app/context/FinanceContext"
import AmountInput from "../app/components/AmountInput"
import CategoryPicker from "../app/components/CategoryPicker"
import { formatDateFull } from "../app/utils/formatters"
import TransactionItem from "../app/components/TransactionItem"
import { SafeAreaView } from "react-native-safe-area-context"

const Income = () => {
  const { colors } = useTheme()
  const { addTransaction, updateTransaction, transactions } = useFinance()

  const [amount, setAmount] = useState(0)
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined)
  const [subCategoryId, setSubCategoryId] = useState<string | undefined>(undefined)

  const [isEditing, setIsEditing] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)

  const handleCategorySelect = (catId: string, subCatId?: string) => {
    setCategoryId(catId)
    setSubCategoryId(subCatId)
  }

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false)
    if (selectedDate) {
      setDate(selectedDate)
    }
  }

  const handleTransactionPress = (transaction) => {
    setIsEditing(true)
    setEditingTransaction(transaction)

    // Pre-fill the form with transaction data
    setAmount(transaction.amount)
    setDescription(transaction.description)
    setDate(new Date(transaction.date))
    setCategoryId(transaction.categoryId)
    setSubCategoryId(transaction.subCategoryId)
  }

  const handleSave = () => {
    if (amount <= 0) {
      // Show error
      return
    }

    if (isEditing && editingTransaction) {
      // Update existing transaction
      updateTransaction({
        ...editingTransaction,
        amount,
        description: description.trim() || "Income",
        date: date.toISOString(),
        categoryId,
        subCategoryId,
      })

      // Reset editing state
      setIsEditing(false)
      setEditingTransaction(null)
    } else {
      // Add new transaction
      addTransaction({
        amount,
        description: description.trim() || "Income",
        date: date.toISOString(),
        type: "income",
        categoryId,
        subCategoryId,
      })
    }

    // Reset form
    setAmount(0)
    setDescription("")
    setDate(new Date())
    setCategoryId(undefined)
    setSubCategoryId(undefined)
  }

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
    formContainer: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
    },
    label: {
      fontSize: 16,
      fontWeight: "500",
      marginBottom: 8,
      color: colors.text,
    },
    inputContainer: {
      marginBottom: 16,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.background,
    },
    dateButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      backgroundColor: colors.background,
    },
    dateText: {
      fontSize: 16,
      color: colors.text,
    },
    saveButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      padding: 16,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
    },
    saveButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
      marginLeft: 8,
    },
    disabledButton: {
      opacity: 0.6,
    },
  })

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{isEditing ? "Edit Income" : "Add Income"}</Text>
            <Text style={styles.subtitle}>Record your earnings</Text>
          </View>

          <View style={styles.formContainer}>
            <AmountInput value={amount} onChange={setAmount} isExpense={false} />

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={styles.input}
                value={description}
                onChangeText={setDescription}
                placeholder="Salary, Freelance, etc."
                placeholderTextColor={colors.text + "60"} // Adding transparency
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                <Text style={styles.dateText}>{formatDateFull(date.toISOString())}</Text>
                <Calendar size={20} color={colors.text} />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker value={date} mode="date" display="default" onChange={handleDateChange} />
              )}
            </View>

            <CategoryPicker
              selectedCategoryId={categoryId}
              selectedSubCategoryId={subCategoryId}
              onCategorySelect={handleCategorySelect}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, amount <= 0 && styles.disabledButton]}
            onPress={handleSave}
            disabled={amount <= 0}
          >
            <Check size={20} color="white" />
            <Text style={styles.saveButtonText}>Save Income</Text>
          </TouchableOpacity>

          <View style={{ marginTop: 24 }}>
            <Text style={styles.title}>Income History</Text>

            {transactions
              .filter((t) => t.type === "income")
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} onPress={handleTransactionPress} />
              ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Income

