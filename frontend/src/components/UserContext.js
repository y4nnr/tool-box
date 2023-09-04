import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const UserContext = createContext();

export const useUsers = () => {
    return useContext(UserContext);
};

export const UserProvider = ({ children }) => {
    const [users, setUsers] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:3001/users')
            .then(response => {
                setUsers(response.data);
            })
            .catch(error => {
                console.error("Error fetching users:", error);
            });

        axios.get('http://localhost:3001/getOnlineUsers')
            .then(response => {
                setOnlineUsers(response.data); // This should return an array of userIDs
            })
            .catch(error => {
                console.error("Error fetching online users:", error);
            });
    }, []);

    const value = {
        users,
        setUsers,
        onlineUsers,
        setOnlineUsers,
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};
