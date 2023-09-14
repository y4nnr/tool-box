import React, { useState, useEffect, useRef } from 'react';

const formatDateWithMilliseconds = (timestampInSeconds) => {
    const date = new Date(timestampInSeconds * 1000);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString('en-US', { hour12: false })}.${date.getMilliseconds().toString().padStart(3, '0')}`;
}


const titleStyle = {
    borderBottom: '2px solid #3498db',
    paddingBottom: '10px',
    marginTop: '20px',
    margin: '20px'

};

const buttonStyleCode = {
    padding: '10px 15px',
    borderRadius: '5px',
    backgroundColor: '#3a3a3a',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    marginRight: '10px'
};

function Monitor() {
    console.log("Monitor rendered");  // <-- Add this line here

    const [commands, setCommands] = useState([]);
    const wsRef = useRef();

// New state for showing or hiding the code
const [showCode, setShowCode] = useState(false);

// Function to toggle the visibility of the code block
const toggleCode = () => {
    setShowCode(prevState => !prevState);
}


    useEffect(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            // If the WebSocket is already open, don't try to open another connection.
            return;
        }
        setTimeout(() => {
        wsRef.current = new WebSocket('ws://localhost:3002');

        wsRef.current.onopen = () => {
            console.log('WebSocket connected.');
        };

        wsRef.current.onmessage = (message) => {
            const { time, args } = JSON.parse(message.data);
            console.log(`Received command from server: ${args}`);
            const formattedCommand = `${formatDateWithMilliseconds(time)} - ${args.join(' ')}`;
            setCommands(prevCommands => {
                const newCommands = [...prevCommands, formattedCommand];
                return newCommands.slice(-9);  // keep only the last 9 commands
            });
        };
        

        wsRef.current.onerror = (error) => {
            console.error(`WebSocket Error: ${error}`);
        };

        wsRef.current.onclose = () => {
            console.log('WebSocket closed.');
        };

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        }}, 1000); // waits 1 second before attempting to connect
    }, []);

    return (
        <div>
        <h3 style={titleStyle}>Redis Monitor Command Output</h3>
   
        <div>
            <div className="terminal" style={{ width: 'auto', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere'}}>
                {commands.map((command, index) => (
                    <div className="command" key={index}>{command}</div>
                ))}
            </div>
</div>
</div>
);
}

export default Monitor;
