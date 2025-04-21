"use client";

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Calendar, Check } from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "../context/ThemeContext";
import { useFinance, type Transaction } from "../context/FinanceContext";
import AmountInput from "../components/AmountInput";
import CategoryPicker from "../components/CategoryPicker";
import TransactionItem from "../components/TransactionItem";
import { formatDateFull } from "../utils/formatters";
import { SafeAreaView } from "react-native-safe-area-context";

const Transactions = () => {
  const { colors } = useTheme();
  const { transactions, addTransaction, updateTransaction } = useFinance();

  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [subCategoryId, setSubCategoryId] = useState<string | undefined>(
    undefined
  );
  const [transactionType, setTransactionType] = useState<"income" | "expense">(
    "expense"
  );

  const [isEditing, setIsEditing] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  // For transaction list
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");

  const filteredTransactions = transactions
    .filter((t) => {
      if (filter === "all") return true;
      return t.type === filter;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleCategorySelect = (catId: string, subCatId?: string) => {
    setCategoryId(catId);
    setSubCategoryId(subCatId);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const resetForm = () => {
    setAmount(0);
    setDescription("");
    setDate(new Date());
    setCategoryId(undefined);
    setSubCategoryId(undefined);
    setTransactionType("expense");
    setIsEditing(false);
    setEditingTransaction(null);
    setIsAddingTransaction(false);
  };

  const handleSave = () => {
    if (amount <= 0) {
      // Show error
      return;
    }

    if (isEditing && editingTransaction) {
      // Update existing transaction
      updateTransaction({
        ...editingTransaction,
        amount,
        description: description.trim() || "Transaction",
        date: date.toISOString(),
        categoryId,
        subCategoryId,
      });
    } else {
      // Add new transaction
      addTransaction({
        amount,
        description: description.trim() || "Transaction",
        date: date.toISOString(),
        type: transactionType,
        categoryId,
        subCategoryId,
      });
    }

    // Reset form and hide it
    resetForm();
  };

  const handleTransactionPress = (transaction: Transaction) => {
    setIsEditing(true);
    setIsAddingTransaction(true);
    setEditingTransaction(transaction);
    setTransactionType(transaction.type);

    // Pre-fill the form with transaction data
    setAmount(transaction.amount);
    setDescription(transaction.description);
    setDate(new Date(transaction.date));
    setCategoryId(transaction.categoryId);
    setSubCategoryId(transaction.subCategoryId);
  };

  const handleAddNewTransaction = () => {
    resetForm(); // Reset form before showing it
    setIsAddingTransaction(true);
  };

  const handleCancel = () => {
    resetForm();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 16,
    },
    header: {
      marginBottom: 16,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
    },
    filterContainer: {
      flexDirection: "row",
      backgroundColor: colors.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    filterButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    filterButtonActive: {
      backgroundColor: colors.primary,
    },
    filterButtonText: {
      fontSize: 14,
      color: colors.text,
    },
    filterButtonTextActive: {
      color: colors.card,
    },
    formContainer: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
    },
    typeSelector: {
      flexDirection: "row",
      marginBottom: 16,
      backgroundColor: colors.background,
      borderRadius: 8,
      overflow: "hidden",
    },
    typeButton: {
      flex: 1,
      paddingVertical: 12,
      alignItems: "center",
    },
    typeButtonActive: {
      backgroundColor: colors.primary,
    },
    typeButtonText: {
      fontSize: 16,
      color: colors.text,
    },
    typeButtonTextActive: {
      color: colors.card,
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
    addButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      padding: 16,
      alignItems: "center",
      marginBottom: 16,
    },
    addButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
    },
    transactionsList: {
      marginTop: 16,
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
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Transactions</Text>
            <View style={styles.filterContainer}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filter === "all" && styles.filterButtonActive,
                ]}
                onPress={() => setFilter("all")}>
                <Text
                  style={[
                    styles.filterButtonText,
                    filter === "all" && styles.filterButtonTextActive,
                  ]}>
                  All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filter === "income" && styles.filterButtonActive,
                ]}
                onPress={() => setFilter("income")}>
                <Text
                  style={[
                    styles.filterButtonText,
                    filter === "income" && styles.filterButtonTextActive,
                  ]}>
                  Income
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filter === "expense" && styles.filterButtonActive,
                ]}
                onPress={() => setFilter("expense")}>
                <Text
                  style={[
                    styles.filterButtonText,
                    filter === "expense" && styles.filterButtonTextActive,
                  ]}>
                  Expenses
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {!isAddingTransaction ? (
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddNewTransaction}>
              <Text style={styles.addButtonText}>Add New Transaction</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.formContainer}>
              <Text style={[styles.title, { marginBottom: 16 }]}>
                {isEditing ? "Edit Transaction" : "Add New Transaction"}
              </Text>

              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    transactionType === "expense" && styles.typeButtonActive,
                  ]}
                  onPress={() => setTransactionType("expense")}>
                  <Text
                    style={[
                      styles.typeButtonText,
                      transactionType === "expense" &&
                        styles.typeButtonTextActive,
                    ]}>
                    Expense
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    transactionType === "income" && styles.typeButtonActive,
                  ]}
                  onPress={() => setTransactionType("income")}>
                  <Text
                    style={[
                      styles.typeButtonText,
                      transactionType === "income" &&
                        styles.typeButtonTextActive,
                    ]}>
                    Income
                  </Text>
                </TouchableOpacity>
              </View>

              <AmountInput
                value={amount}
                onChange={setAmount}
                isExpense={transactionType === "expense"}
              />

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={styles.input}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Enter description..."
                  placeholderTextColor={colors.text + "60"}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Date</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}>
                  <Text style={styles.dateText}>
                    {formatDateFull(date.toISOString())}
                  </Text>
                  <Calendar size={20} color={colors.text} />
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                  />
                )}
              </View>

              <CategoryPicker
                selectedCategoryId={categoryId}
                selectedSubCategoryId={subCategoryId}
                onCategorySelect={handleCategorySelect}
              />

              <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    { flex: 1, backgroundColor: colors.border },
                  ]}
                  onPress={handleCancel}>
                  <Text style={[styles.saveButtonText, { color: colors.text }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    { flex: 1 },
                    amount <= 0 && styles.disabledButton,
                  ]}
                  onPress={handleSave}
                  disabled={amount <= 0}>
                  <Check size={20} color="white" />
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.transactionsList}>
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
                  No transactions found. Add a new transaction to get started.
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Transactions;
