import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Users, DollarSign, Target, TrendingUp, Search, Filter,
  MoreHorizontal, CheckCircle, XCircle, AlertTriangle,
  UserCheck, UserX, Trash2, Eye, Flag, RefreshCw,
  ArrowUpRight, Activity, Award, Zap, Clock
} from 'lucide-react';
import {
  useUsers, useSetUserActive, useDeleteUser,
  useDonations, useReports, useResolveReport,
  useAdminStats, useCreatorStats
} from '../hooks/useApi';
import { useAuthStore } from '../store/auth.store';
import { Badge, PageLoader, EmptyState, Card, Avatar, ProgressBar } from '../components/ui';
import toast from 'react-hot-toast';

// ── Helpers ───────────────────────────────────
function fmtCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function roleBadge(role: string) {
  const map: Record<string, 'danger' | 'purple' | 'info'> = { ADMIN: 'danger', CREATOR: 'purple', DONOR: 'info' };
  return map[role] ?? 'default' as never;
}

// ════════════════════════════════════════════
// USERS PAGE
// ════════════════════════════════════════════
export function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const setActive = useSetUserActive();
  const deleteUser = useDeleteUser();
  const { user: me } = useAuthStore();

  const { data, isLoading } = useUsers({ page, limit: 20, search: search || undefined, role: role || undefined });
  const users = (data?.data ?? []) as Record<string, unknown>[];
  const meta = data?.meta;

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await setActive.mutateAsync({ id, isActive: !isActive });
      toast.success(`User ${isActive ? 'deactivated' : 'activated'}`);
    } catch { toast.error('Failed to update user'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this user?')) return;
    try {
      await deleteUser.mutateAsync(id);
      toast.success('User deleted');
    } catch { toast.error('Failed to delete user'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold">User Management</h2>
          <p className="text-sm mt-0.5">{meta?.total ?? 0} registered users</p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name or email…"
              className="pl-9 pr-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 w-56"
            />
          </div>
          <select
            value={role} onChange={e => { setRole(e.target.value); setPage(1); }}
            className="px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-300"
          >
            {[['', 'All roles'], ['ADMIN', 'Admin'], ['CREATOR', 'Creator'], ['DONOR', 'Donor']].map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? <PageLoader /> : users.length === 0 ? (
          <EmptyState icon={<Users size={36} />} title="No users found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="bg-slate-50/50 border-b">
                {['User', 'Roles', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold uppercase tracking-wider px-5 py-3.5">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const roles = (u.roles as string[]) ?? [];
                  const isActive = u.isActive as boolean;
                  const uid = u.id as string;
                  return (
                    <tr key={uid} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={`${u.firstName} ${u.lastName}`} src={u.avatarUrl as string | null} />
                          <div>
                            <p className="text-sm font-medium">{u.firstName as string} {u.lastName as string}</p>
                            <p className="text-xs">{u.email as string}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap gap-1.5">
                          {roles.map(r => <Badge key={r} variant={roleBadge(r)}>{r}</Badge>)}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`flex items-center gap-1.5 text-xs font-medium ${isActive ? 'text-emerald-600' : ""}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs">{new Date(u.createdAt as string).toLocaleDateString()}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggleActive(uid, isActive)}
                            className={`p-1.5 rounded-lg transition-colors ${isActive ? 'text-slate-500 hover:text-amber-600 hover:bg-amber-50' : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'}`}
                            title={isActive ? 'Deactivate' : 'Activate'}
                          >
                            {isActive ? <UserX size={13} /> : <UserCheck size={13} />}
                          </button>
                          {uid !== me?.id && (
                            <button onClick={() => handleDelete(uid)} className="p-1.5 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t">
            <p className="text-xs">Page {meta.page} of {meta.totalPages}</p>
            <div className="flex gap-1.5">
              <button disabled={!meta.hasPrev} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-xs border rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors">Prev</button>
              <button disabled={!meta.hasNext} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-xs border rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors">Next</button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════
// DONATIONS PAGE
// ════════════════════════════════════════════
export function AdminDonationsPage() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useDonations({ page, limit: 25, status: status || undefined });
  const donations = (data?.data ?? []) as Record<string, unknown>[];
  const meta = data?.meta;

  const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
    COMPLETED: 'success', PENDING: 'warning', FAILED: 'danger', REFUNDED: 'info',
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Donations</h2>
          <p className="text-sm mt-0.5">{meta?.total ?? 0} transactions</p>
        </div>
        <div className="flex gap-2">
          {['', 'COMPLETED', 'PENDING', 'FAILED', 'REFUNDED'].map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${status === s ? 'bg-indigo-600 text-white' : 'bg-white border hover:bg-slate-50'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? <PageLoader /> : donations.length === 0 ? (
          <EmptyState icon={<DollarSign size={36} />} title="No donations found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="bg-slate-50/50 border-b">
                {['Donor', 'Campaign', 'Amount', 'Reward', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold uppercase tracking-wider px-5 py-3.5">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {donations.map((d) => {
                  const donor = d.donor as { user?: { firstName?: string; lastName?: string } } | null;
                  const campaign = d.campaign as { title?: string; slug?: string } | null;
                  const reward = d.reward as { title?: string } | null;
                  const payment = d.payment as { provider?: string } | null;
                  return (
                    <tr key={d.id as string} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <Avatar name={d.isAnonymous ? 'Anon' : `${donor?.user?.firstName ?? 'U'} ${donor?.user?.lastName ?? ''}`} size="sm" />
                          <div>
                            <p className="text-xs font-medium text-slate-800">
                              {d.isAnonymous ? 'Anonymous' : `${donor?.user?.firstName} ${donor?.user?.lastName}`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {campaign?.slug ? (
                          <Link to={`/campaigns/${campaign.slug}`} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium max-w-[150px] block truncate">
                            {campaign.title}
                          </Link>
                        ) : <span className="text-xs">—</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-bold">{fmtCurrency(Number(d.amount))}</p>
                        <p className="text-[10px]">{d.currency as string} · {payment?.provider}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        {reward ? <span className="text-xs text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">{reward.title}</span> : <span className="text-xs">—</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={statusVariant[d.status as string] ?? 'default'}>{d.status as string}</Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs">{new Date(d.createdAt as string).toLocaleDateString()}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t">
            <p className="text-xs">Page {meta.page} of {meta.totalPages} · {meta.total} total</p>
            <div className="flex gap-1.5">
              <button disabled={!meta.hasPrev} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-xs border rounded-lg disabled:opacity-40 hover:bg-slate-50">Prev</button>
              <button disabled={!meta.hasNext} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-xs border rounded-lg disabled:opacity-40 hover:bg-slate-50">Next</button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════
// REPORTS PAGE
// ════════════════════════════════════════════
export function AdminReportsPage() {
  const [status, setStatus] = useState('PENDING');
  const resolveReport = useResolveReport();
  const { data, isLoading } = useReports({ status: status || undefined, page: 1, limit: 30 });
  const reports = (data?.data ?? []) as Record<string, unknown>[];

  const handleResolve = async (id: string, action: 'RESOLVED' | 'DISMISSED') => {
    try {
      await resolveReport.mutateAsync({ id, status: action });
      toast.success(`Report ${action.toLowerCase()}`);
    } catch { toast.error('Failed to update report'); }
  };

  const reasonColor: Record<string, string> = {
    SPAM: 'bg-orange-50 text-orange-700', FRAUD: 'bg-red-50 text-red-700',
    INAPPROPRIATE_CONTENT: 'bg-pink-50 text-pink-700', MISLEADING: 'bg-amber-50 text-amber-700',
    COPYRIGHT: 'bg-purple-50 text-purple-700', OTHER: 'bg-slate-100',
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Reports</h2>
          <p className="text-sm mt-0.5">Content moderation queue</p>
        </div>
        <div className="flex gap-2">
          {['PENDING', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED', ''].map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${status === s ? 'bg-indigo-600 text-white' : 'bg-white border hover:bg-slate-50'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? <PageLoader /> : reports.length === 0 ? (
          <Card><EmptyState icon={<Flag size={36} />} title="No reports" description="Nothing in the moderation queue" /></Card>
        ) : reports.map((r) => {
          const reporter = r.reporter as { firstName?: string; lastName?: string; email?: string };
          const campaign = r.campaign as { title?: string; slug?: string } | null;
          const comment = r.comment as { content?: string } | null;
          const isPending = r.status === 'PENDING' || r.status === 'UNDER_REVIEW';

          return (
            <Card key={r.id as string} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${reasonColor[r.reason as string] ?? 'bg-slate-100'}`}>
                      {(r.reason as string).replace('_', ' ')}
                    </span>
                    <Badge variant={r.status === 'RESOLVED' ? 'success' : r.status === 'DISMISSED' ? 'default' : 'warning'}>
                      {r.status as string}
                    </Badge>
                  </div>

                  {campaign && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <Target size={12} className="" />
                      <Link to={`/campaigns/${campaign.slug}`} className="text-xs text-indigo-600 hover:underline">{campaign.title}</Link>
                    </div>
                  )}
                  {comment && (
                    <p className="text-xs rounded-lg px-3 py-2 mb-1 italic">"{(comment.content as string)?.slice(0, 120)}…"</p>
                  )}
                  {r.description && (
                    <p className="text-xs mt-1">Note: {r.description as string}</p>
                  )}

                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <span>Reported by {reporter.firstName} {reporter.lastName} ({reporter.email})</span>
                    <span>·</span>
                    <span>{new Date(r.createdAt as string).toLocaleDateString()}</span>
                  </div>
                </div>

                {isPending && (
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <button onClick={() => handleResolve(r.id as string, 'RESOLVED')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-medium transition-colors">
                      <CheckCircle size={12} /> Resolve
                    </button>
                    <button onClick={() => handleResolve(r.id as string, 'DISMISSED')}
                      className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-100 rounded-xl text-xs font-medium transition-colors">
                      <XCircle size={12} /> Dismiss
                    </button>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════
// FULL ANALYTICS PAGE
// ════════════════════════════════════════════
const MOCK_MONTHLY = [
  { month: 'May', revenue: 18400, donations: 94, users: 42 },
  { month: 'Jun', revenue: 22100, donations: 118, users: 58 },
  { month: 'Jul', revenue: 19800, donations: 103, users: 51 },
  { month: 'Aug', revenue: 28600, donations: 147, users: 73 },
  { month: 'Sep', revenue: 24300, donations: 129, users: 64 },
  { month: 'Oct', revenue: 31200, donations: 168, users: 84 },
  { month: 'Nov', revenue: 38900, donations: 201, users: 101 },
  { month: 'Dec', revenue: 44100, donations: 229, users: 115 },
  { month: 'Jan', revenue: 35600, donations: 184, users: 92 },
  { month: 'Feb', revenue: 41800, donations: 216, users: 108 },
  { month: 'Mar', revenue: 52300, donations: 271, users: 136 },
  { month: 'Apr', revenue: 58700, donations: 304, users: 152 },
];

export function AdminAnalyticsPage() {
  const { data: statsData, isLoading } = useAdminStats();
  const stats = statsData?.data as Record<string, unknown> | undefined;

  const kpis = [
    { icon: DollarSign, label: 'Total Revenue', value: fmtCurrency(Number(stats?.totalRevenue ?? 0)), delta: '+12.3%', up: true, color: 'bg-indigo-500' },
    { icon: Heart, label: 'Total Donations', value: String(stats?.totalDonations ?? 0), delta: '+8.7%', up: true, color: 'bg-rose-500' },
    { icon: Users, label: 'Total Users', value: String(stats?.totalUsers ?? 0), delta: '+15.1%', up: true, color: 'bg-amber-500' },
    { icon: Target, label: 'Active Campaigns', value: String(stats?.activeCampaigns ?? 0), delta: '+3', up: true, color: 'bg-violet-500' },
    { icon: Activity, label: 'Avg. Donation', value: fmtCurrency(Number(stats?.totalRevenue ?? 0) / Math.max(Number(stats?.totalDonations ?? 1), 1)), delta: '+$12', up: true, color: 'bg-emerald-500' },
    { icon: Award, label: 'Success Rate', value: '68%', delta: '+4%', up: true, color: 'bg-sky-500' },
    { icon: TrendingUp, label: 'Conversion', value: '4.2%', delta: '+0.3%', up: true, color: 'bg-pink-500' },
    { icon: Zap, label: 'Repeat Donors', value: '34%', delta: '+2%', up: true, color: 'bg-orange-500' },
  ];

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold">Analytics</h2>
        <p className="text-sm mt-0.5">Platform performance overview</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {kpis.map(({ icon: Icon, label, value, delta, up, color }) => (
          <Card key={label} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={15} className="text-white" />
              </div>
              <span className={`text-xs font-medium flex items-center gap-0.5 ${up ? 'text-emerald-600' : 'text-red-500'}`}>
                <ArrowUpRight size={11} className={!up ? 'rotate-180' : ''} /> {delta}
              </span>
            </div>
            <p className="text-lg font-bold">{value}</p>
            <p className="text-[11px] mt-0.5">{label}</p>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-1">Revenue Trend</h3>
          <p className="text-xs mb-4">Monthly recurring revenue over 12 months</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={MOCK_MONTHLY}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `$${v/1000}k`} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => fmtCurrency(v)} contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#revGrad)" dot={false} activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-1">Donations & New Users</h3>
          <p className="text-xs mb-4">Acquisition and engagement correlation</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={MOCK_MONTHLY}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="donations" stroke="#6366f1" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="users" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-1">Monthly Donation Volume</h3>
          <p className="text-xs mb-4">Count of processed transactions per month</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MOCK_MONTHLY}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Bar dataKey="donations" fill="#6366f1" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Top campaigns table */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-4">Top Campaigns by Revenue</h3>
          {stats?.topCampaigns ? (
            <div className="space-y-3">
              {(stats.topCampaigns as Record<string, unknown>[]).map((c, i) => (
                <div key={c.id as string} className="flex items-center gap-3">
                  <span className="text-xs font-bold w-5">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-800 truncate">{c.title as string}</p>
                    <ProgressBar value={Number(c.progressPercent ?? 0)} size="sm" />
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold">{fmtCurrency(Number(c.raisedAmount))}</p>
                    <p className="text-[10px]">{c.donorsCount as number} donors</p>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-center py-8">No campaign data</p>}
        </Card>
      </div>
    </div>
  );
}

// fix missing import
function Heart(props: { size: number; className?: string }) {
  return (
    <svg width={props.size} height={props.size} viewBox="0 0 24 24" fill="currentColor" className={props.className}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}

// ── Analytics router — shows correct dashboard per role ──
export function AnalyticsRouterPage() {
  const { user } = useAuthStore();

  if (user?.roles.includes('ADMIN')) return <AdminAnalyticsPage />;
  if (user?.roles.includes('CREATOR')) return <CreatorAnalyticsPage />;
  return <DonorAnalyticsPage />;
}

function CreatorAnalyticsPage() {
  const { data, isLoading } = useCreatorStats();
  if (isLoading) return <PageLoader />;
  const stats = data?.data as Record<string, unknown> | undefined;
  if (!stats) return null;

  const monthly = (stats.monthlyRevenue as { month: string; revenue: number }[]) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold">My Analytics</h2>
        <p className="text-sm mt-0.5">Performance across your campaigns only</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Raised', value: fmtCurrency(Number(stats.totalRaised ?? 0)), color: 'bg-indigo-500', icon: DollarSign },
          { label: 'Total Donations', value: String(stats.totalDonations ?? 0), color: 'bg-rose-500', icon: Activity },
          { label: 'Campaigns', value: String((stats.campaigns as unknown[])?.length ?? 0), color: 'bg-violet-500', icon: Target },
        ].map(({ label, value, color, icon: Icon }) => (
          <Card key={label} className="p-4">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${color}`}>
              <Icon size={15} className="text-white" />
            </div>
            <p className="text-xl font-bold">{value}</p>
            <p className="text-xs mt-0.5">{label}</p>
          </Card>
        ))}
      </div>

      {monthly.length > 0 && (
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-4">My Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `$${v}`} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => fmtCurrency(v)} contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Bar dataKey="revenue" fill="#6366f1" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}

function DonorAnalyticsPage() {
  const { data, isLoading } = useDonorStats();
  if (isLoading) return <PageLoader />;
  const stats = data?.data as Record<string, unknown> | undefined;
  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold">My Giving</h2>
        <p className="text-sm mt-0.5">Your personal donation history</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Donated', value: fmtCurrency(Number(stats.totalDonated ?? 0)), color: 'bg-indigo-500', icon: DollarSign },
          { label: 'Donations Made', value: String(stats.totalDonations ?? 0), color: 'bg-rose-500', icon: Activity },
          { label: 'Campaigns Backed', value: String(stats.supportedCampaigns ?? 0), color: 'bg-emerald-500', icon: Target },
        ].map(({ label, value, color, icon: Icon }) => (
          <Card key={label} className="p-4">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${color}`}>
              <Icon size={15} className="text-white" />
            </div>
            <p className="text-xl font-bold">{value}</p>
            <p className="text-xs mt-0.5">{label}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
