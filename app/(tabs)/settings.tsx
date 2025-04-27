import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Share,
  TextInput,
  Modal,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Moon,
  Sun,
  Smartphone,
  Download,
  Trash2,
  Plus,
  Check,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFinance } from "../context/FinanceContext";
import { getCurrency, setCurrency } from "../utils/formatters";
import { useState, useEffect } from "react";

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
];

const THEMES = [
  { id: "light", name: "Light", Icon: Sun },
  { id: "dark", name: "Dark", Icon: Moon },
  { id: "system", name: "System", Icon: Smartphone },
];

export default function Settings() {
  const { colors, theme, setTheme } = useTheme();
  const { transactions, debts, budgets } = useFinance();
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0]);
  const [dailySummary, setDailySummary] = useState(false);
  const [budgetAlerts, setBudgetAlerts] = useState(false);
  const [showCustomCurrencyModal, setShowCustomCurrencyModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [customCurrency, setCustomCurrency] = useState({
    code: "",
    symbol: "",
    name: "",
  });

  useEffect(() => {
    const loadCurrency = async () => {
      const currency = await getCurrency();
      setSelectedCurrency(currency);
    };
    loadCurrency();

    const loadNotificationSettings = async () => {
      try {
        const settings = await AsyncStorage.getItem("notificationSettings");
        if (settings) {
          const { dailySummary: daily, budgetAlerts: alerts } =
            JSON.parse(settings);
          setDailySummary(daily);
          setBudgetAlerts(alerts);
        }
      } catch (error) {
        console.error("Error loading notification settings:", error);
      }
    };
    loadNotificationSettings();
  }, []);

  const handleCurrencyChange = async (currency: typeof selectedCurrency) => {
    setSelectedCurrency(currency);
    await setCurrency(currency);
  };

  const handleAddCustomCurrency = async () => {
    if (
      !customCurrency.code ||
      !customCurrency.symbol ||
      !customCurrency.name
    ) {
      Alert.alert("Error", "Please fill in all currency fields");
      return;
    }

    const newCurrency = {
      code: customCurrency.code.toUpperCase(),
      symbol: customCurrency.symbol,
      name: customCurrency.name,
    };

    try {
      const storedCurrencies = await AsyncStorage.getItem("customCurrencies");
      const customCurrencies = storedCurrencies
        ? JSON.parse(storedCurrencies)
        : [];
      customCurrencies.push(newCurrency);
      await AsyncStorage.setItem(
        "customCurrencies",
        JSON.stringify(customCurrencies)
      );

      await handleCurrencyChange(newCurrency);
      setShowCustomCurrencyModal(false);
      setCustomCurrency({ code: "", symbol: "", name: "" });
    } catch (error) {
      console.error("Error saving custom currency:", error);
      Alert.alert("Error", "Failed to save custom currency");
    }
  };

  const saveNotificationSettings = async (daily: boolean, alerts: boolean) => {
    try {
      await AsyncStorage.setItem(
        "notificationSettings",
        JSON.stringify({
          dailySummary: daily,
          budgetAlerts: alerts,
        })
      );
    } catch (error) {
      console.error("Error saving notification settings:", error);
    }
  };

  const handleDailySummaryToggle = (value: boolean) => {
    setDailySummary(value);
    saveNotificationSettings(value, budgetAlerts);
  };

  const handleBudgetAlertsToggle = (value: boolean) => {
    setBudgetAlerts(value);
    saveNotificationSettings(dailySummary, value);
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "Are you sure you want to clear all your data? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear Data",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                "transactions",
                "debts",
                "budgets",
                "categories",
              ]);
              Alert.alert(
                "Success",
                "All data has been cleared. Please restart the app."
              );
            } catch (error) {
              Alert.alert("Error", "Failed to clear data");
            }
          },
        },
      ]
    );
  };

  const handleExportData = async () => {
    try {
      const data = {
        transactions,
        debts,
        budgets,
        exportDate: new Date().toISOString(),
      };

      const jsonStr = JSON.stringify(data, null, 2);
      await Share.share({
        message: jsonStr,
        title: "FinTrack Data Export",
      });
    } catch (error) {
      Alert.alert("Error", "Failed to export data");
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 16,
    },
    header: {
      marginBottom: 24,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.text + "99",
    },
    section: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 16,
    },
    themeButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 16,
      backgroundColor: colors.background,
      borderRadius: 8,
      marginBottom: 8,
    },
    themeButtonText: {
      fontSize: 16,
      color: colors.text,
      marginLeft: 12,
    },
    themeIconContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    rowLast: {
      borderBottomWidth: 0,
    },
    rowLabel: {
      fontSize: 16,
      color: colors.text,
    },
    currencyPicker: {
      marginTop: 8,
    },
    currencyOption: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
      backgroundColor: colors.background,
    },
    selectedCurrency: {
      backgroundColor: colors.primary + "20",
    },
    currencySymbol: {
      fontSize: 18,
      fontWeight: "600",
      marginRight: 12,
      color: colors.text,
    },
    currencyOptionText: {
      fontSize: 16,
      color: colors.text,
      flex: 1,
    },
    addCurrencyButton: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      gap: 8,
    },
    addCurrencyText: {
      fontSize: 16,
      color: colors.primary,
    },
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.5)",
      padding: 20,
    },
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 20,
      width: "100%",
      maxWidth: 400,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 20,
      textAlign: "center",
    },
    inputContainer: {
      marginBottom: 16,
    },
    label: {
      fontSize: 16,
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.background,
    },
    modalButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
      marginTop: 20,
    },
    modalButton: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      alignItems: "center",
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: "600",
    },
    dangerButton: {
      backgroundColor: colors.danger,
      padding: 16,
      borderRadius: 8,
      alignItems: "center",
      marginTop: 8,
    },
    dangerButtonText: {
      color: colors.card,
      fontSize: 16,
      fontWeight: "600",
    },
    actionButton: {
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 8,
      alignItems: "center",
      marginTop: 8,
    },
    actionButtonText: {
      color: colors.card,
      fontSize: 16,
      fontWeight: "600",
    },
  });

  const currentTheme = THEMES.find((t) => t.id === theme);
  const ThemeIcon = currentTheme?.Icon || Sun;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Customize your app experience</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Theme</Text>
          <TouchableOpacity
            style={styles.themeButton}
            onPress={() => setShowThemeModal(true)}>
            <View style={styles.themeIconContainer}>
              <ThemeIcon size={20} color={colors.text} />
              <Text style={styles.themeButtonText}>{currentTheme?.name}</Text>
            </View>
            <Text style={{ color: colors.text + "80" }}>Change</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Currency</Text>
          <View style={styles.currencyPicker}>
            {CURRENCIES.map((currency) => (
              <TouchableOpacity
                key={currency.code}
                style={[
                  styles.currencyOption,
                  selectedCurrency.code === currency.code &&
                    styles.selectedCurrency,
                ]}
                onPress={() => handleCurrencyChange(currency)}>
                <Text style={styles.currencySymbol}>{currency.symbol}</Text>
                <Text style={styles.currencyOptionText}>
                  {currency.name} ({currency.code})
                </Text>
                {selectedCurrency.code === currency.code && (
                  <Check size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.addCurrencyButton}
              onPress={() => setShowCustomCurrencyModal(true)}>
              <Plus size={20} color={colors.primary} />
              <Text style={styles.addCurrencyText}>Add Custom Currency</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Daily Summary</Text>
            <Switch
              value={dailySummary}
              onValueChange={handleDailySummaryToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
          <View style={[styles.row, styles.rowLast]}>
            <Text style={styles.rowLabel}>Budget Alerts</Text>
            <Switch
              value={budgetAlerts}
              onValueChange={handleBudgetAlertsToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleExportData}>
            <Text style={styles.actionButtonText}>Export Data</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={handleClearData}>
            <Text style={styles.dangerButtonText}>Clear All Data</Text>
          </TouchableOpacity>
        </View>

        <Modal
          visible={showThemeModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowThemeModal(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Theme</Text>
              {THEMES.map((themeOption) => {
                const Icon = themeOption.Icon;
                return (
                  <TouchableOpacity
                    key={themeOption.id}
                    style={[
                      styles.themeButton,
                      theme === themeOption.id && styles.selectedCurrency,
                    ]}
                    onPress={() => {
                      setTheme(themeOption.id);
                      setShowThemeModal(false);
                    }}>
                    <View style={styles.themeIconContainer}>
                      <Icon size={20} color={colors.text} />
                      <Text style={styles.themeButtonText}>
                        {themeOption.name}
                      </Text>
                    </View>
                    {theme === themeOption.id && (
                      <Check size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Modal>

        <Modal
          visible={showCustomCurrencyModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowCustomCurrencyModal(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Custom Currency</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Currency Code (e.g., USD)</Text>
                <TextInput
                  style={styles.input}
                  value={customCurrency.code}
                  onChangeText={(text) =>
                    setCustomCurrency((prev) => ({ ...prev, code: text }))
                  }
                  placeholder="Enter currency code"
                  maxLength={3}
                  autoCapitalize="characters"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Symbol (e.g., $)</Text>
                <TextInput
                  style={styles.input}
                  value={customCurrency.symbol}
                  onChangeText={(text) =>
                    setCustomCurrency((prev) => ({ ...prev, symbol: text }))
                  }
                  placeholder="Enter currency symbol"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Name (e.g., US Dollar)</Text>
                <TextInput
                  style={styles.input}
                  value={customCurrency.name}
                  onChangeText={(text) =>
                    setCustomCurrency((prev) => ({ ...prev, name: text }))
                  }
                  placeholder="Enter currency name"
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    { backgroundColor: colors.border },
                  ]}
                  onPress={() => setShowCustomCurrencyModal(false)}>
                  <Text
                    style={[styles.modalButtonText, { color: colors.text }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={handleAddCustomCurrency}>
                  <Text
                    style={[styles.modalButtonText, { color: colors.card }]}>
                    Add Currency
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}
