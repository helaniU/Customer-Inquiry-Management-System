'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

export default function NewInquiryPage() {
    const [customerName, setCustomerName] = useState('');
    const [contactInfo, setContactInfo] = useState('');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [errors, setErrors] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

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
            router.push('/dashboard');
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

    return (
        <div className="min-h-screen bg-gray-50 font-sans py-8">
            <div className="mx-auto max-w-2xl px-4">
                <Link href="/dashboard" className="mb-4 inline-block text-sm text-gray-600 hover:underline">
                    &larr; Back to Dashboard
                </Link>

                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h1 className="mb-6 text-xl font-bold text-gray-900">Record New Customer Inquiry</h1>

                    {errors.length > 0 && (
                        <div className="mb-6 rounded-md bg-red-50 p-4 border border-red-200">
                            <h3 className="text-sm font-semibold text-red-800">Please correct the following:</h3>
                            <ul className="mt-2 list-inside list-disc text-sm text-red-700">
                                {errors.map((err, i) => (
                                    <li key={i}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Customer Name *</label>
                            <input
                                type="text"
                                required
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                                placeholder="e.g. Jane Doe"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Contact Information *</label>
                            <input
                                type="text"
                                required
                                value={contactInfo}
                                onChange={(e) => setContactInfo(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                                placeholder="Email or phone number"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Subject *</label>
                            <input
                                type="text"
                                required
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                                placeholder="Brief summary of request"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description *</label>
                            <textarea
                                rows={4}
                                required
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                                placeholder="Provide detailed inquiry information..."
                            />
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <Link
                                href="/dashboard"
                                className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                            >
                                {submitting ? 'Saving...' : 'Record Inquiry'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}