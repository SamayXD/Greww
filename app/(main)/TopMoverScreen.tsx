import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useTopMovers } from "../../src/hooks/useStockData";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
// fallbackData removed for minimal UI

const { width, height } = Dimensions.get("window");

const StockCard = ({ item }) => {
  const changeValue = parseFloat(item.change_percentage.replace("%", ""));
  const isPositive = changeValue >= 0;
  return (
    <TouchableOpacity
      style={[styles.card, { width: (width - 48) / 2 }]}
      onPress={() => router.push({ pathname: "StockDetailsScreen", params: { symbol: item.ticker } })}
      activeOpacity={0.8}
    >
      <View style={styles.cardInner}>
        <View style={styles.cardHeader}>
          <Text style={styles.ticker}>{item.ticker}</Text>
          <View style={[styles.deltaPill, isPositive ? styles.deltaUp : styles.deltaDown]}>
            <Text style={styles.deltaText}>{isPositive ? "+" : ""}{item.change_percentage}</Text>
          </View>
        </View>
        <Text style={styles.price}>${parseFloat(item.price).toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const CollapsibleHeader = ({ title, isGainer, count, isExpanded, onToggle, isCollapsed }) => (
  <TouchableOpacity
    style={[
      styles.sectionHeader,
      isCollapsed && styles.collapsedHeader,
    ]}
    onPress={onToggle}
    activeOpacity={0.8}
  >
    <View style={styles.sectionTitleContainer}>
      <Text style={styles.sectionPill}>{isGainer ? "Gainers" : "Losers"}</Text>
      <View style={styles.titleTextContainer}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionSubtitle}>{count} stocks</Text>
      </View>
      <View style={styles.expandIconContainer}>
        <View
          style={[
            styles.expandIcon,
            isExpanded && styles.expandIconRotated,
            isCollapsed && styles.expandIconCollapsed,
          ]}
        >
          <Text style={styles.expandIconText}>
            {isCollapsed ? "▲" : isExpanded ? "▲" : "▼"}
          </Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

const TopMoverScreen = () => {
  const { data: topMovers, isLoading, error } = useTopMovers();

  const { data: bottomMovers } = useTopMovers();
  const [viewMode, setViewMode] = useState("balanced"); // 'balanced', 'gainers', 'losers'

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainerSimple}>
          <ActivityIndicator size="small" color="#111827" />
          <Text style={styles.loadingText}>Loading</Text>
        </View>
      </SafeAreaView>
    );
  }

  // minimal UI: no debug logs

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <View style={styles.errorIcon}>
            <Text style={styles.errorIconText}>⚠</Text>
          </View>
          <Text style={styles.errorTitle}>Unable to load data</Text>
          <Text style={styles.errorText}>
            Please check your connection and try again
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleHeaderPress = (section) => {
    if (viewMode === section) {
      setViewMode("balanced");
    } else {
      setViewMode(section);
    }
  };

  // render inline in FlatList for simplicity

  const isGainersExpanded = viewMode === "gainers";
  const isLosersExpanded = viewMode === "losers";
  const isGainersCollapsed = viewMode === "losers";
  const isLosersCollapsed = viewMode === "gainers";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Top Movers</Text>
          <TouchableOpacity onPress={() => setViewMode("balanced")} activeOpacity={0.7}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.sectionsContainer}>
        {/* Top Gainers Section */}
        <View
          style={[
            styles.section,
            isGainersExpanded && styles.sectionExpanded,
            isGainersCollapsed && styles.sectionCollapsed,
          ]}
        >
          <CollapsibleHeader
            title="Top Gainers"
            isGainer={true}
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
              showsVerticalScrollIndicator={false}
              scrollEnabled={isGainersExpanded}
              nestedScrollEnabled={true}
            />
          )}
        </View>

        {/* Elegant Divider */}
        {viewMode === "balanced" && <View style={styles.divider} />}

        {/* Top Losers Section */}
        <View
          style={[
            styles.section,
            isLosersExpanded && styles.sectionExpanded,
            isLosersCollapsed && styles.sectionCollapsed,
          ]}
        >
          <CollapsibleHeader
            title="Top Losers"
            isGainer={false}
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
              showsVerticalScrollIndicator={false}
              scrollEnabled={isLosersExpanded}
              nestedScrollEnabled={true}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 22, fontWeight: "700", color: "#111827" },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  resetButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#3B82F6",
    borderRadius: 20,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  resetButtonText: { color: "#6B7280", fontSize: 13, fontWeight: "500", textDecorationLine: "underline" },
  sectionsContainer: {
    flex: 1,
  },
  section: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    minHeight: 60,
  },
  sectionExpanded: {
    flex: 10,
  },
  sectionCollapsed: {
    flex: 0,
    minHeight: 60,
    maxHeight: 60,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  collapsedHeader: {
    borderBottomWidth: 0,
  },
  gainersHeader: {
    backgroundColor: "#ECFDF5",
  },
  losersHeader: {
    backgroundColor: "#FEF2F2",
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  sectionIconText: {
    fontSize: 14,
    color: "white",
    fontWeight: "bold",
  },
  titleTextContainer: {
    flex: 1,
  },
  sectionPill: {
    marginRight: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "600",
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  sectionSubtitle: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  expandIconContainer: {
    padding: 4,
  },
  expandIcon: { width: 24, height: 24, justifyContent: "center", alignItems: "center", backgroundColor: "#F3F4F6", borderRadius: 12 },
  expandIconRotated: {
    backgroundColor: "#E2E8F0",
  },
  expandIconCollapsed: {
    backgroundColor: "#FEF2F2",
  },
  expandIconText: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "bold",
  },
  listContent: { padding: 12, paddingTop: 10 },
  row: { justifyContent: "space-between", marginBottom: 12 },
  card: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: "#E5E7EB" },
  cardInner: { padding: 12, minHeight: 85 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  ticker: { fontSize: 14, fontWeight: "800", color: "#111827", letterSpacing: 0.2 },
  deltaPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  deltaUp: { backgroundColor: "#16A34A" },
  deltaDown: { backgroundColor: "#DC2626" },
  deltaText: { fontSize: 10, fontWeight: "700", color: "#FFFFFF" },
  price: { fontSize: 18, fontWeight: "700", color: "#111827", letterSpacing: -0.2, marginBottom: 4 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  changeAmount: {
    fontSize: 12,
    fontWeight: "600",
  },
  volume: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
  },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#E5E7EB" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingSpinner: {
    flexDirection: "row",
    marginBottom: 16,
  },
  spinnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3B82F6",
    marginHorizontal: 4,
    opacity: 0.7,
  },
  loadingContainerSimple: { flex: 1, justifyContent: "center", alignItems: "center", gap: 8 },
  loadingText: { fontSize: 14, color: "#6B7280", fontWeight: "500", marginTop: 8 },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  errorIconText: {
    fontSize: 24,
    color: "#EF4444",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    textAlign: "center",
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default TopMoverScreen;
