'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { accountsApi } from '@/lib/api/accounts';
import { AccountSummary } from '@/types/account';
import AccountCard from '@/components/accounts/AccountCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, Plus, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

function AccountsContent() {
    const router = useRouter();
    const [accounts, setAccounts] = useState<AccountSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const data = await accountsApi.getAllAccounts();
            setAccounts(data);
        } catch (error: any) {
            console.error('Failed to fetch accounts:', error);
            toast.error('Failed to load accounts');
        } finally {
            setIsLoading(false);
        }
    };

    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">My Accounts</h1>
                            <p className="text-muted-foreground">Manage your bank accounts</p>
                        </div>
                    </div>
                    <Button onClick={() => router.push('/accounts/create')}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Account
                    </Button>
                </div>

                {/* Total Balance Card */}
                <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                    <CardHeader>
                        <CardDescription className="text-blue-100">
                            Total Balance
                        </CardDescription>
                        <CardTitle className="text-4xl font-bold">
                            {formatCurrency(totalBalance)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-2">
                            <Wallet className="h-5 w-5" />
                            <span className="text-sm">
                {accounts.length} {accounts.length === 1 ? 'Account' : 'Accounts'}
              </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Accounts Grid */}
                {accounts.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <Wallet className="h-16 w-16 text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No accounts yet</h3>
                            <p className="text-muted-foreground mb-6 text-center">
                                Create your first account to get started with banking
                            </p>
                            <Button onClick={() => router.push('/accounts/create')}>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Account
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {accounts.map((account) => (
                            <AccountCard key={account.id} account={account} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AccountsPage() {
    return (
        <ProtectedRoute>
            <AccountsContent />
        </ProtectedRoute>
    );
}