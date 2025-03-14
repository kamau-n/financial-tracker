"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"
import { defaultCategories } from "../utils/categories"
import { ExpenseCategory, SubCategory, Transaction } from "../utils/types"

// Define types


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
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [totalIncome, setTotalIncome] = useState(0)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [balance, setBalance] = useState(0)

  // Load data from AsyncStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedTransactions = await AsyncStorage.getItem("transactions")
        let storedCategories = await AsyncStorage.getItem("categories")

        console.log("storedTransactions", storedTransactions)
        console.log("storedCategories", storedCategories)

        if (storedTransactions) {
          setTransactions(JSON.parse(storedTransactions))
        }

        //ts-ignore

        setCategories!=null ? storedCategories = JSON.parse(storedCategories) : null

        if (setCategories!=null && storedCategories &&  storedCategories?.length>0) {
          console.log("storedCategories selected", storedCategories)
          setCategories(JSON.parse(storedCategories))
        } else {
          // Set default categories if none exist
       
          setCategories (defaultCategories)
          console.log("defaultCategories selected", categories)
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

    // Save transactions to AsyncStorage
    AsyncStorage.setItem("transactions", JSON.stringify(transactions)).catch((error) =>
      console.error("Error saving transactions:", error),
    )
  }, [transactions])

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

  const addCategory = (category: Omit<ExpenseCategory, "id" | "subCategories">) => {
    const newCategory = {
      ...category,
      id: Date.now().toString(),
      subCategories: [],
    }
    setCategories((prev) => [...prev, newCategory])
  }

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id))
    // Also remove transactions with this category
    setTransactions((prev) => prev.filter((t) => t.categoryId !== id))
  }

  const updateCategory = (category: ExpenseCategory) => {
    setCategories((prev) => prev.map((c) => (c.id === category.id ? category : c)))
  }

  const addSubCategory = (subCategory: Omit<SubCategory, "id">) => {
    const newSubCategory = {
      ...subCategory,
      id: Date.now().toString(),
    }

    setCategories((prev) =>
      prev.map((c) => {
        if (c.id === subCategory.parentId) {
          return {
            ...c,
            subCategories: [...c.subCategories, newSubCategory],
          }
        }
        return c
      }),
    )
  }

  const deleteSubCategory = (id: string) => {
    setCategories((prev) =>
      prev.map((c) => ({
        ...c,
        subCategories: c.subCategories.filter((sc) => sc.id !== id),
      })),
    )

    // Also remove transactions with this subcategory
    setTransactions((prev) => prev.filter((t) => t.subCategoryId !== id))
  }

  const updateSubCategory = (subCategory: SubCategory) => {
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id === subCategory.parentId) {
          return {
            ...c,
            subCategories: c.subCategories.map((sc) => (sc.id === subCategory.id ? subCategory : sc)),
          }
        }
        return c
      }),
    )
  }

  const value = {
    transactions,
    categories,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    addCategory,
    deleteCategory,
    updateCategory,
    addSubCategory,
    deleteSubCategory,
    updateSubCategory,
    totalIncome,
    totalExpenses,
    balance,
  }

  console.log("FinanceProvider value", value.categories)

  return(
    <>
    <SafeAreaProvider>
   <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
   </SafeAreaProvider>
   </>
  )
}

