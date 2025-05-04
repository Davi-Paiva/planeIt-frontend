import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { getSuggestions, voteOnDestination } from '../../services/plans';
import { isAuthenticated } from '../../services/auth';
import './DecideDestination.css';

export const DecideDestination = () => {
    const navigate = useNavigate();
    const { code } = useParams<{ code: string }>();
    
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [direction, setDirection] = useState<string | null>(null);
    const [voted, setVoted] = useState<{[key: string]: boolean}>({});
    
    // References for the swipe card
    const cardRef = useRef<HTMLDivElement>(null);
    const initialX = useRef<number | null>(null);
    const currentX = useRef<number>(0);
    
    useEffect(() => {
        // Fetch suggestions
        const fetchSuggestions = async () => {
            // Skip if suggestions are already loaded
            if (suggestions.length > 0) {
                setLoading(false);
                return;
            }
            
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
                
                // Get suggestions from API
                const suggestionsData = await getSuggestions(code);
                setSuggestions(suggestionsData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load suggestions');
            } finally {
                setLoading(false);
            }
        };
        
        fetchSuggestions();
    }, [code, navigate, suggestions.length]);
    
    // Handle card swipe start
    const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
        if (!cardRef.current) return;
        
        // Get initial X position
        initialX.current = 'touches' in e 
            ? e.touches[0].clientX 
            : (e as React.MouseEvent).clientX;
        
        // Add event listeners for move and end
        document.addEventListener('mousemove', handleTouchMove);
        document.addEventListener('mouseup', handleTouchEnd);
        document.addEventListener('touchmove', handleTouchMove);
        document.addEventListener('touchend', handleTouchEnd);
    };
    
    // Handle card swipe movement
    const handleTouchMove = (e: TouchEvent | MouseEvent) => {
        if (initialX.current === null || !cardRef.current) return;
        
        // Calculate how far we've moved
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const diffX = clientX - initialX.current;
        currentX.current = diffX;
        
        // Update card position and rotation
        const rotate = diffX / 10;
        cardRef.current.style.transform = `translateX(${diffX}px) rotate(${rotate}deg)`;
        
        // Determine swipe direction for visual feedback
        if (diffX > 50) {
            setDirection('right');
        } else if (diffX < -50) {
            setDirection('left');
        } else {
            setDirection(null);
        }
    };
    
    // Handle card swipe end
    const handleTouchEnd = () => {
        initialX.current = null;
        
        // Clean up event listeners
        document.removeEventListener('mousemove', handleTouchMove);
        document.removeEventListener('mouseup', handleTouchEnd);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
        
        if (!cardRef.current) return;
        
        // Check if swipe was decisive enough to count as a vote
        if (currentX.current > 100) {
            // Swiped right - Like
            handleVote(true);
        } else if (currentX.current < -100) {
            // Swiped left - Dislike
            handleVote(false);
        } else {
            // Reset card position if swipe wasn't decisive
            cardRef.current.style.transform = '';
            setDirection(null);
        }
        
        currentX.current = 0;
    };
    
    // Handle voting on a destination
    const handleVote = async (liked: boolean) => {
        if (currentIndex >= suggestions.length) return;
        
        const currentSuggestion = suggestions[currentIndex];
        const suggestionId = currentSuggestion.id;
        
        // Skip API call if already voted on this suggestion
        if (voted[suggestionId]) {
            // Just move to next card
            setCurrentIndex(currentIndex + 1);
            setDirection(null);
            if (cardRef.current) {
                cardRef.current.style.transform = '';
            }
            
        }
        
        try {
            // Mark this suggestion as voted immediately to prevent duplicate votes
            setVoted(prev => ({
                ...prev,
                [suggestionId]: true
            }));
            
            // Send vote to backend
            if (liked) {
                await voteOnDestination(code!, currentSuggestion.airport_code);
            }
            
            // Animate the card off screen
            if (cardRef.current) {
                const direction = liked ? 1 : -1;
                cardRef.current.style.transform = `translateX(${direction * window.innerWidth}px) rotate(${direction * 30}deg)`;
            }
            
            // Move to next card after animation
            setTimeout(() => {
                setCurrentIndex(currentIndex + 1);
                setDirection(null);
                if (cardRef.current) {
                    cardRef.current.style.transform = '';
                }
            }, 300);
        } catch (err) {
            // Show error but allow continuing to next card
            const errorMessage = err instanceof Error ? err.message : 'Failed to submit vote';
            console.error('Vote error:', errorMessage);
            
            // Move to next card anyway
            setCurrentIndex(currentIndex + 1);
            setDirection(null);
            if (cardRef.current) {
                cardRef.current.style.transform = '';
            }
        }
    };
    
    // Helper to vote with buttons (alternative to swiping)
    const handleButtonVote = (liked: boolean) => {
        if (cardRef.current) {
            const direction = liked ? 1 : -1;
            cardRef.current.style.transform = `translateX(${direction * 50}px) rotate(${direction * 5}deg)`;
            
            setTimeout(() => {
                handleVote(liked);
            }, 100);
        } else {
            handleVote(liked);
        }
    };
    
    if (loading) {
        return (
            <div className="decide-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading suggestions...</p>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="decide-container">
                <div className="error-container">
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button 
                        className="back-button" 
                        onClick={() => navigate(`/plan/${code}`)}
                    >
                        Back to Plan
                    </button>
                </div>
            </div>
        );
    }
    
    // All cards have been swiped
    if (currentIndex >= suggestions.length) {
        return (
            <div className="decide-container">
                <div className="decide-header">
                    <button className="back-button" onClick={() => navigate(`/plan/${code}`)}>
                        Back to Plan
                    </button>
                    <h1>Voting Complete</h1>
                </div>
                
                <div className="decide-content">
                    <div className="voting-complete">
                        <div className="complete-icon">🎉</div>
                        <h2>Thanks for voting!</h2>
                        <p>You've reviewed all destination suggestions. Your votes have been recorded.</p>
                        
                        <div className="results-preview">
                            <h3>Keep an eye on the results</h3>
                            <p>Once everyone in your group has voted, we'll tally the results and show the most popular destinations.</p>
                        </div>
                        
                        <button 
                            className="back-to-plan-button" 
                            onClick={() => navigate(`/plan/${code}`)}
                        >
                            Return to Plan
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    const currentSuggestion = suggestions[currentIndex];
    
    return (
        <div className="decide-container">
            <div className="decide-header">
                <button className="back-button" onClick={() => navigate(`/plan/${code}`)}>
                    Back to Plan
                </button>
                
            </div>
            <div className="decide-header">
                <h1>Vote on Destinations</h1>
            </div>
            
            <div className="decide-content">
                <div className="destination-intro">
                    <h2>Swipe to vote</h2>
                    <p>Swipe right for destinations you like, left for those you don't. Your group's votes will determine the final results.</p>
                    <div className="swipe-counter">
                        <span>{currentIndex + 1}</span> of <span>{suggestions.length}</span>
                    </div>
                </div>
                
                <div className="swipe-container">
                    <div 
                        className={`swipe-card ${direction === 'right' ? 'like' : ''} ${direction === 'left' ? 'dislike' : ''}`}
                        ref={cardRef}
                        onMouseDown={handleTouchStart}
                        onTouchStart={handleTouchStart}
                    >
                        {direction === 'right' && <div className="like-stamp">LIKE</div>}
                        {direction === 'left' && <div className="dislike-stamp">PASS</div>}
                        
                        <div className="destination-image">
                            {currentSuggestion.image ? (
                                <img 
                                    src={currentSuggestion.image} 
                                    alt={currentSuggestion.name} 
                                />
                            ) : (
                                <div className="placeholder-image">
                                    <span>{currentSuggestion.city.charAt(0).toUpperCase()}</span>
                                </div>
                            )}
                            
                        </div>
                        
                        <div className="destination-info">
                            <div className="destination-header">
                                <h3>{currentSuggestion.name}</h3>
                                {currentSuggestion.country && (
                                    <div className="destination-country">{currentSuggestion.city}, {currentSuggestion.country}</div>
                                )}
                            </div>
                            
                            <p className="destination-description">
                                {currentSuggestion.description || 'No description available.'}
                            </p>

                            {currentSuggestion.price && (
                                <div className="price-tag">
                                    <span className="price-label">Lowest Flight</span>
                                    <span className="price-value">{currentSuggestion.price}€</span>
                                </div>
                            )}
                            
                        </div>
                    </div>
                </div>
                
                <div className="vote-buttons">
                    <button 
                        className="dislike-button" 
                        onClick={() => handleButtonVote(false)}
                    >
                        <span>✕</span>
                    </button>
                    
                    <button 
                        className="like-button" 
                        onClick={() => handleButtonVote(true)}
                    >
                        <span>✓</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DecideDestination; 