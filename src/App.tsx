import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { Home } from './pages/Home/Home';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/join-plan" element={<div>Join Plan Page</div>} />
        <Route path="/create-plan" element={<div>Create Plan Page</div>} />
      </Routes>
    </Router>
  );
};

export default App; 