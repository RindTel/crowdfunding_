import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  TrendingUp, Users, DollarSign, Target, ArrowUpRight,
  Plus, Eye, Edit3, Star, Heart, Award, Activity,
  CheckCircle, Clock, AlertCircle
} from 'lucide-react';
import { useAdminStats, useCreatorStats, useDonorStats, useCampaigns, useDeleteCampaign } from '../hooks/useApi';
import { useAuthStore } from '../store/auth.store';
import { Badge, PageLoader, EmptyState, Button, Card, ProgressBar, Avatar } from '../components/ui';
import type { Campaign, Donation, AdminStats, CreatorStats, DonorStats } from '../types';
import toast from 'react-hot-toast';

// ── Stat Card ─────────────────────────────────
function StatCard({ icon: Icon, label, value, delta, deltaUp, accent }: {
  icon: React.ElementType; label: string; value: string;
  delta?: string; deltaUp?: boolean; accent: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>
          <Icon size={18} className="text-white" />
        </div>
        {delta && (
          <span className={`flex items-center gap-0.5 text-xs font-medium ${deltaUp ? 'text-emerald-600' : 'text-red-500'}`}>
            <ArrowUpRight size={12} className={!deltaUp ? 'rotate-180' : ''} />
            {delta}
          </span>
        )}
      </div>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs mt-0.5">{label}</p>
    </Card>
  );
}

// ── Campaign row ──────────────────────────────
function CampaignRow({ campaign, onDelete }: { campaign: Campaign; onDelete?: (id: string) => void }) {
  const statusVariant: Record<string, 'success' | 'info' | 'default' | 'warning' | 'danger'> = {
    ACTIVE: 'success', COMPLETED: 'info', DRAFT: 'default',
    PAUSED: 'warning', CANCELLED: 'danger', PENDING_REVIEW: 'purple',
  };
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 flex-shrink-0 overflow-hidden">
            {campaign.coverImageUrl ? (
              <img src={campaign.coverImageUrl} alt={campaign.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><Target size={14} className="" /></div>
            )}
          </div>
          <div>
            <p className="text-sm font-medium flex items-center gap-1.5">
              {campaign.title.length > 32 ? campaign.title.slice(0, 32) + '…' : campaign.title}
              {campaign.isFeatured && <Star size={11} className="text-amber-400 fill-amber-400" />}
            </p>
            <p className="text-xs">{campaign.category.name}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <div className="w-28">
          <div className="flex justify-between text-xs mb-1">
            <span className="">{campaign.progressPercent}%</span>
          </div>
          <ProgressBar value={campaign.progressPercent} size="sm" />
        </div>
      </td>
      <td className="px-5 py-3.5">
        <p className="text-sm font-semibold">${campaign.raisedAmount.toLocaleString()}</p>
        <p className="text-xs">of ${campaign.goalAmount.toLocaleString()}</p>
      </td>
      <td className="px-5 py-3.5">
        <span className="text-sm">{campaign.donorsCount}</span>
      </td>
      <td className="px-5 py-3.5">
        <Badge variant={statusVariant[campaign.status] ?? 'default'}>{campaign.status}</Badge>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-1.5">
          <Link to={`/campaigns/${campaign.slug}`} className="p-1.5 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Eye size={13} /></Link>
          <Link to={`/dashboard/campaigns/${campaign.id}/edit`} className="p-1.5 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"><Edit3 size={13} /></Link>
          {onDelete && (
            <button onClick={() => onDelete(campaign.id)} className="p-1.5 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ── Admin Dashboard ───────────────────────────
function AdminDashboard() {
  const { data, isLoading } = useAdminStats();
  if (isLoading) return <PageLoader />;
  const stats = data?.data as AdminStats | undefined;
  if (!stats) return null;

  const categoryColors = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Total Revenue" value={`$${Number(stats.totalRevenue).toLocaleString()}`} delta="12.3%" deltaUp accent="bg-indigo-500" />
        <StatCard icon={Target} label="Active Campaigns" value={String(stats.activeCampaigns)} delta="3 new" deltaUp accent="bg-violet-500" />
        <StatCard icon={Users} label="Total Users" value={stats.totalUsers.toLocaleString()} delta="8.7%" deltaUp accent="bg-amber-500" />
        <StatCard icon={Heart} label="Total Donations" value={stats.totalDonations.toLocaleString()} delta="5.2%" deltaUp accent="bg-rose-500" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Card className="xl:col-span-2 p-5">
          <h3 className="text-sm font-semibold mb-4">Revenue (12 months)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats.topCampaigns.map((c, i) => ({ name: c.title?.slice(0, 12), value: Number(c.raisedAmount) }))}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fill="url(#g1)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-4">By Status</h3>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={stats.campaignsByStatus} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="_count.id" nameKey="status">
                {stats.campaignsByStatus.map((_: unknown, i: number) => <Cell key={i} fill={categoryColors[i % 5]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => v} contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {stats.campaignsByStatus.map((s: { status: string; _count: { id: number } }, i: number) => (
              <div key={s.status} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: categoryColors[i % 5] }} />
                  <span className="">{s.status}</span>
                </div>
                <span className="font-medium">{s._count.id}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent donations */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
          <h3 className="text-sm font-semibold">Recent Donations</h3>
          <span className="flex items-center gap-1 text-xs text-emerald-600">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live
          </span>
        </div>
        <div className="divide-y divide-slate-100">
          {stats.recentDonations.slice(0, 8).map((d: Donation) => (
            <div key={d.id} className="flex items-center gap-3 px-5 py-3">
              <Avatar name={d.isAnonymous ? 'Anon' : `${(d as unknown as { donor?: { user?: { firstName?: string; lastName?: string } } }).donor?.user?.firstName ?? 'User'} ${(d as unknown as { donor?: { user?: { firstName?: string; lastName?: string } } }).donor?.user?.lastName ?? ''}`} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-800">{d.isAnonymous ? 'Anonymous' : 'Donor'}</p>
                <p className="text-[11px] truncate">{d.campaign?.title}</p>
              </div>
              <span className="text-xs font-bold text-emerald-600">${Number(d.amount).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Creator Dashboard ─────────────────────────
function CreatorDashboard() {
  const { data, isLoading } = useCreatorStats();
  if (isLoading) return <PageLoader />;
  const stats = data?.data as CreatorStats | undefined;
  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Total Raised" value={`$${Number(stats.totalRaised).toLocaleString()}`} accent="bg-indigo-500" />
        <StatCard icon={Heart} label="Total Donations" value={stats.totalDonations.toLocaleString()} accent="bg-rose-500" />
        <StatCard icon={Target} label="Campaigns" value={String(stats.campaigns.length)} accent="bg-violet-500" />
        <StatCard icon={Activity} label="Active" value={String(stats.campaigns.filter((c: Campaign) => c.status === 'ACTIVE').length)} accent="bg-emerald-500" />
      </div>

      {stats.monthlyRevenue.length > 0 && (
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-4">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Bar dataKey="revenue" fill="#6366f1" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
          <h3 className="text-sm font-semibold">My Campaigns</h3>
          <Link to="/dashboard/campaigns/new">
            <Button size="sm" leftIcon={<Plus size={13} />}>New Campaign</Button>
          </Link>
        </div>
        {stats.campaigns.length === 0 ? (
          <EmptyState icon={<Target size={36} />} title="No campaigns yet" description="Create your first campaign to start raising funds" action={<Link to="/dashboard/campaigns/new"><Button size="sm">Create Campaign</Button></Link>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="bg-slate-50/50 border-b">
                {['Campaign', 'Progress', 'Raised', 'Donors', 'Status', ''].map(h => (
                  <th key={h} className="text-left text-xs font-semibold uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {stats.campaigns.map((c: Campaign) => <CampaignRow key={c.id} campaign={c} />)}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

// ── Donor Dashboard ───────────────────────────
function DonorDashboard() {
  const { data, isLoading } = useDonorStats();
  if (isLoading) return <PageLoader />;
  const stats = data?.data as DonorStats | undefined;
  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={DollarSign} label="Total Donated" value={`$${Number(stats.totalDonated).toLocaleString()}`} accent="bg-indigo-500" />
        <StatCard icon={Heart} label="Donations Made" value={String(stats.totalDonations)} accent="bg-rose-500" />
        <StatCard icon={Target} label="Campaigns Backed" value={String(stats.supportedCampaigns)} accent="bg-emerald-500" />
      </div>

      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-50">
          <h3 className="text-sm font-semibold">Donation History</h3>
        </div>
        {stats.donations.length === 0 ? (
          <EmptyState icon={<Heart size={36} />} title="No donations yet" description="Explore campaigns and make your first contribution" action={<Link to="/campaigns"><Button size="sm" variant="secondary">Browse campaigns</Button></Link>} />
        ) : (
          <div className="divide-y divide-slate-100">
            {stats.donations.map((d: Donation) => {
              const statusIcon = d.status === 'COMPLETED' ? <CheckCircle size={14} className="text-emerald-500" /> :
                d.status === 'PENDING' ? <Clock size={14} className="text-amber-500" /> :
                <AlertCircle size={14} className="text-red-500" />;
              return (
                <div key={d.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden">
                    {d.campaign?.coverImageUrl ? (
                      <img src={d.campaign.coverImageUrl} alt="" className="w-full h-full object-cover" />
                    ) : <div className="w-full h-full flex items-center justify-center"><Target size={14} className="" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/campaigns/${d.campaign?.slug}`} className="text-sm font-medium hover:text-indigo-600 transition-colors truncate block">
                      {d.campaign?.title}
                    </Link>
                    {d.reward && <p className="text-xs text-indigo-600 mt-0.5">Reward: {d.reward.title}</p>}
                    {d.message && <p className="text-xs italic mt-0.5 truncate">"{d.message}"</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold">${Number(d.amount).toLocaleString()}</p>
                    <div className="flex items-center gap-1 justify-end mt-0.5">
                      {statusIcon}
                      <span className="text-xs">{new Date(d.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <div className="text-center">
        <Link to="/campaigns">
          <Button variant="secondary" leftIcon={<Target size={14} />}>Explore more campaigns</Button>
        </Link>
      </div>
    </div>
  );
}

// ── Dashboard Router ──────────────────────────
export function DashboardOverviewPage() {
  const { user } = useAuthStore();
  const name = user?.firstName ?? 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">{greeting}, {name} 👋</h1>
        <p className="text-sm mt-0.5">Here's what's happening on your platform</p>
      </div>
      {user?.roles.includes('ADMIN') && <AdminDashboard />}
      {!user?.roles.includes('ADMIN') && user?.roles.includes('CREATOR') && <CreatorDashboard />}
      {!user?.roles.includes('ADMIN') && !user?.roles.includes('CREATOR') && <DonorDashboard />}
    </div>
  );
}

// ── Campaigns management page ─────────────────
export function DashboardCampaignsPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const deleteCampaign = useDeleteCampaign();
  const { data, isLoading } = useCampaigns(
    user?.roles.includes('ADMIN') ? {} : { creatorId: user?.id }
  );
  const campaigns = (data?.data ?? []) as Campaign[];

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this campaign?')) return;
    try {
      await deleteCampaign.mutateAsync(id);
      toast.success('Campaign deleted');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Campaigns</h2>
          <p className="text-sm mt-0.5">{campaigns.length} total</p>
        </div>
        {user?.roles.includes('CREATOR') && (
          <Button leftIcon={<Plus size={14} />} onClick={() => navigate('/dashboard/campaigns/new')}>
            New Campaign
          </Button>
        )}
      </div>

      <Card className="overflow-hidden">
        {isLoading ? <PageLoader /> : campaigns.length === 0 ? (
          <EmptyState icon={<Target size={40} />} title="No campaigns yet" action={
            user?.roles.includes('CREATOR') ? (
              <Button size="sm" onClick={() => navigate('/dashboard/campaigns/new')} leftIcon={<Plus size={13} />}>Create Campaign</Button>
            ) : undefined
          } />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="bg-slate-50/50 border-b">
                {['Campaign', 'Progress', 'Raised', 'Donors', 'Status', ''].map(h => (
                  <th key={h} className="text-left text-xs font-semibold uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {campaigns.map(c => <CampaignRow key={c.id} campaign={c} onDelete={handleDelete} />)}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

// ── Settings page ─────────────────────────────
export function DashboardSettingsPage() {
  const { user } = useAuthStore();
  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h2 className="text-lg font-bold">Settings</h2>
        <p className="text-sm mt-0.5">Manage your account preferences</p>
      </div>
      <Card className="p-5">
        <h3 className="text-sm font-semibold mb-4">Profile</h3>
        <div className="flex items-center gap-4 mb-4">
          <Avatar name={`${user?.firstName} ${user?.lastName}`} size="lg" />
          <Button variant="outline" size="sm">Change avatar</Button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1.5">First name</label>
            <input defaultValue={user?.firstName} className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5">Last name</label>
            <input defaultValue={user?.lastName} className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
        </div>
        <div className="mt-3">
          <label className="block text-xs font-medium mb-1.5">Email</label>
          <input defaultValue={user?.email} disabled className="w-full px-3 py-2 border rounded-xl text-sm" />
        </div>
        <Button className="mt-4" size="sm">Save changes</Button>
      </Card>

      <Card className="p-5">
        <h3 className="text-sm font-semibold mb-4">Roles</h3>
        <div className="flex flex-wrap gap-2">
          {user?.roles.map(r => <Badge key={r} variant={r === 'ADMIN' ? 'danger' : r === 'CREATOR' ? 'purple' : 'info'}>{r}</Badge>)}
        </div>
      </Card>
    </div>
  );
}
