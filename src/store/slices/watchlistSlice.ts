import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";

// Define the type for a stock item
export interface StockItem {
  symbol: string;
  name: string;
  addedAt: number; // timestamp
}

// Define the type for a watchlist
export interface Watchlist {
  id: string;
  name: string;
  stocks: StockItem[];
  createdAt: number;
}

// For backward compatibility
export interface WatchlistItem extends StockItem {}

// Define the type for the watchlist state
export interface WatchlistState {
  watchlists: {
    [key: string]: Watchlist;
  };
  defaultWatchlistId: string | null;
  // Keep the old 'items' for backward compatibility
  items: WatchlistItem[];
}

// Helper function to generate unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Create default watchlist
const createDefaultWatchlist = (): Watchlist => {
  const id = generateId();
  return {
    id,
    name: "My Watchlist",
    stocks: [],
    createdAt: Date.now(),
  };
};

// Initial state with a default watchlist
const defaultWatchlist = createDefaultWatchlist();
const initialState: WatchlistState = {
  watchlists: {
    [defaultWatchlist.id]: defaultWatchlist,
  },
  defaultWatchlistId: defaultWatchlist.id,
  items: [], // For backward compatibility
};

// Create the watchlist slice
const watchlistSlice = createSlice({
  name: "watchlist",
  initialState,
  reducers: {
    // Initialize default watchlist if none exists
    initializeDefaultWatchlist: (state) => {
      if (Object.keys(state.watchlists).length === 0) {
        const defaultWatchlist = createDefaultWatchlist();
        state.watchlists[defaultWatchlist.id] = defaultWatchlist;
        state.defaultWatchlistId = defaultWatchlist.id;
      }
      // Sync with backward compatibility items
      if (
        state.defaultWatchlistId &&
        state.watchlists[state.defaultWatchlistId]
      ) {
        state.items = state.watchlists[state.defaultWatchlistId].stocks;
      }
    },

    // Create a new watchlist
    createWatchlist: (state, action: PayloadAction<{ name: string }>) => {
      const id = generateId();
      state.watchlists[id] = {
        id,
        name: action.payload.name,
        stocks: [],
        createdAt: Date.now(),
      };
    },

    // Rename a watchlist
    renameWatchlist: (
      state,
      action: PayloadAction<{ id: string; newName: string }>
    ) => {
      const { id, newName } = action.payload;
      if (state.watchlists[id]) {
        state.watchlists[id].name = newName;
      }
    },

    // Delete a watchlist
    deleteWatchlist: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.watchlists[id] && id !== state.defaultWatchlistId) {
        delete state.watchlists[id];
      }
    },

    // Add a stock to a specific watchlist
    addToWatchlist: (
      state,
      action: PayloadAction<
        { watchlistId?: string; stock: StockItem } | WatchlistItem
      >
    ) => {
      let watchlistId: string;
      let stock: StockItem;

      // Handle backward compatibility - if payload is just a WatchlistItem
      if ("symbol" in action.payload && "name" in action.payload) {
        watchlistId = state.defaultWatchlistId!;
        stock = action.payload as StockItem;
      } else {
        const payload = action.payload as {
          watchlistId?: string;
          stock: StockItem;
        };
        watchlistId = payload.watchlistId || state.defaultWatchlistId!;
        stock = payload.stock;
      }

      const watchlist = state.watchlists[watchlistId];
      if (watchlist) {
        const exists = watchlist.stocks.some(
          (item) => item.symbol === stock.symbol
        );
        if (!exists) {
          const newStock = {
            ...stock,
            addedAt: Date.now(),
          };
          watchlist.stocks.push(newStock);

          // Update backward compatibility items if it's the default watchlist
          if (watchlistId === state.defaultWatchlistId) {
            state.items = watchlist.stocks;
          }
        }
      }
    },

    // Remove a stock from a watchlist
    removeFromWatchlist: (
      state,
      action: PayloadAction<{ watchlistId?: string; symbol: string } | string>
    ) => {
      let watchlistId: string;
      let symbol: string;

      // Handle backward compatibility - if payload is just a string
      if (typeof action.payload === "string") {
        watchlistId = state.defaultWatchlistId!;
        symbol = action.payload;
      } else {
        watchlistId = action.payload.watchlistId || state.defaultWatchlistId!;
        symbol = action.payload.symbol;
      }

      const watchlist = state.watchlists[watchlistId];
      if (watchlist) {
        watchlist.stocks = watchlist.stocks.filter(
          (item) => item.symbol !== symbol
        );

        // Update backward compatibility items if it's the default watchlist
        if (watchlistId === state.defaultWatchlistId) {
          state.items = watchlist.stocks;
        }
      }
    },

    // For backward compatibility - clear default watchlist
    clearWatchlist: (state) => {
      if (
        state.defaultWatchlistId &&
        state.watchlists[state.defaultWatchlistId]
      ) {
        state.watchlists[state.defaultWatchlistId].stocks = [];
        state.items = [];
      }
    },

    // Set default watchlist
    setDefaultWatchlist: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.watchlists[id]) {
        state.defaultWatchlistId = id;
        state.items = state.watchlists[id].stocks;
      }
    },
  },
});

// Export actions
export const {
  initializeDefaultWatchlist,
  createWatchlist,
  renameWatchlist,
  deleteWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  clearWatchlist,
  setDefaultWatchlist,
} = watchlistSlice.actions;

// Base selectors
const selectWatchlistState = (state: { watchlist: WatchlistState }) =>
  state.watchlist;
const selectWatchlistsMap = createSelector(
  [selectWatchlistState],
  (wl) => wl?.watchlists || {}
);
const selectDefaultWatchlistId = createSelector(
  [selectWatchlistState],
  (wl) => wl?.defaultWatchlistId || null
);

// Memoized selectors
export const selectAllWatchlists = createSelector(
  [selectWatchlistsMap],
  (map) =>
    Object.values(map)
      .slice()
      .sort((a, b) => a.createdAt - b.createdAt)
);

export const selectWatchlistById = createSelector(
  [selectWatchlistsMap, (_: { watchlist: WatchlistState }, id: string) => id],
  (map, id) => map[id] || null
);

export const selectDefaultWatchlist = createSelector(
  [selectWatchlistsMap, selectDefaultWatchlistId],
  (map, id) => (id ? map[id] || null : null)
);

export const selectIsInWatchlist = createSelector(
  [selectWatchlistsMap, (_: { watchlist: WatchlistState }, symbol: string) => symbol],
  (map, symbol) =>
    Object.values(map).some((watchlist) =>
      watchlist.stocks.some((stock) => stock.symbol === symbol)
    )
);

// Backward compatibility selectors
export const selectWatchlistItems = (state: { watchlist: WatchlistState }) => {
  if (!state.watchlist) {
    return [];
  }
  // Return items from default watchlist or backward compatibility items
  const defaultWatchlist = selectDefaultWatchlist(state);
  return defaultWatchlist
    ? defaultWatchlist.stocks
    : state.watchlist.items || [];
};

// Export reducer
export default watchlistSlice.reducer;
