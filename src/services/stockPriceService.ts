// services/stockPriceService.ts
import axios from "axios";
import fallbackData from "../utils/fallbackData";

const API_KEY = "VRRHSA582DCX1JSX";
const BASE_URL = "https://www.alphavantage.co/query";

export const stockPriceService = {
  // 1. Top Gainers and Losers
  getTopMovers: async () => {
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          function: "TOP_GAINERS_LOSERS",
          apikey: API_KEY,
        },
      });
      console.log("Top Movers Data:", response.data);
      // fallbackData.topMovers = response.data;
      // console.log("Fallback Data:", fallbackData.topMovers);
      return fallbackData.topMovers;
    } catch (error) {
      console.error("Error fetching top movers:", error);
      return fallbackData.topMovers;
    }
  },

  // 2. Company Overview
  getCompanyOverview: async (symbol: string) => {
    const response = await axios.get(BASE_URL, {
      params: {
        function: "OVERVIEW",
        symbol,
        apikey: API_KEY,
      },
    });
    fallbackData.companyOverview = response.data;
    return response.data || fallbackData.companyOverview;
  },

  // 3. Symbol Search
  searchSymbol: async (keywords: string) => {
    const response = await axios.get(BASE_URL, {
      params: {
        function: "SYMBOL_SEARCH",
        keywords,
        apikey: API_KEY,
      },
    });
    fallbackData.symbolSearch = response.data.bestMatches || [];
    return response.data.bestMatches || fallbackData.symbolSearch;
  },

  // 4. Daily Historical Stock Prices
  getDailyPrices: async (symbol: string) => {
    const response = await axios.get(BASE_URL, {
      params: {
        function: "TIME_SERIES_DAILY",
        symbol,
        outputsize: "compact", // or "full" for all data
        apikey: API_KEY,
      },
    });
    fallbackData.dailyPrices = response.data["Time Series (Daily)"] || {};
    return response.data["Time Series (Daily)"] || fallbackData.dailyPrices;
  },
};
