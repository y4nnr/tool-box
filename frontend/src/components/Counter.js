import React, { useState, useEffect } from 'react';
import axios from 'axios';
function Counter() {
  const [count, setCount] = useState(0);
  const [inputValue, setInputValue] = useState("");
<input type="number" value={inputValue} onChange={e => setInputValue(e.target.value)} />

const buttonStyle = {
    padding: '10px 15px',
    borderRadius: '5px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    marginRight: '10px'
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


// New state for showing or hiding the code
const [showCode, setShowCode] = useState(false);

// Function to toggle the visibility of the code block
const toggleCode = () => {
    setShowCode(prevState => !prevState);
}

  useEffect(() => {
    // Fetch the initial counter value when the component mounts
    axios.get('http://localhost:3001/counter').then(response => {
      setCount(response.data.value);
    });
  }, []);

  const increment = () => {
    axios.post('http://localhost:3001/increment').then(response => {
      setCount(response.data.value);
    });
  };

  const decrement = () => {
    axios.post('http://localhost:3001/decrement').then(response => {
      setCount(response.data.value);
    });
  };

  const setCounter = () => {
    axios.post('http://localhost:3001/setCounter', { value: inputValue }).then(response => {
        setCount(response.data.value);
        setInputValue('');  // clear the input box
    });
};



return (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>

      {/* Counter Display */}
      <div style={{ fontSize: '24px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
          <div class="card" style={{ padding: '10px 20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
              <p style={{ marginRight: '10px' }}><i class="fa fa-user"></i></p>
              Count: {count}
          </div>
      </div>

      {/* Increment and Decrement buttons */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
          <button onClick={increment} style={buttonStyle}>Increment</button>
          <button onClick={decrement} style={buttonStyle}>Decrement</button>
      </div>

      {/* Set Counter Manually */}
<div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
    <input 
        type="number" 
        value={inputValue} 
        onChange={(e) => setInputValue(e.target.value)} 
        placeholder="Set Counter Value"
        style={{ fontSize: '20px', textAlign: 'center', width: '60%', padding: '10px' }}
    />
    <button onClick={setCounter} style={buttonStyle}>Set Counter Value</button>
</div>


      {/* Show/Hide Code button */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <button className="code-button" onClick={toggleCode} style={buttonStyleCode}>
              {showCode ? "Hide the Code" : "Show the Code"}
          </button>
      </div>

      {showCode && (
    <div className="code-container" style={{ width: '100%', marginBottom: '20px', marginTop: '20px' }}>
        <pre style={{ padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', background: '#f7f7f7' }}>
            <code>
{`////////////////////////////////////////////// String counter
// Fetch the counter value from Redis
app.get('/counter', (req, res) => {
    client.get('counter', (err, reply) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch counter' });
        res.json({ value: parseInt(reply || '0', 10) });
    });
});

// Increment the counter using Redis INCR
app.post('/increment', (req, res) => {
    client.incr('counter', (err, reply) => {
        if (err) return res.status(500).json({ error: 'Failed to increment counter' });
        res.json({ value: parseInt(reply, 10) });
    });
});

// Decrement the counter using Redis DECR
app.post('/decrement', (req, res) => {
    client.decr('counter', (err, reply) => {
        if (err) return res.status(500).json({ error: 'Failed to decrement counter' });
        res.json({ value: parseInt(reply, 10) });
    });
});

// Set counter value in Redis
app.post('/setCounter', (req, res) => {
    const value = req.body.value;
    client.set('counter', value, (err, reply) => {
        if (err) return res.status(500).json({ error: 'Failed to set counter' });
        res.json({ value: parseInt(value, 10) });
    });
});`}
            </code>
        </pre>
    </div>
)}


  </div>
);

}


export default Counter;
