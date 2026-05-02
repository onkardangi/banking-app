'use client';

import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

function DashboardContent() {
    const router = useRouter();
    const { user, clearAuth } = useAuthStore();

    const handleLogout = () => {
        clearAuth();
        toast.success('Logged out successfully');
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6">
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

                {/* Coming Soon Cards */}
                <div className="grid md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Accounts</CardTitle>
                            <CardDescription>Manage your bank accounts</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Coming in Milestone 3</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Transactions</CardTitle>
                            <CardDescription>View transaction history</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Coming in Milestone 4</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Transfers</CardTitle>
                            <CardDescription>Send money to others</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Coming in Milestone 5</p>
                        </CardContent>
                    </Card>
                </div>
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