'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, Loader2, Coffee } from 'lucide-react';
import api from '@/lib/api';
import { useTheme } from '@/components/ThemeProvider';

export default function NewInquiryPage() {
    const [customerName, setCustomerName] = useState('');
    const [contactInfo, setContactInfo] = useState('');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [errors, setErrors] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();
    const { dark } = useTheme();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors([]);
        setSubmitting(true);

        try {
            await api.post('/inquiries', {
                customerName,
                contactInfo,
                subject,
                description,
            });
            router.push('/inquiries');
        } catch (err: any) {
            if (err.response?.data?.details) {
                setErrors(err.response.data.details);
            } else {
                setErrors([err.response?.data?.message || 'Failed to submit inquiry']);
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Theme-aware classes
    const bg = dark ? 'bg-zinc-950' : 'bg-gray-50';
    const text = dark ? 'text-zinc-100' : 'text-gray-900';
    const mutedText = dark ? 'text-zinc-400' : 'text-gray-500';
    const cardBg = dark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200';
    const labelText = dark ? 'text-zinc-300' : 'text-gray-700';
    const inputBg = dark
        ? 'bg-zinc-950 border-zinc-700 text-zinc-100 placeholder-zinc-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40'
        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-400/40';
    const backLink = dark ? 'text-zinc-400 hover:text-amber-400' : 'text-gray-500 hover:text-amber-600';
    const cancelBtn = dark
        ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
        : 'border-gray-300 text-gray-700 hover:bg-gray-50';

    return (
        <div className={`min-h-screen ${bg} ${text} font-sans py-8`}>
            <div className="mx-auto max-w-2xl px-4">

                {/* Back link */}
                <Link
                    href="/inquiries"
                    className={`mb-5 inline-flex items-center gap-1.5 text-sm font-medium transition ${backLink}`}
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Inquiries
                </Link>

                {/* Card */}
                <div className={`rounded-2xl border ${cardBg} p-6 shadow-sm space-y-5`}>

                    {/* Header */}
                    <div className="flex items-center gap-3 pb-4 border-b border-inherit">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center flex-shrink-0">
                            <Coffee className="w-4 h-4" />
                        </div>
                        <div>
                            <p className={`text-xs font-semibold uppercase tracking-wider ${mutedText}`}>Customer Inquiry</p>
                            <h1 className="text-lg font-bold">Record New Inquiry</h1>
                        </div>
                    </div>

                    {/* Error banner */}
                    {errors.length > 0 && (
                        <div className="rounded-xl bg-rose-950/40 border border-rose-800/60 p-4 flex gap-3">
                            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-semibold text-rose-300 mb-1">Please correct the following:</p>
                                <ul className="list-disc list-inside text-xs text-rose-300/80 space-y-0.5">
                                    {errors.map((err, i) => (
                                        <li key={i}>{err}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className={`block text-xs font-medium uppercase tracking-wide ${mutedText}`}>
                                    Customer Name <span className="text-rose-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition ${inputBg}`}
                                    placeholder="e.g. Jane Doe"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className={`block text-xs font-medium uppercase tracking-wide ${mutedText}`}>
                                    Contact Information <span className="text-rose-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={contactInfo}
                                    onChange={(e) => setContactInfo(e.target.value)}
                                    className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition ${inputBg}`}
                                    placeholder="Email or phone number"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className={`block text-xs font-medium uppercase tracking-wide ${mutedText}`}>
                                Subject <span className="text-rose-400">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition ${inputBg}`}
                                placeholder="Brief summary of the request"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className={`block text-xs font-medium uppercase tracking-wide ${mutedText}`}>
                                Description <span className="text-rose-400">*</span>
                            </label>
                            <textarea
                                rows={5}
                                required
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition resize-none ${inputBg}`}
                                placeholder="Provide detailed inquiry information..."
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <Link
                                href="/inquiries"
                                className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${cancelBtn}`}
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-5 py-2 text-sm font-semibold text-zinc-950 shadow-md shadow-amber-500/20 active:scale-[0.98] transition disabled:opacity-50 cursor-pointer"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Record Inquiry'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}