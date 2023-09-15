import React, { useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const wrapperStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    marginTop: '20px'
  };
  
  const mapContainerStyle = {
    width: '700px',
    height: '400px',
    marginBottom: '20px'
  };
  
  const infoStyle = {
    backgroundColor: '#f7f7f7',
    padding: '10px 20px',
    textAlign: 'center',
    width: '400px',
    borderTop: '1px solid #ddd',
    borderBottom: '1px solid #ddd'
  };
  
  const buttonStyle = {
    backgroundColor: '#3498db',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '10px'
  };
  
  const defaultCenter = {
    lat: 40.730610,  // Coordinates for New York City
    lng: -73.935242
  };

  const titleStyle = {
    alignSelf: 'flex-start', // This will override the parent's alignItems: 'center'
    width: '100%', // This will make the title take the full width of the parent
    borderBottom: '2px solid #3498db',
    paddingBottom: '10px',
    marginTop: '20px',
    marginLeft: '20px' // This provides some space from the left edge
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

  function GeoSpatialMap() {
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [distances, setDistances] = useState(null);  // Store distances
    const [nearbyItems, setNearbyItems] = useState(null); // Updated state

      // New state for showing or hiding the code
const [showCode, setShowCode] = useState(false);

// Function to toggle the visibility of the code block
const toggleCode = () => {
    setShowCode(prevState => !prevState);
}
  
    const handleMapClick = (event) => {
      setSelectedLocation({
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      });
    };
  
    const handleClearDistances = () => {
        setSelectedLocation(null);
        setDistances(null);
      };
      
      const handleClearNearbyItems = () => {
        setSelectedLocation(null);
        setNearbyItems(null);
      };


    const handleValidateCoordinates = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/storeCoordinates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(selectedLocation),
        });
  
        const data = await response.json();
    // Sort distances from lowest to highest
    const sortedDistances = data.distances.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    setDistances(sortedDistances);

    console.log(data);
  } catch (error) {
    console.error("Error storing coordinates:", error);
  }
};
  
    const handleFetchNearbyItems = async () => {
        try {
          // This is an example URL, change this to the actual endpoint on your server
          // that fetches the GEOSEARCH data.
          const response = await fetch('http://localhost:3001/api/storeCoordinates', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(selectedLocation),
          });
    
          const data = await response.json();
          // Sort distances from lowest to highest
          const sortedDistances = data.distances.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
            setDistances(sortedDistances);            setNearbyItems(data.nearbyItems); // This line is added to set the nearby items
            console.log(data);

            // Filter out 'MyLocation' and sort by distance
            const filteredAndSortedItems = data.nearbyItems
                .filter(item => item[0] !== 'MyLocation')
                .map(item => [item[0], parseFloat(item[1]).toFixed(3)])
                .sort((a, b) => parseFloat(a[1]) - parseFloat(b[1]));
            setNearbyItems(filteredAndSortedItems);

            
        } catch (error) {
            console.error("Error storing coordinates:", error);
        }
          
    };
    return (
        <div>
          <div>
        <h3 style={titleStyle}>Select Your Location</h3>

      <LoadScript googleMapsApiKey="AIzaSyAuNDT3WDS6bqTHVfW563NKP9HIPQ1E2Dc">
        <div style={wrapperStyle}>
        <GoogleMap
    mapContainerStyle={mapContainerStyle}
    center={defaultCenter}
    zoom={10}
    onClick={handleMapClick}
    options={{
      streetViewControl: false,
      fullscreenControl: false,
      mapTypeId: 'hybrid',  // Use 'hybrid' to show satellite view with labels
      mapTypeControl: false  // Disable the map type control buttons
  }}
  
>
    {selectedLocation && <Marker position={selectedLocation} />}
</GoogleMap>

          {selectedLocation && (
            <div style={infoStyle}>
              <p>
                Selected Coordinates: 
                Latitude: <strong>{selectedLocation.lat.toFixed(6)}</strong>, 
                Longitude: <strong>{selectedLocation.lng.toFixed(6)}</strong>
              </p>
              <button style={buttonStyle} onClick={handleValidateCoordinates}>
                Validate Coordinates
              </button>
              <button style={buttonStyle} onClick={handleFetchNearbyItems}>
                Fetch Nearby Locations (≤10km)
              </button>
            </div>
          )}
          
          <h3 style={titleStyle}></h3>

          {distances && (           
        <table className="ranking-table" style={{ width: '100%'}} >
        <thead>
                <tr>
                  <th style={{ fontSize: '20px', width: '70%' }}>Random Places</th>
                  <th style={{ fontSize: '20px', width: '70%' }}>Distance (km)</th>
                </tr>
              </thead>
              <tbody>
                {distances.map((item, index) => (
                  <tr key={index}>
                    <td style={{ fontSize: '20px'}}>{item.location}</td>
                    <td style={{ fontSize: '20px'}}>{item.distance}</td>
                  </tr>
                ))}
              </tbody>
              <button style={buttonStyle} onClick={handleClearDistances}>
                Clear Distances
                </button>
            </table>
            
          )}
          {nearbyItems && (
            <table className="ranking-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ fontSize: '20px', width: '70%' }}>Nearby Points of Interest</th>
                  <th style={{ fontSize: '20px', width: '70%'  }}>Distance (km)</th>
                </tr>
              </thead>
              <tbody>
                {nearbyItems.map((item, index) => (
                  <tr key={index}>
                    <td style={{ fontSize: '20px' }}>{item[0]}</td>
                    <td style={{ fontSize: '20px' }}>{item[1]}</td>
                  </tr>
                ))}
              </tbody>
              <button style={buttonStyle} onClick={handleClearNearbyItems}>
                 Clear Nearby Locations
            </button>
            </table>
          )}
        </div>
      </LoadScript>
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
  

export default React.memo(GeoSpatialMap);