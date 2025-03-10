"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, TextInput, StyleSheet } from "react-native"
import { useTheme } from "../context/ThemeContext"

interface AmountInputProps {
  value: number
  onChange: (value: number) => void
  label?: string
  isExpense?: boolean
}

const AmountInput: React.FC<AmountInputProps> = ({ value, onChange, label = "Amount", isExpense = false }) => {
  const { colors } = useTheme()
  const [displayValue, setDisplayValue] = useState(value > 0 ? value.toString() : "")

  useEffect(() => {
    setDisplayValue(value > 0 ? value.toString() : "")
  }, [value])

  const handleChangeText = (text: string) => {
    // Remove any non-numeric characters except decimal point
    const cleanedText = text.replace(/[^0-9.]/g, "")

    // Ensure only one decimal point
    const parts = cleanedText.split(".")
    const formattedText = parts.length > 1 ? `${parts[0]}.${parts.slice(1).join("")}` : cleanedText

    setDisplayValue(formattedText)

    // Convert to number and call onChange
    const numValue = Number.parseFloat(formattedText || "0")
    if (!isNaN(numValue)) {
      onChange(numValue)
    } else {
      onChange(0)
    }
  }

  const styles = StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    label: {
      fontSize: 16,
      fontWeight: "500",
      marginBottom: 8,
      color: colors.text,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.card,
      paddingHorizontal: 12,
    },
    currencySymbol: {
      fontSize: 24,
      fontWeight: "500",
      color: isExpense ? colors.danger : colors.success,
      marginRight: 8,
    },
    input: {
      flex: 1,
      fontSize: 24,
      fontWeight: "500",
      color: isExpense ? colors.danger : colors.success,
      padding: 12,
    },
  })

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        <Text style={styles.currencySymbol}>{isExpense ? "-$" : "$"}</Text>
        <TextInput
          style={styles.input}
          value={displayValue}
          onChangeText={handleChangeText}
          keyboardType="numeric"
          placeholder="0.00"
          placeholderTextColor={colors.text + "60"} // Adding transparency
        />
      </View>
    </View>
  )
}

export default AmountInput

