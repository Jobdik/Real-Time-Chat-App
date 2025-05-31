import React from 'react';
import styles from './Message.module.css'; 

import { MdFavorite, MdFavoriteBorder } from "react-icons/md";


// Message component renders a single chat message bubble, with like functionality
function Message({message, onLike, isLiked, currentUser}){
    // Determine if the current user is the author of this message
    const isOwner = message.author.name === currentUser.username;
    return(
        // Apply owner styling if the message belongs to the current user
        <div className={styles.message__container + (isOwner ? " " + styles.message__owner : "")}>

            {/* Author name container */}
            <div className={styles.message__author__container}>
                <strong className={styles.message__author}>{message.author.name}</strong>
            </div>

            {/* Message text content */}
            <div className={styles.message__content}>
                <span className={styles.message__text}>{message.content}</span>
            </div>

            {/* Like button*/}
            <div className={styles.message__like__container}>
                {/* Display formated to client timezone send time */}
                <span className={styles.message__send__time}>{
                    new Date(message.creation_date).toLocaleTimeString(undefined,{
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                    })}
                </span>
                
                <button className={styles.message__like + (isLiked ? " " + styles.like_active : "")} onClick={() => onLike(message.id)}>{isLiked ? <MdFavorite /> : <MdFavoriteBorder />} {message.likes}</button>
            </div>
        </div>
    )
}


// React.memo optimizes re-renders by memoizing when props haven't changed
export default React.memo(Message, 
    (prevProps, nextProps) =>{
        return(
            prevProps.message.id === nextProps.message.id &&
            prevProps.message.likes === nextProps.message.likes &&
            prevProps.isLiked === nextProps.isLiked &&
            prevProps.currentUser === nextProps.currentUser
        )
})