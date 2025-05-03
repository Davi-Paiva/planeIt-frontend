// Base API URL for the backend
const API_BASE_URL = 'http://0.0.0.0:8000';

// Interface for user data returned from the API
export interface User {
    id: string;
    name: string;
    email: string;
}

// Interface for the signup response
export interface SignupResponse {
    access_token: string;
    user: User;
}

// Interface for Plan data
export interface Plan {
    id?: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    creator?: User;
    users?: User[];
    code?: string;
}

// Interface for Plan creation response
export interface PlanResponse {
    id: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    creator: User;
    users: User[];
    code: string;
}

// Error handling helper
class ApiError extends Error {
    constructor(message: string, public statusCode?: number) {
        super(message);
        this.name = 'ApiError';
    }
}

// Helper function to get auth token
const getAuthToken = (): string | null => {
    return localStorage.getItem('token');
};

/**
 * Signup function that connects to the backend
 * @param name User's full name
 * @param email User's email address
 * @param password User's password
 * @returns Promise with signup response containing token and user data
 */
export const signup = async (name: string, email: string, password: string): Promise<SignupResponse> => {
    try {
        
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                email,
                password
            })
        });

        // Parse the JSON response
        const data = await response.json();
        
        // Check if the request was successful
        if (!response.ok) {
            throw new ApiError(
                data.detail || data.message || 'Signup failed', 
                response.status
            );
        }
        
        return data as SignupResponse;
    } catch (error) {
        // If it's already an ApiError, rethrow it
        if (error instanceof ApiError) {
            throw error;
        }
        
        // Handle fetch errors (network issues, etc.)
        throw new ApiError(
            (error instanceof Error) ? error.message : 'Network error during signup'
        );
    }
};

export const signin = async (email: string, password: string): Promise<SignupResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new ApiError(
                data.detail || data.message || 'Signin failed', 
                response.status
            );
        }
        
        return data as SignupResponse;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        
        throw new ApiError(
            (error instanceof Error) ? error.message : 'Network error during signin'
        );
    }
};

/**
 * Create a new travel plan
 * @param planData The plan data to create
 * @returns Promise with the created plan data
 */
export const createPlan = async (planData: Plan): Promise<PlanResponse> => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new ApiError('Authentication required', 401);
        }
        console.log(token);
        const response = await fetch(`${API_BASE_URL}/plan`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(planData)
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new ApiError(
                data.detail || data.message || 'Failed to create plan', 
                response.status
            );
        }
        
        return data as PlanResponse;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        
        throw new ApiError(
            (error instanceof Error) ? error.message : 'Network error while creating plan'
        );
    }
};

/**
 * Get plan details by plan code
 * @param code The unique plan code
 * @returns Promise with the plan data
 */
export const getPlan = async (code: string): Promise<PlanResponse> => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new ApiError('Authentication required', 401);
        }

        const response = await fetch(`${API_BASE_URL}/plan/${code}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new ApiError(
                data.detail || data.message || 'Failed to retrieve plan', 
                response.status
            );
        }
        
        return data as PlanResponse;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        
        throw new ApiError(
            (error instanceof Error) ? error.message : 'Network error while retrieving plan'
        );
    }
};

/**
 * Get all plans for the authenticated user
 * @returns Promise with an array of user's plans
 */
export const getUserPlans = async (): Promise<PlanResponse[]> => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new ApiError('Authentication required', 401);
        }

        const response = await fetch(`${API_BASE_URL}/plan/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new ApiError(
                data.detail || data.message || 'Failed to retrieve user plans', 
                response.status
            );
        }
        
        return data as PlanResponse[];
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        
        throw new ApiError(
            (error instanceof Error) ? error.message : 'Network error while retrieving plans'
        );
    }
};