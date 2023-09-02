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

    return (
        <div>
            <h3> Weather for {weather.name}</h3>
            <div style={{ fontSize: '20px' }}> Temperature: </div><div style={{ fontSize: '20px', color: '#007BFF'}}>{kelvinToCelsius(weather.main?.temp).toFixed(2)} °C</div>
            <div style={{ fontSize: '20px' }}>Description:</div><div style={{ fontSize: '20px', color: '#007BFF'}}> {weather.weather && weather.weather[0] && weather.weather[0].description}</div>
            <div style={{ fontSize: '20px'}}>Response Time: </div><div style={{ fontSize: '20px', color: '#007BFF'}}>{responseTime} ms</div>
            <div >
                <select style={{ fontSize: '20px'}} value={city} onChange={e => setCity(e.target.value)}>
                    {cities.map(cityName => (
                        <option key={cityName} value={cityName}>
                            {cityName}
                        </option>
                    ))}
                </select>
                <button onClick={() => fetchWeather(false)}>Get Data from Cache</button>
                <button onClick={() => fetchWeather(true)}>Get Data from Source API</button>
                <button onClick={clearCityCache}>Clear City Cache</button>

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

                            `}
                        </code>
                    </pre>
                </div>
            )}
        </div>
    );
}

export default ApiCaching;
