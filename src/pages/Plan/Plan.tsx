import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getPlan, formatPlanForDisplay } from '../../services/plans';
import { PlanResponse, User } from '../../services/api';
import QRCode from 'react-qr-code';
import './Plan.css';
import { isAuthenticated } from '../../services/auth';

export const Plan = () => {
    const navigate = useNavigate();
    const { code } = useParams<{ code: string }>();
    
    const [plan, setPlan] = useState<PlanResponse | null>(null);
    const [formattedPlan, setFormattedPlan] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Get the full URL for the QR code
    const getQRCodeValue = () => {
        const baseUrl = `${window.location.protocol}//${window.location.host}`;
        return `${baseUrl}/plan/${code}`;
    };

    useEffect(() => {
        // Fetch plan details using the code
        const fetchPlan = async () => {
            try {
                if (!isAuthenticated()) {
                    navigate('/login');
                    return;
                }
                setLoading(true);
                setError(null);
                
                if (!code) {
                    throw new Error('Plan code is missing');
                }
                
                // Get plan data from API
                const planData = await getPlan(code);
                setPlan(planData);
                
                // Format plan data for display
                const formatted = formatPlanForDisplay(planData);
                setFormattedPlan(formatted);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load plan details');
            } finally {
                setLoading(false);
            }
        };
        
        fetchPlan();
    }, [code]);
    
    // Enhanced participant display section
    const renderParticipants = () => {
        if (!plan?.users || plan.users.length === 0) {
            return (
                <p className="no-participants">No participants have joined yet</p>
            );
        }

        return (
            <div className="participants-list">
                {plan.users.map((participant: User) => {
                    const isCreator = participant.email === plan.creator.email;
                    
                    return (
                        <div className={`participant ${isCreator ? 'creator' : ''}`}>
                            <div className="participant-avatar" 
                                 style={{ backgroundColor: stringToColor(participant.name) }}>
                                {participant.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="participant-info">
                                <div className="participant-name">
                                    {participant.name}
                                    {isCreator && 
                                        <span className="crown-icon" title="Creator"> 👑</span>
                                    }
                                </div>
                                {isCreator && 
                                    <div className="participant-role">Creator</div>
                                }
                                <div className="participant-email" style={{ fontSize: '12px', color: '#666' }}>{participant.email}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    // Generate a color based on the user's name for consistent avatars
    const stringToColor = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        const hue = hash % 360;
        return `hsl(${hue}, 65%, 55%)`;
    };
    
    if (loading) {
        return (
            <div className="plan-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading plan details...</p>
                </div>
            </div>
        );
    }
    
    if (error || !plan || !formattedPlan) {
        return (
            <div className="plan-container">
                <div className="error-container">
                    <h2>Error</h2>
                    <p>{error || 'Unable to load plan'}</p>
                    <button 
                        className="back-button" 
                        onClick={() => navigate('/')}
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="plan-container">
            <div className="plan-header">
                <button className="back-button" onClick={() => navigate('/')}>
                    Back
                </button>
            </div>
            
            <div className="plan-content">
                <div className="plan-code-section">
                    <h3>Share This Plan</h3>
                    
                    <div className="qr-code-container">
                        <QRCode 
                            value={getQRCodeValue()}
                            size={180}
                            className="qr-code"
                        />
                        <p className="qr-instruction">
                            Scan this QR code to join the plan
                        </p>
                    </div>
                    
                    <div className="plan-code-container">
                        <p className="code-label">Or share this code:</p>
                        <div className="plan-code">{plan.code}</div>
                        <p className="code-instruction">Enter this code on the "Join Plan" page</p>
                    </div>
                </div>
                
                <h1 className="plan-title">{plan.name}</h1>
                
                <div className="plan-dates">
                    {formattedPlan.displayDuration}
                </div>
                
                <div className="plan-description">
                    <h3>Description</h3>
                    <p>{plan.description || 'No description provided'}</p>
                </div>
                
                <div className="plan-participants">
                    <h3>Participants ({formattedPlan.participantCount})</h3>
                    {renderParticipants()}
                </div>
            </div>
        </div>
    );
};