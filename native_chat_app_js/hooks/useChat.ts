import { useState, useEffect, useRef, useCallback, startTransition} from "react";
import { API_URL } from "../constants/api";

/**
 * Custom hook that manages:
 * - Fetching initial messages
 * - Open and close web-socket connection
 * - Sending new messages and like/unlike requests
 * - Maintaining a set of messages, users, and which messages have been liked
 */


export interface Author {
    id: number;
    name: string;
    active: boolean;
}
export interface ChatMessage{
    id: string;
    author_id: number;
    author: Author;
    content: string;
    creation_date: string;
    likes: number;
    likedBy?: string[];
}

export interface ChatUser{
    username: string;
    online: boolean;
}

type WSIncomingMsg =
    | {type: "newMessage"; message: ChatMessage}
    | {type: "updateLike"; messageId: string; likes: number; likedBy: string[]}
    | {type: "users"; data: [string, boolean][]}


export function useChat(username : string){

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [users, setUsers] = useState<ChatUser[]>([]);

    const [likedSet, setLikedSet] = useState<Set<string>>(new Set());

    const wsRef = useRef<WebSocket | null>(null);

    // Function to send a request to the server to create a new message 
    const sendMessage = useCallback(
        (content : string) => {
            if (wsRef.current){
                wsRef.current.send(JSON.stringify({type: "message", content, username}));
            }
        },[username]
    );

    // Function to send a request to the server to like/unlike a message
    const likeMessage = useCallback(
        (id: string) =>{
            const newSet = new Set(likedSet);
            if(newSet.has(id)) newSet.delete(id);
            else newSet.add(id); 
            setLikedSet(newSet);
            
            if(wsRef.current){
                wsRef.current.send(JSON.stringify({type: newSet.has(id) ? "like" : "unlike", messageId: id, likedBy: username}));
            }
        },[likedSet, username]

    );


    
    useEffect(()=>{
        async function fetchMessages(){
            try{
                // Trow a cookies to the server for authentication
                const response = await fetch(`${API_URL}/messages`,{
                    method: "GET",
                    credentials: "include",
                });
                const data: ChatMessage[] = await response.json();
                // Reverse the order of the messages
                setMessages(data.reverse());
                // Make a set of liked messages
                const initialLikes = new Set(
                    data.filter(message => message.likedBy?.includes(username)).map(message => message.id)  
                );
                setLikedSet(initialLikes);
            }
            catch(e){
                console.log("Error fetching messages:", e);
            }

        }

        fetchMessages();

        const ws = new WebSocket(`ws://localhost:4000`); 
        wsRef.current = ws;

        ws.onopen = () => console.log("WebSocket connected as", username);


        ws.onmessage = (event) => {

            const message: WSIncomingMsg = JSON.parse(event.data);

            startTransition(() => {
                switch(message.type){
                    case "newMessage":
                        setMessages(prev => [...prev, message.message]);
                        break;
                    case "updateLike":
                        setMessages(prev => prev.map(m => m.id === message.messageId ? {...m, likes: message.likes, likedBy: message.likedBy} : m));
                        break;
                    case "users":
                        setUsers(message.data.map(([username, online]) => ({username, online})));
                        break;
                    default:
                        break;
                }
            })
        };

        return () => {
            wsRef.current?.close();
        };


    }, [username]);

    return {messages, users, sendMessage, likeMessage, username, likedSet};
}