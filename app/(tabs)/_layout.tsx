import { Tabs } from 'expo-router';
import { Chrome as Home, ListPlus, ChartBar as BarChart, Settings ,BookDashedIcon,HomeIcon, HandCoins} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { StatusBar } from 'expo-status-bar';

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
            tabBarIcon: ({ color, size }) => <HomeIcon color={color} size={size} />,
          }}
        />

   

        <Tabs.Screen
          name="transactions"
          options={{
            title: 'Transactions',
            tabBarIcon: ({ color, size }) => <ListPlus color={color} size={size} />,
          }}
        />

    
     


        <Tabs.Screen
          name="debt"
          options={{
            title: 'Debts',
            tabBarIcon: ({ color, size }) => <HandCoins color={color} size={size} />,
          }}
        />

         <Tabs.Screen
          name="reports"
          options={{
            title: 'Reports',
            tabBarIcon: ({ color, size }) => <BarChart color={color} size={size} />,
          }}
        />


         <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
          }}
        />

      </Tabs>

      
    </>
  );
}