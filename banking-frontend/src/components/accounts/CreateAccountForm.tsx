'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { accountsApi } from '@/lib/api/accounts';
import { AccountType } from '@/types/account';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Loader2, CreditCard, TrendingUp } from 'lucide-react';

const createAccountSchema = z.object({
    accountType: z.enum(['SAVINGS', 'CHECKING'], {
        required_error: 'Please select an account type',
    }),
    initialDeposit: z.string().optional(),
});

type CreateAccountFormData = z.infer<typeof createAccountSchema>;

export default function CreateAccountForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<CreateAccountFormData>({
        resolver: zodResolver(createAccountSchema),
        defaultValues: {
            accountType: AccountType.SAVINGS,
            initialDeposit: '0',
        },
    });

    const selectedType = watch('accountType');

    const onSubmit = async (data: CreateAccountFormData) => {
        setIsLoading(true);
        try {
            const initialDeposit = data.initialDeposit
                ? parseFloat(data.initialDeposit)
                : 0;

            await accountsApi.createAccount({
                accountType: data.accountType as AccountType,
                initialDeposit: initialDeposit > 0 ? initialDeposit : undefined,
            });

            toast.success('Account created successfully!');
            router.push('/accounts');
            router.refresh();
        } catch (error: any) {
            console.error('Create account error:', error);
            const errorMessage =
                error.response?.data?.message || 'Failed to create account';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Create New Account</CardTitle>
                <CardDescription>
                    Choose your account type and set an initial deposit
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-6">
                    {/* Account Type Selection */}
                    <div className="space-y-3">
                        <Label>Account Type</Label>
                        <RadioGroup
                            value={selectedType}
                            onValueChange={(value) =>
                                setValue('accountType', value as AccountType)
                            }
                        >
                            <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                                <RadioGroupItem value="SAVINGS" id="savings" />
                                <Label
                                    htmlFor="savings"
                                    className="flex items-center space-x-3 cursor-pointer flex-1"
                                >
                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                    <div>
                                        <p className="font-medium">Savings Account</p>
                                        <p className="text-sm text-muted-foreground">
                                            Earn interest on your balance
                                        </p>
                                    </div>
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                                <RadioGroupItem value="CHECKING" id="checking" />
                                <Label
                                    htmlFor="checking"
                                    className="flex items-center space-x-3 cursor-pointer flex-1"
                                >
                                    <CreditCard className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="font-medium">Checking Account</p>
                                        <p className="text-sm text-muted-foreground">
                                            For everyday transactions
                                        </p>
                                    </div>
                                </Label>
                            </div>
                        </RadioGroup>
                        {errors.accountType && (
                            <p className="text-sm text-red-500">{errors.accountType.message}</p>
                        )}
                    </div>

                    {/* Initial Deposit */}
                    <div className="space-y-2">
                        <Label htmlFor="initialDeposit">
                            Initial Deposit (Optional)
                        </Label>
                        <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
                            <Input
                                id="initialDeposit"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                className="pl-7"
                                {...register('initialDeposit')}
                                disabled={isLoading}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            You can add funds to your account later
                        </p>
                        {errors.initialDeposit && (
                            <p className="text-sm text-red-500">
                                {errors.initialDeposit.message}
                            </p>
                        )}
                    </div>
                </CardContent>

                <CardFooter className="flex gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isLoading}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading} className="flex-1">
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}