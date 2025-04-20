"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { defaultCategories } from "../utils/categories";
import type {
  ExpenseCategory,
  SubCategory,
  Transaction,
  Debt,
  Payment,
  Budget,
  NotificationSettings,
  FinanceContextType,
} from "../utils/types";
import { showNotification } from "../utils/notifications";

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
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>({
      budgetAlerts: true,
    });
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [balance, setBalance] = useState(0);

  // Load data from AsyncStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedTransactions = await AsyncStorage.getItem("transactions");
        const storedDebts = await AsyncStorage.getItem("debts");
        const storedBudgets = await AsyncStorage.getItem("budgets");
        const storedSettings = await AsyncStorage.getItem(
          "notificationSettings"
        );
        let storedCategories = await AsyncStorage.getItem("categories");

        if (storedTransactions) {
          setTransactions(JSON.parse(storedTransactions));
        }

        if (storedDebts) {
          setDebts(JSON.parse(storedDebts));
        }

        if (storedBudgets) {
          setBudgets(JSON.parse(storedBudgets));
        }

        if (storedSettings) {
          setNotificationSettings(JSON.parse(storedSettings));
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

  // Check budgets and send notifications
  // useEffect(() => {
  //   if (!notificationSettings.budgetAlerts) return;

  //   const checkBudgets = () => {
  //     budgets.forEach((budget) => {
  //       const start = new Date(budget.startDate);
  //       const end = budget.endDate ? new Date(budget.endDate) : new Date();
  //       const now = new Date();

  //       // Only check current budgets
  //       if (now >= start && now <= end) {
  //         const spent = transactions
  //           .filter(
  //             (t) =>
  //               t.type === "expense" &&
  //               t.categoryId === budget.categoryId &&
  //               new Date(t.date) >= start &&
  //               new Date(t.date) <= end
  //           )
  //           .reduce((sum, t) => sum + t.amount, 0);

  //         const spentPercentage = (spent / budget.amount) * 100;
  //         const category = categories.find((c) => c.id === budget.categoryId);

  //         // Check thresholds and send notifications if not already sent for this threshold
  //         if (
  //           spentPercentage >= 100 &&
  //           budget.lastNotificationThreshold !== 100
  //         ) {
  //           showNotification(
  //             "Budget Alert",
  //             `You've exceeded your budget for ${
  //               category?.name
  //             }! (${spentPercentage.toFixed(1)}%)`
  //           );
  //           updateBudget({ ...budget, lastNotificationThreshold: 100 });
  //         } else if (
  //           spentPercentage >= 90 &&
  //           budget.lastNotificationThreshold !== 90
  //         ) {
  //           showNotification(
  //             "Budget Alert",
  //             `You're at 90% of your budget for ${category?.name}`
  //           );
  //           updateBudget({ ...budget, lastNotificationThreshold: 90 });
  //         } else if (
  //           spentPercentage >= 70 &&
  //           budget.lastNotificationThreshold !== 70
  //         ) {
  //           showNotification(
  //             "Budget Alert",
  //             `You're at 70% of your budget for ${category?.name}`
  //           );
  //           updateBudget({ ...budget, lastNotificationThreshold: 70 });
  //         }
  //       }
  //     });
  //   };

  //   // Check budgets immediately and set up interval
  //   checkBudgets();
  //   const interval = setInterval(checkBudgets, 1000 * 60 * 60); // Check every hour

  //   return () => clearInterval(interval);
  // }, [transactions, budgets, notificationSettings.budgetAlerts]);

  // Save notification settings
  useEffect(() => {
    AsyncStorage.setItem(
      "notificationSettings",
      JSON.stringify(notificationSettings)
    );
  }, [notificationSettings]);

  // Calculate totals whenever transactions change
  useEffect(() => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    setTotalIncome(income);
    setTotalExpenses(expenses);
    setBalance(income - expenses);

    AsyncStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  // Save debts whenever they change
  useEffect(() => {
    AsyncStorage.setItem("debts", JSON.stringify(debts));
  }, [debts]);

  // Save budgets whenever they change
  useEffect(() => {
    AsyncStorage.setItem("budgets", JSON.stringify(budgets));
  }, [budgets]);

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions((prev) => [...prev, newTransaction]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTransaction = (transaction: Transaction) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === transaction.id ? transaction : t))
    );
  };

  const addDebt = (debt: Omit<Debt, "id" | "payments">) => {
    const newDebt = {
      ...debt,
      id: Date.now().toString(),
      payments: [],
    };
    setDebts((prev) => [...prev, newDebt]);
  };

  const updateDebt = (debt: Debt) => {
    setDebts((prev) => prev.map((d) => (d.id === debt.id ? debt : d)));
  };

  const deleteDebt = (id: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== id));
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
  };

  const addBudget = (budget: Omit<Budget, "id">) => {
    const newBudget = {
      ...budget,
      id: Date.now().toString(),
    };
    setBudgets((prev) => [...prev, newBudget]);
  };

  const updateBudget = (budget: Budget) => {
    setBudgets((prev) => prev.map((b) => (b.id === budget.id ? budget : b)));
  };

  const deleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  };

  const updateNotificationSettings = (settings: NotificationSettings) => {
    setNotificationSettings(settings);
  };

  const value = {
    transactions,
    debts,
    budgets,
    categories,
    notificationSettings,
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
    updateNotificationSettings,
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
