import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Heart, Share2, Flag, Users, Clock, DollarSign,
  CheckCircle, Award, MessageCircle, Bell, ChevronRight, Loader2, Lock
} from 'lucide-react';
import { useCampaignBySlug, useCreateDonation, useRecentDonations } from '../../hooks/useApi';
import type { Reward } from '../../types';
import { ProgressBar, Badge, PageLoader, Button, Avatar } from '../../components/ui';
import { useAuthStore } from '../../store/auth.store';
import { CommentsSection } from './CommentsSection';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

// ── Reward Card ───────────────────────────────
function RewardCard({ reward, selected, onSelect, donationAmount }: {
  reward: Reward; selected: boolean; onSelect: () => void; donationAmount: number;
}) {
  const isMet = donationAmount >= reward.minimumAmount;
  const isFull = reward.maxClaims !== null && reward.claimsCount >= reward.maxClaims;

  return (
    <div
      onClick={() => !isFull && onSelect()}
      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
        isFull ? 'opacity-50 cursor-not-allowed' :
        selected ? 'border-indigo-500 bg-indigo-50/50 shadow-md shadow-indigo-100' :
        'border-slate-200 hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-semibold text-sm">{reward.title}</h4>
        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${selected ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'}`}>
          {selected && <div className="w-1.5 h-1.5 rounded-full" />}
        </div>
      </div>
      <p className="text-indigo-600 font-bold text-sm mb-1.5">Pledge ${reward.minimumAmount.toLocaleString()}+</p>
      <p className="text-xs leading-relaxed mb-3">{reward.description}</p>

      <div className="flex items-center justify-between text-[11px]">
        {reward.estimatedDelivery && (
          <span>Est. {new Date(reward.estimatedDelivery).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
        )}
        {reward.maxClaims && (
          <span className={isFull ? 'text-red-500' : ''}>
            {isFull ? 'Fully claimed' : `${reward.maxClaims - reward.claimsCount} left`}
          </span>
        )}
      </div>
      {!isMet && !isFull && (
        <p className="text-[11px] text-amber-600 mt-1.5">⚡ Pledge ${(reward.minimumAmount - donationAmount).toFixed(0)} more to unlock</p>
      )}
    </div>
  );
}

// ── Donation Panel ────────────────────────────
function DonationPanel({ campaign }: { campaign: NonNullable<ReturnType<typeof useCampaignBySlug>['data']>['data'] }) {
  const { isAuthenticated } = useAuthStore();
  const [amount, setAmount] = useState(25);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedReward, setSelectedReward] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [message, setMessage] = useState('');
  const [step, setStep] = useState<'amount' | 'details' | 'done'>('amount');
  const createDonation = useCreateDonation();

  const presets = [10, 25, 50, 100, 250];
  const finalAmount = customAmount ? parseFloat(customAmount) : amount;

  const handleDonate = async () => {
    if (!finalAmount || finalAmount <= 0) return toast.error('Please enter a valid amount');
    if (campaign.minDonation && finalAmount < campaign.minDonation) {
      return toast.error(`Minimum donation is $${campaign.minDonation}`);
    }

    try {
      await createDonation.mutateAsync({
        campaignId: campaign.id,
        amount: finalAmount,
        currency: campaign.currency,
        isAnonymous,
        message: message || undefined,
        rewardId: selectedReward || undefined,
        paymentProvider: 'stripe',
      });
      setStep('done');
      toast.success('Thank you for your donation! 🎉');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Donation failed';
      toast.error(msg);
    }
  };

  if (step === 'done') {
    return (
      <div className="bg-white rounded-2xl border shadow-sm p-6 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-emerald-600" />
        </div>
        <h3 className="text-lg font-bold mb-2">Thank you!</h3>
        <p className="text-sm mb-5">Your donation of <strong>${finalAmount}</strong> is making a difference.</p>
        <Button variant="secondary" fullWidth onClick={() => setStep('amount')}>
          Donate again
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden sticky top-6">
      {/* Progress summary */}
      <div className="p-5 border-b border-slate-50">
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-2xl font-bold">${campaign.raisedAmount.toLocaleString()}</p>
            <p className="text-sm">of ${campaign.goalAmount.toLocaleString()} goal</p>
          </div>
          <p className="text-2xl font-bold text-indigo-600">{campaign.progressPercent}%</p>
        </div>
        <ProgressBar value={campaign.progressPercent} size="lg" />
        <div className="flex items-center justify-between mt-3 text-sm">
          <div className="flex items-center gap-1.5"><Users size={13} /> {campaign.donorsCount} donors</div>
          {campaign.endDate && (
            <div className="flex items-center gap-1.5">
              <Clock size={13} />
              {Math.max(0, Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / 86400000))} days left
            </div>
          )}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Amount presets */}
        <div>
          <p className="text-sm font-semibold mb-2.5">Choose amount</p>
          <div className="grid grid-cols-5 gap-1.5 mb-2.5">
            {presets.map(p => (
              <button
                key={p}
                onClick={() => { setAmount(p); setCustomAmount(''); }}
                className={`py-2 rounded-xl text-sm font-medium transition-colors ${!customAmount && amount === p ? 'bg-indigo-600 text-white' : 'bg-slate-100 hover:bg-slate-200'}`}
              >
                ${p}
              </button>
            ))}
          </div>
          <div className="relative">
            <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="number"
              placeholder="Custom amount"
              value={customAmount}
              onChange={e => setCustomAmount(e.target.value)}
              className="w-full pl-8 pr-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
        </div>

        {/* Rewards */}
        {campaign.rewards && campaign.rewards.length > 0 && (
          <div>
            <p className="text-sm font-semibold mb-2.5">Select a reward</p>
            <div className="space-y-2.5 max-h-64 overflow-y-auto">
              <div
                onClick={() => setSelectedReward(null)}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all text-sm ${!selectedReward ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-slate-300'}`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${!selectedReward ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'}`}>
                    {!selectedReward && <div className="w-1.5 h-1.5 rounded-full" />}
                  </div>
                  <span className="font-medium">No reward — just support</span>
                </div>
              </div>
              {campaign.rewards.map(r => (
                <RewardCard
                  key={r.id}
                  reward={r}
                  selected={selectedReward === r.id}
                  onSelect={() => setSelectedReward(r.id)}
                  donationAmount={finalAmount}
                />
              ))}
            </div>
          </div>
        )}

        {/* Message & anonymous */}
        <div className="space-y-3">
          <textarea
            placeholder="Leave a message of support (optional)"
            value={message}
            onChange={e => setMessage(e.target.value)}
            maxLength={500}
            rows={2}
            className="w-full px-3.5 py-2.5 border rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder:text-slate-500"
          />
          {campaign.allowAnonymous && (
            <label className="flex items-center gap-2.5 cursor-pointer">
              <div
                onClick={() => setIsAnonymous(v => !v)}
                className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${isAnonymous ? 'bg-indigo-600' : 'bg-slate-200'}`}
              >
                <div className={`w-4 h-4 rounded-full shadow transition-transform ${isAnonymous ? 'translate-x-4' : ''}`} />
              </div>
              <span className="text-sm">Donate anonymously</span>
            </label>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={handleDonate}
          disabled={createDonation.isPending || !finalAmount}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-indigo-200 disabled:opacity-60"
        >
          {createDonation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Heart size={16} />}
          Back this project · ${finalAmount || 0}
        </button>

        <div className="flex items-center justify-center gap-1.5 text-xs">
          <Lock size={10} /> Secure · Encrypted payments
        </div>
      </div>
    </div>
  );
}

// ── Campaign Detail Page ──────────────────────
export function CampaignDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading } = useCampaignBySlug(slug!);
  const { data: recentData } = useRecentDonations(data?.data?.id ?? '');
  const [activeTab, setActiveTab] = useState<'story' | 'updates' | 'comments'>('story');

  if (isLoading) return <PageLoader />;
  if (!data?.data) return (
    <div className="text-center py-20">
      <p className="">Campaign not found</p>
      <Link to="/campaigns" className="text-indigo-600 text-sm mt-2 inline-block">← Back to campaigns</Link>
    </div>
  );

  const c = data.data;
  const recentDonations = (recentData?.data as unknown[]) ?? [];

  return (
    <div className="max-w-6xl mx-auto px-5 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-6">
        <Link to="/campaigns" className="hover:text-slate-600 flex items-center gap-1.5 transition-colors">
          <ArrowLeft size={14} /> All campaigns
        </Link>
        <ChevronRight size={12} />
        <span className="text-slate-600 truncate max-w-xs">{c.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        {/* Left */}
        <div>
          {/* Cover */}
          <div className="rounded-2xl overflow-hidden aspect-video bg-slate-200 mb-6">
            {c.coverImageUrl ? (
              <img src={c.coverImageUrl} alt={c.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Award size={48} className="" />
              </div>
            )}
          </div>

          {/* Title + meta */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant={c.status === 'ACTIVE' ? 'success' : c.status === 'COMPLETED' ? 'info' : 'default'}>
                {c.status}
              </Badge>
              <Badge variant="default">{c.category.name}</Badge>
              {c.isFeatured && <Badge variant="warning">⭐ Featured</Badge>}
            </div>
            <h1 className="text-2xl font-bold mb-3 leading-tight">{c.title}</h1>
            <p className="text-slate-600 leading-relaxed">{c.description}</p>
          </div>

          {/* Creator */}
          <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl">
            <Avatar
              name={`${c.creator.user.firstName} ${c.creator.user.lastName}`}
              src={c.creator.user.avatarUrl}
              size="lg"
            />
            <div>
              <p className="text-sm font-semibold">{c.creator.user.firstName} {c.creator.user.lastName}</p>
              <p className="text-xs">{c.creator.isVerified ? '✓ Verified creator' : 'Campaign creator'}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 border-b mb-6">
            {([['story', 'Story'], ['updates', `Updates (${c.updates?.length ?? 0})`], ['comments', 'Comments']] as [string, string][]).map(([t, label]) => (
              <button
                key={t}
                onClick={() => setActiveTab(t as typeof activeTab)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === t ? 'border-indigo-600 text-indigo-600' : 'border-transparent hover:text-slate-600'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'story' && (
            <div className="prose prose-slate max-w-none leading-relaxed text-[15px]">
              {c.story.split('\n').map((p, i) => p ? <p key={i}>{p}</p> : <br key={i} />)}
            </div>
          )}

          {activeTab === 'updates' && (
            <div className="space-y-4">
              {(c.updates ?? []).length === 0 ? (
                <p className="text-slate-500 text-sm py-8 text-center">No updates yet</p>
              ) : (c.updates ?? []).map(u => (
                <div key={u.id} className="p-5 border rounded-2xl">
                  <p className="text-xs mb-1">{new Date(u.createdAt).toLocaleDateString()}</p>
                  <h4 className="font-semibold mb-2">{u.title}</h4>
                  <p className="text-sm leading-relaxed">{u.content}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'comments' && (
            <CommentsSection campaignId={c.id} />
          )}
        </div>

        {/* Right — donation panel */}
        <div>
          <DonationPanel campaign={c} />

          {/* Recent donors */}
          {recentDonations.length > 0 && (
            <div className="mt-5 rounded-2xl border shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Recent supporters</h3>
                <span className="flex items-center gap-1 text-xs text-emerald-600">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {recentDonations.slice(0, 6).map((d: unknown, i) => {
                  const donation = d as { id: string; isAnonymous: boolean; donor?: { user?: { firstName?: string; lastName?: string } }; amount: number; createdAt: string; message?: string };
                  return (
                    <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                      <Avatar
                        name={donation.isAnonymous ? 'Anonymous' : `${donation.donor?.user?.firstName ?? 'User'} ${donation.donor?.user?.lastName ?? ''}`}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-800">
                          {donation.isAnonymous ? 'Anonymous' : `${donation.donor?.user?.firstName} ${donation.donor?.user?.lastName}`}
                        </p>
                        {donation.message && <p className="text-[11px] truncate italic">"{donation.message}"</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-emerald-600">${Number(donation.amount).toLocaleString()}</p>
                        <p className="text-[10px]">{formatDistanceToNow(new Date(donation.createdAt), { addSuffix: true })}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
