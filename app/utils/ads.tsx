// // BannerAdComponent.tsx
// import { AdMobBanner } from "expo-ads-admob";
// import { Platform } from "react-native";

// export default function BannerAdComponent() {
//   if (Platform.OS === "web") return null;

//   return (
//     <AdMobBanner
//       bannerSize="fullBanner"
//       adUnitID={
//         __DEV__
//           ? "ca-app-pub-3940256099942544/6300978111" // Test ID
//           : "ca-app-pub-1595924632810821/7307943098" // Your live ID
//       }
//       servePersonalizedAds
//       onDidFailToReceiveAdWithError={(error) => console.log(error)}
//     />
//   );
// }
