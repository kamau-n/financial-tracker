import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useColorScheme as useRNColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "./context/ThemeContext";
import { FinanceProvider } from "./context/FinanceContext";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { useFrameworkReady } from "@/hooks/useFrameworkReady";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function RootLayout() {
  useFrameworkReady();
  const colorScheme = useRNColorScheme();

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      // Hide the splash screen after resources are loaded
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    if (Platform.OS !== "web") {
      // Request notification permissions
      Notifications.requestPermissionsAsync();
    }
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <>
      <SafeAreaProvider>
        <ThemeProvider>
          <FinanceProvider>
            <NavigationThemeProvider
              value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              </Stack>
            </NavigationThemeProvider>
          </FinanceProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </>
  );
}
