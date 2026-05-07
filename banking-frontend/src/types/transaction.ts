export enum TransactionType {
    DEPOSIT = 'DEPOSIT',
    WITHDRAWAL = 'WITHDRAWAL',
    TRANSFER = 'TRANSFER',
}

export enum TransactionStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
}

export interface Transaction {
    id: number;
    accountId: number;
    type: TransactionType;
    amount: number;
    description?: string;
    balanceAfter: number;
    status: TransactionStatus;
    createdAt: string;
}

export interface DepositRequest {
    accountId: number;
    amount: number;
    description?: string;
}

export interface WithdrawalRequest {
    accountId: number;
    amount: number;
    description?: string;
}

export interface TransferRequest {
    fromAccountId: number;
    toAccountId: number;
    amount: number;
    description?: string;
}

export interface TransferResponse {
    withdrawal: Transaction;
    deposit: Transaction;
    message: string;
}