'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface Inquiry {
    id: string;
    customerName: string;
    contactInfo: string;
    subject: string;
    description: string;
    status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED';
    createdAt: string;
    updatedAt: string;
    createdBy: { name: string; email: string };
}

export default function InquiryDetailPage() {
    const { id } = useParams();
    const router = useRouter();

    const [inquiry, setInquiry] = useState<Inquiry | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusError, setStatusError] = useState('');
    const [updating, setUpdating] = useState(false);

    const fetchInquiry = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get(`/inquiries/${id}`);
            setInquiry(res.data);
        } catch (err: any) {
            if (err.response?.status === 404) {
                setError('Inquiry record not found.');
            } else if (err.response?.status === 403) {
                setError('You are not authorized to view this inquiry.');
            } else {
                setError('Failed to load inquiry details.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchInquiry();
    }, [id]);

    const handleStatusChange = async (newStatus: string) => {
        setStatusError('');
        setUpdating(true);

        try {
            const res = await api.patch(`/inquiries/${id}/status`, { status: newStatus });
            setInquiry(res.data);
        } catch (err: any) {
            // Handles Situation 2: Stale data / invalid status change attempt
            const msg = err.response?.data?.message || 'Failed to update status';
            setStatusError(`Status update rejected: ${msg}`);
            // Re-fetch to synchronize state with server
            fetchInquiry();
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-sm text-gray-500">Loading inquiry details...</div>;
    }

    if (error) {
        return (
            <div className="mx-auto max-w-xl p-8 font-sans">
                <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
                    <p className="text-red-700 font-medium mb-4">{error}</p>
                    <Link href="/dashboard" className="text-sm text-black underline">
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans py-8">
            <div className="mx-auto max-w-3xl px-4">
                <Link href="/dashboard" className="mb-4 inline-block text-sm text-gray-600 hover:underline">
                    &larr; Back to Dashboard
                </Link>

                {statusError && (
                    <div className="mb-4 rounded-md bg-amber-50 p-4 border border-amber-200 text-sm text-amber-800">
                        {statusError}
                    </div>
                )}

                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                        <div>
                            <span className="text-xs font-semibold uppercase text-gray-400">Inquiry Details</span>
                            <h1 className="text-2xl font-bold text-gray-900">{inquiry?.subject}</h1>
                        </div>
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-800">
                            Current: {inquiry?.status}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-4 text-sm">
                        <div>
                            <p className="text-gray-500 text-xs">Customer Name</p>
                            <p className="font-medium text-gray-900">{inquiry?.customerName}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs">Contact Info</p>
                            <p className="font-medium text-gray-900">{inquiry?.contactInfo}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs">Recorded By</p>
                            <p className="font-medium text-gray-900">{inquiry?.createdBy?.name}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs">Recorded On</p>
                            <p className="font-medium text-gray-900">
                                {inquiry ? new Date(inquiry.createdAt).toLocaleString() : ''}
                            </p>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                        <p className="text-gray-500 text-xs mb-1">Description</p>
                        <p className="whitespace-pre-wrap text-sm text-gray-800 bg-gray-50 p-4 rounded-md border border-gray-100">
                            {inquiry?.description}
                        </p>
                    </div>

                    {/* Status Lifecycle Control */}
                    <div className="mt-8 border-t border-gray-200 pt-6">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Update Status Lifecycle:</h3>
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => handleStatusChange('IN_PROGRESS')}
                                disabled={updating || inquiry?.status === 'IN_PROGRESS'}
                                className="rounded-md bg-yellow-600 px-4 py-2 text-xs font-semibold text-white hover:bg-yellow-700 disabled:opacity-40"
                            >
                                Mark In Progress
                            </button>
                            <button
                                onClick={() => handleStatusChange('RESOLVED')}
                                disabled={updating || inquiry?.status === 'RESOLVED'}
                                className="rounded-md bg-green-600 px-4 py-2 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-40"
                            >
                                Mark Resolved
                            </button>
                            <button
                                onClick={() => handleStatusChange('NEW')}
                                disabled={updating || inquiry?.status === 'NEW'}
                                className="rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-40"
                            >
                                Reopen (Set New)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}