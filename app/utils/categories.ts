import { ExpenseCategory } from "./types";

export const defaultCategories: ExpenseCategory[] = [
  {
    id: "1",
    name: "Housing",
    color: "#4f46e5",
    subCategories: [
      { id: "1-1", name: "Rent", parentId: "1" },
      { id: "1-2", name: "Mortgage", parentId: "1" },
      { id: "1-3", name: "Property Taxes", parentId: "1" },
      { id: "1-4", name: "Home Maintenance", parentId: "1" },
    ],
  },
  {
    id: "2",
    name: "Food",
    color: "#10b981",
    subCategories: [
      { id: "2-1", name: "Groceries", parentId: "2" },
      { id: "2-2", name: "Dining Out", parentId: "2" },
      { id: "2-3", name: "Snacks & Beverages", parentId: "2" },
    ],
  },
  {
    id: "3",
    name: "Transportation",
    color: "#f59e0b",
    subCategories: [
      { id: "3-1", name: "Fuel", parentId: "3" },
      { id: "3-2", name: "Public Transport", parentId: "3" },
      { id: "3-3", name: "Car Maintenance", parentId: "3" },
      { id: "3-4", name: "Taxis & Ridesharing", parentId: "3" },
    ],
  },
  {
    id: "4",
    name: "Entertainment",
    color: "#ef4444",
    subCategories: [
      { id: "4-1", name: "Movies & Shows", parentId: "4" },
      { id: "4-2", name: "Games", parentId: "4" },
      { id: "4-3", name: "Streaming Services", parentId: "4" },
      { id: "4-4", name: "Events & Concerts", parentId: "4" },
    ],
  },
  {
    id: "5",
    name: "Utilities",
    color: "#8b5cf6",
    subCategories: [
      { id: "5-1", name: "Electricity", parentId: "5" },
      { id: "5-2", name: "Water", parentId: "5" },
      { id: "5-3", name: "Internet & Cable", parentId: "5" },
      { id: "5-4", name: "Gas", parentId: "5" },
    ],
  },
  {
    id: "6",
    name: "Health",
    color: "#f87171",
    subCategories: [
      { id: "6-1", name: "Doctor Visits", parentId: "6" },
      { id: "6-2", name: "Medication", parentId: "6" },
      { id: "6-3", name: "Health Insurance", parentId: "6" },
      { id: "6-4", name: "Gym & Fitness", parentId: "6" },
    ],
  },
  {
    id: "7",
    name: "Insurance",
    color: "#fbbf24",
    subCategories: [
      { id: "7-1", name: "Health Insurance", parentId: "7" },
      { id: "7-2", name: "Car Insurance", parentId: "7" },
      { id: "7-3", name: "Home Insurance", parentId: "7" },
      { id: "7-4", name: "Life Insurance", parentId: "7" },
    ],
  },
  {
    id: "8",
    name: "Personal",
    color: "#6ee7b7",
    subCategories: [
      { id: "8-1", name: "Clothing", parentId: "8" },
      { id: "8-2", name: "Beauty & Grooming", parentId: "8" },
      { id: "8-3", name: "Subscriptions", parentId: "8" },
    ],
  },
  {
    id: "9",
    name: "Salary",
    color: "#f472b6",
    subCategories: [
      { id: "9-1", name: "Base Salary", parentId: "9" },
      { id: "9-2", name: "Bonuses", parentId: "9" },
      { id: "9-3", name: "Overtime Pay", parentId: "9" },
    ],
  },
  {
    id: "10",
    name: "Investment Returns",
    color: "#34d399",
    subCategories: [
      { id: "10-1", name: "Stocks", parentId: "10" },
      { id: "10-2", name: "Bonds", parentId: "10" },
      { id: "10-3", name: "Real Estate", parentId: "10" },
    ],
  },
  {
    id: "11",
    name: "Dividends",
    color: "#6b7280",
    subCategories: [
      { id: "11-1", name: "Stock Dividends", parentId: "11" },
      { id: "11-2", name: "Mutual Fund Dividends", parentId: "11" },
    ],
  },
  {
    id: "12",
    name: "Profit",
    color: "#6b7280",
    subCategories: [
      { id: "12-1", name: "Business Profit", parentId: "12" },
      { id: "12-2", name: "Side Hustles", parentId: "12" },
    ],
  },
];
