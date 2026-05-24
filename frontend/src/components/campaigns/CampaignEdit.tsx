import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Trash2, Plus, X, AlertTriangle } from 'lucide-react';
import { useCampaign, useUpdateCampaign, useDeleteCampaign, useRewards, useCreateReward, useDeleteReward, useCreateCampaignUpdate, useCampaignUpdates } from '../../hooks/useApi';
import { useAuthStore } from '../../store/auth.store';
import { Input, Textarea, Select, Button, Card, Badge, PageLoader, Modal } from '../../components/ui';
import type { Reward } from '../../types';
import toast from 'react-hot-toast';

// ── Status badge map ──────────────────────────
const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PENDING_REVIEW', label: 'Submit for Review' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const ADMIN_STATUS_OPTIONS = [
  ...STATUS_OPTIONS,
  { value: 'ACTIVE', label: 'Active (Admin)' },
  { value: 'COMPLETED', label: 'Completed (Admin)' },
  { value: 'REJECTED', label: 'Rejected (Admin)' },
];

// ── Reward Manager Panel ──────────────────────
function RewardManager({ campaignId }: { campaignId: string }) {
  const { data } = useRewards(campaignId);
  const createReward = useCreateReward(campaignId);
  const deleteReward = useDeleteReward(campaignId);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', minimumAmount: '', maxClaims: '', estimatedDelivery: '' });
  const rewards = (data?.data ?? []) as Reward[];

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = async () => {
    if (!form.title || !form.minimumAmount) return toast.error('Title and minimum amount are required');
    try {
      await createReward.mutateAsync({
        title: form.title,
        description: form.description,
        minimumAmount: parseFloat(form.minimumAmount),
        maxClaims: form.maxClaims ? parseInt(form.maxClaims) : undefined,
        estimatedDelivery: form.estimatedDelivery ? new Date(form.estimatedDelivery + '-01').toISOString() : undefined,
      });
      setForm({ title: '', description: '', minimumAmount: '', maxClaims: '', estimatedDelivery: '' });
      setShowForm(false);
      toast.success('Reward added');
    } catch { toast.error('Failed to create reward'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this reward?')) return;
    try {
      await deleteReward.mutateAsync(id);
      toast.success('Reward deleted');
    } catch { toast.error('Failed to delete reward'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Backer Rewards</h3>
        <Button size="sm" variant="outline" leftIcon={<Plus size={12} />} onClick={() => setShowForm(v => !v)}>
          {showForm ? 'Cancel' : 'Add Reward'}
        </Button>
      </div>

      {showForm && (
        <div className="border border-indigo-200 bg-indigo-50/30 rounded-2xl p-4 mb-4 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider">New Reward</h4>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Title" placeholder="e.g. Early Supporter" value={form.title} onChange={e => set('title', e.target.value)} required />
            <Input label="Min. pledge ($)" type="number" placeholder="25" value={form.minimumAmount} onChange={e => set('minimumAmount', e.target.value)} required />
          </div>
          <Textarea label="Description" rows={2} placeholder="What do backers receive?" value={form.description} onChange={e => set('description', e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Max claims" type="number" placeholder="Unlimited" value={form.maxClaims} onChange={e => set('maxClaims', e.target.value)} />
            <Input label="Est. delivery (month)" type="month" value={form.estimatedDelivery} onChange={e => set('estimatedDelivery', e.target.value)} />
          </div>
          <Button size="sm" onClick={handleCreate} loading={createReward.isPending}>Save Reward</Button>
        </div>
      )}

      {rewards.length === 0 ? (
        <p className="text-sm text-center py-6 border-2 border-dashed rounded-2xl">
          No rewards yet — add one above
        </p>
      ) : (
        <div className="space-y-2.5">
          {rewards.map(r => (
            <div key={r.id} className="flex items-start justify-between gap-3 p-3.5 border rounded-xl">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold">{r.title}</span>
                  <span className="text-xs text-indigo-600 font-medium">${r.minimumAmount}+</span>
                  {!r.isAvailable && <Badge variant="danger">Unavailable</Badge>}
                </div>
                <p className="text-xs truncate">{r.description}</p>
                {r.maxClaims && (
                  <p className="text-xs mt-0.5">{r.claimsCount} / {r.maxClaims} claimed</p>
                )}
              </div>
              <button onClick={() => handleDelete(r.id)} className="p-1.5 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Campaign Updates Panel ────────────────────
function UpdatesPanel({ campaignId }: { campaignId: string }) {
  const { data } = useCampaignUpdates(campaignId);
  const createUpdate = useCreateCampaignUpdate(campaignId);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', imageUrl: '' });
  const updates = (data?.data ?? []) as { id: string; title: string; content: string; createdAt: string }[];

  const handlePost = async () => {
    if (!form.title || !form.content) return toast.error('Title and content are required');
    try {
      await createUpdate.mutateAsync({
        title: form.title,
        content: form.content,
        imageUrl: form.imageUrl || undefined,
      });
      setForm({ title: '', content: '', imageUrl: '' });
      setShowForm(false);
      toast.success('Update posted to backers');
    } catch { toast.error('Failed to post update'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Campaign Updates</h3>
        <Button size="sm" variant="outline" leftIcon={<Plus size={12} />} onClick={() => setShowForm(v => !v)}>
          {showForm ? 'Cancel' : 'Post Update'}
        </Button>
      </div>

      {showForm && (
        <div className="border border-emerald-200 bg-emerald-50/20 rounded-2xl p-4 mb-4 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider">New Update</h4>
          <Input label="Title" placeholder="What's new?" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <Textarea label="Content" rows={4} placeholder="Keep your backers in the loop…" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
          <Input label="Image URL (optional)" type="url" placeholder="https://…" value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} />
          <Button size="sm" onClick={handlePost} loading={createUpdate.isPending}>Publish Update</Button>
        </div>
      )}

      {updates.length === 0 ? (
        <p className="text-sm text-center py-6 border-2 border-dashed rounded-2xl">
          No updates posted yet
        </p>
      ) : (
        <div className="space-y-3">
          {updates.map(u => (
            <div key={u.id} className="p-4 border rounded-xl">
              <p className="text-[11px] mb-1">{new Date(u.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}</p>
              <p className="text-sm font-semibold mb-1">{u.title}</p>
              <p className="text-xs leading-relaxed line-clamp-3">{u.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Edit Page ────────────────────────────
export function CampaignEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data, isLoading } = useCampaign(id!);
  const updateCampaign = useUpdateCampaign(id!);
  const deleteCampaign = useDeleteCampaign();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isAdmin = user?.roles.includes('ADMIN') ?? false;

  const [form, setForm] = useState({
    title: '', description: '', story: '', goalAmount: '',
    coverImageUrl: '', videoUrl: '', endDate: '',
    allowAnonymous: true, minDonation: '', maxDonation: '',
    categoryId: '', status: 'DRAFT',
  });

  // Populate form when data loads
  useEffect(() => {
    const c = data?.data;
    if (!c) return;
    setForm({
      title: c.title ?? '',
      description: c.description ?? '',
      story: c.story ?? '',
      goalAmount: String(c.goalAmount ?? ''),
      coverImageUrl: c.coverImageUrl ?? '',
      videoUrl: c.videoUrl ?? '',
      endDate: c.endDate ? c.endDate.slice(0, 10) : '',
      allowAnonymous: c.allowAnonymous ?? true,
      minDonation: c.minDonation ? String(c.minDonation) : '',
      maxDonation: c.maxDonation ? String(c.maxDonation) : '',
      categoryId: c.category?.id ?? '',
      status: c.status ?? 'DRAFT',
    });
  }, [data?.data]);

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    try {
      await updateCampaign.mutateAsync({
        title: form.title,
        description: form.description,
        story: form.story,
        goalAmount: parseFloat(form.goalAmount),
        coverImageUrl: form.coverImageUrl || undefined,
        videoUrl: form.videoUrl || undefined,
        endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
        allowAnonymous: form.allowAnonymous,
        minDonation: form.minDonation ? parseFloat(form.minDonation) : undefined,
        maxDonation: form.maxDonation ? parseFloat(form.maxDonation) : undefined,
        status: form.status,
      });
      toast.success('Campaign saved successfully');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Save failed';
      toast.error(msg);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCampaign.mutateAsync(id!);
      toast.success('Campaign deleted');
      navigate('/dashboard/campaigns');
    } catch { toast.error('Failed to delete campaign'); }
  };

  if (isLoading) return <PageLoader />;
  if (!data?.data) return (
    <div className="text-center py-20">
      <p className="">Campaign not found</p>
      <Link to="/dashboard/campaigns" className="text-indigo-600 text-sm mt-2 inline-block">← Back</Link>
    </div>
  );

  const campaign = data.data;
  const statusOptions = isAdmin ? ADMIN_STATUS_OPTIONS : STATUS_OPTIONS;

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to="/dashboard/campaigns" className="p-2 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-lg font-bold">Edit Campaign</h1>
            <p className="text-xs mt-0.5 truncate max-w-xs">{campaign.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Link to={`/campaigns/${campaign.slug}`} target="_blank">
            <Button variant="outline" size="sm" leftIcon={<Eye size={13} />}>Preview</Button>
          </Link>
          <Button
            size="sm"
            onClick={handleSave}
            loading={updateCampaign.isPending}
            leftIcon={<Save size={13} />}
          >
            Save Changes
          </Button>
        </div>
      </div>

      {/* Status + danger zone banner */}
      <div className="flex items-center justify-between p-3.5 rounded-xl border mb-6">
        <div className="flex items-center gap-3">
          <span className="text-xs">Status:</span>
          <Badge variant={campaign.status === 'ACTIVE' ? 'success' : campaign.status === 'DRAFT' ? 'default' : 'warning'}>
            {campaign.status}
          </Badge>
          <span className="text-xs">·</span>
          <span className="text-xs">{campaign.progressPercent}% funded · {campaign.donorsCount} donors</span>
        </div>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
        >
          <Trash2 size={12} /> Delete Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* Left — main form */}
        <div className="space-y-5">
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-semibold">Campaign Details</h3>
            <Input
              label="Title" required
              value={form.title}
              onChange={e => set('title', e.target.value)}
            />
            <Textarea
              label="Short description" required rows={2}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              hint={`${form.description.length}/500`}
            />
            <Textarea
              label="Full story" required rows={10}
              value={form.story}
              onChange={e => set('story', e.target.value)}
              hint={`${form.story.length} characters`}
            />
            <Input
              label="Cover image URL" type="url"
              value={form.coverImageUrl}
              onChange={e => set('coverImageUrl', e.target.value)}
            />
            {form.coverImageUrl && (
              <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-100">
                <img src={form.coverImageUrl} alt="Cover preview" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
              </div>
            )}
            <Input
              label="Video URL (YouTube/Vimeo)" type="url"
              value={form.videoUrl}
              onChange={e => set('videoUrl', e.target.value)}
            />
          </Card>

          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-semibold">Funding Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Funding goal ($)" required type="number"
                value={form.goalAmount}
                onChange={e => set('goalAmount', e.target.value)}
              />
              <Input
                label="End date" type="date"
                value={form.endDate}
                onChange={e => set('endDate', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Min donation ($)" type="number" placeholder="No minimum"
                value={form.minDonation}
                onChange={e => set('minDonation', e.target.value)}
              />
              <Input
                label="Max donation ($)" type="number" placeholder="No maximum"
                value={form.maxDonation}
                onChange={e => set('maxDonation', e.target.value)}
              />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => set('allowAnonymous', !form.allowAnonymous)}
                className={`w-10 h-[22px] rounded-full transition-colors flex items-center px-0.5 ${form.allowAnonymous ? 'bg-indigo-600' : 'bg-slate-200'}`}
              >
                <div className={`w-4 h-4 rounded-full shadow transition-transform ${form.allowAnonymous ? 'translate-x-[18px]' : ''}`} />
              </div>
              <div>
                <p className="text-sm font-medium">Allow anonymous donations</p>
              </div>
            </label>

            {/* Status selector */}
            <Select
              label="Campaign status"
              value={form.status}
              onChange={e => set('status', e.target.value)}
              options={statusOptions}
            />
            {!isAdmin && (
              <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl p-3">
                <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
                Setting to "Submit for Review" notifies admins. Status ACTIVE requires admin approval.
              </div>
            )}
          </Card>
        </div>

        {/* Right — rewards + updates */}
        <div className="space-y-5">
          <Card className="p-5">
            <RewardManager campaignId={id!} />
          </Card>
          <Card className="p-5">
            <UpdatesPanel campaignId={id!} />
          </Card>
        </div>
      </div>

      {/* Delete confirmation modal */}
      <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Campaign" size="sm">
        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
            <AlertTriangle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">
              This will permanently deactivate <strong>{campaign.title}</strong>. Donation records will be preserved but the campaign will no longer be visible.
            </p>
          </div>
          <div className="flex gap-2.5">
            <Button variant="secondary" fullWidth onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button variant="danger" fullWidth onClick={handleDelete} loading={deleteCampaign.isPending}>
              Delete Campaign
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
