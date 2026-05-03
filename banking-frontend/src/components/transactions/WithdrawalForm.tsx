'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { transactionsApi } from '@/lib/api/transactions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, DollarSign, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const withdrawalSchema = z.object({
    amount: z.string().refine((val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num > 0;
    }, 'Amount must be greater than 0'),
    description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
});

type WithdrawalFormData = z.infer<typeof withdrawalSchema>;

interface WithdrawalFormProps {
    accountId: number;
    currentBalance: number;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function WithdrawalForm({ accountId, currentBalance, onSuccess, onCancel }: WithdrawalFormProps) {
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<WithdrawalFormData>({
        resolver: zodResolver(withdrawalSchema),
    });

    const amount = watch('amount');
    const requestedAmount = amount ? parseFloat(amount) : 0;
    const remainingBalance = currentBalance - requestedAmount;
    const isInsufficientFunds = requestedAmount > currentBalance;

    const onSubmit = async (data: WithdrawalFormData) => {
        const withdrawAmount = parseFloat(data.amount);

        if (withdrawAmount > currentBalance) {
            toast.error('Insufficient funds');
            return;
        }

        setIsLoading(true);
        try {
            await transactionsApi.withdraw({
                accountId,
                amount: withdrawAmount,
                description: data.description || undefined,
            });

            toast.success(`Successfully withdrew $${withdrawAmount.toFixed(2)}`);
            onSuccess();
        } catch (error: any) {
            console.error('Withdrawal error:', error);
            const errorMessage = error.response?.data?.message || 'Failed to withdraw. Please try again.';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label>Available Balance</Label>
                <div className="text-2xl font-bold text-green-600">
                    ${currentBalance.toFixed(2)}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="amount">Withdrawal Amount</Label>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={currentBalance}
                        placeholder="0.00"
                        className="pl-9"
                        {...register('amount')}
                        disabled={isLoading}
                    />
                </div>
                {errors.amount && (
                    <p className="text-sm text-red-500">{errors.amount.message}</p>
                )}
            </div>

            {requestedAmount > 0 && (
                <div className="space-y-2">
                    {isInsufficientFunds ? (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                Insufficient funds. You cannot withdraw more than your available balance.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <div className="p-3 bg-muted rounded-lg">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Remaining Balance:</span>
                                <span className="font-semibold">
                  ${remainingBalance.toFixed(2)}
                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                    id="description"
                    placeholder="e.g., ATM withdrawal, Bill payment..."
                    rows={3}
                    {...register('description')}
                    disabled={isLoading}
                />
                {errors.description && (
                    <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
            </div>

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
                    disabled={isLoading || isInsufficientFunds}
                    className="flex-1"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        'Withdraw'
                    )}
                </Button>
            </div>
        </form>
    );
}