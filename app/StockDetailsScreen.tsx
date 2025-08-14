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
import {
  Heart,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
} from "lucide-react-native";
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

    // Format dates based on time range
    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      return `${month}/${day}`;
    };

    return {
      labels: dates.map(formatDate),
      datasets: [
        {
          data: prices.reverse(),
          strokeWidth: 3,
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
          colors={["#FFFFFF", "#F8F9FF"]}
          style={styles.loadingContainer}
        >
          <View style={styles.loadingContent}>
            <View style={styles.loadingSpinner}>
              <ActivityIndicator size="large" color="#000" />
            </View>
            <Text style={styles.loadingText}>LOADING STOCK DATA</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (companyError || priceError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>⚠ ERROR</Text>
            <Text style={styles.errorText}>Unable to load stock data</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => router.back()}
            >
              <Text style={styles.retryText}>GO BACK</Text>
            </TouchableOpacity>
          </View>
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

  // Generate labels with proper intervals based on time range
  const getFormattedLabels = (chartData) => {
    if (!chartData) return [];

    const totalLabels = chartData.labels.length;
    let interval;

    // Set interval based on time range
    switch (timeRange) {
      case "7":
        interval = 1; // Show every day for 7 days
        break;
      case "30":
        interval = Math.ceil(totalLabels / 6); // Show ~6 labels for 30 days
        break;
      case "90":
        interval = Math.ceil(totalLabels / 7); // Show ~7 labels for 90 days
        break;
      default:
        interval = Math.ceil(totalLabels / 6);
    }

    return chartData.labels.map((label, index) => {
      return index % interval === 0 ? label : "";
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color="#FFFFFF" strokeWidth={3} />
          </TouchableOpacity>

          <View style={styles.headerTitle}>
            <Text style={styles.headerText}>STOCK DETAILS</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.watchlistButton,
              isInWatchlist && styles.watchlistButtonActive,
            ]}
            onPress={toggleWatchlist}
          >
            <Heart
              size={20}
              color={isInWatchlist ? "#FFFFFF" : "#000000"}
              fill={isInWatchlist ? "#FFFFFF" : "transparent"}
              strokeWidth={3}
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

        {/* Stock Info Card */}
        <View style={styles.stockInfoCard}>
          <View style={styles.stockHeader}>
            <Text style={styles.symbol}>{symbol}</Text>
            <View
              style={[
                styles.trendBadge,
                { backgroundColor: isPositive ? "#34C759" : "#FF3B30" },
              ]}
            >
              {isPositive ? (
                <TrendingUp size={16} color="#FFFFFF" strokeWidth={3} />
              ) : (
                <TrendingDown size={16} color="#FFFFFF" strokeWidth={3} />
              )}
            </View>
          </View>
          <Text style={styles.companyName}>{companyData?.Name}</Text>

          <View style={styles.priceSection}>
            <Text style={styles.currentPrice}>${currentPrice?.toFixed(2)}</Text>
            <View
              style={[
                styles.changeContainer,
                {
                  backgroundColor: isPositive ? "#34C759" : "#FF3B30",
                },
              ]}
            >
              <Text style={styles.change}>
                {isPositive ? "+" : ""}${Math.abs(priceChange).toFixed(2)}
              </Text>
              <Text style={styles.changePercent}>
                {isPositive ? "+" : ""}
                {priceChangePercent}%
              </Text>
            </View>
          </View>
        </View>

        {/* Time Range Selector */}
        <View style={styles.timeRangeCard}>
          <Text style={styles.cardTitle}>TIME PERIOD</Text>
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
        </View>

        {/* Chart Card */}
        {chartData && (
          <View style={styles.chartCard}>
            <Text style={styles.cardTitle}>PRICE CHART</Text>
            <View style={styles.chartContainer}>
              <LineChart
                data={{
                  labels: getFormattedLabels(chartData),
                  datasets: [{ data: chartData.datasets[0].data }],
                }}
                width={width - 80}
                height={220}
                chartConfig={{
                  backgroundColor: "#FFFFFF",
                  backgroundGradientFrom: "#FFFFFF",
                  backgroundGradientTo: "#FFFFFF",
                  decimalPlaces: 2,
                  color: () => (isPositive ? "#34C759" : "#FF3B30"),
                  labelColor: () => "#000000",
                  style: {
                    borderRadius: 0,
                  },
                  propsForDots: { r: "0" },
                  propsForBackgroundLines: {
                    stroke: "#E0E0E0",
                    strokeWidth: 1,
                    strokeDasharray: "0",
                  },
                  propsForVerticalLabels: {
                    fontSize: 12,
                    fontWeight: "800",
                    fill: "#000000",
                  },
                  propsForHorizontalLabels: {
                    fontSize: 12,
                    fontWeight: "800",
                    fill: "#000000",
                  },
                  formatYLabel: (value) => `${parseFloat(value).toFixed(0)}`,
                }}
                style={styles.chart}
                withDots={false}
                withShadow={false}
                withInnerLines={true}
                withOuterLines={false}
                withHorizontalLabels={true}
                withVerticalLabels={true}
                segments={4}
                xLabelsOffset={5}
                yLabelsOffset={15}
                withVerticalLines={true}
                withHorizontalLines={true}
              />
            </View>
          </View>
        )}

        {/* Key Metrics Card */}
        <View style={styles.metricsCard}>
          <Text style={styles.cardTitle}>KEY METRICS</Text>
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

        {/* Company Details Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>COMPANY INFO</Text>
          <View style={styles.detailsList}>
            <DetailRow label="Industry" value={companyData?.Industry || "—"} />
            <DetailRow label="Sector" value={companyData?.Sector || "—"} />
            <DetailRow label="Exchange" value={companyData?.Exchange || "—"} />
            <DetailRow label="Country" value={companyData?.Country || "—"} />
          </View>
        </View>

        {/* Description Card */}
        {companyData?.Description && (
          <View style={styles.descriptionCard}>
            <Text style={styles.cardTitle}>ABOUT COMPANY</Text>
            <Text style={styles.description}>
              {companyData.Description.length > 300
                ? `${companyData.Description.substring(0, 300)}...`
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
    backgroundColor: "#F8F9FF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    alignItems: "center",
    padding: 40,
  },
  loadingSpinner: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderWidth: 3,
    borderColor: "#000000",
    boxShadow: "6px 6px 0px #000000",
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 18,
    color: "#000000",
    fontWeight: "900",
    letterSpacing: 2,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorBox: {
    backgroundColor: "#FFFFFF",
    padding: 40,
    borderWidth: 3,
    borderColor: "#000000",
    boxShadow: "8px 8px 0px #000000",
    alignItems: "center",
  },
  errorTitle: {
    fontSize: 24,
    color: "#FF3B30",
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#000000",
    textAlign: "center",
    marginBottom: 24,
    fontWeight: "700",
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderWidth: 3,
    borderColor: "#000000",
    boxShadow: "4px 4px 0px #000000",
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 4,
    borderBottomColor: "#000000",
    marginBottom: 20,
  },
  backButton: {
    width: 48,
    height: 48,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#000000",
    boxShadow: "3px 3px 0px #00BBF9",
    borderRadius: 5,
  },
  headerTitle: {
    flex: 1,
    alignItems: "center",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#000000",
    letterSpacing: 2,
  },
  watchlistButton: {
    width: 48,
    height: 48,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#000000",
    boxShadow: "3px 3px 0px #000000",
    borderRadius: 5,
  },
  watchlistButtonActive: {
    backgroundColor: "#FF3B30",
    boxShadow: "3px 3px 0px #000000",
  },
  stockInfoCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 24,
    borderWidth: 3,
    borderColor: "#000000",
    boxShadow: "6px 6px 0px #000000",
    borderRadius: 10,
  },
  stockHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  trendBadge: {
    padding: 8,
    borderWidth: 3,
    borderColor: "#000000",
    boxShadow: "2px 2px 0px #000000",
    borderRadius: 5,
  },
  symbol: {
    fontSize: 36,
    fontWeight: "900",
    color: "#000000",
    letterSpacing: -1,
  },
  companyName: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 24,
    fontWeight: "700",
  },
  priceSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  currentPrice: {
    fontSize: 48,
    fontWeight: "900",
    color: "#000000",
    letterSpacing: -2,
  },
  changeContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 3,
    borderColor: "#000000",
    boxShadow: "3px 3px 0px #000000",
    borderRadius: 5,
    alignItems: "center",
  },
  change: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  changePercent: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 2,
  },
  timeRangeCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderWidth: 3,
    borderColor: "#000000",
    boxShadow: "4px 4px 0px #000000",
    borderRadius: 5,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#000000",
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  timeRangeContainer: {
    flexDirection: "row",
    gap: 12,
  },
  timeButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#F8F9FF",
    borderWidth: 3,
    borderColor: "#000000",
    boxShadow: "2px 2px 0px #000000",
    alignItems: "center",
    borderRadius: 5,
  },
  activeTimeButton: {
    backgroundColor: "#00BBF9",
    boxShadow: "2px 2px 0px #000000",
    borderRadius: 5,
  },
  timeButtonText: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "800",
    letterSpacing: 1,
  },
  activeTimeButtonText: {
    color: "#FFFFFF",
  },
  chartCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderWidth: 3,
    borderColor: "#000000",
    boxShadow: "6px 6px 0px #000000",
    borderRadius: 5,
  },
  chartContainer: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderWidth: 3,
    borderColor: "#000000",
    boxShadow: "3px 3px 0px #F8F9FF",
    borderRadius: 5,
  },
  chart: {
    borderRadius: 0,
  },
  metricsCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderWidth: 3,
    borderColor: "#000000",
    boxShadow: "5px 5px 0px #000000",
    borderRadius: 5,
  },
  metricsList: {
    borderWidth: 3,
    borderColor: "#000000",
    boxShadow: "3px 3px 0px #F8F9FF",
    borderRadius: 5,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 3,
    borderBottomColor: "#000000",
  },
  metricLabel: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "700",
  },
  metricValue: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "900",
  },
  detailsCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderWidth: 3,
    borderColor: "#000000",
    boxShadow: "5px 5px 0px #000000",
    borderRadius: 5,
  },
  detailsList: {
    borderWidth: 3,
    borderColor: "#000000",
    boxShadow: "3px 3px 0px #F8F9FF",
    borderRadius: 5,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 3,
    borderBottomColor: "#000000",
  },
  detailLabel: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "700",
  },
  detailValue: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "900",
    textAlign: "right",
    flex: 1,
    marginLeft: 16,
  },
  descriptionCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 24,
    borderWidth: 3,
    borderColor: "#000000",
    boxShadow: "6px 6px 0px #000000",
    borderRadius: 5,
  },
  description: {
    fontSize: 16,
    color: "#000000",
    lineHeight: 24,
    fontWeight: "600",
  },
});

export default StockDetailsScreen;
