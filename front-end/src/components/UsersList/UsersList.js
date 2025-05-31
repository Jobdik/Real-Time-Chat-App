import styles from "./UsersList.module.css";

import React, { useCallback, useMemo } from "react";
import { Virtuoso } from "react-virtuoso";


import { MdAccountCircle } from "react-icons/md";


const UserList = React.memo(function UserList({ users }) {


    // Create a custom item component for each user and memoize for performance
    const Item = useMemo(() => React.forwardRef((props, ref) => (
        <div
            {...props}
            ref={ref}
            style={{ ...props.style, padding: "0.5rem 0" }}
        />
    )), []);


    // Define custom components to tweak scrolling and spacing
    const VirtuosoComponents = useMemo(() => ({
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

    // Define how each user should be rendered
    const renderRow = useCallback((index, user) => (
         <div className={styles.user} key={user.username}>
                <MdAccountCircle className={styles.user_icon} />
                <span className={styles.user_name}>{user.username}</span>
            <span className={styles.user_status + (user.online ? " " + styles.user_status_online : "")}>{user.online ? "online" : "offline"}</span>
        </div>
    ), []);

    return (
        <Virtuoso
            style={{ height: "100%", width: "100%" }}
            data={users.sort((a, b) => a.username.localeCompare(b.username))} // Sort user list alphabetically
            itemContent={renderRow}
            followOutput="smooth" // Smooth scrolling
            components={VirtuosoComponents}
            computeItemKey={(_, user) => user.id} // Use user ID as unique key
        />
    );
});

export default UserList;