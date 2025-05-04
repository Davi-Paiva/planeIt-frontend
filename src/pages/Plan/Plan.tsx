import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getPlan, formatPlanForDisplay, getPodiumResults } from '../../services/plans';
import { PlanResponse, User, PodiumResult } from '../../services/api';
import QRCode from 'react-qr-code';
import './Plan.css';
import { isAuthenticated, getCurrentUser } from '../../services/auth';

export const Plan = () => {
    const navigate = useNavigate();
    const { code } = useParams<{ code: string }>();
    
    const [plan, setPlan] = useState<PlanResponse | null>(null);
    const [formattedPlan, setFormattedPlan] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isQuizCompleted, setIsQuizCompleted] = useState(false);
    const [allQuizzesCompleted, setAllQuizzesCompleted] = useState(false);
    const [hasVoted, setHasVoted] = useState(false);
    const [hasEveryoneVoted, setHasEveryoneVoted] = useState(false);
    const [podiumResults, setPodiumResults] = useState<PodiumResult[]>([]);
    const [loadingPodium, setLoadingPodium] = useState(false);
    
    // Get the full URL for the QR code
    const getQRCodeValue = () => {
        const baseUrl = `${window.location.protocol}//${window.location.host}`;
        return `${baseUrl}/plan/${code}`;
    };

    useEffect(() => {
        // Check if user has completed quiz
        const completed = plan?.users.find((user: User) => user.email === getCurrentUser()?.email)?.is_quiz_completed;
        setIsQuizCompleted(completed || false);
        const voted = plan?.users.find((user: User) => user.email === getCurrentUser()?.email)?.has_voted;
        setHasVoted(voted || false);
        const everyoneVoted = plan?.users.every((user: User) => user.has_voted);
        setHasEveryoneVoted(everyoneVoted || false);
        
        // Check if all participants have completed the quiz
        if (plan?.users && plan.users.length > 0) {
            const allCompleted = plan.users.every(user => user.is_quiz_completed);
            setAllQuizzesCompleted(allCompleted);
        }
        
        // Fetch podium results if everyone has voted
        if (everyoneVoted && plan) {
            fetchPodiumResults();
        }
    }, [plan]);

    // Fetch podium results when everyone has voted
    const fetchPodiumResults = async () => {
        if (!code) return;
        
        try {
            setLoadingPodium(true);
            const results = await getPodiumResults(code);
            setPodiumResults(results);
        } catch (err) {
            console.error('Failed to fetch podium:', err);
        } finally {
            setLoadingPodium(false);
        }
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
    }, [code, navigate]);
    
    // Render the podium with top destinations
    const renderPodium = () => {
        if (loadingPodium) {
            return (
                <div className="podium-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading voting results...</p>
                </div>
            );
        }
        
        if (!podiumResults || podiumResults.length === 0) {
            return (
                <div className="no-podium-results">
                    <p>No voting results available yet</p>
                </div>
            );
        }
        
        return (
            <div className="podium-container">
                <h3 className="podium-title">Top Destinations</h3>
                <div className="podium-results">
                    {podiumResults.slice(0, 3).map((destination, index) => (
                        <div className={`podium-item podium-position-${index + 1}`}>
                            <div className="podium-medal">
                                {index === 0 && '🥇'}
                                {index === 1 && '🥈'}
                                {index === 2 && '🥉'}
                            </div>
                            <div className="podium-image">
                                {destination.image ? (
                                    <img src={destination.image} alt={destination.city} />
                                ) : (
                                    <div className="podium-placeholder-image">
                                        <span>{destination.city?.charAt(0).toUpperCase() || 'D'}</span>
                                    </div>
                                )}
                            </div>
                            <div className="podium-details">
                                <h4>{destination.city}, {destination.country}</h4>
                                <div className="podium-votes">
                                    <span className="votes-count">{destination.likes || 0} votes</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };
    
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
                    const hasCompletedQuiz = participant.is_quiz_completed;
                    
                    return (
                        <div className={`participant ${isCreator ? 'creator' : ''} ${hasCompletedQuiz ? 'quiz-completed' : 'quiz-pending'}`}>
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
                                <div className="participant-status">
                                    {hasCompletedQuiz ? (
                                        <div className="quiz-completed-badge" title="Quiz completed">
                                            <span className="quiz-status">Quiz completed</span>
                                        </div>
                                    ) : (
                                        <div className="quiz-pending-badge" title="Quiz pending">
                                            <span className="quiz-icon">⏳</span>
                                            <span className="quiz-status">Quiz pending</span>
                                        </div>
                                    )}
                                </div>
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
                {!hasEveryoneVoted && (<div className="plan-code-section">
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
                </div>)}
                
                <h1 className="plan-title">{plan.name}</h1>
                
                <div className="plan-dates">
                    {formattedPlan.displayDuration}
                </div>
                
                <div className="plan-description">
                    <h3>Description</h3>
                    <p>{plan.description || 'No description provided'}</p>
                </div>
                
                {/* Show podium if everyone has voted */}
                {hasEveryoneVoted && (
                    <div className="plan-podium-section">
                        <h3 className="podium-title-results">Voting Results</h3>
                        <div className="celebration-message">
                            <span className="celebration-icon">🎉</span>
                            <span>Everyone has voted! Here are the results:</span>
                        </div>
                        {renderPodium()}
                    </div>
                )}
                
                <div className="plan-participants">
                    <h3>Participants ({formattedPlan.participantCount})</h3>
                    
                    {plan.users && plan.users.length > 0 && (
                        <div className="quiz-completion-stats">
                            <div className="completion-progress">
                                <div className="progress-bar">
                                    <div 
                                        className="progress-fill" 
                                        style={{ width: `${(plan.users.filter(u => u.is_quiz_completed).length / plan.users.length) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="progress-text">
                                    <span>{plan.users.filter(u => u.is_quiz_completed).length} of {plan.users.length} completed quiz</span>
                                </div>
                            </div>
                            
                            {allQuizzesCompleted && !hasEveryoneVoted && (
                                <div className="all-quizzes-completed">
                                    <div className="celebration-message">
                                        <span className="celebration-icon">{hasVoted ? "🤔" : "🎉"}</span>
                                        <span>{hasVoted ? "Waiting for others to vote..." : "Everyone has completed the quiz!"}</span>
                                    </div>
                                    <button 
                                        className={hasVoted ? "decide-destination-button-voted decide-destination-button" : "decide-destination-button"}
                                        onClick={() => navigate(`/plan/${plan.code}/decide`)}
                                        disabled={hasVoted}
                                    >
                                        <span className="decide-icon">🗺️</span>
                                        Decide Your Destination
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {renderParticipants()}
                </div>
                
            </div>

            <div className="footer-spacer"></div>
            
            {/* Persistent footer with quiz button - only show if user hasn't completed quiz */}
            { !isQuizCompleted && (
                <div className="quiz-footer">
                    <div className="quiz-footer-content">
                        <button 
                        className="plan-quiz-button" 
                        onClick={() => navigate(`/quiz/${plan.code}`)}
                    >
                        Continue to quiz
                    </button>
                </div>
            </div>
            )}
        </div>
    );
};