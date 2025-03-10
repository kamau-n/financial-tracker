import { format, parseISO } from "date-fns"

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export const formatDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString)
    return format(date, "MMM d, yyyy")
  } catch (error) {
    return dateString
  }
}

export const formatDateFull = (dateString: string): string => {
  try {
    const date = parseISO(dateString)
    return format(date, "MMMM d, yyyy")
  } catch (error) {
    return dateString
  }
}

export const getCurrentMonthYear = (): string => {
  return format(new Date(), "MMMM yyyy")
}

export const getMonthYearFromDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString)
    return format(date, "MMMM yyyy")
  } catch (error) {
    return ""
  }
}

