import { useNavigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUser, logout } from '../../services/auth';
import { useState, useEffect } from 'react';
import { getUserPlans, formatPlanForDisplay } from '../../services/plans';
import { PlanResponse } from '../../services/api';
import './Home.css';

export const Home = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());
    const [user, setUser] = useState(getCurrentUser());
    const [userPlans, setUserPlans] = useState<PlanResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Update auth state when the component mounts
    useEffect(() => {
        setIsLoggedIn(isAuthenticated());
        setUser(getCurrentUser());
        
        // If user is logged in, fetch their plans
        if (isAuthenticated()) {
            fetchUserPlans();
        }
    }, []);
    
    const fetchUserPlans = async () => {
        try {
            setLoading(true);
            setError(null);
            const plans = await getUserPlans();
            setUserPlans(plans);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load your plans');
        } finally {
            setLoading(false);
        }
    };
    
    const handleLogout = () => {
        logout();
        setIsLoggedIn(false);
        setUser(null);
        setUserPlans([]);
    };

    const renderPlanCard = (plan: PlanResponse) => {
        const formattedPlan = formatPlanForDisplay(plan);
        
        return (
            <div 
                key={plan.id} 
                className="plan-card" 
                onClick={() => navigate(`/plan/${plan.code}`)}
            >
                <div className="plan-card-code">{plan.code}</div>
                <h3 className="plan-card-title">{plan.name || plan.name}</h3>
                <div className="plan-card-dates">{formattedPlan.displayDuration}</div>
                <div className="plan-card-participants">
                    {(plan.users?.length || 0)} participant{(plan.users?.length || 0) !== 1 ? 's' : ''}
                </div>
            </div>
        );
    };
    
    return (
        <div className="home-container">
            <div className="header-actions">
                {isLoggedIn ? (
                    <div className="user-info">
                        <span className="welcome-message">Welcome, {user?.name || 'User'}</span>
                        <button className="logout-button" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                ) : (
                    <button className="login-button" onClick={() => navigate('/login')}>
                        Login
                    </button>
                )}
            </div>
            
            <div className="slogan-container">
                <h2>Plan It</h2>
                <h2>Choose It</h2>
                <h2>Live It</h2>
            </div>
            
            <div className="buttons-container">
                <button className="join-plan-button" onClick={() => {
                    if (isLoggedIn) {
                        navigate('/join-plan');
                    } else {
                        navigate('/login');
                    }
                }}>Join a Travel Plan</button>
                <button className="create-plan-button" onClick={() => {
                    if (isLoggedIn) {
                        navigate('/create-plan');
                    } else {
                        navigate('/login');
                    }
                }}>Create a Travel Plan</button>
            </div>
            
            {isLoggedIn && (
                <div className="my-plans-section">
                    <h2>My Plans</h2>
                    {loading ? (
                        <div className="loading-plans">
                            <div className="loading-spinner"></div>
                            <p>Loading your plans...</p>
                        </div>
                    ) : error ? (
                        <div className="plans-error">
                            <p>{error}</p>
                            <button onClick={fetchUserPlans} className="retry-button">
                                Try Again
                            </button>
                        </div>
                    ) : userPlans.length === 0 ? (
                        <div className="no-plans">
                            <p>You don't have any plans yet.</p>
                            <p>Join or create a plan to get started!</p>
                        </div>
                    ) : (
                        <div className="plans-grid">
                            {userPlans.map(plan => renderPlanCard(plan))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};