import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_KEY_STORAGE_KEY = "alphavantage_api_key";
const DEFAULT_API_KEY = "VRRHSA582DCX1JSX";

const SettingScreen = () => {
  const [apiKey, setApiKey] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadApiKey();
  }, []);

  const loadApiKey = async () => {
    try {
      const savedKey = await AsyncStorage.getItem(API_KEY_STORAGE_KEY);
      setApiKey(savedKey || DEFAULT_API_KEY);
    } catch (error) {
      console.error("Failed to load API key", error);
      setApiKey(DEFAULT_API_KEY);
    } finally {
      setIsLoading(false);
    }
  };

  const saveApiKey = async () => {
    try {
      const keyToSave = apiKey.trim() || DEFAULT_API_KEY;
      await AsyncStorage.setItem(API_KEY_STORAGE_KEY, keyToSave);
      setApiKey(keyToSave);
      setIsEditing(false);
      Alert.alert("Success", "API Key saved successfully!");
    } catch (error) {
      console.error("Failed to save API key", error);
      Alert.alert("Error", "Failed to save API key. Please try again.");
    }
  };

  const handleEditPress = () => {
    setIsEditing(true);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Alpha Vantage API Key</Text>
        <Text style={styles.subtitle}>
          {isEditing ? "Enter your API key" : "Current API key"}
        </Text>

        {isEditing ? (
          <TextInput
            style={styles.input}
            value={apiKey}
            onChangeText={setApiKey}
            placeholder="Enter your Alpha Vantage API key"
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor="#999"
          />
        ) : (
          <View style={styles.keyContainer}>
            <Text
              style={styles.keyText}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {apiKey}
            </Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          {isEditing ? (
            <>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setApiKey(apiKey || DEFAULT_API_KEY);
                  setIsEditing(false);
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={saveApiKey}
              >
                <Text style={[styles.buttonText, { color: "#fff" }]}>Save</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.editButton]}
              onPress={handleEditPress}
            >
              <Text style={styles.buttonText}>Change API Key</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.note}>
          Using {apiKey === DEFAULT_API_KEY ? "default" : "custom"} API key
        </Text>
      </View>
    </View>
  );
};

export default SettingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderWidth: 3,
    borderColor: "#000",
    borderRadius: 5,
    padding: 20,
    marginBottom: 20,
    boxShadow: "3px 2px 0px #000",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 15,
  },
  input: {
    borderWidth: 3,
    borderColor: "#000",
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#fff",
    fontFamily: "monospace",
  },
  keyContainer: {
    borderWidth: 3,
    borderColor: "#000",
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
    backgroundColor: "#f8f9fa",
  },
  keyText: {
    fontFamily: "monospace",
    fontSize: 14,
    color: "#000",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    borderWidth: 3,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "3px 2px 0px #000",
  },
  editButton: {
    backgroundColor: "#00BBF9",
  },
  saveButton: {
    backgroundColor: "#00BBF9",
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: "#fff",
    marginRight: 10,
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#000",
  },
  note: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
  },
});
