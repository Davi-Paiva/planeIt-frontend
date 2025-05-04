import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { QuizData, QuizPage, QuizAnswer, QuizResults } from '../../types/quiz';
import quizData from '../../data/travelQuiz.json';
import './Quiz.css';
import { submitQuiz as submitQuizApi } from '../../services/quiz';
import { QuizResponse } from '../../services/api';

export const Quiz = () => {
    const navigate = useNavigate();
    const { code } = useParams<{ code: string }>();
    
    // Quiz state
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [answers, setAnswers] = useState<QuizAnswer[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    
    // Intro state
    const [showIntro, setShowIntro] = useState(true);
    const [departureAirport, setDepartureAirport] = useState('');
    const [userSummary, setUserSummary] = useState('');
    // Cast the imported JSON to our TypeScript interface
    const typedQuizData = quizData as QuizData;
    
    // Get the current page
    const currentPage = typedQuizData.pages[currentPageIndex];
    
    // Initialize answers for each page
    useEffect(() => {
        const initialAnswers: QuizAnswer[] = typedQuizData.pages.map(page => ({
            pageId: page.id,
            selectedOptions: []
        }));
        setAnswers(initialAnswers);
    }, []);
    
    // Handle option selection
    const handleOptionSelect = (optionId: string) => {
        const updatedAnswers = [...answers];
        const currentAnswer = updatedAnswers[currentPageIndex];
        
        if (currentPage.type === 'single-choice') {
            // For single choice, replace the selection
            currentAnswer.selectedOptions = [optionId];
        } else {
            // For multi choice, toggle the selection
            const optionIndex = currentAnswer.selectedOptions.indexOf(optionId);
            if (optionIndex === -1) {
                currentAnswer.selectedOptions.push(optionId);
            } else {
                currentAnswer.selectedOptions.splice(optionIndex, 1);
            }
        }
        
        setAnswers(updatedAnswers);
    };
    
    // Check if an option is selected
    const isOptionSelected = (optionId: string) => {
        if (answers.length === 0) return false;
        return answers[currentPageIndex].selectedOptions.includes(optionId);
    };
    
    // Navigate to the next page
    const goToNextPage = () => {
        if (currentPageIndex < typedQuizData.pages.length - 1) {
            setCurrentPageIndex(prevIndex => prevIndex + 1);
        } else {
            submitQuiz();
        }
    };
    
    // Navigate to the previous page
    const goToPreviousPage = () => {
        if (currentPageIndex > 0) {
            setCurrentPageIndex(prevIndex => prevIndex - 1);
        }
    };
    
    // Start quiz after airport selection
    const handleStartQuiz = () => {
        if (departureAirport) {
            setShowIntro(false);
        }
    };
    
    // Submit the quiz
    const submitQuiz = async () => {
        setIsSubmitting(true);
        
        // Create quiz results to submit
        const quizResults: QuizResponse = {
            location: departureAirport,
            answers: answers.map(answer => {
                // Find the page for this answer to get the question text
                const page = typedQuizData.pages.find(p => p.id === answer.pageId);
                
                // For multi-choice, join multiple answers
                const answerValues = answer.selectedOptions.map(optId => {
                    const option = page?.options.find(opt => opt.id === optId);
                    return option ? `${option.id}: ${option.text}` : optId;
                }).join(' | ');
                
                return {
                    // Include both ID and question text
                    question: `${page?.question || ""}`,
                    answer: answerValues
                };
            })
        };
        
        const user_summary = await submitQuizApi(quizResults, code!);
        setUserSummary(user_summary);
        setIsSubmitting(false);
        setIsCompleted(true);
    };
    
    // Progress percentage
    const progressPercentage = ((currentPageIndex + 1) / typedQuizData.pages.length) * 100;
    
    // Determine the appropriate emoji based on summary content
    const getPersonalityEmoji = (summary: string): string => {
        if (!summary) return '🌟';
        
        if (summary.toLowerCase().includes('explorer') || summary.toLowerCase().includes('adventur')) 
            return '🧭';
        if (summary.toLowerCase().includes('relax') || summary.toLowerCase().includes('beach')) 
            return '🏖️';
        if (summary.toLowerCase().includes('culture') || summary.toLowerCase().includes('museum')) 
            return '🏛️';
        if (summary.toLowerCase().includes('foodie') || summary.toLowerCase().includes('culinary')) 
            return '🍽️';
        if (summary.toLowerCase().includes('luxur') || summary.toLowerCase().includes('premium')) 
            return '💎';
        if (summary.toLowerCase().includes('budget') || summary.toLowerCase().includes('saving')) 
            return '💰';
        if (summary.toLowerCase().includes('nature') || summary.toLowerCase().includes('outdoor')) 
            return '🌲';
        if (summary.toLowerCase().includes('social') || summary.toLowerCase().includes('friend')) 
            return '👯';
            
        return '✈️';
    };
    
    // Render the thank you screen after completion
    if (isCompleted) {
        return (
            <div className="quiz-container">
                <div className="quiz-header">
                    <button className="back-button" onClick={() => navigate(`/plan/${code}`)}>
                        Back to Plan
                    </button>
                </div>
                
                <div className="quiz-content">
                    <div className="quiz-completion">
                        <div className="completion-icon">{getPersonalityEmoji(userSummary)}</div>
                        <h2>Your Travel Personality</h2>
                        
                        <div className="personality-container">
                            {userSummary ? (
                                <div className="personality-description" 
                                     dangerouslySetInnerHTML={{ __html: userSummary.replace(/\n/g, '<br/>') }}>
                                </div>
                            ) : (
                                <p>Based on your answers, you're a unique traveler with your own style!</p>
                            )}
                        </div>
                        
                        <div className="completion-message">
                            <p>We'll use this profile to recommend destinations that match your travel style.</p>
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
    
    // Render the introduction page
    if (showIntro) {
        return (
            <div className="quiz-container">
                <div className="quiz-header">
                    <button className="back-button" onClick={() => navigate(`/plan/${code}`)}>
                        Back to Plan
                    </button>
                    <h1>{typedQuizData.title}</h1>
                </div>
                
                <div className="quiz-intro">
                    <h2>Welcome to Your Travel Quiz</h2>
                    <p className="intro-description">
                        We'll ask you a few questions to understand your travel preferences 
                        and help you plan the perfect trip with your group.
                    </p>
                    
                    <div className="airport-selection">
                        <label htmlFor="departureAirport">Where are you coming from?</label>
                        <div className="select-wrapper">
                            <select 
                                id="departureAirport"
                                className="airport-select"
                                value={departureAirport} 
                                onChange={(e) => setDepartureAirport(e.target.value)}
                            >
                                <option value="">Select your departure airport</option>
                                {typedQuizData.airports && typedQuizData.airports.length > 0 ? (
                                    typedQuizData.airports.map(airport => (
                                        <option key={airport.code} value={airport.code}>
                                            {airport.city} ({airport.code})
                                        </option>
                                    ))
                                ) : (
                                    // Fallback options if no airports in quiz data
                                    <>
                                        <option value="BCN">Barcelona (BCN)</option>
                                        <option value="MAD">Madrid (MAD)</option>
                                        <option value="LHR">London Heathrow (LHR)</option>
                                        <option value="CDG">Paris Charles de Gaulle (CDG)</option>
                                        <option value="FRA">Frankfurt (FRA)</option>
                                        <option value="AMS">Amsterdam (AMS)</option>
                                        <option value="FCO">Rome (FCO)</option>
                                        <option value="IST">Istanbul (IST)</option>
                                        <option value="JFK">New York (JFK)</option>
                                        <option value="LAX">Los Angeles (LAX)</option>
                                    </>
                                )}
                            </select>
                            <div className="select-arrow">▼</div>
                        </div>
                        {!departureAirport && <p className="airport-hint">This helps us recommend relevant destinations</p>}
                    </div>

                    <div className="intro-details">
                        <h3>What to expect:</h3>
                        <ul>
                            <li>Questions about your travel style and preferences</li>
                            <li>Questions about your budget constraints</li>
                            <li>Questions about activities you enjoy</li>
                            <li>Your responses will help us recommend destinations</li>
                        </ul>
                    </div>

                    <button 
                        className="start-quiz-button"
                        onClick={handleStartQuiz}
                        disabled={!departureAirport}
                    >
                        Start Quiz
                    </button>
                </div>
            </div>
        );
    }
    
    // Render the regular quiz pages
    return (
        <div className="quiz-container">
            <div className="quiz-header">
                <button className="back-button" onClick={() => navigate(`/plan/${code}`)}>
                    Back to Plan
                </button>
                <h1>{typedQuizData.title}</h1>
            </div>
            
            <div className="quiz-content">
                <div className="quiz-progress">
                    <div className="progress-bar">
                        <div 
                            className="progress-fill" 
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                    <div className="progress-text">
                        Question {currentPageIndex + 1} of {typedQuizData.pages.length}
                    </div>
                </div>
                
                <div className="quiz-page">
                    <h2>{currentPage.title}</h2>
                    <h3 className="quiz-question">{currentPage.question}</h3>
                    <p className="quiz-description">{currentPage.description}</p>
                    
                    <div className="quiz-options">
                        {currentPage.options.map(option => (
                            <div 
                                key={option.id}
                                className={`quiz-option ${isOptionSelected(option.id) ? 'selected' : ''}`}
                                onClick={() => handleOptionSelect(option.id)}
                            >
                                <div className="option-icon">{option.icon}</div>
                                <div className="option-text">{option.text}</div>
                                {isOptionSelected(option.id) && (
                                    <div className="option-selected-icon">✓</div>
                                )}
                            </div>
                        ))}
                    </div>
                    
                    <div className="quiz-navigation">
                        <button 
                            className="prev-button" 
                            onClick={goToPreviousPage}
                            disabled={currentPageIndex === 0}
                        >
                            Previous
                        </button>
                        
                        <button 
                            className="next-button" 
                            onClick={goToNextPage}
                            disabled={isSubmitting || answers[currentPageIndex]?.selectedOptions.length === 0}
                        >
                            {isSubmitting ? (
                                <span className="loading-spinner-small"></span>
                            ) : currentPageIndex < typedQuizData.pages.length - 1 ? (
                                'Next'
                            ) : (
                                'Submit'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}; 