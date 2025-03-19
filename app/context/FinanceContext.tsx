"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"
import { defaultCategories } from "../utils/categories"
import type { ExpenseCategory, SubCategory, Transaction, Debt, Payment, FinanceContextType } from "../utils/types"

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

export const useFinance = () => {
  const context = useContext(FinanceContext)
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider")
  }
  return context
}

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [debts, setDebts] = useState<Debt[]>([])
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [totalIncome, setTotalIncome] = useState(0)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [balance, setBalance] = useState(0)

  // Load data from AsyncStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedTransactions = await AsyncStorage.getItem("transactions")
        const storedDebts = await AsyncStorage.getItem("debts")
        let storedCategories = await AsyncStorage.getItem("categories")

        if (storedTransactions) {
          setTransactions(JSON.parse(storedTransactions))
        }

        if (storedDebts) {
          setDebts(JSON.parse(storedDebts))
        }

        if (storedCategories) {
          setCategories(JSON.parse(storedCategories))
        } else {
          setCategories(defaultCategories)
          await AsyncStorage.setItem("categories", JSON.stringify(defaultCategories))
        }
      } catch (error) {
        console.error("Error loading data:", error)
      }
    }

    loadData()
  }, [])

  // Calculate totals whenever transactions change
  useEffect(() => {
    const income = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
    const expenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

    setTotalIncome(income)
    setTotalExpenses(expenses)
    setBalance(income - expenses)

    AsyncStorage.setItem("transactions", JSON.stringify(transactions)).catch((error) =>
      console.error("Error saving transactions:", error),
    )
  }, [transactions])

  // Save debts whenever they change
  useEffect(() => {
    AsyncStorage.setItem("debts", JSON.stringify(debts)).catch((error) =>
      console.error("Error saving debts:", error),
    )
  }, [debts])

  // Save categories whenever they change
  useEffect(() => {
    AsyncStorage.setItem("categories", JSON.stringify(categories)).catch((error) =>
      console.error("Error saving categories:", error),
    )
  }, [categories])

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
    }
    setTransactions((prev) => [...prev, newTransaction])
  }

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }

  const updateTransaction = (transaction: Transaction) => {
    setTransactions((prev) => prev.map((t) => (t.id === transaction.id ? transaction : t)))
  }

  const addDebt = (debt: Omit<Debt, "id" | "payments">) => {
    const newDebt = {
      ...debt,
      id: Date.now().toString(),
      payments: [],
    }
    setDebts((prev) => [...prev, newDebt])
  }

  const updateDebt = (debt: Debt) => {
    setDebts((prev) => prev.map((d) => (d.id === debt.id ? debt : d)))
  }

  const deleteDebt = (id: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== id))
  }

  const addPayment = (debtId: string, payment: Omit<Payment, "id">) => {
    const newPayment = {
      ...payment,
      id: Date.now().toString(),
    }

    setDebts((prev) =>
      prev.map((debt) => {
        if (debt.id === debtId) {
          const updatedPayments = [...debt.payments, newPayment]
          const totalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0)
          
          return {
            ...debt,
            payments: updatedPayments,
            status: totalPaid >= debt.amount ? "paid" : totalPaid > 0 ? "partially_paid" : "pending",
          }
        }
        return debt
      }),
    )
  }

  const deletePayment = (debtId: string, paymentId: string) => {
    setDebts((prev) =>
      prev.map((debt) => {
        if (debt.id === debtId) {
          const updatedPayments = debt.payments.filter((p) => p.id !== paymentId)
          const totalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0)
          
          return {
            ...debt,
            payments: updatedPayments,
            status: totalPaid >= debt.amount ? "paid" : totalPaid > 0 ? "partially_paid" : "pending",
          }
        }
        return debt
      }),
    )
  }

  const value = {
    transactions,
    debts,
    categories,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    addDebt,
    updateDebt,
    deleteDebt,
    addPayment,
    deletePayment,
    totalIncome,
    totalExpenses,
    balance,
  }

  return (
    <SafeAreaProvider>
      <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
    </SafeAreaProvider>
  )
}