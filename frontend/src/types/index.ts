export type CampaignStatus =
  | 'DRAFT' | 'PENDING_REVIEW' | 'ACTIVE'
  | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';

export type DonationStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface Creator {
  id: string;
  userId: string;
  bio: string | null;
  isVerified: boolean;
  totalRaised: number;
  user: { firstName: string; lastName: string; avatarUrl: string | null };
}

export interface Reward {
  id: string;
  campaignId: string;
  title: string;
  description: string;
  minimumAmount: number;
  estimatedDelivery: string | null;
  maxClaims: number | null;
  claimsCount: number;
  isAvailable: boolean;
}

export interface Campaign {
  id: string;
  title: string;
  slug: string;
  description: string;
  story: string;
  goalAmount: number;
  raisedAmount: number;
  progressPercent: number;
  currency: string;
  status: CampaignStatus;
  coverImageUrl: string | null;
  videoUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  donorsCount: number;
  donationsCount: number;
  viewsCount: number;
  isFeatured: boolean;
  allowAnonymous: boolean;
  minDonation: number | null;
  maxDonation: number | null;
  creator: Creator;
  category: Category;
  rewards: Reward[];
  _count?: { donations: number; comments: number };
  createdAt: string;
}

export interface Donation {
  id: string;
  campaignId: string;
  donorId: string | null;
  rewardId: string | null;
  amount: number;
  currency: string;
  isAnonymous: boolean;
  message: string | null;
  status: DonationStatus;
  campaign?: { id: string; title: string; slug: string; coverImageUrl: string | null };
  reward?: { title: string } | null;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalCampaigns: number;
  activeCampaigns: number;
  totalRevenue: number;
  totalDonations: number;
  recentDonations: Donation[];
  campaignsByStatus: { status: CampaignStatus; _count: { id: number } }[];
  topCampaigns: Campaign[];
}

export interface CreatorStats {
  campaigns: Campaign[];
  totalRaised: number;
  totalDonations: number;
  recentDonations: Donation[];
  monthlyRevenue: { month: string; revenue: number }[];
}

export interface DonorStats {
  totalDonated: number;
  totalDonations: number;
  supportedCampaigns: number;
  donations: Donation[];
}
