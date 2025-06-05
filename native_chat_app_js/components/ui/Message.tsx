import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { ChatMessage } from '../../hooks/useChat';
import { Colors } from "@/constants/Colors";

interface MessageProps {
    message: ChatMessage;
    onLike: (id: string) => void;
    isLiked: boolean;
    userId: { id: number };
}

const Message: React.FC<MessageProps> = ({ message, onLike, isLiked, userId }) => {
    // Check if the current message was sent by the logged-in user
    const isOwner = message.author.id === userId.id;

    // Format message creation time to "HH:MM" format in local timezone
    const formattedTime = new Date(message.creation_date).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
    return (
        <View style={[styles.messageContainer, isOwner && styles.messageOwner]}>
            {/* Author's name */}
            <View style={styles.authorContainer}>
                <Text style={styles.authorText}>{message.author.name}</Text>
            </View>
            
            {/* Message content */}
            <View style={styles.contentContainer}>
                <Text style={styles.contentText}>{message.content}</Text>
            </View>

            {/* Time and like section */}
            <View style={styles.likeContainer}>
                <Text style={styles.sendTime}>{formattedTime}</Text>

                {/* Like button */}
                <TouchableOpacity style={[ styles.likeButton ]} onPress={() => onLike(message.id)} >
                    <MaterialIcons
                        name={isLiked ? "favorite" : "favorite-border"}
                        size={14}
                        color={isLiked ? Colors.dark.Accent : "#555"}
                    />
                    <Text style={[styles.likeText, message.likes > 0 && { display:"flex" }, isLiked && { color: Colors.dark.Accent }]}>{message.likes}</Text>
                    
                </TouchableOpacity>
            </View>
        </View>
    );

}

// Custom comparison to avoid unnecessary re-renders
export default React.memo(
  Message,
  (prevProps, nextProps) =>
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.likes === nextProps.message.likes &&
    prevProps.isLiked === nextProps.isLiked &&
    prevProps.userId.id === nextProps.userId.id
);

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const styles = StyleSheet.create({
    messageContainer: {
        backgroundColor: Colors.dark.Deep_Container,   
        padding: 16,                  
        borderRadius: 16,             
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        marginLeft: 16,               
        minWidth: SCREEN_WIDTH * 0.2, 
        maxWidth: SCREEN_WIDTH * 0.4, 
        marginRight: "auto"
    },

    messageOwner: {
        marginLeft: "auto",
        marginRight: 16,              
    },

    authorContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,              
    }, 

    authorText: {
        color: "#FFFFFF",
        fontSize: 19.2,               
        fontWeight: "700",
        borderBottomWidth: 1,
        borderBottomColor: "#4a4e54",
    },

    contentContainer: {
        marginBottom: 8,              
        paddingBottom: 8,     
        borderBottomWidth: 0.8,
        borderBottomColor: "#4a4e54"          
    },

    contentText: {
        color: "#FFFFFF",
        fontSize: 16,                 
        fontWeight: "500",
        flexWrap: "wrap",           
    },

    likeContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",               
        gap: 8,                       
    },

    sendTime: {
        color: "#4a4e54",
        fontSize: 14.4,               
    },

    likeButton: {
        flexDirection: "row",
        alignItems: "center",
    },

    likeText: {
        color: "#4a4e54",
        fontSize: 16,               
        marginLeft: 4,
        textAlign: "center",
        lineHeight: 12,
        display: "none",
    },


});


