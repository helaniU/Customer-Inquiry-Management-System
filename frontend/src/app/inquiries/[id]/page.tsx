'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, Clock, CheckCircle2, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import { useTheme } from '@/components/ThemeProvider';

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

function InquiryDetailContent() {
    const { id } = useParams();
    const router = useRouter();
    const { dark } = useTheme();
    const [currentUser, setCurrentUser] = useState<any>(null);

    const [inquiry, setInquiry] = useState<Inquiry | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusError, setStatusError] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try { setCurrentUser(JSON.parse(storedUser)); } catch {}
        }
    }, []);

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
            const msg = err.response?.data?.message || 'Failed to update status';
            setStatusError(`Status update rejected: ${msg}`);
            fetchInquiry();
        } finally {
            setUpdating(false);
        }
    };

    const isAdmin = currentUser?.role === 'ADMIN';

    // Theme classes
    const bg = dark ? 'min-h-screen bg-zinc-950 text-zinc-100' : 'min-h-screen bg-gray-50 text-gray-900';
    const cardBg = dark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200';
    const mutedText = dark ? 'text-zinc-400' : 'text-gray-500';
    const divider = dark ? 'border-zinc-800' : 'border-gray-100';
    const labelText = dark ? 'text-zinc-500' : 'text-gray-400';
    const descBg = dark ? 'bg-zinc-800/60 border-zinc-700' : 'bg-gray-50 border-gray-100';

    const getStatusBadge = (status: Inquiry['status']) => {
        switch (status) {
            case 'NEW': return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-sky-500/10 text-sky-500 border border-sky-500/20">
                    <AlertCircle className="w-3.5 h-3.5" /> New
                </span>
            );
            case 'IN_PROGRESS': return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    <Clock className="w-3.5 h-3.5" /> In Progress
                </span>
            );
            case 'RESOLVED': return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                </span>
            );
        }
    };

    if (loading) {
        return (
            <div className={`${bg} flex items-center justify-center`}>
                <div className="flex flex-col items-center gap-3">
                    <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
                    <p className={`text-sm ${mutedText}`}>Loading inquiry details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`${bg} flex items-center justify-center p-8`}>
                <div className={`rounded-2xl border ${dark ? 'bg-rose-950/30 border-rose-800' : 'bg-red-50 border-red-200'} p-8 text-center max-w-sm`}>
                    <p className={`font-medium mb-4 ${dark ? 'text-rose-300' : 'text-red-700'}`}>{error}</p>
                    <Link href="/inquiries" className="text-sm text-amber-500 hover:text-amber-400 underline">
                        Return to Inquiries
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={bg}>
            <div className="max-w-3xl mx-auto px-4 py-8">
                <Link href="/inquiries" className={`mb-5 inline-flex items-center gap-1.5 text-sm ${mutedText} hover:text-amber-500 transition`}>
                    <ArrowLeft className="w-4 h-4" />
                    Back to Inquiries
                </Link>

                {statusError && (
                    <div className={`mb-4 rounded-xl border ${dark ? 'bg-amber-950/40 border-amber-800 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'} p-4 text-sm`}>
                        {statusError}
                    </div>
                )}

                <div className={`rounded-2xl border ${cardBg} p-6 shadow-sm space-y-5`}>
                    {/* Header */}
                    <div className={`flex items-start justify-between border-b ${divider} pb-4 gap-4`}>
                        <div>
                            <span className={`text-xs font-semibold uppercase tracking-wider ${labelText}`}>Inquiry Details</span>
                            <h1 className="text-2xl font-bold mt-1">{inquiry?.subject}</h1>
                        </div>
                        {inquiry && getStatusBadge(inquiry.status)}
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className={`text-xs ${labelText} mb-0.5`}>Customer Name</p>
                            <p className="font-medium">{inquiry?.customerName}</p>
                        </div>
                        <div>
                            <p className={`text-xs ${labelText} mb-0.5`}>Contact Info</p>
                            <p className="font-medium">{inquiry?.contactInfo}</p>
                        </div>
                        <div>
                            <p className={`text-xs ${labelText} mb-0.5`}>Recorded By</p>
                            <p className="font-medium">{inquiry?.createdBy?.name}</p>
                        </div>
                        <div>
                            <p className={`text-xs ${labelText} mb-0.5`}>Recorded On</p>
                            <p className="font-medium">
                                {inquiry ? new Date(inquiry.createdAt).toLocaleString() : ''}
                            </p>
                        </div>
                    </div>

                    {/* Description */}
                    <div className={`border-t ${divider} pt-4`}>
                        <p className={`text-xs ${labelText} mb-2`}>Description</p>
                        <p className={`whitespace-pre-wrap text-sm leading-relaxed p-4 rounded-xl border ${descBg}`}>
                            {inquiry?.description}
                        </p>
                    </div>

                    {/* Status Controls – ADMIN only */}
                    <div className={`border-t ${divider} pt-5`}>
                        <h3 className="text-sm font-semibold mb-3">Update Status:</h3>
                        {isAdmin ? (
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => handleStatusChange('IN_PROGRESS')}
                                    disabled={updating || inquiry?.status === 'IN_PROGRESS'}
                                    className="rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/30 px-4 py-2 text-xs font-semibold hover:bg-amber-500/20 disabled:opacity-40 transition"
                                >
                                    Mark In Progress
                                </button>
                                <button
                                    onClick={() => handleStatusChange('RESOLVED')}
                                    disabled={updating || inquiry?.status === 'RESOLVED'}
                                    className="rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 px-4 py-2 text-xs font-semibold hover:bg-emerald-500/20 disabled:opacity-40 transition"
                                >
                                    Mark Resolved
                                </button>
                                <button
                                    onClick={() => handleStatusChange('NEW')}
                                    disabled={updating || inquiry?.status === 'NEW'}
                                    className={`rounded-xl px-4 py-2 text-xs font-semibold border disabled:opacity-40 transition ${dark ? 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'}`}
                                >
                                    Reopen (Set New)
                                </button>
                            </div>
                        ) : (
                            <p className={`text-xs ${mutedText} italic`}>
                                Only admins can change the status of an inquiry.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function InquiryDetailPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-sm text-gray-500">Loading...</div>}>
            <InquiryDetailContent />
        </Suspense>
    );
}