import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import {
  Calendar,
  Check,
  CircleAlert as AlertCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "../context/ThemeContext";
import { useFinance } from "../context/FinanceContext";
import {
  formatCurrency,
  formatDate,
  formatDateFull,
} from "../utils/formatters";
import { SafeAreaView } from "react-native-safe-area-context";
import CategoryPicker from "../components/CategoryPicker";
import type { Budget } from "../utils/types";

export default function Budgets() {
  const { colors } = useTheme();
  const {
    budgets,
    addBudget,
    updateBudget,
    deleteBudget,
    transactions,
    categories,
  } = useFinance();
  const [isAddingBudget, setIsAddingBudget] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  // Form states
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const resetForm = () => {
    setAmount("");
    setCategoryId("");
    setPeriod("monthly");
    setStartDate(new Date());
    setEndDate(undefined);
    setIsAddingBudget(false);
    setSelectedBudget(null);
  };

  const handleSave = () => {
    if (!amount || !categoryId || isNaN(Number(amount))) return;

    const budgetData = {
      amount: Number(amount),
      categoryId,
      period,
      startDate: startDate.toISOString(),
      endDate: endDate?.toISOString(),
    };

    if (selectedBudget) {
      updateBudget({ ...budgetData, id: selectedBudget.id });
    } else {
      addBudget(budgetData);
    }

    resetForm();
  };

  const calculateSpending = (budget: Budget) => {
    const start = new Date(budget.startDate);
    const end = budget.endDate ? new Date(budget.endDate) : new Date();

    return transactions
      .filter((t) => {
        const date = new Date(t.date);
        return (
          t.type === "expense" &&
          t.categoryId === budget.categoryId &&
          date >= start &&
          date <= end
        );
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getProgressColor = (spent: number, budget: number) => {
    const ratio = spent / budget;
    if (ratio > 0.9) return colors.danger;
    if (ratio > 0.7) return colors.warning;
    return colors.success;
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
      marginBottom: 8,
      color: colors.text,
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
    periodSelector: {
      flexDirection: "row",
      backgroundColor: colors.background,
      borderRadius: 8,
      overflow: "hidden",
      marginBottom: 16,
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
      fontSize: 16,
      color: colors.text,
    },
    periodButtonTextActive: {
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
    budgetItem: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    budgetHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    categoryName: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
    },
    budgetAmount: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.primary,
    },
    progressContainer: {
      marginTop: 8,
    },
    progressBar: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: 4,
      marginTop: 8,
    },
    progressFill: {
      height: "100%",
      borderRadius: 4,
    },
    spendingInfo: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 8,
    },
    spendingText: {
      fontSize: 14,
      color: colors.text + "99",
    },
    noDataContainer: {
      padding: 24,
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 12,
    },
    noDataText: {
      fontSize: 16,
      color: colors.text + "80",
      textAlign: "center",
      marginBottom: 16,
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
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Budget Management</Text>
          <Text style={styles.subtitle}>
            Track and manage your spending limits
          </Text>
        </View>

        {!isAddingBudget && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsAddingBudget(true)}>
            <Text style={styles.addButtonText}>Add New Budget</Text>
          </TouchableOpacity>
        )}

        {isAddingBudget && (
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Amount</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="Enter budget amount"
              />
            </View>

            <CategoryPicker
              selectedCategoryId={categoryId}
              onCategorySelect={(catId) => setCategoryId(catId)}
            />

            <View style={styles.periodSelector}>
              <TouchableOpacity
                style={[
                  styles.periodButton,
                  period === "monthly" && styles.periodButtonActive,
                ]}
                onPress={() => setPeriod("monthly")}>
                <Text
                  style={[
                    styles.periodButtonText,
                    period === "monthly" && styles.periodButtonTextActive,
                  ]}>
                  Monthly
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.periodButton,
                  period === "yearly" && styles.periodButtonActive,
                ]}
                onPress={() => setPeriod("yearly")}>
                <Text
                  style={[
                    styles.periodButtonText,
                    period === "yearly" && styles.periodButtonTextActive,
                  ]}>
                  Yearly
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Start Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowStartDatePicker(true)}>
                <Text style={styles.dateText}>
                  {formatDateFull(startDate.toISOString())}
                </Text>
                <Calendar size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>End Date (Optional)</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowEndDatePicker(true)}>
                <Text style={styles.dateText}>
                  {endDate
                    ? formatDateFull(endDate.toISOString())
                    : "No end date"}
                </Text>
                <Calendar size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { flex: 1, backgroundColor: colors.border },
                ]}
                onPress={resetForm}>
                <Text style={[styles.actionButtonText, { color: colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { flex: 1 }]}
                onPress={handleSave}
                disabled={!amount || !categoryId}>
                <Text style={styles.actionButtonText}>Save Budget</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {budgets.length === 0 ? (
          <View style={styles.noDataContainer}>
            <AlertCircle size={48} color={colors.text + "80"} />
            <Text style={styles.noDataText}>
              You haven't set any budgets yet. Add your first budget to start
              tracking your spending.
            </Text>
          </View>
        ) : (
          budgets.map((budget) => {
            console.log("this are the categories", categories);
            const category = categories.find((c) => c.id === budget.categoryId);
            const spent = calculateSpending(budget);
            const progress = Math.min((spent / budget.amount) * 100, 100);
            const progressColor = getProgressColor(spent, budget.amount);

            return (
              <View key={budget.id} style={styles.budgetItem}>
                <View style={styles.budgetHeader}>
                  <Text style={styles.categoryName}>
                    {category?.name || "Unknown Category"}
                  </Text>
                  <Text style={styles.budgetAmount}>
                    {formatCurrency(budget.amount)}
                  </Text>
                </View>

                <Text style={styles.spendingText}>
                  Period: {period === "monthly" ? "Monthly" : "Yearly"}
                </Text>
                <Text style={styles.spendingText}>
                  {formatDate(budget.startDate)} -{" "}
                  {budget.endDate ? formatDate(budget.endDate) : "Ongoing"}
                </Text>

                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${progress}%`,
                          backgroundColor: progressColor,
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.spendingInfo}>
                    <Text style={styles.spendingText}>
                      Spent: {formatCurrency(spent)}
                    </Text>
                    <Text style={styles.spendingText}>
                      {progress.toFixed(1)}% of budget
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: colors.danger },
                  ]}
                  onPress={() => deleteBudget(budget.id)}>
                  <Text style={styles.actionButtonText}>Delete Budget</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}

        {showStartDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowStartDatePicker(false);
              if (selectedDate) {
                setStartDate(selectedDate);
              }
            }}
          />
        )}

        {showEndDatePicker && (
          <DateTimePicker
            value={endDate || new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowEndDatePicker(false);
              if (selectedDate) {
                setEndDate(selectedDate);
              }
            }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
