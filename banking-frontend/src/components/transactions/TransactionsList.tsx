'use client';

import { Transaction, TransactionType } from '@/types/transaction';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowDownCircle, ArrowUpCircle, ArrowRightLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TransactionsListProps {
    transactions: Transaction[];
}

export default function TransactionsList({ transactions }: TransactionsListProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const getTransactionIcon = (type: TransactionType) => {
        switch (type) {
            case TransactionType.DEPOSIT:
                return <ArrowDownCircle className="h-5 w-5 text-green-600" />;
            case TransactionType.WITHDRAWAL:
                return <ArrowUpCircle className="h-5 w-5 text-red-600" />;
            case TransactionType.TRANSFER:
                return <ArrowRightLeft className="h-5 w-5 text-blue-600" />;
        }
    };

    const getAmountColor = (type: TransactionType) => {
        switch (type) {
            case TransactionType.DEPOSIT:
                return 'text-green-600';
            case TransactionType.WITHDRAWAL:
                return 'text-red-600';
            case TransactionType.TRANSFER:
                return 'text-blue-600';
        }
    };

    const getAmountPrefix = (type: TransactionType) => {
        switch (type) {
            case TransactionType.DEPOSIT:
                return '+';
            case TransactionType.WITHDRAWAL:
                return '-';
            case TransactionType.TRANSFER:
                return '';
        }
    };

    if (transactions.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                    <ArrowRightLeft className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No transactions yet</h3>
                    <p className="text-muted-foreground text-center">
                        Your transaction history will appear here
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-3">
            {transactions.map((transaction) => (
                <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                    {getTransactionIcon(transaction.type)}
                                </div>
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <p className="font-medium">{transaction.type}</p>
                                        <Badge variant="outline" className="text-xs">
                                            {transaction.status}
                                        </Badge>
                                    </div>
                                    {transaction.description && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {transaction.description}
                                        </p>
                                    )}
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`text-xl font-bold ${getAmountColor(transaction.type)}`}>
                                    {getAmountPrefix(transaction.type)}{formatCurrency(transaction.amount)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Balance: {formatCurrency(transaction.balanceAfter)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}