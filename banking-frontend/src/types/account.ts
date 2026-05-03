export enum AccountType {
    SAVINGS = 'SAVINGS',
    CHECKING = 'CHECKING',
}

export enum AccountStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    FROZEN = 'FROZEN',
}

export interface Account {
    id: number;
    accountNumber: string;
    accountType: AccountType;
    balance: number;
    status: AccountStatus;
    userId: number;
    createdAt: string;
    updatedAt: string;
}

export interface AccountSummary {
    id: number;
    accountNumber: string;
    accountType: AccountType;
    balance: number;
    status: AccountStatus;
}

export interface CreateAccountRequest {
    accountType: AccountType;
    initialDeposit?: number;
}