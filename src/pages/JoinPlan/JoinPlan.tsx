import { useNavigate } from 'react-router-dom';
import './JoinPlan.css';
import { useState } from 'react';

export const JoinPlan = () => {
    const navigate = useNavigate();

    const [code, setCode] = useState('');
    
    return (
        <div className="join-plan-container">
            <div className="join-plan-header">
                <button className="back-button" onClick={() => navigate('/')}>
                    Back
                </button>
                <h1>Join a Travel Plan</h1>
            </div>
            
            <div className="join-plan-content">
                <div className="plan-code-input">
                    <h2>Enter Plan Code</h2>
                    <input 
                        type="text" 
                        placeholder="Enter the plan code here" 
                        className="plan-code-field"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                    />
                    <button className="join-button" onClick={() => navigate(`/plan/${code}`)}>
                        Join Plan
                    </button>
                </div>
                
            </div>
        </div>
    );
}; 