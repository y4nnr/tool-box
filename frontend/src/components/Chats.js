import React from 'react';
import Chat from './Chat';

const Chats = () => {
    return (
        <div style={styles.chatsContainer}>
            <Chat user="User 1" titleStyle={titleStyle}/>
            <Chat user="User 2" titleStyle={titleStyle}/>
        </div>
    );
};

const styles = {
    chatsContainer: {
        display: 'flex',
        justifyContent: 'space-between',
    }
    
};

const titleStyle = {
    borderBottom: '2px solid #3498db',
    paddingBottom: '10px',
    marginTop: '20px'
};

export default Chats;
