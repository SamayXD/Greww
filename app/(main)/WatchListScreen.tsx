import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Alert,
  SectionList,
} from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../src/store";
import {
  removeFromWatchlist,
  selectAllWatchlists,
  Watchlist,
  StockItem,
  initializeDefaultWatchlist,
  selectDefaultWatchlist,
} from "../../src/store/slices/watchlistSlice";
import { router } from "expo-router";
import { Trash2, TrendingUp, Plus, ChevronRight } from "lucide-react-native";

const { width } = Dimensions.get("window");

const WatchListScreen = () => {
  const watchlists = useSelector(selectAllWatchlists);
  const defaultWatchlist = useSelector(selectDefaultWatchlist);
  const dispatch = useDispatch();
  const [expandedWatchlists, setExpandedWatchlists] = useState<{
    [key: string]: boolean;
  }>({});

  // Initialize default watchlist on component mount if none exists
  useEffect(() => {
    dispatch(initializeDefaultWatchlist());
  }, [dispatch]);

  const toggleWatchlist = (watchlistId: string) => {
    if (!watchlistId) return;

    setExpandedWatchlists((prev) => ({
      ...prev,
      [watchlistId]: !prev[watchlistId],
    }));
  };

  const handleRemove = (watchlistId: string, symbol: string) => {
    if (!watchlistId || !symbol) return;

    Alert.alert(
      "Remove from Watchlist",
      `Are you sure you want to remove ${symbol} from this watchlist?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          onPress: () => dispatch(removeFromWatchlist({ watchlistId, symbol })),
          style: "destructive",
        },
      ]
    );
  };

  const renderEmptyList = (watchlistName: string) => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No stocks in {watchlistName}</Text>
      <Text style={styles.emptySubtitle}>
        Add stocks by tapping the heart icon on any stock
      </Text>
    </View>
  );

  const renderStockItem = (item: StockItem, watchlistId: string) => (
    <TouchableOpacity
      style={styles.stockCard}
      onPress={() => router.push(`/StockDetailsScreen?symbol=${item.symbol}`)}
    >
      <View style={styles.stockInfo}>
        <Text style={styles.stockSymbol}>{item.symbol}</Text>
        <Text style={styles.stockName} numberOfLines={1}>
          {item.name}
        </Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() =>
            router.push(`/StockDetailsScreen?symbol=${item.symbol}`)
          }
        >
          <TrendingUp size={18} color="#3B82F6" />
          <Text style={styles.viewButtonText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemove(watchlistId, item.symbol)}
        >
          <Trash2 size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderWatchlist = ({ item }: { item: Watchlist }) => {
    // Handle case where item might be undefined or incomplete
    if (!item || !item.id) {
      return null;
    }

    const isExpanded = expandedWatchlists[item.id] || false;
    const stocks = item.stocks || [];

    return (
      <View style={styles.watchlistSection}>
        <TouchableOpacity
          style={styles.watchlistHeader}
          onPress={() => toggleWatchlist(item.id)}
        >
          <Text style={styles.watchlistName}>
            {item.name || "Unnamed Watchlist"}
          </Text>
          <View style={styles.watchlistHeaderRight}>
            <Text style={styles.stockCount}>
              {stocks.length} {stocks.length === 1 ? "stock" : "stocks"}
            </Text>
            <ChevronRight
              size={20}
              color="#6B7280"
              style={[styles.chevron, isExpanded && styles.chevronExpanded]}
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.stockList}>
            {stocks.length > 0
              ? stocks.map((stock) => (
                  <View key={`${item.id}-${stock.symbol}`}>
                    {renderStockItem(stock, item.id)}
                  </View>
                ))
              : renderEmptyList(item.name || "this watchlist")}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Watchlists</Text>
        <Text style={styles.subtitle}>
          {watchlists?.length || 0} watchlists
        </Text>
      </View>

      <FlatList
        data={watchlists || []}
        renderItem={renderWatchlist}
        keyExtractor={(item) => item?.id || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No watchlists yet</Text>
            <Text style={styles.emptySubtitle}>
              Create your first watchlist by adding a stock
            </Text>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default WatchListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF", // white background
  },
  header: {
    padding: 20,
    backgroundColor: "#fff", // cyan accent
    borderBottomWidth: 3,
    borderBottomColor: "#000",
    // removed boxShadow for simplicity
  },
  watchlistSection: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 0,
    marginBottom: 16,
  },
  watchlistHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#00BBF9", // cyan accent
    borderBottomWidth: 3,
    borderBottomColor: "#000",
  },
  watchlistName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#000",
  },
  watchlistHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  stockCount: {
    color: "#000",
    marginRight: 8,
    fontSize: 14,
    fontWeight: "600",
  },
  chevron: {
    transform: [{ rotate: "0deg" }],
    marginLeft: 4,
  },
  chevronExpanded: {
    transform: [{ rotate: "90deg" }],
  },
  stockList: {
    padding: 8,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#000",
  },
  subtitle: {
    fontSize: 14,
    color: "#000",
    marginTop: 4,
    fontWeight: "600",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  stockCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF", // white background
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 0,
    padding: 16,
    marginBottom: 12,
  },
  stockInfo: {
    flex: 1,
    marginRight: 16,
  },
  stockSymbol: {
    fontSize: 18,
    fontWeight: "900",
    color: "#000",
  },
  stockName: {
    fontSize: 14,
    color: "#000",
    marginTop: 2,
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00BBF9", // cyan accent
    borderWidth: 2,
    borderColor: "#000",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 0,
    marginRight: 8,
  },
  viewButtonText: {
    color: "#000",
    fontWeight: "800",
    fontSize: 14,
    marginLeft: 4,
  },
  removeButton: {
    width: 40,
    height: 40,
    borderRadius: 0,
    backgroundColor: "#000", // black for remove button for strong contrast
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#000",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#000",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#000",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#000",
    textAlign: "center",
    lineHeight: 20,
    fontWeight: "600",
  },
});
