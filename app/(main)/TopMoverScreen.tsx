// TopMoverScreen.js (Polished Neo Brutalism)
import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useTopMovers } from "../../src/hooks/useStockData";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

const StockCard = ({ item }) => {
  const changeValue = parseFloat(item.change_percentage.replace("%", ""));
  const isPositive = changeValue >= 0;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { width: (width - 48) / 2 },
        pressed &&
          (isPositive
            ? styles.cardPressedPositive
            : styles.cardPressedNegative),
      ]}
      onPress={() =>
        router.push({
          pathname: "StockDetailsScreen",
          params: { symbol: item.ticker },
        })
      }
    >
      <View style={styles.cardInner}>
        <View style={styles.cardHeader}>
          <Text style={styles.ticker}>{item.ticker}</Text>

          <View
            style={[
              styles.deltaPill,
              isPositive ? styles.deltaUp : styles.deltaDown,
            ]}
          >
            <Text style={styles.deltaText}>
              {isPositive ? "+" : ""}
              {item.change_percentage}
            </Text>
          </View>
        </View>
        <Text style={styles.price}>${parseFloat(item.price).toFixed(2)}</Text>
      </View>
    </Pressable>
  );
};

const CollapsibleHeader = ({
  title,
  count,
  isExpanded,
  isCollapsed,
  onToggle,
}) => (
  <TouchableOpacity
    style={[
      styles.sectionHeader,
      title === "TOP GAINERS"
        ? { backgroundColor: "rgba(54, 234, 102, 0.6)" }
        : { backgroundColor: "rgba(255, 59, 48, 0.6)" },
    ]}
    onPress={onToggle}
    activeOpacity={0.8}
  >
    <Text style={styles.sectionTitle}>{title}</Text>
    <Text style={styles.sectionSubtitle}>{count} stocks</Text>
    <Text style={styles.expandIconText}>
      {isCollapsed ? "▲" : isExpanded ? "▲" : "▼"}
    </Text>
  </TouchableOpacity>
);

const TopMoverScreen = () => {
  const { data: topMovers, isLoading, error } = useTopMovers();
  const { data: bottomMovers } = useTopMovers();
  const [viewMode, setViewMode] = useState("balanced");

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="small" color="#000" />
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>⚠ Unable to load data</Text>
      </SafeAreaView>
    );
  }

  const handleHeaderPress = (section) => {
    setViewMode(viewMode === section ? "balanced" : section);
  };

  const isGainersExpanded = viewMode === "gainers";
  const isLosersExpanded = viewMode === "losers";
  const isGainersCollapsed = viewMode === "losers";
  const isLosersCollapsed = viewMode === "gainers";

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.topBar}>
        <Text style={styles.title}>Top Movers</Text>
        <TouchableOpacity onPress={() => setViewMode("balanced")}>
          <Text style={styles.resetButton}>RESET</Text>
        </TouchableOpacity>
      </View>

      {/* Gainers */}
      <CollapsibleHeader
        title="TOP GAINERS"
        count={topMovers?.top_gainers?.length || 0}
        isExpanded={isGainersExpanded}
        isCollapsed={isGainersCollapsed}
        onToggle={() => handleHeaderPress("gainers")}
      />
      {!isGainersCollapsed && (
        <FlatList
          data={topMovers?.top_gainers || []}
          renderItem={({ item }) => <StockCard item={item} />}
          keyExtractor={(item) => item.ticker}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Losers */}
      <CollapsibleHeader
        title="TOP LOSERS"
        count={bottomMovers?.top_losers?.length || 0}
        isExpanded={isLosersExpanded}
        isCollapsed={isLosersCollapsed}
        onToggle={() => handleHeaderPress("losers")}
      />
      {!isLosersCollapsed && (
        <FlatList
          data={bottomMovers?.top_losers || []}
          renderItem={({ item }) => <StockCard item={item} />}
          keyExtractor={(item) => item.ticker}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  /* Top bar */
  topBar: {
    padding: 16,
    borderBottomWidth: 2,
    borderColor: "#000",
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  title: { fontSize: 26, fontWeight: "900", color: "#000" },
  resetButton: { fontSize: 14, fontWeight: "900", color: "#000" },

  /* Section header */
  sectionHeader: {
    padding: 14,
    borderBottomWidth: 2,
    borderTopWidth: 2,
    borderColor: "#000",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    boxShadow: "3px 2px 0px #000",
  },
  sectionTitle: { fontSize: 16, fontWeight: "900", color: "#000" },
  sectionSubtitle: { fontSize: 12, fontWeight: "700", color: "#000" },
  expandIconText: { fontSize: 14, fontWeight: "900", color: "#000" },

  /* Cards */
  card: {
    borderWidth: 2,
    padding: 14,
    minHeight: 85,
    borderColor: "#000",
    backgroundColor: "#fff",
    boxShadow: "3px 2px 0px #000",
  },
  cardPressedPositive: { backgroundColor: "rgba(54, 234, 102, 0.6)" },
  cardPressedNegative: { backgroundColor: "rgba(255, 59, 48, 0.6)" },
  cardInner: { flex: 1 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  ticker: { fontSize: 16, fontWeight: "900", color: "#000" },
  deltaPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: "#000",
  },
  deltaUp: { backgroundColor: "#16A34A" },
  deltaDown: { backgroundColor: "#DC2626" },
  deltaText: { color: "#fff", fontSize: 12, fontWeight: "900" },
  price: { fontSize: 18, fontWeight: "900", color: "#000" },

  /* List layout */
  listContent: { padding: 12 },
  row: { justifyContent: "space-between", marginBottom: 12 },

  /* States */
  loadingText: { marginTop: 8, fontWeight: "700", color: "#000" },
  errorText: { color: "#000", fontWeight: "900", fontSize: 16 },
});

export default TopMoverScreen;
