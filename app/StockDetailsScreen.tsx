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
import { wp } from "../src/utils/responsive";

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
  const processedLabels = chartData?.labels.map((label, i) =>
    i % 12 === 0 ? label : ""
  );

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
              data={{
                labels: processedLabels,
                datasets: [{ data: chartData.datasets[0].data }],
              }}
              width={width - 60}
              height={220}
              chartConfig={{
                backgroundColor: "transparent",
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                decimalPlaces: 2,
                color: () =>
                  isPositive ? "rgba(52, 199, 89, 1)" : "rgba(255, 59, 48, 1)",
                labelColor: () => "#000",
                propsForDots: { r: "0" },
                propsForBackgroundLines: { stroke: "transparent" },
                propsForLabels: { fontSize: 12, fontWeight: "700" },
                formatYLabel: (value) => `$${parseFloat(value).toFixed(2)}`,
              }}
              style={{ marginHorizontal: 20 }}
              withDots={false}
              withShadow={false}
              withInnerLines={false}
              withOuterLines={false}
              withHorizontalLabels={true}
              withVerticalLabels={true}
              segments={8} // fewer Y-axis segments
              // formatXLabel={(value) => value}
              xLabelsOffset={1}
              fromZero
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
    backgroundColor: "#FFFFFF", // pure white bg
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
    fontSize: 16,
    color: "#000000",
    fontWeight: "700",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: "#000",
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "700",
  },
  retryButton: {
    backgroundColor: "#00BBF9", // cyan accent
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 0,
    borderWidth: 3,
    borderColor: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  retryText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    borderBottomWidth: 4,
    borderBottomColor: "#000",
  },
  backButton: {
    width: 44,
    height: 44,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#00BBF9", // cyan border
    borderRadius: 0,
  },
  backText: {
    fontSize: 26,
    color: "#00BBF9", // cyan text
    fontWeight: "900",
    lineHeight: 26,
  },
  watchlistButton: {
    width: 44,
    height: 44,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#000",
    borderRadius: 0,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  stockInfo: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 4,
    borderBottomColor: "#000",
  },
  symbol: {
    fontSize: 32,
    fontWeight: "900",
    color: "#000",
    letterSpacing: -1,
  },
  companyName: {
    fontSize: 18,
    color: "#000",
    marginTop: 6,
    fontWeight: "700",
  },
  priceSection: {
    marginTop: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 20,
  },
  currentPrice: {
    fontSize: 44,
    fontWeight: "900",
    color: "#000",
    letterSpacing: -1,
  },
  changeContainer: {
    borderWidth: 3,
    borderColor: "#000",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 0,
  },
  change: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  timeRangeContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  timeButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 0,
    backgroundColor: "#fff",
    borderWidth: 3,
    borderColor: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  activeTimeButton: {
    backgroundColor: "#00BBF9",
    borderColor: "#000",
  },
  timeButtonText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "700",
    letterSpacing: 1,
  },
  activeTimeButtonText: {
    color: "#000",
  },
  chartContainer: {
    alignItems: "center",
    marginBottom: 40,
    borderWidth: 4,
    borderColor: "#000",
    padding: 12,
    borderRadius: 0,
    shadowColor: "#000",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    width: wp(90),
    alignSelf: "center",
  },
  chart: {
    borderRadius: 0,
  },
  metricsContainer: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#000",
    marginBottom: 20,
    letterSpacing: 1,
  },
  metricsList: {
    backgroundColor: "#fff",
    borderRadius: 0,
    borderWidth: 3,
    borderColor: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 3,
    borderBottomColor: "#000",
  },
  metricLabel: {
    fontSize: 16,
    color: "#000",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 16,
    color: "#000",
    fontWeight: "900",
  },
  detailsContainer: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  detailsList: {
    backgroundColor: "#fff",
    borderRadius: 0,
    borderWidth: 3,
    borderColor: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 3,
    borderBottomColor: "#000",
  },
  detailLabel: {
    fontSize: 16,
    color: "#000",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    color: "#000",
    fontWeight: "900",
    textAlign: "right",
    flex: 1,
    marginLeft: 16,
  },
  descriptionContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  description: {
    fontSize: 16,
    color: "#000",
    lineHeight: 24,
    fontWeight: "700",
  },
});

export default StockDetailsScreen;
