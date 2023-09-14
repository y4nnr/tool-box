import React, { useState } from 'react';
import './App.css';
import './styles.css';
import Counter from './components/Counter';
import CounterSS from './components/CounterSS';
import Monitor from './components/Monitor';
import ApiCaching from './components/ApiCaching';
import SeatingMap from './components/SeatingMap';
import Cart from './components/Cart';
import Users from './components/Users';
import Intersection from './components/Intersection';
import { UserProvider } from './components/UserContext';
import GeoSpatialMap from './components/GeoSpatialMap';
import 'leaflet/dist/leaflet.css';



function App() {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [cart, setCart] = useState({});
  const handleSeatsSelected = (seats) => {
    setCart(prevCart => ({ ...prevCart, ...seats }));
};

  return (
    <div className="main-app-container">

      <h1 className="main-title"> Redis use cases</h1>
      <div style={{ width: '100%' }}>
          <hr className="main-separator-top" />
      </div>
      <div className="app-container">
        {/* Main content on the left */}
        <div className="main-content">
        <div className="main-component-section">
            <h1 className="main-component-title">COUNTER</h1>
            <Counter />
          </div>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start' }}>
            <hr className="main-separator" />
          </div>
          <div className="main-component-section">
            <h1 className="main-component-title">LEADERBOARD</h1>
            <CounterSS />
          </div>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start' }}>
            <hr className="main-separator" />
          </div>
          <div className="main-component-section">
            <h1 className="main-component-title">API CACHING</h1>
            <ApiCaching />
          </div>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start' }}>
            <hr className="main-separator" />
          </div>
          <div className="main-component-section">
            <h1 className="main-component-title">SEAT SELECTION</h1>
            <SeatingMap onSeatsSelected={handleSeatsSelected} cart={cart} />
          </div>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start' }}>
            <hr className="main-separator" />
          </div>
          <div className="main-component-section">
            <h1 className="main-component-title">SHOPPING CART</h1>
            <Cart selectedSeats={selectedSeats} onSeatsSelected={handleSeatsSelected} />
          </div>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start' }}>
            <hr className="main-separator" />
          </div>
          <UserProvider>
          <div className="main-component-section">
            <h1 className="main-component-title">USER DIRECTORY</h1>
            <Users />
          </div>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start' }}>
            <hr className="main-separator" />
          </div>
          <div className="main-component-section">
            <h1 className="main-component-title">INTERSECTIONS</h1>
            <Intersection />
          </div>
          </UserProvider>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start' }}>
            <hr className="main-separator" />
          </div>
          <div className="main-component-section">
            <h1 className="main-component-title">GEOSPATIAL</h1>
            <GeoSpatialMap />
          </div>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start' }}>
            <hr className="main-separator" />
          </div>
        </div>
        {/* Monitor on the right */}
        <div className="monitor-sticky">
        <h1 style={{margin: '1px 15px'}} className="main-component-title">MONITOR</h1>
          <Monitor />
        </div>
      </div>
    </div>
  );
}


export default App;