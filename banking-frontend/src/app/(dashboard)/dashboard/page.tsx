'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { Wallet, ArrowLeftRight, FileText, LogOut, Loader2 } from 'lucide-react';
import { transactionsApi, PagedResponse } from '@/lib/api/transactions';
import { Transaction } from '@/types/transaction';
import TransactionsList from '@/components/transactions/TransactionsList';

function DashboardContent() {
    const router = useRouter();
    const { user, clearAuth } = useAuthStore();
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
    const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);

    useEffect(() => {
        fetchRecentTransactions();
    }, []);

    const fetchRecentTransactions = async () => {
        try {
            setIsLoadingTransactions(true);
            // Fetch first page with 5 most recent transactions
            const data = await transactionsApi.getAllUserTransactions(0, 5);
            setRecentTransactions(data.content);
        } catch (error) {
            console.error('Failed to fetch recent transactions:', error);
            // Don't show error toast - transactions are optional on dashboard
        } finally {
            setIsLoadingTransactions(false);
        }
    };

    const handleLogout = () => {
        clearAuth();
        toast.success('Logged out successfully');
        router.push('/login');
    };

    const menuItems = [
        {
            title: 'Accounts',
            description: 'Manage your bank accounts',
            icon: Wallet,
            href: '/accounts',
            available: true,
        },

        {
            title: 'Transfers',
            description: 'Send money to others',
            icon: ArrowLeftRight,
            href: '/transfers',
            available: false,
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">
                            Welcome, {user?.firstName} {user?.lastName}!
                        </h1>
                        <p className="text-muted-foreground">{user?.email}</p>
                    </div>
                    <Button onClick={handleLogout} variant="outline">
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </div>

                {/* User Info Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                        <CardDescription>Your profile details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Name</p>
                                <p className="text-lg">{user?.firstName} {user?.lastName}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Email</p>
                                <p className="text-lg">{user?.email}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Role</p>
                                <p className="text-lg">{user?.role}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">User ID</p>
                                <p className="text-lg">{user?.id}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Menu Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Card
                                key={item.title}
                                className={item.available ? 'cursor-pointer hover:shadow-lg transition-shadow' : 'opacity-60'}
                                onClick={() => item.available && router.push(item.href)}
                            >
                                <CardHeader>
                                    <div className="flex items-center space-x-2">
                                        <Icon className="h-5 w-5" />
                                        <CardTitle>{item.title}</CardTitle>
                                    </div>
                                    <CardDescription>{item.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {item.available ? (
                                        <Button variant="outline" className="w-full">
                                            Open
                                        </Button>
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center">
                                            Coming soon
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Recent Transactions */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Recent Transactions</CardTitle>
                                <CardDescription>Your latest account activity</CardDescription>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push('/accounts')}
                            >
                                View All
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoadingTransactions ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : recentTransactions.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>No transactions yet</p>
                                <p className="text-sm mt-1">Start by creating an account and making a deposit</p>
                            </div>
                        ) : (
                            <TransactionsList transactions={recentTransactions} />
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <DashboardContent />
        </ProtectedRoute>
    );
}