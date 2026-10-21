'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Coffee,
  LogOut,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
  ShieldCheck,
  RefreshCw,
  X
} from 'lucide-react';
import api from '@/lib/api';

interface Inquiry {
  id: string;
  customerName: string;
  contactInfo: string;
  subject: string;
  description: string;
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED';
  createdById: string;
  createdBy?: { id: string; name: string; email: string };
  assignedTo?: { id: string; name: string; email: string } | null;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    customerName: '',
    contactInfo: '',
    subject: '',
    description: '',
  });

  const fetchInquiries = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await api.get('/inquiries', { params });
      setInquiries(res.data);
    } catch (err: any) {
      console.error('Failed to load inquiries', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm, router]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token) {
      router.push('/login');
      return;
    }

    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error(e);
      }
    }

    fetchInquiries();
  }, [fetchInquiries, router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleStatusChange = async (inquiryId: string, nextStatus: string) => {
    try {
      await api.patch(`/inquiries/${inquiryId}/status`, { status: nextStatus });
      fetchInquiries();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Could not update status';
      alert(msg);
    }
  };

  const handleCreateInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    try {
      setSubmitting(true);
      await api.post('/inquiries', formData);
      setFormData({ customerName: '', contactInfo: '', subject: '', description: '' });
      setIsModalOpen(false);
      fetchInquiries();
    } catch (err: any) {
      const details = err.response?.data?.details?.join(', ') || err.response?.data?.message || 'Failed to create inquiry';
      setFormError(details);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: Inquiry['status']) => {
    switch (status) {
      case 'NEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <AlertCircle className="w-3.5 h-3.5" />
            New
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            In Progress
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Resolved
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Coffee Ninja
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                Inquiries
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {currentUser && (
            <div className="flex items-center gap-2 text-sm text-zinc-300 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">
                {currentUser.name?.[0] || 'U'}
              </div>
              <span className="font-medium text-white">{currentUser.name}</span>
              <span className="text-xs uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-amber-400 font-semibold text-[10px]">
                {currentUser.role}
              </span>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-rose-400 bg-zinc-900 hover:bg-rose-950/30 border border-zinc-800 hover:border-rose-900 px-3 py-2 rounded-xl transition cursor-pointer"
            title="Log out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by subject or customer name..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          {/* Filters & Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-xl text-xs">
              <button
                onClick={() => setStatusFilter('')}
                className={`px-3 py-1.5 rounded-lg transition font-medium ${
                  statusFilter === '' ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('NEW')}
                className={`px-3 py-1.5 rounded-lg transition font-medium ${
                  statusFilter === 'NEW' ? 'bg-sky-500 text-zinc-950' : 'text-zinc-400 hover:text-white'
                }`}
              >
                New
              </button>
              <button
                onClick={() => setStatusFilter('IN_PROGRESS')}
                className={`px-3 py-1.5 rounded-lg transition font-medium ${
                  statusFilter === 'IN_PROGRESS' ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400 hover:text-white'
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => setStatusFilter('RESOLVED')}
                className={`px-3 py-1.5 rounded-lg transition font-medium ${
                  statusFilter === 'RESOLVED' ? 'bg-emerald-500 text-zinc-950' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Resolved
              </button>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 active:scale-[0.98] transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              New Inquiry
            </button>
          </div>
        </div>

        {/* Inquiries Grid / List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
            <p className="text-sm">Loading inquiries...</p>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/40 p-8 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 text-zinc-500 flex items-center justify-center mx-auto">
              <Coffee className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-zinc-300">No inquiries found</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              There are currently no customer inquiries matching your filter. Create one to get started!
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-2 inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Inquiry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inquiries.map((inq) => (
              <div
                key={inq.id}
                className="bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700/80 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    {getStatusBadge(inq.status)}
                    <span className="text-[11px] text-zinc-500">
                      {new Date(inq.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">{inq.subject}</h3>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-3 leading-relaxed">
                      {inq.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-zinc-800/60 space-y-1">
                    <div className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                      <span>{inq.customerName}</span>
                      <span className="text-zinc-500 text-[11px]">{inq.contactInfo}</span>
                    </div>
                  </div>
                </div>

                {/* Status Transitions Controls */}
                <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-zinc-500">Change Status:</span>
                  <div className="flex gap-1.5">
                    {inq.status === 'NEW' && (
                      <button
                        onClick={() => handleStatusChange(inq.id, 'IN_PROGRESS')}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 transition text-[11px] font-semibold cursor-pointer"
                      >
                        Start Progress
                      </button>
                    )}
                    {inq.status === 'IN_PROGRESS' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(inq.id, 'NEW')}
                          className="px-2 py-1 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition text-[11px] cursor-pointer"
                        >
                          Mark New
                        </button>
                        <button
                          onClick={() => handleStatusChange(inq.id, 'RESOLVED')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition text-[11px] font-semibold cursor-pointer"
                        >
                          Resolve
                        </button>
                      </>
                    )}
                    {inq.status === 'RESOLVED' && (
                      <button
                        onClick={() => handleStatusChange(inq.id, 'IN_PROGRESS')}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition text-[11px] font-semibold cursor-pointer"
                      >
                        Reopen
                      </button>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </main>

      {/* Modal: New Inquiry */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Create New Inquiry</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 text-xs text-rose-300 bg-rose-950/40 border border-rose-800/60 rounded-xl">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateInquiry} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="e.g. John Doe"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400">Contact Info</label>
                  <input
                    type="text"
                    required
                    value={formData.contactInfo}
                    onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                    placeholder="Email or Phone"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Subject</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Defective Espresso Machine Grinder"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Description</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of the issue..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-zinc-950 transition disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Creating...' : 'Submit Inquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}