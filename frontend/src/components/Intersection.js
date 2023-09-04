import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserCircle } from 'react-icons/fa';
import { useUsers } from './UserContext';

function Intersection() {
    const { users, setUsers, onlineUsers, setOnlineUsers } = useUsers();
    const [onlinePremiumUsers, setOnlinePremiumUsers] = useState([]); // State for online premium users

    useEffect(() => {
        // Fetch users from server
        axios.get('http://localhost:3001/getUsers')
            .then(response => {
                setUsers(response.data);
            })
            .catch(error => {
                console.error("Error fetching users:", error);
            });

        // Fetch online users by userID
        axios.get('http://localhost:3001/getOnlineUsers')
            .then(response => {
                setOnlineUsers(response.data); // This should return an array of userIDs
            })
            .catch(error => {
                console.error("Error fetching online users:", error);
            });

        // Fetch online premium users (intersection of onlineUsers and premiumUsers)
        axios.get('http://localhost:3001/getIntersectionUsers')
            .then(response => {
                const premiumUserIds = response.data;
                const onlinePremiumUserIds = premiumUserIds.filter(userId => onlineUsers.includes(userId));
                setOnlinePremiumUsers(onlinePremiumUserIds);
                console.log("Online Premium Users:", premiumUserIds); // For debugging
            })
            .catch(error => {
                console.error("Error fetching online premium users:", error);
            });
            
    }, [setUsers, setOnlineUsers]);

    const toggleUserOnline = (user) => {
        console.log("toggleUserOnline function called with user:", user);
        if (!user || !user.userId) return;
    
        if (onlineUsers.includes(user.userId)) {  // If user is already online
            console.log("Setting user offline. User ID:", user.userId);
            axios.post('http://localhost:3001/userOffline', { userId: user.userId })
                .then(response => {
                    console.log("Offline Response:", response.data);
                    setOnlineUsers(prev => prev.filter(onlineUser => onlineUser !== user.userId));
    
                    // Fetch online premium users after setting the user offline
                    fetchOnlinePremiumUsers();
                })
                .catch(error => {
                    console.error("Error setting user offline:", error);
                });
        } else {
            console.log("Setting user online. User ID:", user.userId);
            
            axios.post('http://localhost:3001/userOnline', { userId: user.userId })
                .then(response => {
                    console.log("Online Response:", response.data);
                    setOnlineUsers(prev => [...prev, user.userId]);
    
                    // Fetch online premium users after setting the user online
                    fetchOnlinePremiumUsers();
                })
                .catch(error => {
                    console.error("Error setting user online:", error);
                });
        }
    };
    
    // Function to fetch online premium users
    const fetchOnlinePremiumUsers = () => {
        axios.get('http://localhost:3001/getIntersectionUsers')
            .then(response => {
                const premiumUserIds = response.data;
                const onlinePremiumUserIds = premiumUserIds.filter(userId => onlineUsers.includes(userId));
                setOnlinePremiumUsers(premiumUserIds);
                console.log("Online Premium Userssss:", premiumUserIds); // Add this line
            })
            .catch(error => {
                console.error("Error fetching premium users:", error);
            });
    };
   

    const sectionStyle = {
        flex: '0 48%',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.05)',
        height: 'max-content'
    };

    const titleStyle = {
        borderBottom: '2px solid #3498db',
        paddingBottom: '10px',
        marginTop: '20px'
    };

    const listStyle = {
        listStyleType: 'none',
        padding: 0,
        maxHeight: '200px',  
        overflowY: 'auto'
    };

    const listItemStyle = {
        marginBottom: '10px',
        height: '30px',
        display: 'flex',
        alignItems: 'center'
    };

    const buttonStyle = {
        marginLeft: '15px',
        padding: '5px 10px',
        cursor: 'pointer',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        color: 'white',
        borderRadius: '5px',
    };

 

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2%' }}>
            <div style={sectionStyle}>
                <h3 style={titleStyle}>Registered Users</h3>
                <ul style={listStyle}>
                    {users.filter(user => user).map(user => (
                        <li key={user.userId} style={listItemStyle}>
                            {user.username}
                            <button style={buttonStyle} onClick={() => toggleUserOnline(user)}>
                                {onlineUsers.includes(user.userId) ? 'Go Offline' : 'Go Online'}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            <div style={sectionStyle}>
                <h3 style={titleStyle}>Online Users</h3>
                <ul style={listStyle}>
                    {onlineUsers.map(onlineUserId => {
                        // Retrieve the username for each online user
                        const onlineUser = users.find(user => user.userId === onlineUserId);
                        return (
                            <li key={onlineUserId} style={listItemStyle}>
                            <span role="img" aria-label="Online" style={{ marginRight: '10px' }}>🟢</span>
                            {onlineUser ? onlineUser.username : 'Unknown User'}
                            </li>
                        );
                    })}
                </ul>
            </div>
            <div style={sectionStyle}>
                <h3 style={titleStyle}>Online Premium Users</h3>
                <ul style={listStyle}>
                    {onlinePremiumUsers.map(onlineUserId => {
                        const onlinePremiumUser = users.find(user => user.userId === onlineUserId);
                        return (
                            <li key={onlineUserId} style={listItemStyle}>
                                <span role="img" aria-label="Online" style={{ marginRight: '10px' }}>🟢</span>
                                {onlinePremiumUser ? onlinePremiumUser.username : 'Unknown User'}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}

export default Intersection;