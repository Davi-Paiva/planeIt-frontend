import { createPlan as apiCreatePlan, getPlan as apiGetPlan, getUserPlans as apiGetUserPlans, getSuggestions as apiGetSuggestions, voteOnDestination as apiVoteOnDestination, getPodiumResults as apiGetPodiumResults, Plan, PlanResponse, PodiumResult } from './api';

/**
 * Create a new travel plan
 * @param id Optional plan ID (for updating existing plans)
 * @param title Plan title
 * @param description Plan description
 * @param startDate Start date (YYYY-MM-DD format)
 * @param endDate End date (YYYY-MM-DD format)
 * @returns Promise with the created plan data
 */
export const createPlan = async (
    name: string,
    description: string,
    startDate: string,
    endDate: string
): Promise<PlanResponse> => {
    try {
        // Validate inputs
        if (!name) throw new Error('Title is required');
        if (!startDate) throw new Error('Start date is required');
        if (!endDate) throw new Error('End date is required');
        
        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (isNaN(start.getTime())) throw new Error('Invalid start date');
        if (isNaN(end.getTime())) throw new Error('Invalid end date');
        if (start > end) throw new Error('Start date cannot be after end date');
        
        // Create plan object
        const planData: Plan = {
            name,
            description: description || '',
            startDate,
            endDate
        };
        
        // Call API to create plan
        const response = await apiCreatePlan(planData);
        
        return response;
    } catch (error) {
        // Rethrow the error for the component to handle
        throw error;
    }
};

/**
 * Get a travel plan by its code
 * @param code The unique plan code
 * @returns Promise with the plan data
 */
export const getPlan = async (code: string): Promise<PlanResponse> => {
    try {
        if (!code) {
            throw new Error('Plan code is required');
        }
        
        // Call API to get plan
        const response = await apiGetPlan(code);
        
        return response;
    } catch (error) {
        // Rethrow the error for the component to handle
        throw error;
    }
};

/**
 * Get all plans for the current user
 * @returns Promise with an array of the user's plans
 */
export const getUserPlans = async (): Promise<PlanResponse[]> => {
    try {
        // Call API to get user plans
        const response = await apiGetUserPlans();
        return response;
    } catch (error) {
        // Rethrow the error for the component to handle
        throw error;
    }
};

/**
 * Format a PlanResponse object for display
 * @param plan The plan to format
 * @returns Formatted plan with readable dates and participant count
 */
export const formatPlanForDisplay = (plan: PlanResponse) => {
    // Format dates (e.g., "24 Nov 2023")
    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };
    
    return {
        ...plan,
        formattedStartDate: formatDate(plan.startDate),
        formattedEndDate: formatDate(plan.endDate),
        participantCount: plan.users?.length || 0,
        displayDuration: `${formatDate(plan.startDate)} - ${formatDate(plan.endDate)}`,
        creatorName: plan.creator?.name || 'Unknown'
    };
}; 

export const getSuggestions = async (code: string): Promise<any> => {
    try {
        // Call API to get suggestions
        const response = await apiGetSuggestions(code);
        return response;
    } catch (error) {
        // Rethrow the error for the component to handle
        throw error;
    }
};

/**
 * Submit a vote for a destination suggestion
 * @param planCode The plan code
 * @param destinationId The destination ID
 * @param liked Whether the user liked the destination
 * @returns Promise with the vote response
 */
export const voteOnDestination = async (
    planCode: string,
    destinationId: string,
): Promise<any> => {
    try {
        if (!planCode) {
            throw new Error('Plan code is required');
        }
        
        if (!destinationId) {
            throw new Error('Destination ID is required');
        }
        
        // Call API to submit vote
        const response = await apiVoteOnDestination(planCode, destinationId);
        return response;
    } catch (error) {
        // Rethrow the error for the component to handle
        throw error;
    }
};

/**
 * Get the podium results (top voted destinations) for a plan
 * @param code The plan code
 * @returns Promise with the podium results
 */
export const getPodiumResults = async (code: string): Promise<PodiumResult[]> => {
    try {
        if (!code) {
            throw new Error('Plan code is required');
        }
        
        // Call API to get podium results
        const response = await apiGetPodiumResults(code);
        return response;
    } catch (error) {
        // Rethrow the error for the component to handle
        throw error;
    }
};
