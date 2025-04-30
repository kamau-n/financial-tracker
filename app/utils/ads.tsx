// // BannerAdComponent.tsx
// import React from 'react';
// import { Platform } from 'react-native';
// import {
//   BannerAd,
//   BannerAdSize,
//   TestIds,
// } from 'react-native-google-mobile-ads';

// export default function BannerAdComponent() {
//   if (Platform.OS === 'web') return null;

//   const adUnitId = __DEV__
//     ? TestIds.BANNER
//     : 'ca-app-pub-1595924632810821/7307943098'; // Your live ID

//   return (
//     <BannerAd
//       unitId={adUnitId}
//       size={BannerAdSize.FULL_BANNER}
//       requestOptions={{
//         requestNonPersonalizedAdsOnly: false, // or true if you want limited tracking
//       }}
//       onAdFailedToLoad={(error) => {
//         console.error('Ad failed to load: ', error);
//       }}
//     />
//   );
// }
