import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity, 
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { API_URL } from "../constants/api";
import { Colors } from "../constants/Colors";


const SERVER_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

export default function LoginScreen() {
  const router = useRouter();

  const [authChecked, setAuthChecked] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [inFocus, setInFocus] = useState(false);

 // Check auth token on mount
  useEffect(() => {
    async function checkToken() {
      try {
        const res = await fetch(`${SERVER_URL}/auth`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (data.auth) {
          setIsAuth(true);
          setUsername(data.username);
          setUserId(data.userId);
        } else {
          setIsAuth(false);
        }
      } catch (err) {
        console.log("Error checking token:", err);
        setIsAuth(false);
      } finally {
        setAuthChecked(true);
      }
    }
    checkToken();
  }, []);

  // Redirect to chat after auth check
  useEffect(() => {
    if (authChecked && isAuth && username && userId) {
      // encodeURIComponent, чтобы в имени не было проблем с пробелами и спецсимволами
      router.replace(`/chat?username=${encodeURIComponent(username)}&userId=${encodeURIComponent(userId)}`);
    }
  }, [authChecked, isAuth, username]);

  // Show loading indicator until auth check finishes
  if (!authChecked) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3478F6" />
      </View>
    );
  }

  // Handle login
  const join = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      alert("Please enter a name.");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });

      if (response.ok) {
        setIsAuth(true);
        setUsername(trimmed);
      } else {
        const error = await response.json();
        alert("Login failed: " + error.message);
      }
    } catch (e) {
      console.log("Login failed:", e);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container_bg}>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>Chat App</Text>
        </View>
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={[styles.input, inFocus && styles.inputFocused]}
              onFocus={() => setInFocus(true)}
              onBlur={() => setInFocus(false)}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor="#888"
              onSubmitEditing={join}
              returnKeyType="send"
            />
          </View>
          <TouchableOpacity style={styles.button} onPress={join}>
            <Text style={styles.buttonText}>Start chatting!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.dark.Background,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.dark.Background,
  },
  container_bg: {
    backgroundColor: Colors.dark.Container,
    boxShadow: "0px 15px 20px rgba(0, 0, 0, 0.1)",
    
    padding: 32,
    borderRadius: 32,
  },
  titleWrapper: {
    marginBottom: 32,
    width: "100%",
    alignItems: "center",
  },
  title: {
    backgroundColor: Colors.dark.Deep_Container,
    borderRadius: 16,

    paddingVertical: 12,
    paddingHorizontal: 56,

    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.4)",
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  inputContainer: {
    backgroundColor: Colors.dark.Deep_Container,
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 24,

    boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.6)",

    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  inputWrapper: {
    width: "100%",
    marginBottom: 16,
  },

  input: {
    width: "100%",
    height: 48,

    backgroundColor: Colors.dark.Container,
    color: "#FFFFFF",
    outlineWidth: 0,

    borderColor: "#4a4e54",
    borderWidth: 1,
    borderRadius: 12,

    paddingHorizontal: 12,

    fontSize: 16,

    textAlign: "center",
  },

  inputFocused: {
    borderColor: Colors.dark.Accent,
  },

  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.dark.Accent,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#1f2126",
    fontSize: 16,
    fontWeight: "600",
  },
});