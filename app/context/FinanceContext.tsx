import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { defaultCategories } from "../utils/categories";
import { Alert } from "react-native";
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

  // Check budget status and show alerts if needed
  const checkBudgetStatus = (budget: Budget) => {
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

    if (percentage >= 100) {
      Alert.alert(
        "Budget Exceeded",
        `You have exceeded your budget for ${
          category?.name || "this category"
        }.\n\nBudget: ${budget.amount}\nSpent: ${spent}`
      );
    } else if (percentage >= 80) {
      Alert.alert(
        "Budget Warning",
        `You have used ${percentage.toFixed(1)}% of your budget for ${
          category?.name || "this category"
        }.\n\nBudget: ${budget.amount}\nSpent: ${spent}`
      );
    }
  };

  // Load data from AsyncStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedTransactions = await AsyncStorage.getItem("transactions");
        const storedDebts = await AsyncStorage.getItem("debts");
        const storedBudgets = await AsyncStorage.getItem("budgets");

        if (storedTransactions) {
          setTransactions(JSON.parse(storedTransactions));
        }

        if (storedDebts) {
          setDebts(JSON.parse(storedDebts));
        }

        if (storedBudgets) {
          setBudgets(JSON.parse(storedBudgets));
        }

        setCategories(defaultCategories);
        await AsyncStorage.setItem(
          "categories",
          JSON.stringify(defaultCategories)
        );
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, []);

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

    AsyncStorage.setItem("transactions", JSON.stringify(transactions)).catch(
      (error) => console.error("Error saving transactions:", error)
    );

    // Check all budgets when transactions change

    console.log("am checking the budgets have changed");
    budgets.forEach(checkBudgetStatus);
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

  const addBudget = (budget: Omit<Budget, "id">) => {
    const newBudget = {
      ...budget,
      id: Date.now().toString(),
    };
    setBudgets((prev) => [...prev, newBudget]);
    // Check the new budget immediately
    checkBudgetStatus(newBudget);
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
