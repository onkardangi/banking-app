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
import { Loader2, DollarSign } from 'lucide-react';

const depositSchema = z.object({
    amount: z.string().refine((val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num > 0;
    }, 'Amount must be greater than 0'),
    description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
});

type DepositFormData = z.infer<typeof depositSchema>;

interface DepositFormProps {
    accountId: number;
    currentBalance: number;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function DepositForm({ accountId, currentBalance, onSuccess, onCancel }: DepositFormProps) {
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<DepositFormData>({
        resolver: zodResolver(depositSchema),
    });

    const onSubmit = async (data: DepositFormData) => {
        setIsLoading(true);
        try {
            const amount = parseFloat(data.amount);

            await transactionsApi.deposit({
                accountId,
                amount,
                description: data.description || undefined,
            });

            toast.success(`Successfully deposited $${amount.toFixed(2)}`);
            onSuccess();
        } catch (error: any) {
            console.error('Deposit error:', error);
            const errorMessage = error.response?.data?.message || 'Failed to deposit. Please try again.';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label>Current Balance</Label>
                <div className="text-2xl font-bold text-green-600">
                    ${currentBalance.toFixed(2)}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="amount">Deposit Amount</Label>
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
                        disabled={isLoading}
                    />
                </div>
                {errors.amount && (
                    <p className="text-sm text-red-500">{errors.amount.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                    id="description"
                    placeholder="e.g., Salary deposit, Tax refund..."
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
                <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        'Deposit'
                    )}
                </Button>
            </div>
        </form>
    );
}