import React, { useCallback, useState, useEffect, useRef} from 'react';

import { View, StyleSheet, TouchableOpacity, Dimensions, Animated, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

import { FlashList } from '@shopify/flash-list';

import { FontAwesome } from '@expo/vector-icons';

import Message from './Message';

import { ChatMessage } from '@/hooks/useChat';
import { Colors } from "@/constants/Colors";

interface MessageListProps {
    messages: ChatMessage[];
    likeMessage: (id: string) => void;
    likedSet : Set<string>;
    userId: { id: number };
}


const MessageList: React.FC<MessageListProps> = React.memo(
  ({ messages, likeMessage, likedSet, userId }) => {
    // Tracks whether the user is scrolled to the bottom
    const [atBottom, setAtBottom] = useState<boolean>(true);

    // Refs for FlashList and animations
    const flatListRef = useRef<FlashList<ChatMessage>>(null);
    const slideAnim = useRef(new Animated.Value(50)).current; 
    const opacityAnim = useRef(new Animated.Value(0)).current;

    // Previous message count to detect new message
    const prevMessagesLengthRef = useRef(messages.length);
    const newMessageArrivedRef = useRef(false);
    const firstRender = useRef(true);
    const isButtonVisibleRef = useRef(false);

    // Detects whether a new message was added
    useEffect(() => {
      const prevLen = prevMessagesLengthRef.current;
      const currLen = messages.length;
      if (currLen > prevLen ) {
        newMessageArrivedRef.current = true;
      }
      prevMessagesLengthRef.current = currLen;
    }, [messages]);

    // Animates the scroll-to-bottom button appearance
    const animateButton = (visible: boolean) => {
      if (visible === isButtonVisibleRef.current) return;
      isButtonVisibleRef.current = visible;

      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: visible ? 0 : 50,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: visible ? 1 : 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    };

    // React to scroll state change
    useEffect(() => {
      animateButton(!atBottom);
    }, [atBottom]);

    
    // Determine whether the user is at the bottom of the list
    const handleScroll = useCallback(
      (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { contentOffset, contentSize, layoutMeasurement } =
          event.nativeEvent;
        const paddingToBottom = 100;
        const isBottom =
          contentOffset.y + layoutMeasurement.height + paddingToBottom >=
          contentSize.height;
        setAtBottom(isBottom);
      },
      []
    );

    // Programmatically scroll to the bottom
    const scrollToBottom = useCallback(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, []);

    // Renders a single message
    const renderItem = useCallback(
      ({ item }: { item: ChatMessage }) => (
        <View style={styles.itemContainer}>
          <Message
            message={item}
            onLike={likeMessage}
            isLiked={likedSet.has(item.id)}
            userId={userId}
          />
        </View>
      ),
      [likeMessage, likedSet, userId]
    );

    return (
      <View style={styles.container}>
        <FlashList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onScroll={handleScroll}
          scrollEventThrottle={32}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            // Auto-scroll only when new messages arrive
            if (newMessageArrivedRef.current) {

              // Time-out to render full dom of messages at first render before auto-scroll
              if (firstRender.current) {
                firstRender.current = false;
                setTimeout(() => { scrollToBottom(); }, 100);
              }
              else{
                scrollToBottom();
              }
              
              newMessageArrivedRef.current = false;
            }
          }}

        />

        {/* Scroll-to-bottom floating button */}
        {!atBottom && (
          <Animated.View
            style={[
              styles.scrollButtonContainer,
              {
                transform: [{ translateY: slideAnim }],
                opacity: opacityAnim,
              },
            ]}
          >
            <TouchableOpacity style={styles.scrollButton} onPress={scrollToBottom} >
              <FontAwesome name="arrow-down" size={20} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    );
  }
);

export default MessageList;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    overflow: "hidden",
    backgroundColor: Colors.dark.Container,
    borderRadius: 32,
  },

  itemContainer : {
    paddingBottom: 16,
  },

  listContent: {
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  scrollButtonContainer: {
    position: "absolute",
    left: SCREEN_WIDTH / 2 - 24,
    bottom: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    zIndex: 100,
  },
  scrollButton: {
    flex: 1,
    backgroundColor: Colors.dark.Deep_Container,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
  },
});

