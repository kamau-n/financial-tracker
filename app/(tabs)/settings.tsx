import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Share,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { Moon, Sun, Smartphone, Download, Trash2 } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFinance } from "../context/FinanceContext";

export default function Settings() {
  const { colors, theme, setTheme, isDark } = useTheme();
  const { transactions, debts, budgets } = useFinance();

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
    themeButtons: {
      flexDirection: "row",
      gap: 8,
    },
    themeButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 12,
      borderRadius: 8,
      borderWidth: 2,
      gap: 8,
    },
    activeThemeButton: {
      backgroundColor: colors.primary + "20",
      borderColor: colors.primary,
    },
    inactiveThemeButton: {
      borderColor: colors.border,
    },
    themeButtonText: {
      fontSize: 16,
      color: colors.text,
      fontWeight: "500",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    lastRow: {
      borderBottomWidth: 0,
    },
    rowText: {
      fontSize: 16,
      color: colors.text,
    },
    version: {
      textAlign: "center",
      color: colors.text + "80",
      marginTop: 24,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    actionButtonText: {
      fontSize: 16,
      color: colors.text,
    },
    dangerText: {
      color: colors.danger,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Customize your app experience</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.themeButtons}>
            <TouchableOpacity
              style={[
                styles.themeButton,
                theme === "light"
                  ? styles.activeThemeButton
                  : styles.inactiveThemeButton,
              ]}
              onPress={() => setTheme("light")}>
              <Sun size={20} color={colors.text} />
              <Text style={styles.themeButtonText}>Light</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeButton,
                theme === "dark"
                  ? styles.activeThemeButton
                  : styles.inactiveThemeButton,
              ]}
              onPress={() => setTheme("dark")}>
              <Moon size={20} color={colors.text} />
              <Text style={styles.themeButtonText}>Dark</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeButton,
                theme === "system"
                  ? styles.activeThemeButton
                  : styles.inactiveThemeButton,
              ]}
              onPress={() => setTheme("system")}>
              <Smartphone size={20} color={colors.text} />
              <Text style={styles.themeButtonText}>System</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.row}>
            <Text style={styles.rowText}>Daily Summary</Text>
            <Switch value={true} onValueChange={() => {}} />
          </View>
          <View style={styles.row}>
            <Text style={styles.rowText}>Budget Alerts</Text>
            <Switch value={true} onValueChange={() => {}} />
          </View>
          {/* <View style={[styles.row, styles.lastRow]}>
            <Text style={styles.rowText}>Bill Reminders</Text>
            <Switch value={false} onValueChange={() => {}} />
          </View> */}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Privacy</Text>
          <TouchableOpacity style={styles.row} onPress={handleExportData}>
            <View style={styles.actionButton}>
              <Download size={20} color={colors.text} />
              <Text style={styles.actionButtonText}>Export Data</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.row, styles.lastRow]}
            onPress={handleClearData}>
            <View style={styles.actionButton}>
              <Trash2 size={20} color={colors.danger} />
              <Text style={[styles.actionButtonText, styles.dangerText]}>
                Delete All Data
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.version}>Version 0.0.3</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
