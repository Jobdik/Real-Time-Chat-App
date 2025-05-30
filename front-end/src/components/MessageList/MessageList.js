import styles from './MessageList.module.css'
import React, { useMemo, useCallback, forwardRef} from 'react';

import { Virtuoso } from 'react-virtuoso';

import Message from '../Message/Message';

import { FaArrowDown } from "react-icons/fa";



const MessageList = React.memo(function MessageList({ messages, likeMessage, likedSet, username }) {
    const virtuosoRef = React.useRef(null);
    const [bottom, setBottom] = React.useState(true);

    
    const Item = useMemo(()=> forwardRef(
        (props, ref) => (
            <div 
                {...props}
                ref={ref}
                style={{ ...props.style, padding: '1rem 0' }}
            />
        )    
    ), []);

    const VirtuosoComponents = useMemo(()=>({
        Header: ()=> <div style={{height: '1rem'}}></div>,
        Footer: () => <div style={{height: '1rem'}}></div>,
        Scroller: React.forwardRef((props, ref) => (
            <div 
                {...props}
                ref={ref}
                style={{ ...props.style, overflow: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            />
        )),
        Item,
    }), [Item]);

    const renderRow = useCallback((index, message)=>(
        <Message
            key={message.id}
            message={message}
            onLike={likeMessage}
            isLiked={likedSet.has(message.id)}
            currentUser={username}
        />
    ), [likeMessage, likedSet, username]);

    return (
        <div className={styles.masseges_container}>

            <Virtuoso
                ref={virtuosoRef}
                style={{ height: '100%', width: '100%' }}
                data={messages}
                itemContent={renderRow}
                initialTopMostItemIndex={messages.length - 1}
                followOutput="smooth"
                components={VirtuosoComponents}
                computeItemKey={(_, message) => message.id}
                atBottomStateChange={setBottom}
            />  

            {!bottom &&(
                <button className={styles.scrollToBottom}
                onClick={() =>{
                    virtuosoRef.current?.scrollToIndex({
                        index: messages.length - 1,
                        align: 'end',
                        behavior: 'smooth',
                    });
                }}>
                    <FaArrowDown className={styles.scrollToBottom__icon}/>
                </button>)
            }

        </div>
    );


})

export default MessageList