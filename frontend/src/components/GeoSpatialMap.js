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
    width: '400px',
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
  

function GeoSpatialMap() {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleMapClick = (event) => {
    setSelectedLocation({
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    });
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
      console.log(data);
    } catch (error) {
      console.error("Error storing coordinates:", error);
    }
  };

  return (
    <LoadScript googleMapsApiKey="AIzaSyAuNDT3WDS6bqTHVfW563NKP9HIPQ1E2Dc">
      <div style={wrapperStyle}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={defaultCenter}
          zoom={10}
          onClick={handleMapClick}
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
          </div>
        )}
      </div>
    </LoadScript>
  );
}

export default React.memo(GeoSpatialMap);