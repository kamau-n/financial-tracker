export type ExpenseCategory = {
    id: string
    name: string
    color: string
    subCategories: SubCategory[]
  }
  
  export type SubCategory = {
    id: string
    name: string
    parentId: string
  }
  
  export type Transaction = {
    id: string
    amount: number
    description: string
    date: string
    type: "income" | "expense"
    categoryId?: string
    subCategoryId?: string
  }
  
  type FinanceContextType = {
    transactions: Transaction[]
    categories: ExpenseCategory[]
    addTransaction: (transaction: Omit<Transaction, "id">) => void
    deleteTransaction: (id: string) => void
    updateTransaction: (transaction: Transaction) => void
    addCategory: (category: Omit<ExpenseCategory, "id" | "subCategories">) => void
    deleteCategory: (id: string) => void
    updateCategory: (category: ExpenseCategory) => void
    addSubCategory: (subCategory: Omit<SubCategory, "id">) => void
    deleteSubCategory: (id: string) => void
    updateSubCategory: (subCategory: SubCategory) => void
    totalIncome: number
    totalExpenses: number
    balance: number
  }