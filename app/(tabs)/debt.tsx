import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from "react-native"
import { Plus, ArrowRight, ArrowLeft, Trash2, Calendar } from "lucide-react-native"
import DateTimePicker from "@react-native-community/datetimepicker"
import { useTheme } from "../context/ThemeContext"
import { useFinance } from "../context/FinanceContext"
import { formatCurrency, formatDate, formatDateFull } from "../utils/formatters"
import { SafeAreaView } from "react-native-safe-area-context"
import type { Debt, Payment } from "../utils/types"

export default function Debts() {
  const { colors } = useTheme()
  const { debts, addDebt, updateDebt, deleteDebt, addPayment } = useFinance()
  const [isAddingDebt, setIsAddingDebt] = useState(false)
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null)
  const [showPaymentForm, setShowPaymentForm] = useState(false)

  // Form states
  const [personName, setPersonName] = useState("")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(new Date())
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [type, setType] = useState<"lent" | "borrowed">("lent")
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showDueDatePicker, setShowDueDatePicker] = useState(false)
  
  // Payment form states
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentNote, setPaymentNote] = useState("")
  const [paymentDate, setPaymentDate] = useState(new Date())
  const [showPaymentDatePicker, setShowPaymentDatePicker] = useState(false)

  const resetForm = () => {
    setPersonName("")
    setAmount("")
    setDescription("")
    setDate(new Date())
    setDueDate(undefined)
    setType("lent")
    setIsAddingDebt(false)
    setSelectedDebt(null)
  }

  const resetPaymentForm = () => {
    setPaymentAmount("")
    setPaymentNote("")
    setPaymentDate(new Date())
    setShowPaymentForm(false)
  }

  const handleAddDebt = () => {
    if (!personName || !amount || isNaN(Number(amount))) return

    const newDebt = {
      personName,
      amount: Number(amount),
      description,
      date: date.toISOString(),
      dueDate: dueDate?.toISOString(),
      type,
      status: "pending",
      payments: []
    }

    addDebt(newDebt)
    resetForm()
  }

  const handleAddPayment = () => {
    if (!selectedDebt || !paymentAmount || isNaN(Number(paymentAmount))) return

    const payment = {
      amount: Number(paymentAmount),
      date: paymentDate.toISOString(),
      note: paymentNote
    }

    addPayment(selectedDebt.id, payment)
    resetPaymentForm()
  }

  const calculateRemainingAmount = (debt: Debt) => {
    const totalPaid = debt.payments.reduce((sum, payment) => sum + payment.amount, 0)
    return debt.amount - totalPaid
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
      color: colors.text + "99",
    },
    formContainer: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
    },
    inputContainer: {
      marginBottom: 16,
    },
    label: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.text,
      marginBottom: 8,
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
    addButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      padding: 16,
      alignItems: "center",
      marginBottom: 16,
    },
    addButtonText: {
      color: colors.card,
      fontSize: 16,
      fontWeight: "600",
    },
    debtItem: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    debtHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    personName: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
    },
    amount: {
      fontSize: 18,
      fontWeight: "600",
    },
    debtDetails: {
      marginTop: 8,
    },
    debtDescription: {
      fontSize: 14,
      color: colors.text + "99",
      marginBottom: 4,
    },
    paymentsList: {
      marginTop: 12,
    },
    paymentItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    actionButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      padding: 12,
      alignItems: "center",
      marginTop: 12,
    },
    actionButtonText: {
      color: colors.card,
      fontSize: 14,
      fontWeight: "600",
    },
  })

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Debt Management</Text>
          <Text style={styles.subtitle}>Track money you've borrowed or lent</Text>
        </View>

        {!isAddingDebt && !showPaymentForm && (
          <TouchableOpacity style={styles.addButton} onPress={() => setIsAddingDebt(true)}>
            <Text style={styles.addButtonText}>Add New Debt</Text>
          </TouchableOpacity>
        )}

        {isAddingDebt && (
          <View style={styles.formContainer}>
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[styles.typeButton, type === "lent" && styles.typeButtonActive]}
                onPress={() => setType("lent")}
              >
                <Text style={[styles.typeButtonText, type === "lent" && styles.typeButtonTextActive]}>
                  Money Lent
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, type === "borrowed" && styles.typeButtonActive]}
                onPress={() => setType("borrowed")}
              >
                <Text style={[styles.typeButtonText, type === "borrowed" && styles.typeButtonTextActive]}>
                  Money Borrowed
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Person Name</Text>
              <TextInput
                style={styles.input}
                value={personName}
                onChangeText={setPersonName}
                placeholder="Enter name"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Amount</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="Enter amount"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={styles.input}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter description"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                <Text style={styles.dateText}>{formatDateFull(date.toISOString())}</Text>
                <Calendar size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Due Date (Optional)</Text>
              <TouchableOpacity style={styles.dateButton} onPress={() => setShowDueDatePicker(true)}>
                <Text style={styles.dateText}>
                  {dueDate ? formatDateFull(dueDate.toISOString()) : "Select due date"}
                </Text>
                <Calendar size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity
                style={[styles.actionButton, { flex: 1, backgroundColor: colors.border }]}
                onPress={resetForm}
              >
                <Text style={[styles.actionButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { flex: 1 }]}
                onPress={handleAddDebt}
                disabled={!personName || !amount}
              >
                <Text style={styles.actionButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {showPaymentForm && selectedDebt && (
          <View style={styles.formContainer}>
            <Text style={styles.title}>Add Payment</Text>
            <Text style={styles.subtitle}>
              Recording payment for debt with {selectedDebt.personName}
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Payment Amount</Text>
              <TextInput
                style={styles.input}
                value={paymentAmount}
                onChangeText={setPaymentAmount}
                keyboardType="numeric"
                placeholder="Enter payment amount"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Note</Text>
              <TextInput
                style={styles.input}
                value={paymentNote}
                onChangeText={setPaymentNote}
                placeholder="Add a note (optional)"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Payment Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowPaymentDatePicker(true)}
              >
                <Text style={styles.dateText}>{formatDateFull(paymentDate.toISOString())}</Text>
                <Calendar size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity
                style={[styles.actionButton, { flex: 1, backgroundColor: colors.border }]}
                onPress={resetPaymentForm}
              >
                <Text style={[styles.actionButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { flex: 1 }]}
                onPress={handleAddPayment}
                disabled={!paymentAmount}
              >
                <Text style={styles.actionButtonText}>Save Payment</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {debts.map((debt) => (
          <View key={debt.id} style={styles.debtItem}>
            <View style={styles.debtHeader}>
              <Text style={styles.personName}>{debt.personName}</Text>
              <Text
                style={[
                  styles.amount,
                  { color: debt.type === "lent" ? colors.success : colors.danger },
                ]}
              >
                {debt.type === "lent" ? "+" : "-"} {formatCurrency(debt.amount)}
              </Text>
            </View>

            <Text style={styles.debtDescription}>{debt.description}</Text>
            <Text style={styles.debtDescription}>Date: {formatDate(debt.date)}</Text>
            {debt.dueDate && (
              <Text style={styles.debtDescription}>Due: {formatDate(debt.dueDate)}</Text>
            )}

            <Text style={[styles.debtDescription, { fontWeight: "500" }]}>
              Remaining: {formatCurrency(calculateRemainingAmount(debt))}
            </Text>

            {debt.payments.length > 0 && (
              <View style={styles.paymentsList}>
                <Text style={[styles.label, { marginBottom: 8 }]}>Payment History</Text>
                {debt.payments.map((payment) => (
                  <View key={payment.id} style={styles.paymentItem}>
                    <View>
                      <Text style={styles.debtDescription}>{formatDate(payment.date)}</Text>
                      {payment.note && (
                        <Text style={styles.debtDescription}>{payment.note}</Text>
                      )}
                    </View>
                    <Text style={[styles.amount, { color: colors.success }]}>
                      {formatCurrency(payment.amount)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                setSelectedDebt(debt)
                setShowPaymentForm(true)
              }}
            >
              <Text style={styles.actionButtonText}>Add Payment</Text>
            </TouchableOpacity>
          </View>
        ))}

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false)
              if (selectedDate) {
                setDate(selectedDate)
              }
            }}
          />
        )}

        {showDueDatePicker && (
          <DateTimePicker
            value={dueDate || new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDueDatePicker(false)
              if (selectedDate) {
                setDueDate(selectedDate)
              }
            }}
          />
        )}

        {showPaymentDatePicker && (
          <DateTimePicker
            value={paymentDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowPaymentDatePicker(false)
              if (selectedDate) {
                setPaymentDate(selectedDate)
              }
            }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  )
}