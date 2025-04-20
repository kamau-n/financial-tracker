import { Platform } from "react-native";

export const showNotification = (title: string, body: string) => {
  if (Platform.OS === "web") {
    // Check if browser notifications are supported and permitted
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification(title, { body });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification(title, { body });
          }
        });
      }
    } else {
      // Fallback to alert for browsers that don't support notifications
      alert(`${title}\n${body}`);
    }
  } else {
    // For mobile, we'll use a simple alert for now
    // In a production app, you'd want to use something like expo-notifications
    alert(`${title}\n${body}`);
  }
};
