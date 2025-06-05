import React, { useMemo, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
} from "react-native";

import { MaterialIcons } from "@expo/vector-icons";

import { ChatUser } from "../../hooks/useChat";

import { Colors } from "@/constants/Colors";

interface UserListProps {
  users: ChatUser[];
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const UserList: React.FC<UserListProps> = React.memo(({ users }) => {
  // Alphabetically sort users by name
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => a.username.localeCompare(b.username));
  }, [users]);

  // Renders a single user item
  const renderItem = useCallback(
    ({ item }: { item: ChatUser }) => (
      <View style={[styles.userContainer]}>
        <MaterialIcons
          name="account-circle"
          size={32}
          color="#757575"
          style={styles.userIcon}
        />
        <Text style={styles.userName}>{item.username}</Text>
        <Text
          style={[
            styles.userStatus,
            item.online ? styles.userStatusOnline : styles.userStatusOffline,
          ]}
        >
          {item.online ? "online" : "offline"}
        </Text>
      </View>
    ),
    []
  );

  return (
    <FlatList
      data={sortedUsers}
      extraData={users} // Ensures re-render if user props change
      keyExtractor={(item) => item.username} // Use username as unique key
      renderItem={renderItem}
      contentContainerStyle={styles.listContent}
      style={[styles.container, styles.shadow]}
      ListEmptyComponent={<Text style={{ color: "#888", textAlign: "center" }}>No users online</Text>}
    />
  );
});

export default UserList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: SCREEN_WIDTH >= 768 ? 250 : "100%", 
    backgroundColor: Colors.dark.Container,
    borderTopLeftRadius: 32,
    borderBottomLeftRadius: 32,
    marginBottom: 16,
    marginTop: 16,
  },
  listContent: {
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 8, 
    backgroundColor: Colors.dark.Deep_Container,
    borderRadius: 24,
    marginBottom: 8,

    boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.1)",

  },
  userIcon: {
    marginRight: 4,
  },
  userName: {
    color: "#FFFFFF",
    fontSize: 16,
    flex: 1,
    lineHeight: 20,
  },
  userStatus: {
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
    marginRight: 8,
  },

  userStatusOnline: {
    color: Colors.dark.Accent,
  },
  userStatusOffline: {
    color: "#b0bec5",
  },

  shadow:{
  

    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.2)",
  },
});