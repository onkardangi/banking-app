'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { accountsApi } from '@/lib/api/accounts';
import { Account } from '@/types/account';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Plus, Minus, CreditCard, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import DepositForm from '@/components/transactions/DepositForm';
import WithdrawalForm from '@/components/transactions/WithdrawalForm';
import PaginatedTransactionsList from '@/components/transactions/PaginatedTransactionsList';

function AccountDetailsContent() {
    const params = useParams();
    const router = useRouter();
    const accountId = parseInt(params.id as string);

    const [account, setAccount] = useState<Account | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);

    useEffect(() => {
        fetchAccountDetails();
    }, [accountId]);

    const fetchAccountDetails = async () => {
        try {
            setIsLoading(true);
            const accountData = await accountsApi.getAccountById(accountId);
            setAccount(accountData);
        } catch (error: any) {
            console.error('Failed to fetch account details:', error);
            toast.error('Failed to load account details');
            router.push('/accounts');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTransactionSuccess = () => {
        setShowDepositModal(false);
        setShowWithdrawalModal(false);
        fetchAccountDetails();
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const formatAccountNumber = (accountNumber: string) => {
        return accountNumber.replace(/(\d{4})(?=\d)/g, '$1-');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-green-500';
            case 'INACTIVE':
                return 'bg-gray-500';
            case 'FROZEN':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getAccountIcon = (type: string) => {
        return type === 'SAVINGS' ? <TrendingUp className="h-6 w-6" /> : <CreditCard className="h-6 w-6" />;
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!account) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Button variant="ghost" onClick={() => router.push('/accounts')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Accounts
                    </Button>
                </div>

                {/* Account Info Card */}
                <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                {getAccountIcon(account.accountType)}
                                <div>
                                    <CardTitle className="text-white">
                                        {account.accountType} Account
                                    </CardTitle>
                                    <CardDescription className="text-blue-100">
                                        {formatAccountNumber(account.accountNumber)}
                                    </CardDescription>
                                </div>
                            </div>
                            <Badge className={getStatusColor(account.status)}>
                                {account.status}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <p className="text-blue-100 text-sm">Available Balance</p>
                                <p className="text-4xl font-bold">{formatCurrency(account.balance)}</p>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    onClick={() => setShowDepositModal(true)}
                                    className="flex-1 bg-white text-blue-600 hover:bg-blue-50"
                                    disabled={account.status !== 'ACTIVE'}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Deposit
                                </Button>
                                <Button
                                    onClick={() => setShowWithdrawalModal(true)}
                                    variant="outline"
                                    className="flex-1 border-white text-white hover:bg-blue-600"
                                    disabled={account.status !== 'ACTIVE'}
                                >
                                    <Minus className="mr-2 h-4 w-4" />
                                    Withdraw
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Transaction History */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold">Transaction History</h2>
                    <PaginatedTransactionsList accountId={account.id} pageSize={10} />
                </div>

                {/* Deposit Modal */}
                <Dialog open={showDepositModal} onOpenChange={setShowDepositModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Deposit Money</DialogTitle>
                            <DialogDescription>
                                Add funds to your {account.accountType.toLowerCase()} account
                            </DialogDescription>
                        </DialogHeader>
                        <DepositForm
                            accountId={account.id}
                            currentBalance={account.balance}
                            onSuccess={handleTransactionSuccess}
                            onCancel={() => setShowDepositModal(false)}
                        />
                    </DialogContent>
                </Dialog>

                {/* Withdrawal Modal */}
                <Dialog open={showWithdrawalModal} onOpenChange={setShowWithdrawalModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Withdraw Money</DialogTitle>
                            <DialogDescription>
                                Withdraw funds from your {account.accountType.toLowerCase()} account
                            </DialogDescription>
                        </DialogHeader>
                        <WithdrawalForm
                            accountId={account.id}
                            currentBalance={account.balance}
                            onSuccess={handleTransactionSuccess}
                            onCancel={() => setShowWithdrawalModal(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

export default function AccountDetailsPage() {
    return (
        <ProtectedRoute>
            <AccountDetailsContent />
        </ProtectedRoute>
    );
}