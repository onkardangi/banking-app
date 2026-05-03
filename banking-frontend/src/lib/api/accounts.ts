import apiClient from './client';
import { Account, AccountSummary, CreateAccountRequest } from '@/types/account';

export const accountsApi = {
    // Create new account
    createAccount: async (data: CreateAccountRequest): Promise<Account> => {
        const response = await apiClient.post<Account>('/accounts', data);
        return response.data;
    },

    // Get all user accounts
    getAllAccounts: async (): Promise<AccountSummary[]> => {
        const response = await apiClient.get<AccountSummary[]>('/accounts');
        return response.data;
    },

    // Get account by ID
    getAccountById: async (accountId: number): Promise<Account> => {
        const response = await apiClient.get<Account>(`/accounts/${accountId}`);
        return response.data;
    },

    // Get account by account number
    getAccountByNumber: async (accountNumber: string): Promise<Account> => {
        const response = await apiClient.get<Account>(`/accounts/number/${accountNumber}`);
        return response.data;
    },

    // Delete account
    deleteAccount: async (accountId: number): Promise<void> => {
        await apiClient.delete(`/accounts/${accountId}`);
    },

    // Update account status
    updateAccountStatus: async (accountId: number, status: string): Promise<Account> => {
        const response = await apiClient.patch<Account>(
            `/accounts/${accountId}/status`,
            null,
            { params: { status } }
        );
        return response.data;
    },
};