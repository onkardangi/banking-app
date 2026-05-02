import apiClient from './client';

export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    type: string;
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: 'CUSTOMER' | 'ADMIN';
}

export interface UserResponse {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: 'CUSTOMER' | 'ADMIN';
    createdAt: string;
}

export const authApi = {
    register: async (data: RegisterRequest): Promise<UserResponse> => {
        const response = await apiClient.post<UserResponse>('/auth/register', data);
        return response.data;
    },

    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/login', data);
        return response.data;
    },

    getCurrentUser: async (): Promise<UserResponse> => {
        const response = await apiClient.get<UserResponse>('/auth/me');
        return response.data;
    },
};