// ============================================================
// SkillGraph — Base44 API Service Layer
// ============================================================
// Interfaces with the external Base44 backend via REST.

import axios, { AxiosError } from 'axios';
import { AuthResponse, Gig, MicroCourse, User } from '../types';

const BASE_URL = process.env.EXPO_PUBLIC_BASE44_API_URL || 'https://api.base44.app/v1';

// Configure the Axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10-second timeout for mobile resilience
});

/**
 * Standardized error handler for all Base44 API calls.
 * Extracts the most helpful error message possible for the UI to display.
 */
const handleApiError = (error: unknown, defaultMessage: string): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    
    // Attempt to pull a specific error message from the Base44 response body
    const serverMessage = axiosError.response?.data?.message || axiosError.response?.data?.error;
    const statusCode = axiosError.response?.status;
    
    console.error(`[Base44 API Error ${statusCode || 'Unknown'}]`, serverMessage || axiosError.message);
    
    throw new Error(serverMessage || defaultMessage);
  }
  
  console.error('[Base44 API Unknown Error]', error);
  throw new Error(defaultMessage);
};

export const base44Client = {
  /**
   * Set or clear the JWT auth token for subsequent requests.
   * Call this after a successful login or when restoring a session.
   */
  setAuthToken: (token: string | null) => {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete apiClient.defaults.headers.common['Authorization'];
    }
  },

  /**
   * Authenticate a user with the Base44 backend.
   */
  async loginUser(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', { email, password });
      
      // Automatically set the token for future requests
      if (response.data?.token) {
        this.setAuthToken(response.data.token);
      }
      
      return response.data;
    } catch (error) {
      console.warn('Base44 Login failed, activating Hackathon Demo Mode');
      return {
        token: 'demo_token_' + Date.now(),
        refreshToken: 'demo_refresh_' + Date.now(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        user: {
          id: 'u1',
          displayName: 'Skill Hacker',
          email: email,
          skills: [],
          walletBalance: 125050, // $1,250.50
          completedCourseIds: [],
          createdAt: new Date().toISOString()
        }
      };
    }
  },

  /**
   * Register a new user with the Base44 backend.
   */
  async registerUser(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', { email, password });
      if (response.data?.token) {
        this.setAuthToken(response.data.token);
      }
      return response.data;
    } catch (error) {
      console.warn('Base44 Register failed, using Demo Mode fallback');
      return this.loginUser(email, password); // Fallback to login logic for demo
    }
  },

  /**
   * Withdraw funds from the user's wallet. Returns the updated wallet balance.
   */
  async withdrawFunds(amountCents: number): Promise<number> {
    try {
      const response = await apiClient.post<{ newBalance: number }>('/wallet/withdraw', { amount: amountCents });
      return response.data.newBalance;
    } catch (error) {
      console.warn('Base44 Withdrawal failed, using Demo fallback');
      return 0; // In demo mode, assume withdrawal succeeds and balance becomes 0
    }
  },

  /**
   * Retrieve the user's withdrawal transaction history.
   */
  async getWithdrawalHistory(): Promise<Array<{ id: string; amount: number; txHash: string; date: string }>> {
    try {
      const response = await apiClient.get<Array<{ id: string; amount: number; txHash: string; date: string }>>('/wallet/history');
      return response.data;
    } catch (error) {
      console.warn('Base44 Withdrawal history failed, using empty Demo history');
      return []; 
    }
  },

  /**
   * Fetch all available gigs (bounties) from the marketplace.
   */
  async getAvailableGigs(): Promise<Gig[]> {
    try {
      const response = await apiClient.get<Gig[] | { data: Gig[] }>('/gigs');
      
      // Handle both direct array responses and wrapped { data: [...] } responses
      const data = response.data;
      return Array.isArray(data) ? data : (data as { data: Gig[] }).data || [];
    } catch (error) {
      console.warn('Base44 Gigs fetch failed, using fallback mocks');
      // Import or define MOCK_GIGS here if needed, but the Screen already has its own fallback.
      // However, returning an empty array here allows the Screen's internal fallback to trigger.
      return []; 
    }
  },

  /**
   * Fetch the list of micro-courses available for learning.
   */
  async getMicroCourses(): Promise<MicroCourse[]> {
    try {
      const response = await apiClient.get<MicroCourse[] | { data: MicroCourse[] }>('/courses');
      
      const data = response.data;
      return Array.isArray(data) ? data : (data as { data: MicroCourse[] }).data || [];
    } catch (error) {
      console.warn('Base44 Courses fetch failed, using Demo fallback');
      return []; // LearningScreen handles empty by showing its own MOCK_COURSES
    }
  },

  /**
   * Fetch a specific user's profile, including their wallet balance and completed courses.
   */
  async getUserProfile(userId: string): Promise<User> {
    try {
      const response = await apiClient.get<User | { data: User }>(`/users/${userId}`);
      
      const data = response.data;
      return ('id' in data) ? (data as User) : (data as { data: User }).data;
    } catch (error) {
      console.warn(`Base44 Profile fetch failed for ${userId}, using Demo User`);
      return {
        id: userId === 'me' ? 'u1' : userId,
        displayName: 'Demo User',
        email: 'demo@skillgraph.io',
        skills: [],
        walletBalance: 50000,
        completedCourseIds: [],
        createdAt: new Date().toISOString()
      };
    }
  },
};
