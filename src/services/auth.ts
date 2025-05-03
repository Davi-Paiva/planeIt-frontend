import { signup as apiSignup, signin as apiSignin, User } from './api';

/**
 * Sign up a new user
 * @param name User's full name
 * @param email User's email address
 * @param password User's password
 * @returns Promise with the user data
 */
export const signup = async (name: string, email: string, password: string): Promise<User> => {
    try {
        // Call the API signup function
        const response = await apiSignup(name, email, password);
        
        // Store the JWT token in localStorage
        localStorage.setItem('token', response.access_token);
        console.log(response.access_token);
        
        // Store the user data in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(response.user));
        
        return response.user;
    } catch (error) {
        // Rethrow the error for the component to handle
        throw error;
    }
};

export const signin = async (email: string, password: string): Promise<User> => {
    try {
        // Call the API signup function
        const response = await apiSignin(email, password);
        
        // Store the JWT token in localStorage
        localStorage.setItem('token', response.access_token);
        
        // Store the user data in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(response.user));
        
        return response.user;
    } catch (error) {
        // Rethrow the error for the component to handle
        throw error;
    }
};

/**
 * Check if a user is authenticated
 * @returns Boolean indicating if a user is logged in
 */
export const isAuthenticated = (): boolean => {
    return localStorage.getItem('token') !== null;
};

/**
 * Get the current user's data
 * @returns User data or null if not authenticated
 */
export const getCurrentUser = (): User | null => {
    if (!isAuthenticated()) {
        return null;
    }
    
    const userJSON = localStorage.getItem('user');
    return userJSON ? JSON.parse(userJSON) : null;
};

/**
 * Log out the current user
 */
export const logout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}; 