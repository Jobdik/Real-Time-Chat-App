import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Dimensions, Animated, } from "react-native";
import { useLocalSearchParams, Redirect } from "expo-router";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import MessageList from "../../components/ui/MessageList";
import UserList from "../../components/ui/UserList";
import { useChat, ChatUser } from "../../hooks/useChat";
import { Colors } from "@/constants/Colors";
import { HoverableIcon } from "@/components/ui/HoverableIcon";
import AnimatedTextInput from "@/components/ui/AnimatedTextInput";
import LoadingAnimation from "@/components/ui/LoadingAnimation";


export default function ChatScreen() {
  // Retrieve parameters from the route (username and userId)
  const { username } = useLocalSearchParams<{ username: string }>();
  const { userId } = useLocalSearchParams<{ userId: string }>();

  // Redirect to login if username is missing
  if (!username) {
    return <Redirect href="/" />;
  }

  // Custom chat hook handles messages, users, and likes
  const { messages, users, sendMessage, likeMessage, likedSet, error, isConnecting } = useChat( username);

  const [input, setInput] = useState<string>("");
  const [showUsers, setShowUsers] = useState<boolean>(false);

  // Set right panel width based on screen size
  const PANEL_WIDTH = SCREEN_WIDTH >= 768 ? 250 : SCREEN_WIDTH * 0.8;
  // Animated value for the right panel width
  const animatedWidth = useRef(new Animated.Value(0)).current;

  // Animate the user list panel when toggled
  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: showUsers ? PANEL_WIDTH : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [showUsers, PANEL_WIDTH, animatedWidth]);

  // Handle sending message
  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setInput("");
  };  


  return (
    <View style={styles.mainContainer}>
      <View style={styles.container}>   
        {/* Header: Chat title and toggle user list button */}
        <View style={[styles.topContainer, styles.shadow]}>
          <View style={styles.titleWrapper}>
            <Text style={styles.chatTitle}>Just Chatting!</Text>
          </View>

          <View style={styles.usersContainerButton}>
            <HoverableIcon
              IconComponent={FontAwesome}
              iconProps={{ name: "users", size: 20}}
              fromColor="#fff"
              toColor={Colors.dark.Accent}
              containerStyle={styles.buttonUsers}
              onPress={() => setShowUsers((prev) => !prev)}
            />

            <View style={styles.titleWrapper}>
              <Text style={styles.activeUsers}>
                {users.filter((u: ChatUser) => u.online).length}
              </Text>
            </View>
          </View>
        </View>

        {/* Message list */}
        <View style={[styles.messagesContainerWrapper, styles.shadow]}>
         {(isConnecting || error) ? ( 
            <View style={styles.loadingContainer}>
              {isConnecting && <LoadingAnimation />}
              {error &&  <Text style={styles.loadingText}>{error}</Text>}
            </View>
          ):(
            <MessageList
              messages={messages}
              likeMessage={likeMessage}
              likedSet={likedSet}
              userId={{ id: Number(userId) }}
            />
          )}
           
        </View>

        {/* Input field with send button */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={90}
          style={styles.inputContainerWrapper}
        >
          <View style={styles.inputContainer}>
            
            <AnimatedTextInput
              value={input}
              onChangeText={setInput}
              containerStyle={styles.inputMessage}
              placeholder="Type a message..."
              returnKeyType="send"
              maxLength={280}
            />


            <HoverableIcon
              IconComponent={Ionicons}
              iconProps={{ name: "send", size: 20 }}
              fromColor="#fff"
              toColor={Colors.dark.Accent}
              containerStyle={styles.buttonSend}
              onPress={handleSend}></HoverableIcon>
            
          </View>
        </KeyboardAvoidingView>
      </View>

      {/* Slide-out animated panel with user list */}
      <Animated.View
        style={[
          styles.rightContainer,
          {
            width: animatedWidth,
            opacity: animatedWidth.interpolate({
              inputRange: [0, PANEL_WIDTH * 0.3, PANEL_WIDTH],
              outputRange: [0, 0.2, 1],
            })
          },
        ]}
      >
        <UserList users={users as ChatUser[]} onClose={() => setShowUsers(false)} />
      </Animated.View>
      
    </View>
  );
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: SCREEN_WIDTH >= 768 ? "row" : "column",
    backgroundColor: Colors.dark.Container,
  },
  container: {
    flex: 1,
    alignItems: "center",
  },
  topContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    width: "98%",
    height: 48,

    paddingHorizontal: 24,

    marginTop: 16,
    borderRadius: 12,
    backgroundColor: Colors.dark.Deep_Container,

  },

  titleWrapper: {
    flexDirection: "row",
    height: '100%',
    justifyContent: "center",
  },
  chatTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    lineHeight: 44,
    fontWeight: "700",
    textAlign: "left",
    padding: 0,
    margin: 0,
  },

  usersContainerButton: {
    flexDirection: "row",
    alignItems: "center",
    height: '100%',
    justifyContent: "center",
  },
  buttonUsers: {
    padding: 8,
    marginRight: 8,
  },

  activeUsers: {
    color: "#FFFFFF",
    fontSize: 20,
    lineHeight: 44,
    textAlign: "left",
    padding: 0,
    margin: 0,
  },
  messagesContainerWrapper: {
    flex: 1,
    backgroundColor: Colors.dark.Container,
    borderRadius: 24,
    marginTop: 16,
    width: "98%",
    marginBottom: 16,
  },
  inputContainerWrapper: {
    width: "98%",
    marginBottom: 16,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:"center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.dark.Deep_Container,

    borderRadius: 32,
  },

  inputMessage: {
    flex: 1,
    height: 40,

    backgroundColor: Colors.dark.Container,
    color: "#FFFFFF",
    outlineWidth: 0,
    
    borderWidth: 1,
    borderRadius: 24,

    paddingHorizontal: 12,
    marginRight: 8,
  },

  inputFocused: {
    borderColor: Colors.dark.Accent,
  },

  buttonSend: {
    paddingVertical: 7,
    paddingHorizontal: 8,
    justifyContent: "center",
    alignItems: "center",

    backgroundColor: Colors.dark.Container,

    borderColor: "#4a4e54",
    borderWidth: 1,
    borderRadius: 64,
  },
  rightContainer: {
    right: 0,
    height: "100%",
    position:SCREEN_WIDTH >= 768 ? "relative" : "absolute",
  },

  loadingContainer:{
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText:{
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 20,
    textAlign: "left",
    backgroundColor: Colors.dark.Deep_Container,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    margin: 0,
  },

  shadow:{
    boxShadow: "0px 15px 20px rgba(0, 0, 0, 0.1)",
  },
});