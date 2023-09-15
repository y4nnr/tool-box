import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUsers } from './UserContext';
import Intersection from './Intersection'; // Import the Intersection component


const titleStyle = {
    borderBottom: '2px solid #3498db',
    paddingBottom: '10px',
    marginTop: '20px'
};

const inputStyle = {
    margin: '10px',
    padding: '10px',
    fontSize: '16px'
};

const buttonStyle = {
    padding: '10px 15px',
    borderRadius: '5px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    cursor: 'pointer'
};

const inputFieldContainerStyle = {
    marginBottom: '15px',
    display: 'flex',
    alignItems: 'center',
};

const inputLabelStyle = {
    minWidth: '100px',
    marginRight: '10px',
    fontWeight: 'bold',
};

const buttonStyleCode = {
    padding: '5px 4px',
    borderRadius: '5px',
    backgroundColor: '#3a3a3a',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    marginRight: '10px',
    marginBottom: '1px'
};


function Users() {
    const { users, setUsers, onlineUsers, setOnlineUsers } = useUsers();
    const [onlinePremiumUsers, setOnlinePremiumUsers] = useState([]); // State for online premium users
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [premium, setPremium] = useState('No');
    const [geo, setGeo] = useState('Africa');

    useEffect(() => {
        async function fetchUsers() {
            try {
                const response = await axios.get('http://localhost:3001/users');
                setUsers(response.data);
            } catch (error) {
                console.error("Error fetching users", error);
            }
        }

        fetchUsers();
    }, [setUsers]);

    // New state for showing or hiding the code
const [showCode, setShowCode] = useState(false);

// Function to toggle the visibility of the code block
const toggleCode = () => {
    setShowCode(prevState => !prevState);
}

    const addUserHandler = async () => {
        try {
            const newUser = { username, firstName, lastName, premium, geo };
            const response = await axios.post('http://localhost:3001/users', newUser);
            if (response.data) {
                setUsers(prevUsers => [...prevUsers, response.data]);
            }

            // Reset fields
            setUsername('');
            setFirstName('');
            setLastName('');
            setPremium('No');
            setGeo('Africa');
        } catch (error) {
            console.error("Error adding user", error);
        }
    };

    const deleteUserHandler = async (userId) => {
        try {
            const response = await axios.delete(`http://localhost:3001/users/${userId}`);
            if (response.status === 200) {
                setUsers(prevUsers => prevUsers.filter(user => user.userId !== userId));

                if (onlineUsers.includes(userId)) {
                    setOnlineUsers(prevOnlineUsers => prevOnlineUsers.filter(id => id !== userId));
                }

                // Remove the deleted user from onlinePremiumUsers as well
                setOnlinePremiumUsers(prevOnlinePremiumUsers => prevOnlinePremiumUsers.filter(id => id !== userId));
            }
        } catch (error) {
            console.error("Error deleting user", error);
        }
    };
    

    return (
        <div>
     <div>
    <h3 style={titleStyle}>Add User</h3>
    <div>
        <div style={inputFieldContainerStyle}>
            <label style={inputLabelStyle}>Username:</label>
            <input style={inputStyle} value={username} placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div style={inputFieldContainerStyle}>
            <label style={inputLabelStyle}>First Name:</label>
            <input style={inputStyle} value={firstName} placeholder="First Name" onChange={(e) => setFirstName(e.target.value)} />
        </div>
        <div style={inputFieldContainerStyle}>
            <label style={inputLabelStyle}>Last Name:</label>
            <input style={inputStyle} value={lastName} placeholder="Last Name" onChange={(e) => setLastName(e.target.value)} />
        </div>
        <div style={inputFieldContainerStyle}>
            <label style={inputLabelStyle}>Premium:</label>
            <select style={inputStyle} value={premium} onChange={(e) => setPremium(e.target.value)}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
            </select>
        </div>
        <div style={inputFieldContainerStyle}>
            <label style={inputLabelStyle}>Geo:</label>
            <select style={inputStyle} value={geo} onChange={(e) => setGeo(e.target.value)}>
                <option value="Africa">Africa</option>
                <option value="Asia">Asia</option>
                <option value="Europe">Europe</option>
                <option value="North America">North America</option>
                <option value="South America">South America</option>
                <option value="Australia">Australia</option>
                <option value="Antarctica">Antarctica</option>
            </select>
        </div>
        <button style={buttonStyle} onClick={addUserHandler}>Add User</button>
    </div>
</div>

            
            <div style={{ marginTop: '40px' }}>
                <h3 style={titleStyle}>User List</h3>
                <table style={{ margin: '20px', width: '90%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>Username</th>
                            <th style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>Name</th>
                            <th style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>Premium</th>
                            <th style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>Geo</th>
                            <th style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.filter(user => user && user.userId).map(user => (
                            <tr key={user.userId}>
                                <td style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>{user.username}</td>
                                <td style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>{user.firstName} {user.lastName}</td>
                                <td style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>{user.premium}</td>
                                <td style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>{user.geo}</td>
                                <td style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>
                                    <button style={buttonStyle} onClick={() => deleteUserHandler(user.userId)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
  {/* Show/Hide Code button */}
  <div style={{ width: '100%', display: 'flex', justifyContent: 'right', marginBottom: '20px' }}>
          <button className="code-button" onClick={toggleCode} style={buttonStyleCode}>
          {showCode ? 'Hide code' : 'Show code'}
          </button>
      </div>

      {showCode && (
    <div className="code-container" style={{ width: '100%', marginBottom: '20px', marginTop: '20px' }}>
        <pre style={{ padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', background: '#f7f7f7' }}>
            <code>
{`//////////////////////////////////////////////// Sorted Set counter
///Add Element to the Sorted Set
app.post('/addElement', (req, res) => {
    const { element, score } = req.body;
    client.zadd('sortedSet', score, element, (err, reply) => {
        if (err) {
            res.status(500).send({ error: err.message });
            return;
        }
        res.status(200).send({ added: true });
    });
});

///Get All Elements from the Sorted Set
app.get('/getAllElements', (req, res) => {
    client.zrange('sortedSet', 0, -1, 'WITHSCORES', (err, elements) => {
        if (err) {
            res.status(500).send({ error: err.message });
            return;
        }
        let result = [];
        for (let i = 0; i < elements.length; i += 2) {
            result.push({ element: elements[i], score: elements[i + 1] });
        }
        res.status(200).send(result);
    });
});

///Update Score of an Element
app.put('/updateScore', (req, res) => {
    const { element, newScore } = req.body;
    client.zadd('sortedSet', newScore, element, (err, reply) => {
        if (err) {
            res.status(500).send({ error: err.message });
            return;
        }
        res.status(200).send({ updated: true });
    });
});

///Fetch Ranked Elements
app.get('/getRankedElements', (req, res) => {
    client.zrevrange('sortedSet', 0, -1, 'WITHSCORES', (err, elements) => {
        if (err) {
            res.status(500).send({ error: err.message });
            return;
        }
        let result = [];
        for (let i = 0; i < elements.length; i += 2) {
            result.push({ element: elements[i], score: elements[i + 1] });
        }
        res.status(200).send(result);
    });
});

app.delete('/deleteElement', (req, res) => {
    const { element } = req.body;

    client.zrem('sortedSet', element, (err, response) => {
        if (err) {
            return res.status(500).json({ message: "Error deleting element", error: err.message });
        }
        res.json({ message: "Element deleted successfully" });
    });
});


app.get('/getRanking', async (req, res) => {
    try {
        const ranking = await getRankingFromRedis();
        res.status(200).json(ranking);
    } catch (error) {
        console.error("Error:", error);  // This will print the error details in the backend console
        res.status(500).json({ message: "Error fetching ranking", error: error.message });
    }
    
});

const getRankingFromRedis = async () => {
    return new Promise((resolve, reject) => {
        client.zrevrange('sortedSet', 0, -1, 'WITHSCORES', (err, result) => {
            if (err) return reject(err);

            let ranking = [];
            for (let i = 0; i < result.length; i += 2) {
                ranking.push({
                    element: result[i],
                    score: result[i + 1]
                });
            }
            resolve(ranking);
        });
    });
};


//////////////////////////////////////////////`}
            </code>
        </pre>
    </div>
)}


  </div>    );
}

export default Users;
