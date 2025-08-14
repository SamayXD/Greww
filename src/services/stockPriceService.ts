// services/stockPriceService.ts
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import fallbackData from "../utils/fallbackData";

const API_KEY_STORAGE_KEY = "alphavantage_api_key";
const DEFAULT_API_KEY = "VRRHSA582DCX1JSX";
const BASE_URL = "https://www.alphavantage.co/query";

const getApiKey = async (): Promise<string> => {
  try {
    const savedKey = await AsyncStorage.getItem(API_KEY_STORAGE_KEY);
    return savedKey || DEFAULT_API_KEY;
  } catch (error) {
    console.error("Error getting API key:", error);
    return DEFAULT_API_KEY;
  }
};

export const stockPriceService = {
  // 1. Top Gainers and Losers
  getTopMovers: async () => {
    try {
      const apiKey = await getApiKey();
      const response = await axios.get(BASE_URL, {
        params: {
          function: "TOP_GAINERS_LOSERS",
          apikey: apiKey,
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
    try {
      const apiKey = await getApiKey();
      const response = await axios.get(BASE_URL, {
        params: {
          function: "OVERVIEW",
          symbol,
          apikey: apiKey,
        },
      });
      fallbackData.companyOverview = response.data;
      return response.data || fallbackData.companyOverview;
    } catch (error) {
      console.error("Error fetching company overview:", error);
      return fallbackData.companyOverview;
    }
  },

  // 3. Symbol Search
  searchSymbol: async (keywords: string) => {
    try {
      const apiKey = await getApiKey();
      const response = await axios.get(BASE_URL, {
        params: {
          function: "SYMBOL_SEARCH",
          keywords,
          apikey: apiKey,
        },
      });
      fallbackData.symbolSearch = response.data.bestMatches || [];
      return response.data.bestMatches || fallbackData.symbolSearch;
    } catch (error) {
      console.error("Error searching symbols:", error);
      return fallbackData.symbolSearch;
    }
  },

  // 4. Daily Historical Stock Prices
  getDailyPrices: async (symbol: string) => {
    try {
      const apiKey = await getApiKey();
      const response = await axios.get(BASE_URL, {
        params: {
          function: "TIME_SERIES_DAILY",
          symbol,
          apikey: apiKey,
          outputsize: "compact",
        },
      });
      fallbackData.dailyPrices = response.data["Time Series (Daily)"] || {};
      return response.data["Time Series (Daily)"] || fallbackData.dailyPrices;
    } catch (error) {
      console.error("Error fetching daily prices:", error);
      return fallbackData.dailyPrices;
    }
  },
};
