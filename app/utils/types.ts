export type ExpenseCategory = {
  id: string;
  name: string;
  color: string;
  subCategories: SubCategory[];
};

export type SubCategory = {
  id: string;
  name: string;
  parentId: string;
};

export type Transaction = {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: "income" | "expense";
  categoryId?: string;
  subCategoryId?: string;
};

export type Budget = {
  id: string;
  categoryId: string;
  amount: number;
  period: "monthly" | "yearly";
  startDate: string;
  endDate?: string;
};

export type Debt = {
  id: string;
  personName: string;
  amount: number;
  description: string;
  date: string;
  dueDate?: string;
  type: "lent" | "borrowed";
  status: "pending" | "partially_paid" | "paid";
  payments: Payment[];
};

export type Payment = {
  id: string;
  amount: number;
  date: string;
  note?: string;
};

export type FinanceContextType = {
  transactions: Transaction[];
  debts: Debt[];
  budgets: Budget[];
  categories: ExpenseCategory[];
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (transaction: Transaction) => void;
  addDebt: (debt: Omit<Debt, "id" | "payments">) => void;
  updateDebt: (debt: Debt) => void;
  deleteDebt: (id: string) => void;
  addPayment: (debtId: string, payment: Omit<Payment, "id">) => void;
  deletePayment: (debtId: string, paymentId: string) => void;
  addBudget: (budget: Omit<Budget, "id">) => void;
  updateBudget: (budget: Budget) => void;
  deleteBudget: (id: string) => void;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
};
