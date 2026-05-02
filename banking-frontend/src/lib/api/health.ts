import apiClient from "@/lib/api/client";

export interface HealthResponse {
    status: string;
    message: string;
}

export const checkHealth = async (): Promise<HealthResponse> => {
    const response = await apiClient.get<HealthResponse>('/health');
    return response.data;
}