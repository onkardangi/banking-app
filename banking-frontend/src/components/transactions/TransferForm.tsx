'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { transactionsApi } from '@/lib/api/transactions';
import { accountsApi } from '@/lib/api/accounts';
import { Account } from '@/types/account';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, DollarSign, AlertTriangle, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const transferSchema = z.object({
    fromAccountId: z.string().min(1, 'Please select source account'),
    toAccountId: z.string().min(1, 'Please select destination account'),
    amount: z.string().refine((val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num > 0;
    }, 'Amount must be greater than 0'),
    description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
}).refine((data) => data.fromAccountId !== data.toAccountId, {
    message: "Cannot transfer to the same account",
    path: ['toAccountId'],
});

type TransferFormData = z.infer<typeof transferSchema>;

interface TransferFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export default function TransferForm({ onSuccess, onCancel }: TransferFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loadingAccounts, setLoadingAccounts] = useState(true);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<TransferFormData>({
        resolver: zodResolver(transferSchema),
        defaultValues: {
            fromAccountId: '',
            toAccountId: '',
            amount: '',
            description: '',
        },
    });

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            setLoadingAccounts(true);
            const data = await accountsApi.getUserAccounts();
            // Only show active accounts
            const activeAccounts = data.filter(acc => acc.status === 'ACTIVE');
            setAccounts(activeAccounts);
        } catch (error) {
            console.error('Failed to fetch accounts:', error);
            toast.error('Failed to load accounts');
        } finally {
            setLoadingAccounts(false);
        }
    };

    const fromAccountId = watch('fromAccountId');
    const toAccountId = watch('toAccountId');
    const amount = watch('amount');

    // Get selected accounts
    const fromAccount = accounts.find(acc => acc.id.toString() === fromAccountId);
    const toAccount = accounts.find(acc => acc.id.toString() === toAccountId);

    // Calculate remaining balance
    const transferAmount = amount ? parseFloat(amount) : 0;
    const remainingBalance = fromAccount ? fromAccount.balance - transferAmount : 0;
    const isInsufficientFunds = fromAccount ? transferAmount > fromAccount.balance : false;

    // Filter accounts for "To" dropdown (exclude selected "From" account)
    const toAccounts = accounts.filter(acc => acc.id.toString() !== fromAccountId);

    const onSubmit = async (data: TransferFormData) => {
        const transferAmount = parseFloat(data.amount);

        if (!fromAccount) {
            toast.error('Please select a source account');
            return;
        }

        if (transferAmount > fromAccount.balance) {
            toast.error('Insufficient funds');
            return;
        }

        setIsLoading(true);
        try {
            await transactionsApi.transfer({
                fromAccountId: parseInt(data.fromAccountId),
                toAccountId: parseInt(data.toAccountId),
                amount: transferAmount,
                description: data.description || undefined,
            });

            toast.success(`Successfully transferred $${transferAmount.toFixed(2)}`);
            onSuccess();
        } catch (error: any) {
            console.error('Transfer error:', error);
            const errorMessage = error.response?.data?.message || 'Failed to transfer. Please try again.';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (loadingAccounts) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (accounts.length < 2) {
        return (
            <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-yellow-500" />
                <p className="text-lg font-semibold mb-2">Need More Accounts</p>
                <p className="text-muted-foreground">
                    You need at least 2 active accounts to make a transfer.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* From Account */}
            <div className="space-y-2">
                <Label htmlFor="fromAccountId">From Account</Label>
                <Select
                    value={fromAccountId}
                    onValueChange={(value) => {
                        setValue('fromAccountId', value);
                        // Reset "To" account if it's the same as new "From" account
                        if (value === toAccountId) {
                            setValue('toAccountId', '');
                        }
                    }}
                    disabled={isLoading}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select source account" />
                    </SelectTrigger>
                    <SelectContent>
                        {accounts.map((account) => (
                            <SelectItem key={account.id} value={account.id.toString()}>
                                {account.accountType} - ${account.balance.toFixed(2)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.fromAccountId && (
                    <p className="text-sm text-red-500">{errors.fromAccountId.message}</p>
                )}
            </div>

            {/* Arrow Indicator */}
            {fromAccountId && toAccountId && (
                <div className="flex justify-center">
                    <ArrowRight className="h-6 w-6 text-muted-foreground" />
                </div>
            )}

            {/* To Account */}
            <div className="space-y-2">
                <Label htmlFor="toAccountId">To Account</Label>
                <Select
                    value={toAccountId}
                    onValueChange={(value) => setValue('toAccountId', value)}
                    disabled={isLoading || !fromAccountId}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select destination account" />
                    </SelectTrigger>
                    <SelectContent>
                        {toAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.id.toString()}>
                                {account.accountType} - ${account.balance.toFixed(2)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.toAccountId && (
                    <p className="text-sm text-red-500">{errors.toAccountId.message}</p>
                )}
            </div>

            {/* Amount */}
            <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.00"
                        className="pl-9"
                        {...register('amount')}
                        disabled={isLoading || !fromAccountId}
                    />
                </div>
                {errors.amount && (
                    <p className="text-sm text-red-500">{errors.amount.message}</p>
                )}
            </div>

            {/* Balance Info */}
            {fromAccount && transferAmount > 0 && (
                <div className="space-y-2">
                    {isInsufficientFunds ? (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                Insufficient funds. Available: ${fromAccount.balance.toFixed(2)}
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <div className="p-3 bg-muted rounded-lg space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Current Balance:</span>
                                <span className="font-semibold">${fromAccount.balance.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Transfer Amount:</span>
                                <span className="font-semibold text-red-600">-${transferAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm pt-1 border-t">
                                <span className="text-muted-foreground">Remaining Balance:</span>
                                <span className="font-semibold">${remainingBalance.toFixed(2)}</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Description */}
            <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                    id="description"
                    placeholder="e.g., Monthly savings transfer"
                    rows={3}
                    {...register('description')}
                    disabled={isLoading}
                />
                {errors.description && (
                    <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="flex-1"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={isLoading || isInsufficientFunds || !fromAccountId || !toAccountId}
                    className="flex-1"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        'Transfer'
                    )}
                </Button>
            </div>
        </form>
    );
}