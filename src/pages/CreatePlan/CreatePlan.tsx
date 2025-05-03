import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPlan } from '../../services/plans';
import './CreatePlan.css';

export const CreatePlan = () => {
    const navigate = useNavigate();
    
    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    
    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        
        try {
            // Call the service to create the plan
            const newPlan = await createPlan(
                title,
                description,
                startDate,
                endDate
            );
            // Navigate to the plan page on success
            navigate(`/plan/${newPlan.code}`);
        } catch (err) {
            // Handle errors
            console.error('Error creating plan:', err);
            setError(err instanceof Error ? err.message : 'Failed to create plan');
            setLoading(false);
        }
    };
    
    return (
        <div className="create-plan-container">
            <div className="create-plan-header">
                <button className="back-button" onClick={() => navigate('/')}>
                    Back
                </button>
                <h1>Create a Travel Plan</h1>
            </div>
            
            <div className="create-plan-content">
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}
                
                <form className="plan-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="planName">Plan Name</label>
                        <input 
                            type="text" 
                            id="planName" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter a name for your travel plan" 
                            className="form-control"
                            required
                            disabled={loading}
                        />
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group half">
                            <label htmlFor="startDate">Start Date</label>
                            <input 
                                type="date" 
                                id="startDate" 
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="form-control"
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group half">
                            <label htmlFor="endDate">End Date</label>
                            <input 
                                type="date" 
                                id="endDate" 
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="form-control"
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea 
                            id="description" 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add some details about your trip" 
                            className="form-control"
                            rows={4}
                            disabled={loading}
                        ></textarea>
                    </div>
                    
                    <button 
                        type="submit" 
                        className={`create-button ${loading ? 'loading' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Creating Plan...' : 'Create Plan'}
                    </button>
                </form>
            </div>
        </div>
    );
}; 