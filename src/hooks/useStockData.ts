// hooks/useStockData.ts
import { useQuery } from "@tanstack/react-query";
import { stockPriceService } from "../services/stockPriceService";

// 1. Top Gainers/Losers
export const useTopMovers = () => {
  return useQuery({
    queryKey: ["top-movers"],
    queryFn: stockPriceService.getTopMovers,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

// 2. Company Overview
export const useCompanyOverview = (symbol: string) => {
  return useQuery({
    queryKey: ["company-overview", symbol],
    queryFn: () => stockPriceService.getCompanyOverview(symbol),
    enabled: !!symbol,
  });
};

// 3. Ticker Search
export const useSymbolSearch = (keywords: string) => {
  return useQuery({
    queryKey: ["symbol-search", keywords],
    queryFn: () => stockPriceService.searchSymbol(keywords),
    enabled: !!keywords,
  });
};

// 4. Daily Prices for Line Chart
export const useDailyPrices = (symbol: string) => {
  return useQuery({
    queryKey: ["TIME_SERIES_DAILY", symbol],
    queryFn: () => stockPriceService.getDailyPrices(symbol),
    enabled: !!symbol,
  });
};
