import apiClient from './client';
import { Transaction, DepositRequest, WithdrawalRequest, TransferRequest, TransferResponse } from '@/types/transaction';

export interface PagedResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

export const transactionsApi = {
    // Deposit money
    deposit: async (data: DepositRequest): Promise<Transaction> => {
        const response = await apiClient.post<Transaction>('/transactions/deposit', data);
        return response.data;
    },

    // Withdraw money
    withdraw: async (data: WithdrawalRequest): Promise<Transaction> => {
        const response = await apiClient.post<Transaction>('/transactions/withdraw', data);
        return response.data;
    },

    // Get all transactions for an account
    getAccountTransactions: async (accountId: number): Promise<Transaction[]> => {
        const response = await apiClient.get<Transaction[]>(`/transactions/account/${accountId}`);
        return response.data;
    },

    // Get single transaction by ID
    getTransactionById: async (transactionId: number): Promise<Transaction> => {
        const response = await apiClient.get<Transaction>(`/transactions/${transactionId}`);
        return response.data;
    },

    // Get paginated transactions for an account
    getAccountTransactionsPaginated: async (
        accountId: number,
        page: number = 0,
        size: number = 10
    ): Promise<PagedResponse<Transaction>> => {
        const response = await apiClient.get<PagedResponse<Transaction>>(
            `/transactions/account/${accountId}/paginated`,
            { params: { page, size } }
        );
        return response.data;
    },

    // Get all user transactions (for dashboard)
    getAllUserTransactions: async (
        page: number = 0,
        size: number = 10
    ): Promise<PagedResponse<Transaction>> => {
        const response = await apiClient.get<PagedResponse<Transaction>>(
            `/transactions/user/all`,
            { params: { page, size } }
        );
        return response.data;
    },

    // Transfer money between acccounts
    transfer: async (transferRequest : TransferRequest): Promise<TransferResponse> => {
        const response = await apiClient.post(`/transactions/transfer`, transferRequest);
        return response.data;
    }
};