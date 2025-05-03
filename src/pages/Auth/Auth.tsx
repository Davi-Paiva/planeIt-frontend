import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup, signin, isAuthenticated, getCurrentUser } from '../../services/auth';
import './Auth.css';

export const Auth = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        
        // Basic validation
        if (!email || !password || (!isLogin && !name)) {
            setError('Please fill out all required fields');
            setLoading(false);
            return;
        }
        
        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            setLoading(false);
            return;
        }
        
        // Password strength validation
        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            setLoading(false);
            return;
        }
        
        try {
            if (isLogin) {
                // Handle real login
                await signin(email, password);
                navigate('/');
            } else {
                // Handle real signup
                await signup(name, email, password);
                navigate('/');
            }
        } catch (err) {
            console.error('Auth error:', err);
            
            // Extract the error message
            let errorMessage = 'Authentication failed';
            if (err instanceof Error) {
                errorMessage = err.message;
            }
            
            // Try to provide a more user-friendly message
            if (errorMessage.includes('Network Error') || errorMessage.includes('Failed to fetch')) {
                errorMessage = 'Could not connect to the server. Please check your internet connection.';
            } else if (errorMessage.includes('401') || errorMessage.includes('403')) {
                errorMessage = 'Invalid email or password';
            } else if (errorMessage.includes('409') || errorMessage.includes('exists')) {
                errorMessage = 'An account with this email already exists';
            } else if (errorMessage.includes('parse')) {
                errorMessage = 'Server error: Invalid response from server';
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };
    
    const toggleMode = () => {
        setIsLogin(!isLogin);
        // Clear form when switching modes
        setEmail('');
        setPassword('');
        setName('');
        setError(null);
    };
    
    // Check if user is already logged in
    if (isAuthenticated()) {
        const user = getCurrentUser();
        console.log('User already logged in:', user);
        navigate('/');
        return null;
    }
    
    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-logo">
                    <h1>PlaneIt</h1>
                </div>
                
                <h2 className="auth-title">{isLogin ? 'Login' : 'Create Account'}</h2>
                
                {error && <div className="error-message">{error}</div>}
                
                <form className="auth-form" onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input 
                                type="text" 
                                id="name" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your full name" 
                                className="form-control"
                                required
                                disabled={loading}
                            />
                        </div>
                    )}
                    
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input 
                            type="email" 
                            id="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email" 
                            className="form-control"
                            required
                            disabled={loading}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input 
                            type="password" 
                            id="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password" 
                            className="form-control"
                            required
                            disabled={loading}
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className={`auth-button ${loading ? 'loading' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
                    </button>
                </form>
                
                <div className="auth-toggle">
                    <p>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button 
                            className="toggle-button" 
                            onClick={toggleMode}
                            disabled={loading}
                        >
                            {isLogin ? 'Sign Up' : 'Login'}
                        </button>
                    </p>
                </div>
                
                {isLogin && (
                    <div className="forgot-password">
                        <a href="#">Forgot Password?</a>
                    </div>
                )}
            </div>
        </div>
    );
}; 