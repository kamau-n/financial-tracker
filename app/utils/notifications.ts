import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "web") {
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Failed to get push token for push notification!");
    return;
  }

  token = await Notifications.getExpoPushTokenAsync();
  console.log(token);

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return token;
}

export async function scheduleBudgetNotification(budget: any) {
  if (Platform.OS === "web") return;

  const trigger = new Date(budget.dueDate);
  trigger.setDate(trigger.getDate() - 1); // Notify 1 day before
  trigger.setHours(9, 0, 0); // 9 AM

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Budget Alert",
      body: `Your budget for ${budget.category} is due tomorrow!`,
      data: { budget },
    },
    trigger,
  });
}

export async function scheduleDebtNotification(debt: any) {
  if (Platform.OS === "web") return;

  const trigger = new Date(debt.dueDate);
  trigger.setDate(trigger.getDate() - 1); // Notify 1 day before
  trigger.setHours(9, 0, 0); // 9 AM

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Debt Payment Reminder",
      body: `Your ${debt.type} payment of ${debt.amount} to ${debt.personName} is due tomorrow!`,
      data: { debt },
    },
    trigger,
  });
}

export async function showNotification(title: string, body: string) {
  if (Platform.OS === "web") {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        new Notification(title, { body });
      }
    }
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
    },
    trigger: null, // Show immediately
  });
}
