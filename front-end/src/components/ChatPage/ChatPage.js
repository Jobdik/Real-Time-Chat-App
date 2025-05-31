import styles from './ChatPage.module.css';

import { useState } from 'react';

import { useChat } from '../../hooks/useChat';

import { IoSend } from "react-icons/io5";

import MessageList from '../MessageList/MessageList';
import UserList from '../UsersList/UsersList';


// Chat component receives a JWT token prop for authentication
export default function Chat(username){
    // Take dataset from custom web-socket hook
    const {messages, users, sendMessage, likeMessage, likedSet} = useChat(username); 

    const [input, setInput] = useState('');
    
    // Function to format and send message
    const handleSend = () =>{
       const text = input.trim();
       if(!text) return;
       sendMessage(text);
       setInput('');
    }


    return(
        <main className={styles.main}>
            <div className={styles.container}>
                {/* Header showing chat title */}
                <div className={styles.top_container}>
                    <span className={styles.active_users_span}>Just Chating! {}</span>
                </div>

                {/* Messages panel */}
                <div className={styles.masseges_container_wrapper}>
                    <MessageList messages={messages} likeMessage={likeMessage} likedSet={likedSet} username={username} />
                </div>

                {/* Input field and send button */}
                <div className={styles.input_container}>
                    <input className={styles.input_message} value={input} onChange={e => setInput(e.target.value)}></input>
                    <button className={styles.button_send}onClick={() => handleSend(input)}><IoSend /></button>
                </div>

            </div>

            {/* Sidebar showing user list and status */}
            <div className={styles.right_container}>
                <UserList users={users} />
            </div>
        </main>
    )
}