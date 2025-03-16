import { Tabs } from 'expo-router';
import { Home, Wallet, PieChart, BarChart, Settings } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <>
      <StatusBar style="dark" backgroundColor={colors.primary} />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: 'gray',
          tabBarPosition: 'bottom',
          tabBarHideOnKeyboard: true,
          tabBarAccessibilityLabel: 'Tabs',
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          }}
        />
  
  <Tabs.Screen
  name="income"
  options={{
    title: 'Income',
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="cash" color={color} size={size} />
    ),
  }}
/>
        <Tabs.Screen
          name="expenses"
          options={{
            title: 'Expenses',
            tabBarIcon: ({ color, size }) => <PieChart color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="reports"
          options={{
            title: 'Reports',
            tabBarIcon: ({ color, size }) => <BarChart color={color} size={size} />,
          }}
        />


        
      </Tabs>


      
    </>
  );
}