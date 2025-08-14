# Greww - Stock Market Tracker

A modern, neobrutalist stock market tracking application built with React Native and Expo. Track your favorite stocks, view market movers, and get detailed stock information.

## 🚀 Features

- 📈 **Stock Market Overview**: View top gainers and losers in the market
- 📊 **Interactive Charts**: View detailed price history with interactive charts
- 💾 **Watchlist**: Save your favorite stocks for quick access
- 🎨 **Neobrutalist UI**: Clean, bold interface with high contrast design
- 🔒 **API Key Management**: Securely manage your Alpha Vantage API key
- 📱 **Cross-platform**: Works on iOS, Android, and web

## 📋 Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI
- iOS Simulator / Android Emulator or physical device

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/SamayXD/Greww.git
   cd greww
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Press `w` for web browser

## 🔑 API Key Setup

This app uses the Alpha Vantage API for stock market data. The default API key in the code is for demonstration purposes only and has rate limits.

**To get your own API key:**

1. Go to [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Sign up for a free account
3. Get your API key
4. Open the app and go to Settings
5. Tap "Change API Key" and enter your key
6. Tap "Save"

## 📱 Screens

- **Home**: Overview of top movers in the market
- **Watchlist**: Your saved stocks
- **Stock Details**: Detailed view with charts and metrics
- **Settings**: Manage your API key and app preferences

## 🧩 Dependencies

### Main Dependencies

| Package                | Version  |
| ---------------------- | -------- |
| React Native           | 0.79.4   |
| Expo                   | ~53.0.15 |
| React                  | 19.0.0   |
| Redux Toolkit          | ^2.8.2   |
| React Query            | ^5.81.5  |
| React Navigation       | ^5.1.2   |
| React Native Chart Kit | ^6.12.0  |
| React Native SVG       | ^15.12.0 |

### Full Dependency List

```json
{
  "dependencies": {
    "@gorhom/bottom-sheet": "^5.1.8",
    "@react-native-async-storage/async-storage": "^2.2.0",
    "@reduxjs/toolkit": "^2.8.2",
    "@tanstack/react-query": "^5.81.5",
    "axios": "^1.10.0",
    "expo": "~53.0.15",
    "expo-linear-gradient": "^14.1.5",
    "expo-linking": "^7.1.7",
    "expo-router": "^5.1.2",
    "expo-status-bar": "~2.2.3",
    "lucide-react-native": "^0.525.0",
    "react": "19.0.0",
    "react-native": "0.79.4",
    "react-native-chart-kit": "^6.12.0",
    "react-native-dotenv": "^3.4.11",
    "react-native-modal": "^14.0.0-rc.1",
    "react-native-safe-area-context": "^5.6.0",
    "react-native-screens": "^4.13.1",
    "react-native-svg": "^15.12.0",
    "react-redux": "^9.2.0",
    "redux": "^5.0.1",
    "redux-persist": "^6.0.0"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@types/react": "~19.0.10",
    "typescript": "~5.8.3"
  }
}
```

## 🏗️ Project Structure

```
greww/
├── app/                  # Main application code
│   ├── (main)/           # Main app screens
│   │   ├── SettingScreen.tsx
│   │   ├── TopMoverScreen.tsx
│   │   └── WatchListScreen.tsx
│   ├── StockDetailsScreen.tsx
│   └── _layout.tsx
├── assets/               # Images, fonts, and other assets
├── src/
│   ├── components/       # Reusable components
│   ├── services/         # API and business logic
│   ├── store/            # Redux store and slices
│   └── utils/            # Utility functions
└── package.json          # Project dependencies
```

## 🚀 Running the App

### iOS

```bash
npm run ios
# or
yarn ios
```

### Android

```bash
npm run android
# or
yarn android
```

### Web

```bash
npm run web
# or
yarn web
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ using React Native and Expo
- Stock market data provided by [Alpha Vantage](https://www.alphavantage.co/)
- Icons by [Lucide](https://lucide.dev/)
- Neobrutalist design inspiration
