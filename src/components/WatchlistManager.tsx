// components/WatchlistManager.tsx
import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
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
import { Plus, X, Check, Folder, Bookmark, Star } from "lucide-react-native";
import Modal from "react-native-modal";
import { wp } from "../utils/responsive";

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
            <Text style={styles.errorText}>Invalid watchlist data</Text>
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
          activeOpacity={0.8}
        >
          <View style={styles.watchlistItemContent}>
            <View style={styles.watchlistInfo}>
              <View
                style={[
                  styles.watchlistIcon,
                  showSuccess && styles.watchlistIconSuccess,
                ]}
              >
                <Star
                  size={18}
                  color={showSuccess ? "#FFFFFF" : "#000000"}
                  fill={showSuccess ? "#FFFFFF" : "transparent"}
                  strokeWidth={3}
                />
              </View>
              <View style={styles.watchlistDetails}>
                <Text
                  style={[
                    styles.watchlistName,
                    showSuccess && styles.watchlistNameSuccess,
                  ]}
                >
                  {item.name || "UNNAMED WATCHLIST"}
                </Text>
                <Text style={styles.stockCount}>
                  {item.stocks && Array.isArray(item.stocks)
                    ? item.stocks.length
                    : 0}{" "}
                  STOCKS
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.statusIndicator,
                showSuccess && styles.statusIndicatorSuccess,
              ]}
            >
              {showSuccess ? (
                <Check size={16} color="#FFFFFF" strokeWidth={3} />
              ) : (
                <Plus size={16} color="#000000" strokeWidth={3} />
              )}
            </View>
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
      isVisible={visible}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      useNativeDriverForBackdrop={true}
      swipeDirection={"down"}
      swipeThreshold={200}
      propagateSwipe={true}
      onShow={handleModalShow}
      onBackdropPress={onClose}
      style={styles.modal}
    >
      <View style={styles.modalContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <Text style={styles.title}>ADD TO WATCHLIST</Text>
            <Text style={styles.subtitle}>
              {symbol} • {companyName?.toUpperCase()}
            </Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={20} color="#FFFFFF" strokeWidth={3} />
          </TouchableOpacity>
        </View>

        {/* Create New Watchlist */}
        <View style={styles.createSection}>
          <Text style={styles.sectionTitle}>CREATE NEW WATCHLIST</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="ENTER WATCHLIST NAME"
              placeholderTextColor="#666666"
              value={newWatchlistName}
              onChangeText={setNewWatchlistName}
              onSubmitEditing={handleCreateWatchlist}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={[
                styles.createButton,
                isCreating && styles.createButtonLoading,
                !newWatchlistName.trim() && styles.createButtonDisabled,
              ]}
              onPress={handleCreateWatchlist}
              disabled={isCreating || !newWatchlistName.trim()}
            >
              {isCreating ? (
                <Check size={18} color="#FFFFFF" strokeWidth={3} />
              ) : (
                <Plus size={18} color="#FFFFFF" strokeWidth={3} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Watchlists Section */}
        <View style={styles.watchlistsSection}>
          <Text style={styles.sectionTitle}>
            YOUR WATCHLISTS ({watchlists?.length || 0})
          </Text>

          <View style={styles.watchlistsList}>
            {!watchlists ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Folder size={32} color="#000000" strokeWidth={3} />
                </View>
                <Text style={styles.emptyTitle}>LOADING WATCHLISTS...</Text>
                <Text style={styles.emptySubtext}>
                  Please wait while we load your watchlists
                </Text>
              </View>
            ) : !Array.isArray(watchlists) ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <X size={32} color="#FF3B30" strokeWidth={3} />
                </View>
                <Text style={styles.emptyTitle}>DATA ERROR</Text>
                <Text style={styles.emptySubtext}>
                  Watchlists data is not in expected format
                </Text>
              </View>
            ) : watchlists.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Folder size={32} color="#000000" strokeWidth={3} />
                </View>
                <Text style={styles.emptyTitle}>NO WATCHLISTS YET</Text>
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
                contentContainerStyle={styles.flatListContent}
              />
            )}
          </View>
        </View>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.doneButton} onPress={onClose}>
            <Text style={styles.doneButtonText}>DONE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: "flex-end",
    alignItems: "center",
    margin: 0,
  },
  modalContent: {
    backgroundColor: "#F8F9FF",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    maxHeight: "85%",
    height: "80%",
    paddingTop: 0,
    display: "flex",
    flexDirection: "column",
    width: wp(100),
    borderWidth: 4,
    borderColor: "#000000",
    borderBottomWidth: 0,
    boxShadow: "0px -6px 0px #000000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 4,
    borderBottomColor: "#000000",
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: "#000000",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  closeButton: {
    width: 40,
    height: 40,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#000000",
    boxShadow: "3px 3px 0px #FF3B30",
    borderRadius: 5,
  },
  createSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 4,
    borderBottomColor: "#000000",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#000000",
    letterSpacing: 1.2,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: "#F8F9FF",
    borderWidth: 3,
    borderColor: "#000000",
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#000000",
    fontWeight: "700",
    borderRadius: 5,
    boxShadow: "2px 2px 0px #000000",
  },
  createButton: {
    width: 48,
    height: 48,
    backgroundColor: "#00BBF9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#000000",
    borderRadius: 5,
    boxShadow: "3px 3px 0px #000000",
  },
  createButtonLoading: {
    backgroundColor: "#34C759",
  },
  createButtonDisabled: {
    backgroundColor: "#CCCCCC",
    boxShadow: "2px 2px 0px #000000",
  },
  watchlistsSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    display: "flex",
    flexDirection: "column",
  },
  watchlistsList: {
    flex: 1,
    minHeight: 200,
  },
  flatListContent: {
    paddingBottom: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 4,
    borderTopColor: "#000000",
  },
  doneButton: {
    height: 52,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#000000",
    boxShadow: "4px 4px 0px #00BBF9",
    borderRadius: 5,
  },
  doneButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  watchlistItem: {
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#000000",
    // boxShadow: "3px 3px 0px #000000",
    borderRadius: 5,
  },
  watchlistItemSuccess: {
    backgroundColor: "#34C759",
    boxShadow: "3px 3px 0px #000000",
    borderRadius: 5,
  },
  watchlistItemContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  watchlistInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  watchlistIcon: {
    width: 40,
    height: 40,
    backgroundColor: "#F8F9FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    borderWidth: 3,
    borderColor: "#000000",
    boxShadow: "2px 2px 0px #000000",
    borderRadius: 5,
  },
  watchlistIconSuccess: {
    backgroundColor: "#000000",
  },
  watchlistDetails: {
    flex: 1,
  },
  watchlistName: {
    fontSize: 16,
    fontWeight: "900",
    color: "#000000",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  watchlistNameSuccess: {
    color: "#FFFFFF",
  },
  stockCount: {
    fontSize: 12,
    color: "#666666",
    fontWeight: "700",
    letterSpacing: 1,
  },
  statusIndicator: {
    width: 32,
    height: 32,
    backgroundColor: "#00BBF9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#000000",
    boxShadow: "2px 2px 0px #000000",
    borderRadius: 5,
  },
  statusIndicatorSuccess: {
    backgroundColor: "#000000",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    flex: 1,
  },
  emptyIcon: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderWidth: 4,
    borderColor: "#000000",
    boxShadow: "4px 4px 0px #000000",
    borderRadius: 5,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#000000",
    letterSpacing: 1,
    marginBottom: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    lineHeight: 20,
    fontWeight: "600",
    maxWidth: 280,
  },
  errorText: {
    fontSize: 14,
    color: "#FF3B30",
    fontWeight: "700",
    textAlign: "center",
    padding: 16,
  },
});

export default WatchlistManager;
