import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { http } from '../services/api';
import type { Campaign, AdminStats, CreatorStats, DonorStats } from '../types';

export function useCampaigns(params?: Record<string, unknown>) {
  return useQuery({ queryKey: ['campaigns', params], queryFn: () => http.get<Campaign[]>('/campaigns', params) });
}
export function useCampaign(id: string) {
  return useQuery({ queryKey: ['campaign', id], queryFn: () => http.get<Campaign>(`/campaigns/${id}`), enabled: !!id });
}
export function useCampaignBySlug(slug: string) {
  return useQuery({ queryKey: ['campaign-slug', slug], queryFn: () => http.get<Campaign>(`/campaigns/slug/${slug}`), enabled: !!slug });
}
export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (d: Record<string, unknown>) => http.post<Campaign>('/campaigns', d), onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns'] }) });
}
export function useUpdateCampaign(id: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (d: Record<string, unknown>) => http.patch<Campaign>(`/campaigns/${id}`, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['campaign', id] }); qc.invalidateQueries({ queryKey: ['campaigns'] }); } });
}
export function useDeleteCampaign() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => http.delete(`/campaigns/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns'] }) });
}
export function useRewards(campaignId: string) {
  return useQuery({ queryKey: ['rewards', campaignId], queryFn: () => http.get(`/campaigns/${campaignId}/rewards`), enabled: !!campaignId });
}
export function useCreateReward(campaignId: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (d: Record<string, unknown>) => http.post(`/campaigns/${campaignId}/rewards`, d), onSuccess: () => qc.invalidateQueries({ queryKey: ['rewards', campaignId] }) });
}
export function useDeleteReward(campaignId: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => http.delete(`/rewards/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['rewards', campaignId] }) });
}
export function useComments(campaignId: string, page = 1) {
  return useQuery({ queryKey: ['comments', campaignId, page], queryFn: () => http.get(`/campaigns/${campaignId}/comments`, { page, limit: 20 }), enabled: !!campaignId });
}
export function useCreateComment(campaignId: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (d: { content: string; parentId?: string }) => http.post(`/campaigns/${campaignId}/comments`, d), onSuccess: () => qc.invalidateQueries({ queryKey: ['comments', campaignId] }) });
}
export function useDeleteComment(campaignId: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => http.delete(`/comments/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['comments', campaignId] }) });
}
export function useLikeComment(campaignId: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => http.post(`/comments/${id}/like`), onSuccess: () => qc.invalidateQueries({ queryKey: ['comments', campaignId] }) });
}
export function useCampaignUpdates(campaignId: string) {
  return useQuery({ queryKey: ['updates', campaignId], queryFn: () => http.get(`/campaigns/${campaignId}/updates`), enabled: !!campaignId });
}
export function useCreateCampaignUpdate(campaignId: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (d: Record<string, unknown>) => http.post(`/campaigns/${campaignId}/updates`, d), onSuccess: () => qc.invalidateQueries({ queryKey: ['updates', campaignId] }) });
}
export function useCreateDonation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: Record<string, unknown>) => http.post('/donations', d),
    onSuccess: (_d, vars) => { qc.invalidateQueries({ queryKey: ['campaign', vars.campaignId as string] }); qc.invalidateQueries({ queryKey: ['campaigns'] }); qc.invalidateQueries({ queryKey: ['analytics'] }); }
  });
}
export function useRecentDonations(campaignId: string) {
  return useQuery({ queryKey: ['recent-donations', campaignId], queryFn: () => http.get(`/campaigns/${campaignId}/donations/recent`), enabled: !!campaignId, refetchInterval: 30_000 });
}
export function useDonations(params?: Record<string, unknown>) {
  return useQuery({ queryKey: ['donations', params], queryFn: () => http.get('/donations', params) });
}
export function useUsers(params?: Record<string, unknown>) {
  return useQuery({ queryKey: ['users', params], queryFn: () => http.get('/users', params) });
}
export function useSetUserActive() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => http.patch(`/users/${id}/status`, { isActive }), onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }) });
}
export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => http.delete(`/users/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }) });
}
export function useReports(params?: Record<string, unknown>) {
  return useQuery({ queryKey: ['reports', params], queryFn: () => http.get('/reports', params) });
}
export function useCreateReport() {
  return useMutation({ mutationFn: (d: Record<string, unknown>) => http.post('/reports', d) });
}
export function useResolveReport() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, status }: { id: string; status: string }) => http.patch(`/reports/${id}/resolve`, { status }), onSuccess: () => qc.invalidateQueries({ queryKey: ['reports'] }) });
}
export function useAdminStats() {
  return useQuery({ queryKey: ['analytics', 'admin'], queryFn: () => http.get<AdminStats>('/analytics/admin'), staleTime: 60_000 });
}
export function useCreatorStats() {
  return useQuery({ queryKey: ['analytics', 'creator'], queryFn: () => http.get<CreatorStats>('/analytics/creator'), staleTime: 60_000 });
}
export function useDonorStats() {
  return useQuery({ queryKey: ['analytics', 'donor'], queryFn: () => http.get<DonorStats>('/analytics/donor'), staleTime: 60_000 });
}
export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: () => http.get('/categories'), staleTime: Infinity });
}
