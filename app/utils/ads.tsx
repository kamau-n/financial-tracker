// import { Platform } from "react-native";
// import {
//   BannerAd,
//   BannerAdSize,
//   TestIds,
// } from "react-native-google-mobile-ads";

// const adUnitId = __DEV__
//   ? TestIds.BANNER
//   : Platform.select({
//       android: "ca-app-pub-1595924632810821/7307943098",
//       ios: "ca-app-pub-1595924632810821/7307943098",
//       default: TestIds.BANNER,
//     });

// export const BannerAdComponent = () => {
//   if (Platform.OS === "web") return null;

//   return (
//     <BannerAd
//       unitId={adUnitId}
//       size={BannerAdSize.BANNER}
//       requestOptions={{ requestNonPersonalizedAdsOnly: true }}
//     />
//   );
// };
