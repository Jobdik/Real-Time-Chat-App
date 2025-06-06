import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { Colors } from "@/constants/Colors";

export default function TabsNotFound() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Page not found</Text>
      <Link href="/" style={styles.button}>
        <Text style={styles.buttonText}>Back to Home</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.Deep_Container,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 24,
    marginBottom: 16,
  },
  button: {
    backgroundColor: Colors.dark.Accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
  },
});