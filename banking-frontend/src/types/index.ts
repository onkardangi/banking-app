export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: 'CUSTOMER' | 'ADMIN';
}

export interface Account {
    id: string;
    accountNumber: string;
    accountType: 'SAVINGS' | 'CHECKING';
    balance: number;
    status: 'ACTIVE' | 'INACTIVE' | 'FROZEN';
    userId: string;
    createdAt: string;
}

export interface Transaction {
    id: string;
    accountId: string;
    type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
    amount: number;
    description?: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    timestamp: string;
}