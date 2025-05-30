import React from 'react';
import styles from './ChatPage.module.css';

import { useState } from 'react';

import { useChat } from '../../hooks/useChat';

import { IoSend } from "react-icons/io5";

import MessageList from '../MessageList/MessageList';
import UserList from '../UsersList/UsersList';


// Chat component receives a JWT token prop for authentication
export default function Chat({token}){
    // Decode the JWT to extract the current user's username
    const {messages, users, sendMessage, likeMessage, username, likedSet} = useChat(token); 

    const [input, setInput] = useState('');
    
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