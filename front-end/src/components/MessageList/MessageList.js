import styles from './MessageList.module.css'
import React, { useMemo, useCallback, forwardRef} from 'react';

import { Virtuoso } from 'react-virtuoso';

import Message from '../Message/Message';

import { FaArrowDown } from "react-icons/fa";


// MessageList component renders a srollable, virtualized list of messages
const MessageList = React.memo(function MessageList({ messages, likeMessage, likedSet, username }) {
    const virtuosoRef = React.useRef(null);
    const [bottom, setBottom] = React.useState(true);

    // Define custom components to tweak scrolling and spacing
    const Item = useMemo(()=> forwardRef(
        (props, ref) => (
            <div 
                {...props}
                ref={ref}
                style={{ ...props.style, padding: '1rem 0' }}
            />
        )    
    ), []);

    // Define custom components to tweak scrolling and spacing
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

    // Define how each message should be rendered
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
                ref={virtuosoRef} // Attach the Virtuoso instance to the ref
                style={{ height: '100%', width: '100%' }}
                data={messages}
                itemContent={renderRow}
                initialTopMostItemIndex={messages.length - 1} // Start from the bottom
                followOutput="smooth" // Smooth scrolling
                components={VirtuosoComponents}
                computeItemKey={(_, message) => message.id} // Use message ID as unique key
                atBottomStateChange={setBottom} // Update bottom state
            />  

            {/* If not scrolled to the bottom, show a button to scroll to the bottom */}
            {!bottom &&(
                <button className={styles.scrollToBottom}
                onClick={() =>{
                    virtuosoRef.current?.scrollToIndex({
                        index: messages.length - 1, // Scroll to the last message
                        align: 'end', // Align to the end
                        behavior: 'smooth', // Smooth scrolling
                    });
                }}>
                    <FaArrowDown className={styles.scrollToBottom__icon}/>
                </button>)
            }

        </div>
    );


})

export default MessageList