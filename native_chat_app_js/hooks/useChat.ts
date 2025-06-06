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

    const [error, setError] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState<boolean>(true);

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectCountRef = useRef<number>(0);
    const maxReconnectAttempts = 5;
    const reconnectDelayMs = 2000;

    // Function to send a request to the server to create a new message 
    const sendMessage = useCallback(
        (content : string) => {
            if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
                setError("Unable to send message. Connection lost.");
                return;
            }
            wsRef.current.send(JSON.stringify({ type: "message", content, username }));
        },[username]
    );

    // Function to send a request to the server to like/unlike a message
    const likeMessage = useCallback(
        (id: string) =>{
            const newSet = new Set(likedSet);
            if(newSet.has(id)) newSet.delete(id);
            else newSet.add(id); 
            setLikedSet(newSet);

            if(wsRef.current && wsRef.current.readyState === WebSocket.OPEN){
                wsRef.current.send(JSON.stringify({type: newSet.has(id) ? "like" : "unlike", messageId: id, likedBy: username}));
            }
            else{
                setError("Unable to send like request. Connection lost.");
            }
        },[likedSet, username]

    );


    
    useEffect(()=>{
        let isMounted = true;
        async function fetchMessages(){
            try{
                // Trow a cookies to the server for authentication
                const response = await fetch(`${API_URL}/messages`,{
                    method: "GET",
                    credentials: "include",
                });
                if(!response.ok){
                    throw new Error(`Error ${response.status}`);
                }

                const data: ChatMessage[] = await response.json();
                if(!isMounted) return;
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
                if (isMounted) setError("Unable to load messages history");
            }

        }

        fetchMessages();

        function connectWebSocket(){
            setIsConnecting(true);
            setError(null);

            const ws = new WebSocket(`ws://localhost:4000`); 
            wsRef.current = ws;

            ws.onopen = () => {
                console.log("WebSocket connected as", username);
                reconnectCountRef.current = 0;
                setIsConnecting(false);
            }
            
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

            ws.onerror = (e) => {
                console.error("WebSocket error:", e);
                setError("Connection error");
            }


            ws.onclose = (event) => {
                console.log("WebSocket connection closed:", event.code, event.reason);

                if(!event.wasClean){
                    attempReconnect();
                }
            }
        }

        function attempReconnect(){
           if(reconnectCountRef.current >= maxReconnectAttempts){
                setError("Unable to reconnect. Try again later");
                setIsConnecting(false);
                return;
            }

            reconnectCountRef.current += 1;
            setTimeout(()=>{
                console.log("Attempting to reconnect...");
                connectWebSocket();
            }, reconnectDelayMs)
        }

        connectWebSocket();

        return () => {
            isMounted = false;
            wsRef.current?.close();
            wsRef.current = null;
        };


    }, [username]);

    return {messages, users, sendMessage, likeMessage, username, likedSet, error, isConnecting};
}