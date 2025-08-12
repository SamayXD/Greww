// store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import watchlistReducer, {
  initializeDefaultWatchlist,
} from "./slices/watchlistSlice";

// Configuration for persisting the watchlist slice
const persistConfig = {
  key: "watchlist",
  storage: AsyncStorage,
  whitelist: ["watchlists", "defaultWatchlistId", "items"],
};

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, watchlistReducer);

export const store = configureStore({
  reducer: {
    watchlist: persistedReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Initialize the persistor
export const persistor = persistStore(store, null, () => {
  const state = store.getState().watchlist;
  if (!state || Object.keys(state.watchlists).length === 0) {
    store.dispatch(initializeDefaultWatchlist());
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
