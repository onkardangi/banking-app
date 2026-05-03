'use client';

import CreateAccountForm from '@/components/accounts/CreateAccountForm';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

export default function CreateAccountPage() {
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6">
                <div className="max-w-4xl mx-auto">
                    <CreateAccountForm />
                </div>
            </div>
        </ProtectedRoute>
    );
}