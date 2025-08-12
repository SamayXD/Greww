// components/WatchlistManager.tsx
import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import {
  addToWatchlist,
  removeFromWatchlist,
  createWatchlist,
  selectAllWatchlists,
  initializeDefaultWatchlist,
} from "../store/slices/watchlistSlice";
import { Plus, X, Check, Folder } from "lucide-react-native";

interface WatchlistManagerProps {
  visible: boolean;
  onClose: () => void;
  symbol: string;
  companyName: string;
}

const WatchlistManager: React.FC<WatchlistManagerProps> = ({
  visible,
  onClose,
  symbol,
  companyName,
}) => {
  const dispatch = useDispatch();

  // Get watchlists from Redux store
  const watchlists = useSelector(selectAllWatchlists);

  const [newWatchlistName, setNewWatchlistName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [addedToWatchlists, setAddedToWatchlists] = useState<Set<string>>(
    new Set()
  );

  // Initialize default watchlist when modal opens
  React.useEffect(() => {
    if (visible) {
      dispatch(initializeDefaultWatchlist());
    }
  }, [dispatch, visible]);

  // Check which watchlists already contain this symbol
  const watchlistsWithStock = useMemo(() => {
    if (!watchlists || !Array.isArray(watchlists)) {
      return new Set<string>();
    }

    const watchlistIds = new Set<string>();

    watchlists.forEach((watchlist) => {
      if (!watchlist || !watchlist.id) {
        return;
      }

      if (
        watchlist.stocks &&
        Array.isArray(watchlist.stocks) &&
        watchlist.stocks.some((stock) => stock && stock.symbol === symbol)
      ) {
        watchlistIds.add(watchlist.id);
      }
    });
    return watchlistIds;
  }, [watchlists, symbol]);

  const handleToggleWatchlist = useCallback(
    (watchlistId: string, currentlyIn: boolean) => {
      try {
        if (currentlyIn) {
          // remove
          dispatch(removeFromWatchlist({ watchlistId, symbol }));
          setAddedToWatchlists((prev) => {
            const next = new Set(prev);
            next.delete(watchlistId);
            return next;
          });
        } else {
          // add
          dispatch(
            addToWatchlist({
              watchlistId,
              stock: {
                symbol,
                name: companyName || symbol,
                addedAt: Date.now(),
              },
            })
          );
          setAddedToWatchlists((prev) => new Set([...prev, watchlistId]));
        }
      } catch (err) {
        Alert.alert("Error", "Failed to update watchlist");
      }
    },
    [dispatch, symbol, companyName]
  );

  const handleCreateWatchlist = useCallback(() => {
    const trimmedName = newWatchlistName.trim();
    if (!trimmedName) {
      Alert.alert("Invalid Name", "Watchlist name cannot be empty");
      return;
    }

    if (
      watchlists &&
      watchlists.some(
        (w) => w?.name?.toLowerCase() === trimmedName.toLowerCase()
      )
    ) {
      Alert.alert(
        "Duplicate Name",
        "A watchlist with this name already exists"
      );
      return;
    }

    setIsCreating(true);

    try {
      dispatch(createWatchlist({ name: trimmedName }));
      setNewWatchlistName("");

      // Brief success feedback
      setTimeout(() => {
        setIsCreating(false);
      }, 300);
    } catch (err) {
      console.error("Error creating watchlist:", err);
      setIsCreating(false);
      Alert.alert("Error", "Failed to create watchlist");
    }
  }, [dispatch, newWatchlistName, watchlists]);

  const renderWatchlistItem = useCallback(
    ({ item, index }) => {
      if (!item || !item.id) {
        return (
          <View style={styles.watchlistItem}>
            <Text>Invalid watchlist data</Text>
          </View>
        );
      }

      const isInThisWatchlist = watchlistsWithStock.has(item.id);
      const wasJustAdded = addedToWatchlists.has(item.id);
      const showSuccess = isInThisWatchlist || wasJustAdded;

      return (
        <TouchableOpacity
          style={[
            styles.watchlistItem,
            showSuccess && styles.watchlistItemSuccess,
          ]}
          onPress={() => handleToggleWatchlist(item.id, isInThisWatchlist)}
          activeOpacity={0.7}
        >
          <View style={styles.watchlistItemContent}>
            <View style={styles.watchlistInfo}>
              <View style={styles.watchlistIcon}>
                <Folder size={16} color={showSuccess ? "#34C759" : "#3C3C43"} />
              </View>
              <View>
                <Text
                  style={[
                    styles.watchlistName,
                    showSuccess && styles.watchlistNameSuccess,
                  ]}
                >
                  {item.name || "Unnamed Watchlist"}
                </Text>
                <Text style={styles.stockCount}>
                  {item.stocks && Array.isArray(item.stocks)
                    ? item.stocks.length
                    : 0}{" "}
                  stocks
                </Text>
              </View>
            </View>

            {showSuccess && (
              <View style={styles.successIndicator}>
                <Check size={16} color="#34C759" />
              </View>
            )}
          </View>
        </TouchableOpacity>
      );
    },
    [watchlistsWithStock, addedToWatchlists, handleToggleWatchlist]
  );

  // Force refresh when modal opens
  const handleModalShow = useCallback(() => {
    setAddedToWatchlists(new Set());
  }, []);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      onShow={handleModalShow}
    >
      <View style={styles.modalContainer}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Add to Watchlist</Text>
              <Text style={styles.subtitle}>
                {symbol} • {companyName}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={20} color="#3C3C43" />
            </TouchableOpacity>
          </View>

          {/* Create New Watchlist */}
          <View style={styles.createSection}>
            <Text style={styles.sectionTitle}>Create New Watchlist</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter watchlist name"
                value={newWatchlistName}
                onChangeText={setNewWatchlistName}
                onSubmitEditing={handleCreateWatchlist}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={[
                  styles.createButton,
                  isCreating && styles.createButtonLoading,
                ]}
                onPress={handleCreateWatchlist}
                disabled={isCreating || !newWatchlistName.trim()}
              >
                {isCreating ? (
                  <Check size={18} color="#fff" />
                ) : (
                  <Plus size={18} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Watchlists Section */}
          <View style={styles.watchlistsSection}>
            <Text style={styles.sectionTitle}>
              Your Watchlists ({watchlists?.length || 0})
            </Text>

            <View style={styles.watchlistsList}>
              {!watchlists ? (
                <View style={styles.emptyState}>
                  <Folder size={32} color="#8E8E93" />
                  <Text style={styles.emptyTitle}>Loading watchlists...</Text>
                  <Text style={styles.emptySubtext}>
                    Please wait while we load your watchlists
                  </Text>
                </View>
              ) : !Array.isArray(watchlists) ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyTitle}>Data Error</Text>
                  <Text style={styles.emptySubtext}>
                    Watchlists data is not in expected format
                  </Text>
                </View>
              ) : watchlists.length === 0 ? (
                <View style={styles.emptyState}>
                  <Folder size={32} color="#8E8E93" />
                  <Text style={styles.emptyTitle}>No Watchlists Yet</Text>
                  <Text style={styles.emptySubtext}>
                    Create your first watchlist using the form above
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={watchlists}
                  keyExtractor={(item, index) => {
                    const key = item?.id || `fallback-${index}`;
                    return key;
                  }}
                  renderItem={renderWatchlistItem}
                  showsVerticalScrollIndicator={false}
                  extraData={[
                    watchlistsWithStock,
                    addedToWatchlists,
                    watchlists?.length,
                  ]}
                  initialNumToRender={10}
                  maxToRenderPerBatch={10}
                  windowSize={10}
                  removeClippedSubviews={false}
                  contentContainerStyle={{ paddingBottom: 16 }}
                />
              )}
            </View>
          </View>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.doneButton} onPress={onClose}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
    height: "80%",
    paddingTop: 8,
    display: "flex",
    flexDirection: "column",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E5EA",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#8E8E93",
    fontWeight: "400",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
  },
  createSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E5EA",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#000000",
    marginRight: 12,
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  createButtonLoading: {
    backgroundColor: "#34C759",
  },
  watchlistsSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    display: "flex",
    flexDirection: "column",
  },
  watchlistsList: {
    flex: 1,
    minHeight: 200,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 0.5,
    borderTopColor: "#E5E5EA",
    backgroundColor: "#FFFFFF",
  },
  doneButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },
  doneButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  watchlistItem: {
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    marginBottom: 8,
    overflow: "hidden",
  },
  watchlistItemSuccess: {
    backgroundColor: "#E8F5E8",
    borderWidth: 1,
    borderColor: "#34C759",
  },
  watchlistItemContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  watchlistInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  watchlistIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  watchlistName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 2,
  },
  watchlistNameSuccess: {
    color: "#34C759",
  },
  stockCount: {
    fontSize: 13,
    color: "#8E8E93",
    fontWeight: "400",
  },
  successIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    flex: 1,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default WatchlistManager;
