import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Plus, Trash2, Info } from 'lucide-react';
import { useCreateCampaign, useCategories } from '../../hooks/useApi';
import { Input, Textarea, Select, Button, Card } from '../../components/ui';
import toast from 'react-hot-toast';

interface RewardDraft {
  title: string; description: string; minimumAmount: string;
  maxClaims: string; estimatedDelivery: string;
}

const STEPS = ['Basics', 'Story', 'Rewards', 'Settings', 'Review'];

export function CreateCampaignPage() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const createCampaign = useCreateCampaign();
  const { data: categoriesData } = useCategories();
  const categories = (categoriesData?.data as { id: string; name: string }[] | undefined) ?? [];

  const [form, setForm] = useState({
    title: '', categoryId: '', description: '',
    story: '', goalAmount: '', currency: 'USD',
    coverImageUrl: '', videoUrl: '', startDate: '',
    endDate: '', allowAnonymous: true, minDonation: '', maxDonation: '',
  });
  const [rewards, setRewards] = useState<RewardDraft[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const validateStep = () => {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!form.title || form.title.length < 5) e.title = 'Title must be at least 5 characters';
      if (!form.categoryId) e.categoryId = 'Please select a category';
      if (!form.description || form.description.length < 20) e.description = 'Description must be at least 20 characters';
      if (!form.goalAmount || parseFloat(form.goalAmount) <= 0) e.goalAmount = 'Goal must be a positive number';
    }
    if (step === 1) {
      if (!form.story || form.story.length < 100) e.story = 'Story must be at least 100 characters';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => { if (validateStep()) setStep(s => Math.min(s + 1, STEPS.length - 1)); };
  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  const addReward = () => setRewards(r => [...r, { title: '', description: '', minimumAmount: '', maxClaims: '', estimatedDelivery: '' }]);
  const removeReward = (i: number) => setRewards(r => r.filter((_, idx) => idx !== i));
  const setReward = (i: number, k: keyof RewardDraft, v: string) =>
    setRewards(r => r.map((rr, idx) => idx === i ? { ...rr, [k]: v } : rr));

  const handleSubmit = async () => {
    try {
      const payload = {
        title: form.title,
        categoryId: form.categoryId,
        description: form.description,
        story: form.story,
        goalAmount: parseFloat(form.goalAmount),
        currency: form.currency,
        coverImageUrl: form.coverImageUrl || undefined,
        videoUrl: form.videoUrl || undefined,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
        endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
        allowAnonymous: form.allowAnonymous,
        minDonation: form.minDonation ? parseFloat(form.minDonation) : undefined,
        maxDonation: form.maxDonation ? parseFloat(form.maxDonation) : undefined,
      };
      const res = await createCampaign.mutateAsync(payload);
      toast.success('Campaign created successfully!');
      navigate(`/campaigns/${(res.data as { slug: string }).slug}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to create campaign';
      toast.error(msg);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Launch a Campaign</h1>
        <p className="text-sm">Share your vision with the world</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-1 mb-8 overflow-x-auto">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-1 flex-shrink-0">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${i === step ? 'bg-indigo-600 text-white' : i < step ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100'}`}>
              {i < step ? '✓' : <span className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center text-[10px]">{i + 1}</span>}
              {s}
            </div>
            {i < STEPS.length - 1 && <ChevronRight size={12} className="text-slate-300" />}
          </div>
        ))}
      </div>

      <Card className="p-6">
        {/* Step 0: Basics */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold mb-4">Campaign Basics</h2>
            <Input
              label="Campaign title" required placeholder="An inspiring, descriptive title"
              value={form.title} onChange={e => set('title', e.target.value)}
              error={errors.title}
            />
            <Select
              label="Category" required
              value={form.categoryId} onChange={e => set('categoryId', e.target.value)}
              error={errors.categoryId}
              options={[{ value: '', label: 'Select a category…' }, ...categories.map(c => ({ value: c.id, label: c.name }))]}
            />
            <Textarea
              label="Short description" required rows={3}
              placeholder="Summarize your campaign in 1–2 sentences"
              value={form.description} onChange={e => set('description', e.target.value)}
              error={errors.description}
              hint={`${form.description.length}/500`}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Funding goal (USD)" required type="number" min="1"
                placeholder="e.g. 10000"
                value={form.goalAmount} onChange={e => set('goalAmount', e.target.value)}
                error={errors.goalAmount}
              />
              <div>
                <label className="block text-sm font-medium mb-1.5">Currency</label>
                <select
                  value={form.currency} onChange={e => set('currency', e.target.value)}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-300"
                >
                  {['USD', 'EUR', 'GBP', 'CAD', 'AUD'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <Input
              label="Cover image URL" type="url" placeholder="https://…"
              value={form.coverImageUrl} onChange={e => set('coverImageUrl', e.target.value)}
            />
          </div>
        )}

        {/* Step 1: Story */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold mb-4">Your Campaign Story</h2>
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-800">
              <Info size={15} className="flex-shrink-0 mt-0.5 text-blue-600" />
              <p>A compelling story dramatically improves funding success. Share your motivation, plan, and impact.</p>
            </div>
            <Textarea
              label="Full story" required rows={14}
              placeholder="Tell your story here. Include: Why this matters, what the funds will be used for, and what supporters will achieve by backing you..."
              value={form.story} onChange={e => set('story', e.target.value)}
              error={errors.story}
              hint={`${form.story.length} characters (min 100)`}
            />
            <Input
              label="Video URL (optional)" type="url" placeholder="https://youtube.com/watch?v=…"
              value={form.videoUrl} onChange={e => set('videoUrl', e.target.value)}
              hint="Embed a YouTube or Vimeo video to increase engagement"
            />
          </div>
        )}

        {/* Step 2: Rewards */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">Backer Rewards</h2>
              <Button variant="outline" size="sm" leftIcon={<Plus size={13} />} onClick={addReward}>
                Add reward
              </Button>
            </div>
            <p className="text-sm">Rewards are optional but significantly increase donor conversion.</p>

            {rewards.length === 0 ? (
              <div className="border-2 border-dashed rounded-2xl p-8 text-center">
                <p className="text-slate-500 text-sm mb-3">No rewards added yet</p>
                <Button variant="secondary" size="sm" leftIcon={<Plus size={13} />} onClick={addReward}>
                  Add your first reward
                </Button>
              </div>
            ) : rewards.map((r, i) => (
              <div key={i} className="border rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider">Reward #{i + 1}</span>
                  <button onClick={() => removeReward(i)} className="p-1 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Title" placeholder="e.g. Early Bird" value={r.title} onChange={e => setReward(i, 'title', e.target.value)} />
                  <Input label="Minimum pledge ($)" type="number" placeholder="25" value={r.minimumAmount} onChange={e => setReward(i, 'minimumAmount', e.target.value)} />
                </div>
                <Textarea label="Description" rows={2} placeholder="What does the backer receive?" value={r.description} onChange={e => setReward(i, 'description', e.target.value)} />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Max claims (optional)" type="number" placeholder="Unlimited" value={r.maxClaims} onChange={e => setReward(i, 'maxClaims', e.target.value)} />
                  <Input label="Est. delivery" type="month" value={r.estimatedDelivery} onChange={e => setReward(i, 'estimatedDelivery', e.target.value)} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 3: Settings */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold mb-4">Campaign Settings</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Start date" type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
              <Input label="End date" type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} hint="Leave blank for no deadline" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Minimum donation ($)" type="number" placeholder="No minimum" value={form.minDonation} onChange={e => set('minDonation', e.target.value)} />
              <Input label="Maximum donation ($)" type="number" placeholder="No maximum" value={form.maxDonation} onChange={e => set('maxDonation', e.target.value)} />
            </div>
            <label className="flex items-center gap-3 cursor-pointer p-4 border rounded-xl hover:bg-slate-50 transition-colors">
              <div
                onClick={() => set('allowAnonymous', !form.allowAnonymous)}
                className={`w-10 h-5.5 h-[22px] rounded-full transition-colors flex items-center px-0.5 ${form.allowAnonymous ? 'bg-indigo-600' : 'bg-slate-200'}`}
              >
                <div className={`w-4 h-4 rounded-full shadow transition-transform ${form.allowAnonymous ? 'translate-x-[18px]' : ''}`} />
              </div>
              <div>
                <p className="text-sm font-medium">Allow anonymous donations</p>
                <p className="text-xs">Donors can choose to hide their identity</p>
              </div>
            </label>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold mb-4">Review & Launch</h2>
            <div className="space-y-3 text-sm">
              {[
                ['Title', form.title],
                ['Category', categories.find(c => c.id === form.categoryId)?.name ?? '—'],
                ['Goal', `$${parseFloat(form.goalAmount || '0').toLocaleString()} ${form.currency}`],
                ['Rewards', `${rewards.length} reward(s)`],
                ['Anonymous donations', form.allowAnonymous ? 'Allowed' : 'Not allowed'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-2 border-b border-slate-50">
                  <span className="">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
            <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100 text-sm text-amber-800">
              <Info size={15} className="flex-shrink-0 mt-0.5 text-amber-600" />
              <p>Your campaign will be submitted for review. It will go live once approved by our team.</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t">
          <Button variant="ghost" onClick={prevStep} disabled={step === 0}>← Back</Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={nextStep} rightIcon={<ChevronRight size={15} />}>Continue</Button>
          ) : (
            <Button onClick={handleSubmit} loading={createCampaign.isPending}>
              🚀 Submit Campaign
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
