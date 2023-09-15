import React, { useState } from 'react';
import axios from 'axios';


function ApiCaching() {
    const [weather, setWeather] = useState({});
    const [city, setCity] = useState("Paris"); // default to the capital of Russia
    const [responseTime, setResponseTime] = useState(null);

    const cities = [
        "Paris",        // France
        "Ottawa",       // Canada
        "Beijing",      // China
        "New Delhi",    // India
        "Canberra",     // Australia
        "Brasília",     // Brazil
        "Astana",       // Kazakhstan
        "Buenos Aires", // Argentina
        "Algiers",      // Algeria
        "Riyadh"        // Saudi Arabia
    ];

    function kelvinToCelsius(kelvin) {
        return kelvin - 273.15;
    }

// New state for showing or hiding the code
const [showCode, setShowCode] = useState(false);

// Function to toggle the visibility of the code block
const toggleCode = () => {
    setShowCode(prevState => !prevState);
}

    const fetchWeather = async (fromSource = false) => {
        const startTime = new Date().getTime();

        try {
            const response = await axios.get(`http://localhost:3001/weather?city=${city}${fromSource ? '&source=true' : ''}`);
            
            const endTime = new Date().getTime();
            setResponseTime(endTime - startTime);

            setWeather(response.data);
        } catch (error) {
            console.error('Failed to fetch weather:', error);
        }
    };

    const clearCityCache = async () => {
        try {
            await axios.delete(`http://localhost:3001/cache?city=${city}`);
            console.log(`Cache for ${city} cleared`);
        } catch (error) {
            console.error('Failed to clear cache:', error);
        }
    };

    // New styles
    const inputStyle = {
        padding: '10px',
        borderRadius: '5px',
        margin: '0 10px 20px 0',
        fontSize: '18px',
        width: 'calc(50% - 10px)'
    };

    const buttonStyle = {
        padding: '10px 15px',
        borderRadius: '5px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        margin: '10px 5px'
    };

    const titleStyle = {
        borderBottom: '2px solid #3498db',
        paddingBottom: '10px',
        marginTop: '20px'
    };

    const infoStyle = {
        fontSize: '20px',
        display: 'flex',
        alignItems: 'center'
    };

    const dataStyle = {
        fontSize: '20px',
        color: '#007BFF',
        marginLeft: '10px'
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

    return (
        <div>
            <h3 style={titleStyle}>Weather for {weather.name}</h3>
            <div style={infoStyle}>Temperature: <span style={dataStyle}>{kelvinToCelsius(weather.main?.temp).toFixed(2)} °C</span></div>
            <div style={infoStyle}>Description: <span style={dataStyle}>{weather.weather && weather.weather[0] && weather.weather[0].description}</span></div>
            <div style={infoStyle}>Response Time: <span style={dataStyle}>{responseTime} ms</span></div>
            <div>
                <select style={{ ...inputStyle, width: 'auto', fontSize: '20px'}} value={city} onChange={e => setCity(e.target.value)}>
                    {cities.map(cityName => (
                        <option key={cityName} value={cityName}>
                            {cityName}
                        </option>
                    ))}
                </select>
                <button style={buttonStyle} onClick={() => fetchWeather(false)}>Get Data from Cache</button>
                <button style={buttonStyle} onClick={() => fetchWeather(true)}>Get Data from Source API</button>
                <button style={buttonStyle} onClick={clearCityCache}>Clear City Cache</button>
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
);

}

export default ApiCaching;
