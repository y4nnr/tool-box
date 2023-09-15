import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const socket = io.connect('http://localhost:3001');

const Chat = ({ user, titleStyle, icon }) => {
    const [message, setMessage] = useState('');
    const [chatLog, setChatLog] = useState([]);

    const chatEndRef = useRef(null);
    const clearChat = () => {
        setChatLog([]);
    };

    // New state for showing or hiding the code
    const [showCode, setShowCode] = useState(false);

    // Function to toggle the visibility of the code block
    const toggleCode = () => {
        setShowCode(prevState => !prevState);
    }

    const styles = {
        chatContainer: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: '1px solid #ddd',
            borderRadius: '5px',
            padding: '10px',
            width: '45%',
            height: '400px',
        },
        chatMessageRight: {
            padding: '5px 10px',
            borderRadius: '5px',
            marginBottom: '5px',
            background: '#43CC47', // A different color maybe?
            marginLeft: 'auto',
            maxWidth: '80%',
            textAlign: 'right',
            color: 'white',
            width: 'fit-content',
        },
        chatMessageLeft: {
            padding: '5px 10px',
            borderRadius: '5px',
            marginBottom: '5px',
            background: '#ebebeb', // Different color for the other user
            marginRight: 'auto',
            maxWidth: '80%',
            textAlign: 'left',
            width: 'fit-content',
        },
        // ... rest of your styles remain unchanged
    };
    
    const inputStyle = {
        margin: '10px',
        padding: '10px',
        fontSize: '16px',
        width: '100%'
    };
    
    const buttonStyle = {
        padding: '10px 15px',
        borderRadius: '5px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        cursor: 'pointer'
    };
    useEffect(() => {
        console.log('Setting up socket.io listeners.');

        const handleMessage = (msg) => {
            console.log('Received message:', msg);
            setChatLog((prevLog) => {
                const newLog = [...prevLog, msg];
                // If the length exceeds 4, remove the oldest message
                while (newLog.length > 4) {
                    newLog.shift();
                }
                return newLog;
            });
        };
        

        socket.on('chat message', handleMessage);

        return () => {
            console.log('Cleaning up socket.io listeners.');
            socket.off('chat message', handleMessage);
        };
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatLog]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (message.trim() === '') return;

        console.log('Emitting message:', message);
        socket.emit('chat message', { user, message });
        setMessage('');
    };

    return (
        
        <div style={styles.chatContainer}>
            
            <h3 style={titleStyle}><i className={icon}></i> {user}</h3>
            <div style={styles.chatLog}>
                {chatLog.map((data, index) => (
                    <div key={index} style={data.user === user ? styles.chatMessageRight : styles.chatMessageLeft}>
                        {data.message}
                    </div>
                ))}
            </div>
            <form onSubmit={sendMessage} style={styles.chatForm}>
                <input
                    style={inputStyle}  // Apply your inputStyle directly
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                />
                <div style={styles.buttonsContainer}>
                    <button 
                        style={buttonStyle}  // Apply your buttonStyle directly
                        type="submit"
                    >
                        Send
                    </button>
                    <button 
                        style={buttonStyle}  // Apply your buttonStyle directly
                        type="button" 
                        onClick={clearChat}
                    >
                        Clear Chat
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Chat;
