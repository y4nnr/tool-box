import React, { useState, useEffect } from 'react';
import axios from 'axios';
function Counter() {
  const [count, setCount] = useState(0);
  const [inputValue, setInputValue] = useState("");
<input type="number" value={inputValue} onChange={e => setInputValue(e.target.value)} />

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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
  
      {/* Counter Display */}
      <div style={{ fontSize: '20px',width: '%', display: 'flex', justifyContent: 'flex-start'}}>
        <div class="card" style={{ flex: 1 }}>
          <p ><i class="fa fa-user"></i></p>
          Count: {count}
        </div>
      </div>
  
      {/* Increment and Decrement buttons */}
      <div style={{ width: '%', display: 'flex', justifyContent: 'flex-start', gap: '10px', marginTop: '10px' }}>
        <button onClick={increment} style={{ flex: 1 }}>Increment</button>
        <button onClick={decrement} style={{ flex: 1 }}>Decrement</button>
      </div>

{/* Set Counter Manually */}
<div style={{ width: '%', display: 'flex', justifyContent: 'flex-start', gap: '10px', marginTop: '10px', fontSize: '60px' }}>
    <input 
        type="number" 
        value={inputValue} 
        onChange={(e) => setInputValue(e.target.value)} 
        placeholder="Set Counter Value"
        style={{ flex: 2, fontSize: '20px', textAlign: 'center' }}
    />
    <button onClick={setCounter} style={{ flex: 1 }}>Set Counter Value</button>
</div>


  
      {/* Show/Hide Code button */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', marginTop: '10px' }}>
        <button className="code-button" onClick={toggleCode} style={{ flex: 1 }}>
          {showCode ? "Hide the Code" : "Show the Code"}
        </button>
      </div>
  
      {showCode && (
        <div className="code-container" style={{ marginTop: '10px',width: '100%' }}>
        <pre>
            <code style={{ marginTop: '10px',width: 'auto', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere'  }}>
                            {`
////////////////////////////////////////////// String counter
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
});


                            `}
                        </code>
                    </pre>
                </div>
            )}
            </div>
);
}


export default Counter;
