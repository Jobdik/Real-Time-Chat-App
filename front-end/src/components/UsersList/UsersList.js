import styles from "./UsersList.module.css";

import React, { useCallback, useMemo } from "react";
import { Virtuoso } from "react-virtuoso";


import { MdAccountCircle } from "react-icons/md";


const UserList = React.memo(function UserList({ users }) {

    const Item = useMemo(() => React.forwardRef((props, ref) => (
        <div
            {...props}
            ref={ref}
            style={{ ...props.style, padding: "0.5rem 0" }}
        />
    )), []);

    const VirtuosoComponents = useMemo(() => ({
        Scroller: React.forwardRef((props, ref) => (
            <div
                {...props}
                ref={ref}
                style={{ ...props.style, overflow: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            />
        )),
        Item,
    }), [Item]);

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
            data={users}
            itemContent={renderRow}
            followOutput="smooth"
            components={VirtuosoComponents}
            computeItemKey={(_, user) => user.id}
        />
    );
});

export default UserList;