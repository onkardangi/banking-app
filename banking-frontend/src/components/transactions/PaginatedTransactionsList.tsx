'use client';

import { useState, useEffect } from 'react';
import { Transaction } from '@/types/transaction';
import { PagedResponse, transactionsApi } from '@/lib/api/transactions';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import TransactionsList from './TransactionsList';
import { toast } from 'sonner';

interface PaginatedTransactionsListProps {
    accountId: number;
    pageSize?: number;
}

export default function PaginatedTransactionsList({
                                                      accountId,
                                                      pageSize = 10
                                                  }: PaginatedTransactionsListProps) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        fetchTransactions();
    }, [accountId, currentPage]);

    const fetchTransactions = async () => {
        try {
            setIsLoading(true);
            const data = await transactionsApi.getAccountTransactionsPaginated(accountId, currentPage, pageSize);
            setTransactions(data.content);
            setTotalPages(data.totalPages);
            setTotalElements(data.totalElements);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
            toast.error('Failed to load transactions');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    if (isLoading && currentPage === 0) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <TransactionsList transactions={transactions} />

            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-muted-foreground">
                        Showing {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} transactions
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePreviousPage}
                            disabled={currentPage === 0 || isLoading}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                        </Button>
                        <div className="flex items-center px-3 text-sm">
                            Page {currentPage + 1} of {totalPages}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNextPage}
                            disabled={currentPage >= totalPages - 1 || isLoading}
                        >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}