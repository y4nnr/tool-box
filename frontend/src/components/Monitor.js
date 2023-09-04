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
{`////////////////////////////////////////////// API Caching OPENWEATHER

app.get('/weather', async (req, res) => {
    console.log("Received request for weather data.");
    const city = req.query.city || 'Seattle';

    if (req.query.source === 'true') {
        // Fetch directly from OpenWeather API without checking cache
        try {
            console.log("Fetching data directly from OpenWeather API...");
            let weatherResponse = await axios.get(https://api.openweathermap.org/data/2.5/weather?q={city}&appid={OPENWEATHER_API_KEY});
            res.json(weatherResponse.data);
            return;
        } catch (error) {
            console.error("Failed to fetch from OpenWeather API:", error.message);
            res.status(500).json({ error: "Failed to fetch weather data" });
            return;
        }
    }

    // Check cache first
    redisClient.get(city, async (err, data) => {
        if (err) throw err;

        if (data !== null) {
            console.log("Serving data from cache.");
            res.json(JSON.parse(data));
        } else {
            try {
                console.log("Fetching data from OpenWeather API...");
                let weatherResponse = await axios.get(https://api.openweathermap.org/data/2.5/weather?q={city}&appid={OPENWEATHER_API_KEY});
                redisClient.setex(city, 300, JSON.stringify(weatherResponse.data));
                res.json(weatherResponse.data);
            } catch (error) {
                console.error("Failed to fetch from OpenWeather API:", error.message);
                res.status(500).json({ error: "Failed to fetch weather data" });
            }
        }
    });
});

app.delete('/cache', (req, res) => {
    const city = req.query.city;

    redisClient.del(city, (err, reply) => {
        if (err) {
            console.error("Error clearing cache:", err);
            res.status(500).json({ error: "Failed to clear cache" });
            return;
        }
        
        if (reply === 1) {
            console.log(Cache for {city} cleared);
            res.json({ message: Cache for {city} cleared });
        } else {
            console.log(No cache found for {city});
            res.status(404).json({ message: No cache found for {city} });
        }
    });
});
    //////////////////////////////////////////////;`}
            </code>
        </pre>
    </div>
)}
</div>
</div>
);
}

export default Monitor;
