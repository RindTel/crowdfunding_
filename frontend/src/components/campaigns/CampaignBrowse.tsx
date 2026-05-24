import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Users, Clock, Star, Search, Filter, ChevronDown, Target, Loader2 } from 'lucide-react';
import { useCampaigns, useCategories } from '../../hooks/useApi';
import type { Campaign } from '../../types';
import { ProgressBar, EmptyState, Badge } from '../../components/ui';
import { formatDistanceToNow } from 'date-fns';

// ── Campaign Card ─────────────────────────────
export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const daysLeft = campaign.endDate
    ? Math.max(0, Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / 86400000))
    : null;

  const statusColor = campaign.status === 'COMPLETED'
    ? 'emerald' : campaign.progressPercent >= 100 ? 'emerald' : 'indigo';

  return (
    <Link to={`/campaigns/${campaign.slug}`} className="group block">
      <div className="bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        {/* Cover */}
        <div className="relative aspect-[16/9] bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden">
          {campaign.coverImageUrl ? (
            <img
              src={campaign.coverImageUrl}
              alt={campaign.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Target size={36} className="" />
            </div>
          )}
          {campaign.isFeatured && (
            <div className="absolute top-3 left-3">
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest bg-amber-400 text-amber-900 px-2.5 py-1 rounded-full">
                <Star size={9} className="fill-amber-900" /> Featured
              </span>
            </div>
          )}
          {campaign.status === 'COMPLETED' && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white font-bold text-sm bg-emerald-500 px-4 py-1.5 rounded-full">Funded!</span>
            </div>
          )}
          <div className="absolute top-3 right-3">
            <span className="text-[10px] font-medium text-white bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
              {campaign.category.name}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-semibold text-[15px] leading-snug mb-1.5 line-clamp-2 group-hover:text-indigo-700 transition-colors">
            {campaign.title}
          </h3>
          <p className="text-xs line-clamp-2 mb-4 leading-relaxed">{campaign.description}</p>

          <ProgressBar value={campaign.progressPercent} size="sm" color={statusColor} />

          <div className="flex items-center justify-between mt-3">
            <div>
              <p className="text-base font-bold">
                ${campaign.raisedAmount.toLocaleString()}
              </p>
              <p className="text-[11px]">of ${campaign.goalAmount.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-base font-bold text-indigo-600">{campaign.progressPercent}%</p>
              <p className="text-[11px]">funded</p>
            </div>
          </div>

          {/* Footer meta */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
            <div className="flex items-center gap-1.5 text-xs">
              <Users size={12} />
              <span>{campaign.donorsCount.toLocaleString()} donors</span>
            </div>
            {daysLeft !== null && daysLeft > 0 && (
              <div className="flex items-center gap-1.5 text-xs">
                <Clock size={12} />
                <span>{daysLeft}d left</span>
              </div>
            )}
            {(!daysLeft || daysLeft === 0) && campaign.status !== 'COMPLETED' && (
              <span className="text-[11px] text-amber-600 font-medium">Ending soon</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Browse Campaigns page ─────────────────────
const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'COMPLETED', label: 'Completed' },
];

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Newest' },
  { value: 'raisedAmount', label: 'Most funded' },
  { value: 'donorsCount', label: 'Most backers' },
  { value: 'endDate', label: 'Ending soon' },
];

export function CampaignsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [categoryId, setCategoryId] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const { data: campaignsData, isLoading } = useCampaigns({
    search: search || undefined,
    status: status || undefined,
    categoryId: categoryId || undefined,
    sortBy,
    sortOrder: 'desc',
    page,
    limit: 12,
  });

  const { data: categoriesData } = useCategories();
  const campaigns = campaignsData?.data ?? [];
  const meta = campaignsData?.meta;
  const categories = (categoriesData?.data as { id: string; name: string }[]) ?? [];

  return (
    <div className="max-w-7xl mx-auto px-5 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Explore Campaigns</h1>
        <p className="">Discover projects making a difference</p>
      </div>

      {/* Search + filters row */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search campaigns…"
              className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <div className="flex items-center gap-2.5">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-300"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            <button
              onClick={() => setShowFilters(f => !f)}
              className={`flex items-center gap-2 px-3.5 py-2.5 border rounded-xl text-sm transition-colors ${showFilters ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white hover:bg-slate-50'}`}
            >
              <Filter size={14} /> Filters
              {(status || categoryId) && <span className="w-4 h-4 bg-amber-400 rounded-full text-[9px] font-bold flex items-center justify-center text-amber-900">!</span>}
            </button>
          </div>
        </div>

        {/* Expandable filter panel */}
        {showFilters && (
          <div className="flex flex-wrap gap-3 p-4 rounded-2xl border">
            <div>
              <p className="text-xs font-medium mb-2">Status</p>
              <div className="flex gap-2">
                {STATUS_OPTIONS.map(o => (
                  <button
                    key={o.value}
                    onClick={() => { setStatus(o.value); setPage(1); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${status === o.value ? 'bg-indigo-600 text-white' : 'bg-white border hover:bg-slate-50'}`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {categories.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-2">Category</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => { setCategoryId(''); setPage(1); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!categoryId ? 'bg-indigo-600 text-white' : 'bg-white border hover:bg-slate-50'}`}
                  >
                    All
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => { setCategoryId(c.id); setPage(1); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${categoryId === c.id ? 'bg-indigo-600 text-white' : 'bg-white border hover:bg-slate-50'}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results count */}
      {meta && (
        <p className="text-sm mb-5">
          {meta.total} campaign{meta.total !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-indigo-600" size={28} />
        </div>
      ) : campaigns.length === 0 ? (
        <EmptyState
          icon={<Target size={48} />}
          title="No campaigns found"
          description="Try adjusting your filters or search terms"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {campaigns.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-10">
          <button
            disabled={!meta.hasPrev}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 border rounded-xl text-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          {Array.from({ length: Math.min(meta.totalPages, 7) }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${p === page ? 'bg-indigo-600 text-white' : 'border hover:bg-slate-50'}`}
            >
              {p}
            </button>
          ))}
          <button
            disabled={!meta.hasNext}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 border rounded-xl text-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
