import { useState, useEffect, useRef, useCallback, startTransition} from "react";
import { jwtDecode } from "jwt-decode";
import { API_URL } from "../Utils/api";


export function useChat(token){
    const {username} = jwtDecode(token);

    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);

    const [likedSet, setLikedSet] = useState(new Set());

    const wsRef = useRef(null);


    const sendMessage = useCallback(
        content => {
            wsRef.current.send(JSON.stringify({type: "message", content, username}));
        },[username]
    );

    const likeMessage = useCallback(
        id =>{
            const newSet = new Set(likedSet);
            if(newSet.has(id)) newSet.delete(id);
            else newSet.add(id); 
            setLikedSet(newSet);
            
            wsRef.current.send(JSON.stringify({type: newSet.has(id) ? "like" : "unlike", messageId: id, likedBy: username}));
        },[likedSet, username]

    );



    useEffect(()=>{
        fetch(`${API_URL}/messages`).then(respone => respone.json()).then(data => {
            setMessages(data.reverse());

            const initialLikes = new Set(
              data.filter(message => message.likedBy?.includes(username)).map(message => message.id)  
            );
            setLikedSet(initialLikes);
        });


        const ws = new WebSocket(`ws://localhost:4000`); 
        wsRef.current = ws;

        ws.onopen = () => ws.send(JSON.stringify({type: "auth", token}));

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
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
            });
        };

        return () => ws.close();


    }, [token, username]);

    return {messages, users, sendMessage, likeMessage, username, likedSet};
}