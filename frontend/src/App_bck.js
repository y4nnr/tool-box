import React from 'react';
import './App.css';
import './styles.css';
import Counter from './components/Counter';
import CounterSS from './components/CounterSS';
import Monitor from './components/Monitor';
import ApiCaching from './components/ApiCaching';

function App() {
  return (
    
    <div className="main-app-container">

      <h1 className="main-title">Redis Demo</h1>
      <div style={{ width: '100%' }}>
          <hr className="main-separator" />
        </div>
<div className="app-container">
      {/* Main content on the left */}
      <div className="main-content">
        <div className="main-component-section">
          <h1 className="main-component-title">Counter with String</h1>
          <Counter />
        </div>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start' }}>
          <hr className="main-separator" />
        </div>
        <div className="main-component-section">
          <h1 className="main-component-title">Counter with Sorted Set</h1>
          <CounterSS />
        </div>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start' }}>
          <hr className="main-separator" />
        </div>
        <div className="main-component-section">
          <h1 className="main-component-title">API Caching</h1>
          <ApiCaching />
        </div>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start' }}>
          <hr className="main-separator" />
        </div>
      </div>




    </div>
    </div>

  );
}

export default App;
