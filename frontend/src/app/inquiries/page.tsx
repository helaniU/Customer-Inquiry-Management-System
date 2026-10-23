'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Coffee,
  LogOut,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  X,
  LayoutDashboard,
  ListChecks,
  Sun,
  Moon,
} from 'lucide-react';
import api from '@/lib/api';
import { useTheme } from '@/components/ThemeProvider';

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

export default function InquiriesPage() {
  const router = useRouter();
  const { dark, toggle } = useTheme();
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

  const isAdmin = currentUser?.role === 'ADMIN';

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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-500/10 text-sky-500 border border-sky-500/20">
            <AlertCircle className="w-3.5 h-3.5" />
            New
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            In Progress
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Resolved
          </span>
        );
    }
  };

  // Theme-aware classes
  const bg = dark ? 'bg-zinc-950' : 'bg-gray-50';
  const headerBg = dark ? 'bg-zinc-950/80 border-zinc-800/80' : 'bg-white/80 border-gray-200';
  const text = dark ? 'text-zinc-100' : 'text-gray-900';
  const cardBg = dark ? 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700/80' : 'bg-white border-gray-200 hover:border-gray-300';
  const inputBg = dark ? 'bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500 focus:ring-amber-500/40' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-amber-400/40';
  const filterBg = dark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200';
  const mutedText = dark ? 'text-zinc-400' : 'text-gray-500';
  const subText = dark ? 'text-zinc-500' : 'text-gray-400';
  const divider = dark ? 'border-zinc-800/60' : 'border-gray-100';
  const emptyBg = dark ? 'border-zinc-800 bg-zinc-900/40' : 'border-gray-200 bg-gray-50';
  const modalBg = dark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200';
  const modalInputBg = dark ? 'bg-zinc-950 border-zinc-800 text-white focus:ring-amber-500' : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-amber-400';
  const sidebarBg = dark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200';
  const navActive = dark ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-amber-50 text-amber-600 border border-amber-200';
  const navInactive = dark ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100';

  return (
    <div className={`min-h-screen ${bg} ${text} flex font-sans`}>
      {/* Sidebar */}
      <aside className={`hidden md:flex flex-col w-56 ${sidebarBg} border-r sticky top-0 h-screen`}>
        <div className="px-5 py-5 border-b border-inherit flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center flex-shrink-0">
            <Coffee className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm tracking-tight">Coffee Ninja</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <Link
            href="/dashboard"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition ${navInactive}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <Link
            href="/inquiries"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition ${navActive}`}
          >
            <ListChecks className="w-4 h-4" />
            Inquiries
          </Link>
        </nav>

        {/* User info at bottom */}
        {currentUser && (
          <div className={`px-4 py-4 border-t ${divider} space-y-3`}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {currentUser.name?.[0] || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate">{currentUser.name}</p>
                <p className={`text-[10px] uppercase font-medium ${dark ? 'text-amber-400' : 'text-amber-600'}`}>{currentUser.role}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <button
                onClick={toggle}
                className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg transition ${navInactive}`}
                title="Toggle theme"
              >
                {dark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                {dark ? 'Light' : 'Dark'}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className={`md:hidden sticky top-0 z-30 border-b ${headerBg} backdrop-blur-md px-4 py-3 flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <Coffee className="w-5 h-5 text-amber-500" />
            <span className="font-bold text-sm">Inquiries</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggle} className={`p-2 rounded-lg ${navInactive} text-xs`}>
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={handleLogout} className="text-xs text-rose-400 p-2 rounded-lg">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">All Inquiries</h1>
              <p className={`text-sm ${mutedText} mt-0.5`}>Browse, search and manage customer inquiries.</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-amber-500/20 active:scale-[0.98] transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              New Inquiry
            </button>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className={`w-4 h-4 ${subText} absolute left-3.5 top-1/2 -translate-y-1/2`} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by subject or customer..."
                className={`w-full ${inputBg} border rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 transition`}
              />
            </div>

            <div className={`flex items-center gap-1 ${filterBg} border p-1 rounded-xl text-xs`}>
              {(['', 'NEW', 'IN_PROGRESS', 'RESOLVED'] as const).map((s) => {
                const label = s === '' ? 'All' : s === 'IN_PROGRESS' ? 'In Progress' : s.charAt(0) + s.slice(1).toLowerCase();
                const activeColor = s === '' ? 'bg-amber-500 text-zinc-950' : s === 'NEW' ? 'bg-sky-500 text-white' : s === 'IN_PROGRESS' ? 'bg-amber-500 text-zinc-950' : 'bg-emerald-500 text-white';
                return (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-lg transition font-medium ${statusFilter === s ? activeColor : `${mutedText} hover:${text}`}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Inquiry Cards */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
              <p className={`text-sm ${mutedText}`}>Loading inquiries...</p>
            </div>
          ) : inquiries.length === 0 ? (
            <div className={`text-center py-20 border border-dashed ${emptyBg} rounded-2xl p-8 space-y-3`}>
              <div className={`w-12 h-12 rounded-2xl ${dark ? 'bg-zinc-800 text-zinc-500' : 'bg-gray-100 text-gray-400'} flex items-center justify-center mx-auto`}>
                <Coffee className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold">No inquiries found</h3>
              <p className={`text-xs ${mutedText} max-w-sm mx-auto`}>
                No customer inquiries match your filter. Create one to get started!
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-2 inline-flex items-center gap-1.5 text-xs text-amber-500 hover:text-amber-400 font-semibold"
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
                  className={`${cardBg} border rounded-2xl p-5 flex flex-col justify-between space-y-4 transition shadow-sm`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      {getStatusBadge(inq.status)}
                      <span className={`text-[11px] ${subText}`}>
                        {new Date(inq.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold tracking-tight">{inq.subject}</h3>
                      <p className={`text-xs ${mutedText} mt-1 line-clamp-3 leading-relaxed`}>
                        {inq.description}
                      </p>
                    </div>

                    <div className={`pt-2 border-t ${divider} space-y-1`}>
                      <div className={`text-xs font-medium flex items-center justify-between`}>
                        <span>{inq.customerName}</span>
                        <span className={`${subText} text-[11px]`}>{inq.contactInfo}</span>
                      </div>
                      {inq.createdBy && (
                        <p className={`text-[11px] ${subText}`}>By: {inq.createdBy.name}</p>
                      )}
                    </div>
                  </div>

                  {/* Status Controls – ADMIN only */}
                  <div className={`pt-3 border-t ${divider} flex items-center justify-between text-xs`}>
                    {isAdmin ? (
                      <>
                        <span className={`text-[11px] ${subText}`}>Change Status:</span>
                        <div className="flex gap-1.5">
                          {inq.status === 'NEW' && (
                            <button
                              onClick={() => handleStatusChange(inq.id, 'IN_PROGRESS')}
                              className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/30 transition text-[11px] font-semibold cursor-pointer"
                            >
                              Start
                            </button>
                          )}
                          {inq.status === 'IN_PROGRESS' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(inq.id, 'NEW')}
                                className={`px-2 py-1 rounded-lg ${dark ? 'bg-zinc-800 text-zinc-400 hover:text-white' : 'bg-gray-100 text-gray-500 hover:text-gray-900'} transition text-[11px] cursor-pointer`}
                              >
                                Revert
                              </button>
                              <button
                                onClick={() => handleStatusChange(inq.id, 'RESOLVED')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/30 transition text-[11px] font-semibold cursor-pointer"
                              >
                                Resolve
                              </button>
                            </>
                          )}
                          {inq.status === 'RESOLVED' && (
                            <button
                              onClick={() => handleStatusChange(inq.id, 'IN_PROGRESS')}
                              className={`px-2.5 py-1 rounded-lg ${dark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} transition text-[11px] font-semibold cursor-pointer`}
                            >
                              Reopen
                            </button>
                          )}
                        </div>
                      </>
                    ) : (
                      <span className={`text-[11px] ${subText} italic`}>
                        Only admins can change status
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modal: New Inquiry */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`${modalBg} border w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4`}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Create New Inquiry</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className={`${mutedText} hover:${text} transition cursor-pointer`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 text-xs text-rose-400 bg-rose-950/40 border border-rose-800/60 rounded-xl">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateInquiry} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className={`text-xs ${mutedText}`}>Customer Name</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="e.g. John Doe"
                    className={`w-full ${modalInputBg} border rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 transition`}
                  />
                </div>
                <div className="space-y-1">
                  <label className={`text-xs ${mutedText}`}>Contact Info</label>
                  <input
                    type="text"
                    required
                    value={formData.contactInfo}
                    onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                    placeholder="Email or Phone"
                    className={`w-full ${modalInputBg} border rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 transition`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className={`text-xs ${mutedText}`}>Subject</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Defective Espresso Machine Grinder"
                  className={`w-full ${modalInputBg} border rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 transition`}
                />
              </div>

              <div className="space-y-1">
                <label className={`text-xs ${mutedText}`}>Description</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of the issue..."
                  className={`w-full ${modalInputBg} border rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 transition`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold ${mutedText} hover:${text} transition cursor-pointer`}
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
