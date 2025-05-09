import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { defaultCategories } from "../utils/categories";
import { Alert, Platform } from "react-native";
import {
  showNotification,
  scheduleBudgetNotification,
  scheduleDebtNotification,
} from "../utils/notifications";
import type {
  ExpenseCategory,
  SubCategory,
  Transaction,
  Debt,
  Payment,
  Budget,
  FinanceContextType,
} from "../utils/types";

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [balance, setBalance] = useState(0);

  // Load data from AsyncStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          storedTransactions,
          storedDebts,
          storedBudgets,
          storedCategories,
        ] = await Promise.all([
          AsyncStorage.getItem("transactions"),
          AsyncStorage.getItem("debts"),
          AsyncStorage.getItem("budgets"),
          AsyncStorage.getItem("categories"),
        ]);

        if (storedTransactions) {
          setTransactions(JSON.parse(storedTransactions));
        }

        if (storedDebts) {
          setDebts(JSON.parse(storedDebts));
        }

        if (storedBudgets) {
          setBudgets(JSON.parse(storedBudgets));
        }

        if (storedCategories) {
          setCategories(JSON.parse(storedCategories));
        } else {
          setCategories(defaultCategories);
          await AsyncStorage.setItem(
            "categories",
            JSON.stringify(defaultCategories)
          );
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, []);

  // Save transactions whenever they change
  useEffect(() => {
    AsyncStorage.setItem("transactions", JSON.stringify(transactions)).catch(
      (error) => console.error("Error saving transactions:", error)
    );

    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    setTotalIncome(income);
    setTotalExpenses(expenses);
    setBalance(income - expenses);
  }, [transactions]);

  // Save debts whenever they change
  useEffect(() => {
    AsyncStorage.setItem("debts", JSON.stringify(debts)).catch((error) =>
      console.error("Error saving debts:", error)
    );
  }, [debts]);

  // Save budgets whenever they change
  useEffect(() => {
    AsyncStorage.setItem("budgets", JSON.stringify(budgets)).catch((error) =>
      console.error("Error saving budgets:", error)
    );
  }, [budgets]);

  // Save categories whenever they change
  useEffect(() => {
    AsyncStorage.setItem("categories", JSON.stringify(categories)).catch(
      (error) => console.error("Error saving categories:", error)
    );
  }, [categories]);

  // Check budget status and show alerts if needed
  const checkBudgetStatus = async (budget: Budget) => {
    const spent = transactions
      .filter((t) => {
        const transactionDate = new Date(t.date);
        const budgetStart = new Date(budget.startDate);
        const budgetEnd = budget.endDate
          ? new Date(budget.endDate)
          : new Date();

        return (
          t.type === "expense" &&
          t.categoryId === budget.categoryId &&
          transactionDate >= budgetStart &&
          transactionDate <= budgetEnd
        );
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const percentage = (spent / budget.amount) * 100;
    const category = categories.find((c) => c.id === budget.categoryId);

    // Check if we've already notified for this threshold
    const lastNotificationThreshold = budget.lastNotificationThreshold || 0;

    if (percentage >= 100 && lastNotificationThreshold < 100) {
      await showNotification(
        "Budget Exceeded",
        `You have exceeded your budget for ${
          category?.name || "this category"
        }. Budget: $${budget.amount}, Spent: $${spent}`
      );
      // Update the last notification threshold
      updateBudget({
        ...budget,
        lastNotificationThreshold: 100,
      });
    } else if (
      percentage >= 80 &&
      percentage < 100 &&
      lastNotificationThreshold < 80
    ) {
      await showNotification(
        "Budget Warning",
        `You have used ${percentage.toFixed(1)}% of your budget for ${
          category?.name || "this category"
        }. Budget: $${budget.amount}, Spent: $${spent}`
      );
      // Update the last notification threshold
      updateBudget({
        ...budget,
        lastNotificationThreshold: 80,
      });
    }
  };

  // Check debt due dates
  const checkDebtDueDates = async () => {
    if (Platform.OS === "web") return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const debt of debts) {
      if (debt.dueDate && debt.status !== "paid") {
        const dueDate = new Date(debt.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        if (dueDate.getTime() === today.getTime()) {
          await showNotification(
            "Debt Due Today",
            `Your ${debt.type === "borrowed" ? "debt to" : "loan to"} ${
              debt.personName
            } is due today. Amount: $${debt.amount}`
          );
        } else if (dueDate < today) {
          await showNotification(
            "Overdue Debt",
            `Your ${debt.type === "borrowed" ? "debt to" : "loan to"} ${
              debt.personName
            } is overdue. Amount: $${debt.amount}`
          );
        } else if (dueDate.getTime() === today.getTime() + 86400000) {
          // Check for tomorrow
          await showNotification(
            "Debt Due Tomorrow",
            `Your ${debt.type === "borrowed" ? "debt to" : "loan to"} ${
              debt.personName
            } is due tomorrow. Amount: $${debt.amount}`
          );
        }
      }
    }
  };

  // Check notifications daily
  useEffect(() => {
    if (Platform.OS === "web") return;

    const checkNotifications = () => {
      checkDebtDueDates();
      budgets.forEach(checkBudgetStatus);
    };

    // Check immediately on mount
    checkNotifications();

    // Set up daily check
    const interval = setInterval(checkNotifications, 86400000); // 24 hours

    return () => clearInterval(interval);
  }, [budgets, debts, transactions]);

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions((prev) => [...prev, newTransaction]);
  };

  const deleteTransaction = (id: string) => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setTransactions((prev) => prev.filter((t) => t.id !== id));
          },
        },
      ]
    );
  };

  const updateTransaction = (transaction: Transaction) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === transaction.id ? transaction : t))
    );
  };

  const addDebt = async (debt: Omit<Debt, "id" | "payments">) => {
    const newDebt = {
      ...debt,
      id: Date.now().toString(),
      payments: [],
    };
    setDebts((prev) => [...prev, newDebt]);

    if (Platform.OS !== "web" && debt.dueDate) {
      await scheduleDebtNotification(newDebt);
    }
  };

  const updateDebt = (debt: Debt) => {
    setDebts((prev) => prev.map((d) => (d.id === debt.id ? debt : d)));
  };

  const deleteDebt = (id: string) => {
    Alert.alert(
      "Delete Debt",
      "Are you sure you want to delete this debt record?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setDebts((prev) => prev.filter((d) => d.id !== id));
          },
        },
      ]
    );
  };

  const addPayment = (debtId: string, payment: Omit<Payment, "id">) => {
    const newPayment = {
      ...payment,
      id: Date.now().toString(),
    };

    setDebts((prev) =>
      prev.map((debt) => {
        if (debt.id === debtId) {
          const updatedPayments = [...debt.payments, newPayment];
          const totalPaid = updatedPayments.reduce(
            (sum, p) => sum + p.amount,
            0
          );

          return {
            ...debt,
            payments: updatedPayments,
            status:
              totalPaid >= debt.amount
                ? "paid"
                : totalPaid > 0
                ? "partially_paid"
                : "pending",
          };
        }
        return debt;
      })
    );
  };

  const deletePayment = (debtId: string, paymentId: string) => {
    Alert.alert(
      "Delete Payment",
      "Are you sure you want to delete this payment?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setDebts((prev) =>
              prev.map((debt) => {
                if (debt.id === debtId) {
                  const updatedPayments = debt.payments.filter(
                    (p) => p.id !== paymentId
                  );
                  const totalPaid = updatedPayments.reduce(
                    (sum, p) => sum + p.amount,
                    0
                  );

                  return {
                    ...debt,
                    payments: updatedPayments,
                    status:
                      totalPaid >= debt.amount
                        ? "paid"
                        : totalPaid > 0
                        ? "partially_paid"
                        : "pending",
                  };
                }
                return debt;
              })
            );
          },
        },
      ]
    );
  };

  const addBudget = async (budget: Omit<Budget, "id">) => {
    const newBudget = {
      ...budget,
      id: Date.now().toString(),
      lastNotificationThreshold: 0,
    };
    setBudgets((prev) => [...prev, newBudget]);

    if (Platform.OS !== "web" && budget.endDate) {
      await scheduleBudgetNotification(newBudget);
    }
  };

  const updateBudget = (budget: Budget) => {
    setBudgets((prev) => prev.map((b) => (b.id === budget.id ? budget : b)));
    // Check the updated budget immediately
    checkBudgetStatus(budget);
  };

  const deleteBudget = (id: string) => {
    Alert.alert(
      "Delete Budget",
      "Are you sure you want to delete this budget?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setBudgets((prev) => prev.filter((b) => b.id !== id));
          },
        },
      ]
    );
  };

  const value = {
    transactions,
    debts,
    budgets,
    categories,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    addDebt,
    updateDebt,
    deleteDebt,
    addPayment,
    deletePayment,
    addBudget,
    updateBudget,
    deleteBudget,
    totalIncome,
    totalExpenses,
    balance,
  };

  return (
    <SafeAreaProvider>
      <FinanceContext.Provider value={value}>
        {children}
      </FinanceContext.Provider>
    </SafeAreaProvider>
  );
};
