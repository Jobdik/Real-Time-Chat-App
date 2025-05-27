import styles from './ChatPage.module.css';

import { useEffect, useState, useRef } from 'react';

import { jwtDecode } from 'jwt-decode';

import Message from '../Message/Message';
import { API_URL } from '../../Utils/api';

import { IoSend } from "react-icons/io5";
import { MdAccountCircle } from "react-icons/md";


// Chat component receives a JWT token prop for authentication
export default function Chat({token}){
    // Decode the JWT to extract the current user's username
    const {username} = jwtDecode(token);

    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);

    // Ref to keep track of the previous messages length for auto-scrolling logic
    const prevLengthRef = useRef(messages.length);
    // Ref to the messages container DOM element for scrolling
    const containerRef = useRef(null);
    const initialScrollDone = useRef(false);

    const [input, setInput] = useState('');
    const [likedSet, setLikedSet] = useState(new Set());
    const wsRef = useRef(null);

    // Effect for initial data fetch and WebSocket setup
    useEffect(()=>{

        // fetching existing messages
        fetch(`${API_URL}/messages`).then(respone => respone.json()).then(data => {

            // Reverse messages so oldest are first
            setMessages(data.reverse()); 
            
            // Build initial set of likes for the current user
            const initialLikes = new Set(
              data.filter(message => message.likedBy?.includes(username)).map(message => message.id)  
            );

            setLikedSet(initialLikes);
        }); 


        // Open a WebSocket connection to receive real-time updates
        const ws = new WebSocket(`ws://localhost:4000`);
        wsRef.current = ws;

        // Authenticate on open by sending the JWT
        ws.onopen = () => ws.send(JSON.stringify({type: "auth", token}));
        
        // Handle incoming WebSocket messages
        ws.onmessage = ({data}) =>{
            const message = JSON.parse(data);

            // Update massages 
            if(message.type === "newMessage") setMessages(prev => [...prev, message.message]);

            // Like or unlike update
            if(message.type === "updateLike") setMessages(prev => prev.map(m => m.id === message.messageId ? {...m, likes: message.likes, likedBy: message.likedBy} : m));

            // Users list update
            if(message.type === "users") {setUsers(message.data.map(([username, online]) => ({username, online})));};
        }

        // Clean up the WebSocket when component unmounts
        return () => wsRef.current.close();
    },[token])

    // Function to send a new chat message 
    const send = () =>{
        if(input.trim()){
            wsRef.current.send(JSON.stringify({type: "message", content: input, username}));
            setInput('');
        }
    }

    // Function to toggle like/unlike for a given message I
    const like = (id) =>{
        const isLiked = likedSet.has(id);
        // Send either 'like' or 'unlike' action to server
        wsRef.current.send(JSON.stringify({type: isLiked ? "unlike" : "like", messageId: id, likedBy: username}));

        // Optimistically update local likedSet for immediate UI feedback
        setLikedSet(prev => {
            const next = new Set(prev);
            isLiked ? next.delete(id) : next.add(id);
            return next;
        })
    }
    
     // Effect to auto-scroll only when a new message arrives
    useEffect(() => {
        const prevLen = prevLengthRef.current;
        const currLen = messages.length;

        if(currLen > prevLen){
            const el = containerRef.current;
            if(el){
                el.scrollTo({top: el.scrollHeight, behavior: 'smooth'});
            }
        }

        prevLengthRef.current = currLen;
    }, [messages.length]);

    return(
        <main className={styles.main}>
            <div className={styles.container}>
                {/* Header showing chat title */}
                <div className={styles.top_container}>
                    <span className={styles.active_users_span}>Just Chating! {}</span>
                </div>

                {/* Messages panel */}
                <div className={styles.masseges_container_wrapper}>
                    <div ref={containerRef} className={styles.masseges_container}>
                        {messages.map(message => <Message key={message.id} message={message} onLike={() => like(message.id)} isLiked={likedSet.has(message.id)} currentUser={username} />)}
                    </div>
                </div>

                {/* Input field and send button */}
                <div className={styles.input_container}>
                    <input className={styles.input_message} value={input} onChange={e => setInput(e.target.value)}></input>
                    <button className={styles.button_send}onClick={send}><IoSend /></button>
                </div>

            </div>

            {/* Sidebar showing user list and status */}
            <div className={styles.right_container}>
                <div className={styles.users_wrapper}>
                    {users.map(user => 
                        <div className={styles.user} key={user.username}>
                            <MdAccountCircle className={styles.user_icon} />
                            <span className={styles.user_name}>{user.username}</span>
                            <span className={styles.user_status + (user.online ? " " + styles.user_status_online : "")}>{user.online ? "online" : "offline"}</span>
                        </div>)}
                </div>
            </div>
        </main>
    )
}