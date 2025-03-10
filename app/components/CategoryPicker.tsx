"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from "react-native"
import { ChevronDown, Check } from "lucide-react-native"
import { useTheme } from "../context/ThemeContext"
import { type ExpenseCategory, type SubCategory, useFinance } from "../context/FinanceContext"

interface CategoryPickerProps {
  selectedCategoryId?: string
  selectedSubCategoryId?: string
  onCategorySelect: (categoryId: string, subCategoryId?: string) => void
}

const CategoryPicker: React.FC<CategoryPickerProps> = ({
  selectedCategoryId,
  selectedSubCategoryId,
  onCategorySelect,
}) => {
  const { colors } = useTheme()
  const { categories } = useFinance()
  const [modalVisible, setModalVisible] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId)
  const selectedSubCategory = selectedCategory?.subCategories.find((sc) => sc.id === selectedSubCategoryId)

  const toggleExpanded = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }))
  }

  const handleCategorySelect = (category: ExpenseCategory) => {
    // If category has no subcategories, select it directly
    if (category.subCategories.length === 0) {
      onCategorySelect(category.id);
      setModalVisible(false);
    } else {
      // Toggle expanded state for categories with subcategories
      toggleExpanded(category.id);
      // If it's not already selected, select the category
      if (selectedCategoryId !== category.id) {
        onCategorySelect(category.id);
      }
    }
  };

  const handleSubCategorySelect = (category: ExpenseCategory, subCategory: SubCategory) => {
    onCategorySelect(category.id, subCategory.id)
    setModalVisible(false)
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
    pickerButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 12,
      backgroundColor: colors.card,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    pickerText: {
      fontSize: 16,
      color: selectedCategoryId ? colors.text : colors.text + "80",
    },
    modalContainer: {
      flex: 1,
      backgroundColor: colors.background + "E6", // Adding transparency
      justifyContent: "center",
      padding: 20,
    },
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: 12,
      maxHeight: "80%",
      overflow: "hidden",
    },
    modalHeader: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      textAlign: "center",
    },
    categoryItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    categoryColor: {
      width: 16,
      height: 16,
      borderRadius: 8,
      marginRight: 12,
    },
    categoryName: {
      fontSize: 16,
      color: colors.text,
      flex: 1,
    },
    subCategoryItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      paddingLeft: 44,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.background + "40", // Adding transparency
    },
    subCategoryName: {
      fontSize: 16,
      color: colors.text,
      flex: 1,
    },
    checkIcon: {
      marginLeft: 8,
    },
  })

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Category</Text>
      <TouchableOpacity style={styles.pickerButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.pickerText}>
          {selectedCategory
            ? `${selectedCategory.name}${selectedSubCategory ? ` › ${selectedSubCategory.name}` : ""}`
            : "Select a category"}
        </Text>
        <ChevronDown size={20} color={colors.text} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalContainer} 
          activeOpacity={1} 
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
            </View>
            
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id}
              renderItem={({ item: category }) => (
                <>
                  <TouchableOpacity 
                    style={styles.categoryItem}
                    onPress={() => handleCategorySelect(category)}
                  >
                    <View style={[styles.categoryColor, { backgroundColor: category.color }]} />
                    <Text style={styles.categoryName}>{category.name}</Text>
                    {selectedCategoryId === category.id && !selectedSubCategoryId && (
                      <Check size={20} color={colors.primary} style={styles.checkIcon} />
                    )}
                    {category.subCategories.length > 0 && (
                      <ChevronDown 
                        size={20} 
                        color={colors.text} 
                        style={{ 
                          transform: [{ rotate: expandedCategories[category.id] ? '180deg' : '0deg' }]
                        }} 
                      />
                    )}
                  </TouchableOpacity>
                  
                  {expandedCategories[category.id] && category.subCategories.map(subCategory => (
                    <TouchableOpacity
                      key={subCategory.id}
                      style={styles.subCategoryItem}
                      onPress={() => handleSubCategorySelect(category, subCategory)}
                    >
                      <Text style={styles.subCategoryName}>{subCategory.name}</Text>
                      {selectedCategoryId === category.id && selectedSubCategoryId === subCategory.id && (
                        <Check size={20} color={colors.primary} style={styles.checkIcon} />
                      )}
                    </TouchableOpacity>
                  ))}
                </>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

export default CategoryPicker
