'use client';

import { AccountSummary, AccountStatus, AccountType } from '@/types/account';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, DollarSign, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AccountCardProps {
    account: AccountSummary;
}

export default function AccountCard({ account }: AccountCardProps) {
    const router = useRouter();

    const formatAccountNumber = (accountNumber: string) => {
        // Format: 1234-5678-9012-3456
        return accountNumber.replace(/(\d{4})(?=\d)/g, '$1-');
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const getStatusColor = (status: AccountStatus) => {
        switch (status) {
            case AccountStatus.ACTIVE:
                return 'bg-green-500';
            case AccountStatus.INACTIVE:
                return 'bg-gray-500';
            case AccountStatus.FROZEN:
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getAccountIcon = (type: AccountType) => {
        switch (type) {
            case AccountType.SAVINGS:
                return <TrendingUp className="h-5 w-5" />;
            case AccountType.CHECKING:
                return <CreditCard className="h-5 w-5" />;
            default:
                return <CreditCard className="h-5 w-5" />;
        }
    };

    const getAccountTypeLabel = (type: AccountType) => {
        switch (type) {
            case AccountType.SAVINGS:
                return 'Savings Account';
            case AccountType.CHECKING:
                return 'Checking Account';
            default:
                return type;
        }
    };

    return (
        <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push(`/accounts/${account.id}`)}
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                    {getAccountIcon(account.accountType)}
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">
                            {getAccountTypeLabel(account.accountType)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {formatAccountNumber(account.accountNumber)}
                        </p>
                    </div>
                </div>
                <Badge className={getStatusColor(account.status)}>
                    {account.status}
                </Badge>
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div className="text-2xl font-bold">
                        {formatCurrency(account.balance)}
                    </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                    Available Balance
                </p>
            </CardContent>
        </Card>
    );
}