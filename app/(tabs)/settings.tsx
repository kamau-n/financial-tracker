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
  FlatList,
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
  ChevronDown,
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
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
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

  const handleCurrencyChange = async (currency: any) => {
    setSelectedCurrency(currency);
    await setCurrency(currency);
    setShowCurrencyModal(false);
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
      Alert.alert("Error", "Failed to save custom currency");
    }
  };

  const saveNotificationSettings = async (daily: any, alerts: any) => {
    try {
      await AsyncStorage.setItem(
        "notificationSettings",
        JSON.stringify({ dailySummary: daily, budgetAlerts: alerts })
      );
    } catch (error) {
      console.error("Error saving notification settings:", error);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: 16 },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: { fontSize: 16, color: colors.text + "99", marginBottom: 24 },
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
    dropdown: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: colors.background,
      padding: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dropdownText: { fontSize: 16, color: colors.text },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    rowLast: { borderBottomWidth: 0 },
    modalContainer: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 20,
      width: "100%",
      maxWidth: 400,
    },
    currencyOption: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      borderRadius: 8,
    },
    selectedCurrency: { backgroundColor: colors.primary + "20" },
    currencySymbol: {
      fontSize: 18,
      fontWeight: "600",
      marginRight: 12,
      color: colors.text,
    },
    currencyOptionText: { fontSize: 16, color: colors.text, flex: 1 },
    actionButton: {
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 8,
      alignItems: "center",
      marginTop: 8,
    },
    actionButtonText: { color: colors.card, fontSize: 16, fontWeight: "600" },
    dangerButton: {
      backgroundColor: colors.danger,
      padding: 16,
      borderRadius: 8,
      alignItems: "center",
      marginTop: 8,
    },
    dangerButtonText: { color: colors.card, fontSize: 16, fontWeight: "600" },
  });

  const ThemeIcon = THEMES.find((t) => t.id === theme)?.Icon || Sun;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Customize your app experience</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Theme</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowThemeModal(true)}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <ThemeIcon size={20} color={colors.text} />
              <Text style={[styles.dropdownText, { marginLeft: 10 }]}>
                {THEMES.find((t) => t.id === theme)?.name}
              </Text>
            </View>
            <Text style={{ color: colors.text + "80" }}>Change</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Currency</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowCurrencyModal(true)}>
            <Text style={styles.dropdownText}>
              {selectedCurrency.symbol} {selectedCurrency.name} (
              {selectedCurrency.code})
            </Text>
            <ChevronDown size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.row}>
            <Text style={styles.dropdownText}>Daily Summary</Text>
            <Switch
              value={dailySummary}
              onValueChange={(val) => {
                setDailySummary(val);
                saveNotificationSettings(val, budgetAlerts);
              }}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.dropdownText}>Budget Alerts</Text>
            <Switch
              value={budgetAlerts}
              onValueChange={(val) => {
                setBudgetAlerts(val);
                saveNotificationSettings(dailySummary, val);
              }}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={async () => {
              try {
                const data = {
                  transactions,
                  debts,
                  budgets,
                  exportDate: new Date().toISOString(),
                };
                await Share.share({
                  message: JSON.stringify(data, null, 2),
                  title: "FinTrack Data Export",
                });
              } catch {
                Alert.alert("Error", "Failed to export data");
              }
            }}>
            <Text style={styles.actionButtonText}>Export Data</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={() =>
              Alert.alert("Clear All Data", "Are you sure?", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Clear Data",
                  style: "destructive",
                  onPress: async () => {
                    await AsyncStorage.multiRemove([
                      "transactions",
                      "debts",
                      "budgets",
                      "categories",
                    ]);
                    Alert.alert("Success", "All data cleared.");
                  },
                },
              ])
            }>
            <Text style={styles.dangerButtonText}>Clear All Data</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Currency Modal */}
      <Modal
        visible={showCurrencyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCurrencyModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.sectionTitle}>Select Currency</Text>
            <FlatList
              data={CURRENCIES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.currencyOption,
                    item.code === selectedCurrency.code &&
                      styles.selectedCurrency,
                  ]}
                  onPress={() => handleCurrencyChange(item)}>
                  <Text style={styles.currencySymbol}>{item.symbol}</Text>
                  <Text style={styles.currencyOptionText}>
                    {item.name} ({item.code})
                  </Text>
                  {item.code === selectedCurrency.code && (
                    <Check size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => setShowCustomCurrencyModal(true)}>
              <Text style={{ color: colors.primary, marginTop: 12 }}>
                + Add Custom Currency
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
