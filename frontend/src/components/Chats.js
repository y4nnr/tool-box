import React from 'react';
import Chat from './Chat';

const Chats = () => {
    return (
        <div style={styles.chatsContainer}>
            <Chat user="User 1" icon="fa fa-user-o" titleStyle={titleStyle} />
            <Chat user="User 2" icon="fa fa-user-o" titleStyle={titleStyle} />
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
