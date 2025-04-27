import { format, parseISO } from "date-fns";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Default currency if none is set
const DEFAULT_CURRENCY = {
  code: "USD",
  symbol: "$",
  name: "US Dollar",
};

// Get the user's currency preference
export const getCurrency = async () => {
  try {
    const currencyStr = await AsyncStorage.getItem("userCurrency");
    return currencyStr ? JSON.parse(currencyStr) : DEFAULT_CURRENCY;
  } catch (error) {
    return DEFAULT_CURRENCY;
  }
};

// Set the user's currency preference
export const setCurrency = async (currency: {
  code: string;
  symbol: string;
  name: string;
}) => {
  try {
    await AsyncStorage.setItem("userCurrency", JSON.stringify(currency));
  } catch (error) {
    console.error("Error saving currency preference:", error);
  }
};

export const formatCurrency = async (amount: number): Promise<string> => {
  const currency = await getCurrency();
  return `${currency.symbol}${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
};

// Format number with thousand separators without currency
export const formatNumber = (amount: number): string => {
  return new Intl.NumberFormat("en-US").format(amount);
};

export const formatDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, "MMM d, yyyy");
  } catch (error) {
    return dateString;
  }
};

export const formatDateFull = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, "MMMM d, yyyy");
  } catch (error) {
    return dateString;
  }
};

export const getCurrentMonthYear = (): string => {
  return format(new Date(), "MMMM yyyy");
};

export const getMonthYearFromDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, "MMMM yyyy");
  } catch (error) {
    return "";
  }
};
