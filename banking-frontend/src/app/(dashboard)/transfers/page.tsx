'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight, Plus } from 'lucide-react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import TransferForm from '@/components/transactions/TransferForm';

function TransfersContent() {
    const router = useRouter();
    const [showTransferModal, setShowTransferModal] = useState(false);

    const handleTransferSuccess = () => {
        setShowTransferModal(false);
        // Optionally redirect to accounts page to see updated balances
        router.push('/accounts');
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Transfers</h1>
                        <p className="text-muted-foreground">Transfer money between your accounts</p>
                    </div>
                    <Button onClick={() => setShowTransferModal(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Transfer
                    </Button>
                </div>

                {/* Info Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <ArrowLeftRight className="h-5 w-5" />
                            <CardTitle>Internal Transfers</CardTitle>
                        </div>
                        <CardDescription>
                            Transfer funds instantly between your accounts
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-4 border rounded-lg">
                                <h3 className="font-semibold mb-2">✓ Instant Transfer</h3>
                                <p className="text-sm text-muted-foreground">
                                    Funds are transferred immediately between your accounts
                                </p>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <h3 className="font-semibold mb-2">✓ No Fees</h3>
                                <p className="text-sm text-muted-foreground">
                                    Internal transfers between your accounts are completely free
                                </p>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <h3 className="font-semibold mb-2">✓ Transaction History</h3>
                                <p className="text-sm text-muted-foreground">
                                    All transfers are recorded in both account histories
                                </p>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <h3 className="font-semibold mb-2">✓ Secure</h3>
                                <p className="text-sm text-muted-foreground">
                                    Transfers only between your verified accounts
                                </p>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button
                                onClick={() => setShowTransferModal(true)}
                                size="lg"
                                className="w-full md:w-auto"
                            >
                                <ArrowLeftRight className="mr-2 h-4 w-4" />
                                Make a Transfer
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Transfer Modal */}
                <Dialog open={showTransferModal} onOpenChange={setShowTransferModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Transfer Money</DialogTitle>
                            <DialogDescription>
                                Transfer funds between your accounts instantly
                            </DialogDescription>
                        </DialogHeader>
                        <TransferForm
                            onSuccess={handleTransferSuccess}
                            onCancel={() => setShowTransferModal(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

export default function TransfersPage() {
    return (
        <ProtectedRoute>
            <TransfersContent />
        </ProtectedRoute>
    );
}