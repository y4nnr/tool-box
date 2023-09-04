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
    backgroundColor: '#4CAF50',
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


  

  function GeoSpatialMap() {
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [distances, setDistances] = useState(null);  // Store distances
    const [nearbyItems, setNearbyItems] = useState(null); // Updated state

  
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
        fullscreenControl: false
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
                  <th style={{ fontSize: '20px', width: '70%' }}>Name</th>
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
                  <th style={{ fontSize: '20px', width: '70%' }}>Name</th>
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
    );
  }
  

export default React.memo(GeoSpatialMap);