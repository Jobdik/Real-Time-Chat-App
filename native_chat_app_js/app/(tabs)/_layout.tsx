import React from "react";
import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: "#3478F6",
        tabBarInactiveTintColor: "#888",
        tabBarLabelStyle: { fontSize: 12 },
      }}
    >
      
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#1E1E1E",
    borderTopColor: "#333333",
    borderTopWidth: 1,
  },
});