import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LineChart } from "react-native-chart-kit";
import { useCompanyOverview, useDailyPrices } from "../src/hooks/useStockData";
import { router, useLocalSearchParams } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../src/store";
import {
  addToWatchlist,
  removeFromWatchlist,
  selectAllWatchlists,
  selectIsInWatchlist,
  initializeDefaultWatchlist,
  StockItem,
  Watchlist,
} from "../src/store/slices/watchlistSlice";
import { Heart, Plus } from "lucide-react-native";
import WatchlistManager from "../src/components/WatchlistManager";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const StockDetailsScreen = () => {
  const { symbol } = useLocalSearchParams();
  const [timeRange, setTimeRange] = useState("30"); // 30 days default
  const [showWatchlistManager, setShowWatchlistManager] = useState(false);

  // Redux hooks
  const dispatch = useDispatch();
  const watchlists = useSelector(selectAllWatchlists);
  const isInWatchlist = useSelector((state: RootState) =>
    selectIsInWatchlist(state, symbol as string)
  );

  // Initialize default watchlist if none exists
  useEffect(() => {
    dispatch(initializeDefaultWatchlist());
  }, [dispatch]);

  const {
    data: companyData,
    isLoading: companyLoading,
    error: companyError,
  } = useCompanyOverview(symbol as string);

  const {
    data: priceData,
    isLoading: priceLoading,
    error: priceError,
  } = useDailyPrices(symbol as string);

  // Process price data for chart
  const processChartData = () => {
    if (!priceData) return null;

    const dates = Object.keys(priceData).slice(0, parseInt(timeRange));
    const prices = dates.map((date) => parseFloat(priceData[date]["4. close"]));

    return {
      labels: dates.map((date) => date.slice(5)),
      datasets: [
        {
          data: prices.reverse(),
          strokeWidth: 2,
        },
      ],
    };
  };

  const chartData = processChartData();
  const currentPrice = chartData
    ? chartData.datasets[0].data[chartData.datasets[0].data.length - 1]
    : 0;
  const previousPrice = chartData
    ? chartData.datasets[0].data[chartData.datasets[0].data.length - 2]
    : 0;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = ((priceChange / previousPrice) * 100).toFixed(2);
  const isPositive = priceChange >= 0;

  if (companyLoading || priceLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={["#FAFAFA", "#F5F5F5"]}
          style={styles.loadingContainer}
        >
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#000" />
            <Text style={styles.loadingText}>Loading</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (companyError || priceError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to load data</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.retryText}>Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const toggleWatchlist = () => {
    // Always show the watchlist manager when heart icon is pressed
    setShowWatchlistManager(true);
  };

  const handleWatchlistManagerClose = () => {
    setShowWatchlistManager(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>×</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.watchlistButton}
            onPress={toggleWatchlist}
          >
            <Heart
              size={24}
              color={isInWatchlist ? "#EF4444" : "#9CA3AF"}
              fill={isInWatchlist ? "#EF4444" : "transparent"}
            />
          </TouchableOpacity>
        </View>

        {/* Watchlist Manager Modal */}
        <WatchlistManager
          visible={showWatchlistManager}
          onClose={handleWatchlistManagerClose}
          symbol={symbol as string}
          companyName={companyData?.Name || (symbol as string)}
        />

        {/* Stock Info */}
        <View style={styles.stockInfo}>
          <Text style={styles.symbol}>{symbol}</Text>
          <Text style={styles.companyName}>{companyData?.Name}</Text>

          <View style={styles.priceSection}>
            <Text style={styles.currentPrice}>${currentPrice?.toFixed(2)}</Text>
            <View style={styles.changeContainer}>
              <Text
                style={[
                  styles.change,
                  { color: isPositive ? "#34C759" : "#FF3B30" },
                ]}
              >
                {isPositive ? "+" : ""}${Math.abs(priceChange).toFixed(2)} (
                {isPositive ? "+" : ""}
                {priceChangePercent}%)
              </Text>
            </View>
          </View>
        </View>

        {/* Time Range */}
        <View style={styles.timeRangeContainer}>
          {["7", "30", "90"].map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.timeButton,
                timeRange === range && styles.activeTimeButton,
              ]}
              onPress={() => setTimeRange(range)}
            >
              <Text
                style={[
                  styles.timeButtonText,
                  timeRange === range && styles.activeTimeButtonText,
                ]}
              >
                {range}D
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Chart */}
        {chartData && (
          <View style={styles.chartContainer}>
            <LineChart
              data={chartData}
              width={width - 40}
              height={220}
              chartConfig={{
                backgroundColor: "transparent",
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                decimalPlaces: 0,
                color: () =>
                  isPositive ? "rgba(52, 199, 89, 1)" : "rgba(255, 59, 48, 1)",
                labelColor: () => "rgba(0, 0, 0, 0.7)",
                propsForDots: { r: "0" },
                propsForBackgroundLines: { stroke: "transparent" },
                formatYLabel: (value) => `$${parseInt(value)}`,
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 8,
              }}
              withHorizontalLabels={true} // show price labels
              withVerticalLabels={true} // show date labels
              withDots={false}
              withShadow={false}
              withInnerLines={false}
              withOuterLines={false}
            />
          </View>
        )}

        {/* Key Metrics */}
        <View style={styles.metricsContainer}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.metricsList}>
            <MetricRow
              label="Market Cap"
              value={formatMarketCap(companyData?.MarketCapitalization)}
            />
            <MetricRow label="P/E Ratio" value={companyData?.PERatio || "—"} />
            <MetricRow
              label="52W Range"
              value={
                companyData?.["52WeekLow"] && companyData?.["52WeekHigh"]
                  ? `$${companyData["52WeekLow"]} - $${companyData["52WeekHigh"]}`
                  : "—"
              }
            />
            <MetricRow
              label="Dividend Yield"
              value={
                companyData?.DividendYield
                  ? `${(parseFloat(companyData.DividendYield) * 100).toFixed(
                      2
                    )}%`
                  : "—"
              }
            />
            <MetricRow label="Beta" value={companyData?.Beta || "—"} />
          </View>
        </View>

        {/* Company Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailsList}>
            <DetailRow label="Industry" value={companyData?.Industry || "—"} />
            <DetailRow label="Sector" value={companyData?.Sector || "—"} />
            <DetailRow label="Exchange" value={companyData?.Exchange || "—"} />
            <DetailRow label="Country" value={companyData?.Country || "—"} />
          </View>
        </View>

        {/* Description */}
        {companyData?.Description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>
              {companyData.Description.length > 280
                ? `${companyData.Description.substring(0, 280)}...`
                : companyData.Description}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const MetricRow = ({ label, value }) => (
  <View style={styles.metricRow}>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={styles.metricValue}>{value}</Text>
  </View>
);

const DetailRow = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const formatMarketCap = (marketCap) => {
  if (!marketCap) return "—";
  const num = parseInt(marketCap);
  if (num >= 1e12) return `$${(num / 1e12).toFixed(1)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(0)}M`;
  return `$${num.toLocaleString()}`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: "#3C3C43",
    fontWeight: "400",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: "#3C3C43",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#000000",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
  },
  backText: {
    fontSize: 20,
    color: "#3C3C43",
    fontWeight: "300",
  },
  watchlistButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
  },
  stockInfo: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  symbol: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000000",
    letterSpacing: -0.5,
  },
  companyName: {
    fontSize: 16,
    color: "#8E8E93",
    marginTop: 4,
    fontWeight: "400",
  },
  priceSection: {
    marginTop: 24,
  },
  currentPrice: {
    fontSize: 40,
    fontWeight: "300",
    color: "#000000",
    letterSpacing: -1,
  },
  changeContainer: {
    marginTop: 4,
  },
  change: {
    fontSize: 16,
    fontWeight: "500",
  },
  timeRangeContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  timeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: "#F2F2F7",
  },
  activeTimeButton: {
    backgroundColor: "#000000",
  },
  timeButtonText: {
    fontSize: 14,
    color: "#3C3C43",
    fontWeight: "500",
  },
  activeTimeButtonText: {
    color: "#FFFFFF",
  },
  chartContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  chart: {
    borderRadius: 0,
  },
  metricsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 16,
  },
  metricsList: {
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    paddingVertical: 4,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  metricLabel: {
    fontSize: 15,
    color: "#3C3C43",
    fontWeight: "400",
  },
  metricValue: {
    fontSize: 15,
    color: "#000000",
    fontWeight: "500",
  },
  detailsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  detailsList: {
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    paddingVertical: 4,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 15,
    color: "#3C3C43",
    fontWeight: "400",
  },
  detailValue: {
    fontSize: 15,
    color: "#000000",
    fontWeight: "500",
    textAlign: "right",
    flex: 1,
    marginLeft: 16,
  },
  descriptionContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  description: {
    fontSize: 15,
    color: "#3C3C43",
    lineHeight: 22,
    fontWeight: "400",
  },
});

export default StockDetailsScreen;
