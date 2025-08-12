import { StyleSheet } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "../src/store";

const queryClient = new QueryClient();

const _layout = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
      <QueryClientProvider client={queryClient}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: true }} />
          <Stack.Screen name="(main)" options={{ headerShown: false }} />
          <Stack.Screen
            name="StockDetailsScreen"
            options={{ headerShown: false }}
          />
        </Stack>
      </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
};

export default _layout;

const styles = StyleSheet.create({});
