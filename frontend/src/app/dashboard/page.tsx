'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Coffee,
  LogOut,
  ListChecks,
  LayoutDashboard,
  AlertCircle,
  Clock,
  CheckCircle2,
  TrendingUp,
  Sun,
  Moon,
  Plus,
  ArrowRight,
} from 'lucide-react';
import api from '@/lib/api';
import { useTheme } from '@/components/ThemeProvider';

interface Inquiry {
  id: string;
  customerName: string;
  subject: string;
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
  createdBy?: { name: string };
}

export default function DashboardPage() {
  const router = useRouter();
  const { dark, toggle } = useTheme();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInquiries = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/inquiries');
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
  }, [router]);

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

  // Stats
  const total = inquiries.length;
  const countNew = inquiries.filter((i) => i.status === 'NEW').length;
  const countInProgress = inquiries.filter((i) => i.status === 'IN_PROGRESS').length;
  const countResolved = inquiries.filter((i) => i.status === 'RESOLVED').length;

  // Recent 5
  const recent = inquiries.slice(0, 5);

  // Theme classes
  const bg = dark ? 'bg-zinc-950' : 'bg-gray-50';
  const text = dark ? 'text-zinc-100' : 'text-gray-900';
  const mutedText = dark ? 'text-zinc-400' : 'text-gray-500';
  const subText = dark ? 'text-zinc-500' : 'text-gray-400';
  const sidebarBg = dark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200';
  const cardBg = dark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200';
  const navActive = dark ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-amber-50 text-amber-600 border border-amber-200';
  const navInactive = dark ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100';
  const divider = dark ? 'border-zinc-800' : 'border-gray-100';
  const headerBg = dark ? 'bg-zinc-950/80 border-zinc-800/80' : 'bg-white/80 border-gray-200';

  const getStatusBadge = (status: Inquiry['status']) => {
    switch (status) {
      case 'NEW': return <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-500 border border-sky-500/20 font-medium">New</span>;
      case 'IN_PROGRESS': return <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 font-medium">In Progress</span>;
      case 'RESOLVED': return <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-medium">Resolved</span>;
    }
  };

  return (
    <div className={`min-h-screen ${bg} ${text} flex font-sans`}>
      {/* Sidebar */}
      <aside className={`hidden md:flex flex-col w-56 ${sidebarBg} border-r sticky top-0 h-screen`}>
        <div className={`px-5 py-5 border-b ${divider} flex items-center gap-3`}>
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center flex-shrink-0">
            <Coffee className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm tracking-tight">Coffee Ninja</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <Link
            href="/dashboard"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition ${navActive}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <Link
            href="/inquiries"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition ${navInactive}`}
          >
            <ListChecks className="w-4 h-4" />
            Inquiries
          </Link>
        </nav>

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
        {/* Mobile header */}
        <header className={`md:hidden sticky top-0 z-30 border-b ${headerBg} backdrop-blur-md px-4 py-3 flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <Coffee className="w-5 h-5 text-amber-500" />
            <span className="font-bold text-sm">Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggle} className={`p-2 rounded-lg ${navInactive}`}>
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={handleLogout} className="text-xs text-rose-400 p-2 rounded-lg">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* Greeting */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">
                Hello, {currentUser?.name?.split(' ')[0] || 'there'} 👋
              </h1>
              <p className={`text-sm ${mutedText} mt-1`}>
                Here's what's happening with your customer inquiries.
              </p>
            </div>
            <Link
              href="/inquiries/new"
              className="hidden sm:inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-amber-500/20 active:scale-[0.98] transition whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              New Inquiry
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`${cardBg} border rounded-2xl p-4 space-y-2`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium ${mutedText}`}>Total</span>
                <TrendingUp className={`w-4 h-4 ${subText}`} />
              </div>
              <p className="text-3xl font-bold">{loading ? '–' : total}</p>
              <p className={`text-xs ${subText}`}>All inquiries</p>
            </div>
            <div className={`${cardBg} border rounded-2xl p-4 space-y-2`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium ${mutedText}`}>New</span>
                <AlertCircle className="w-4 h-4 text-sky-500" />
              </div>
              <p className="text-3xl font-bold text-sky-500">{loading ? '–' : countNew}</p>
              <p className={`text-xs ${subText}`}>Awaiting action</p>
            </div>
            <div className={`${cardBg} border rounded-2xl p-4 space-y-2`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium ${mutedText}`}>In Progress</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-3xl font-bold text-amber-500">{loading ? '–' : countInProgress}</p>
              <p className={`text-xs ${subText}`}>Being handled</p>
            </div>
            <div className={`${cardBg} border rounded-2xl p-4 space-y-2`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium ${mutedText}`}>Resolved</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-3xl font-bold text-emerald-500">{loading ? '–' : countResolved}</p>
              <p className={`text-xs ${subText}`}>Completed</p>
            </div>
          </div>

          {/* Recent Inquiries */}
          <div className={`${cardBg} border rounded-2xl overflow-hidden`}>
            <div className={`flex items-center justify-between px-5 py-4 border-b ${divider}`}>
              <h2 className="text-sm font-semibold">Recent Inquiries</h2>
              <Link
                href="/inquiries"
                className={`text-xs font-medium text-amber-500 hover:text-amber-400 flex items-center gap-1 transition`}
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {loading ? (
              <div className={`px-5 py-8 text-center text-sm ${mutedText}`}>Loading...</div>
            ) : recent.length === 0 ? (
              <div className={`px-5 py-8 text-center text-sm ${mutedText}`}>
                No inquiries yet.{' '}
                <Link href="/inquiries/new" className="text-amber-500 hover:underline">
                  Create the first one.
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-inherit">
                {recent.map((inq) => (
                  <div
                    key={inq.id}
                    className={`flex items-center justify-between px-5 py-3 gap-4 hover:${dark ? 'bg-zinc-800/40' : 'bg-gray-50'} transition`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{inq.subject}</p>
                      <p className={`text-xs ${mutedText} truncate`}>{inq.customerName}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {getStatusBadge(inq.status)}
                      <span className={`text-[11px] ${subText} hidden sm:inline`}>
                        {new Date(inq.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Role info box */}
          <div className={`rounded-2xl border ${dark ? 'bg-amber-500/5 border-amber-500/20' : 'bg-amber-50 border-amber-200'} p-4`}>
            <p className={`text-xs font-semibold ${dark ? 'text-amber-400' : 'text-amber-700'} mb-1`}>
              Your Role: {currentUser?.role}
            </p>
            <p className={`text-xs ${dark ? 'text-amber-300/70' : 'text-amber-600/80'}`}>
              {currentUser?.role === 'ADMIN'
                ? 'As an Admin, you can submit inquiries and change their status (New → In Progress → Resolved).'
                : 'As an Agent, you can submit and view inquiries. Only Admins can change inquiry status.'}
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}