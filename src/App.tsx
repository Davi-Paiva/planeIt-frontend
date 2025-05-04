import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { Home } from './pages/Home/Home';
import { JoinPlan } from './pages/JoinPlan/JoinPlan';
import { CreatePlan } from './pages/CreatePlan/CreatePlan';
import { Auth } from './pages/Auth/Auth';
import { Plan } from './pages/Plan/Plan';
import { Quiz } from './pages/Quiz/Quiz';
import { DecideDestination } from './pages/DecideDestination/DecideDestination';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Auth />} />
        <Route path="/" element={<Home />} />
        <Route path="/join-plan" element={<JoinPlan />} />
        <Route path="/create-plan" element={<CreatePlan />} />
        <Route path="/plan/:code" element={<Plan />} />
        <Route path="/quiz/:code" element={<Quiz />} />
        <Route path="/plan/:code/decide" element={<DecideDestination />} />
      </Routes>
    </Router>
  );
};

export default App; 