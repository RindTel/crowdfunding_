import { useState } from 'react';
import { Heart, Trash2, Reply, ChevronDown, MessageCircle } from 'lucide-react';
import { useComments, useCreateComment, useDeleteComment, useLikeComment } from '../../hooks/useApi';
import { useAuthStore } from '../../store/auth.store';
import { Avatar, PageLoader, EmptyState } from '../../components/ui';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

interface CommentData {
  id: string;
  content: string;
  likesCount: number;
  createdAt: string;
  user: { id: string; firstName: string; lastName: string; avatarUrl?: string | null };
  replies?: CommentData[];
  _count?: { replies: number };
}

function CommentItem({ comment, campaignId, depth = 0 }: {
  comment: CommentData; campaignId: string; depth?: number;
}) {
  const { user, isAuthenticated } = useAuthStore();
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const createComment = useCreateComment(campaignId);
  const deleteComment = useDeleteComment(campaignId);
  const likeComment = useLikeComment(campaignId);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    try {
      await createComment.mutateAsync({ content: replyText, parentId: comment.id });
      setReplyText('');
      setShowReply(false);
      toast.success('Reply posted');
    } catch { toast.error('Failed to post reply'); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this comment?')) return;
    try {
      await deleteComment.mutateAsync(comment.id);
      toast.success('Comment deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleLike = async () => {
    try { await likeComment.mutateAsync(comment.id); }
    catch { /* ignore */ }
  };

  const isOwner = user?.id === comment.user.id;
  const isAdmin = user?.roles.includes('ADMIN');

  return (
    <div className={`${depth > 0 ? 'ml-10 border-l-2 pl-4' : ''}`}>
      <div className="flex gap-3">
        <Avatar
          name={`${comment.user.firstName} ${comment.user.lastName}`}
          src={comment.user.avatarUrl}
          size={depth > 0 ? 'sm' : 'md'}
        />
        <div className="flex-1 min-w-0">
          <div className="bg-slate-50 rounded-2xl px-4 py-3 mb-1.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-semibold">
                {comment.user.firstName} {comment.user.lastName}
              </span>
              <span className="text-xs">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm leading-relaxed">{comment.content}</p>
          </div>

          <div className="flex items-center gap-3 px-1">
            <button onClick={handleLike} className="flex items-center gap-1 text-xs hover:text-rose-500 transition-colors">
              <Heart size={12} /> {comment.likesCount > 0 && comment.likesCount}
            </button>
            {isAuthenticated && depth === 0 && (
              <button onClick={() => setShowReply(v => !v)} className="flex items-center gap-1 text-xs hover:text-indigo-600 transition-colors">
                <Reply size={12} /> Reply
              </button>
            )}
            {(isOwner || isAdmin) && (
              <button onClick={handleDelete} className="flex items-center gap-1 text-xs hover:text-red-500 transition-colors ml-auto">
                <Trash2 size={11} /> Delete
              </button>
            )}
          </div>

          {showReply && (
            <div className="mt-2 flex gap-2">
              <Avatar name={`${user?.firstName} ${user?.lastName}`} size="sm" />
              <div className="flex-1 flex gap-2">
                <input
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder={`Reply to ${comment.user.firstName}…`}
                  className="flex-1 px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleReply()}
                />
                <button onClick={handleReply} disabled={createComment.isPending || !replyText.trim()}
                  className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                  Post
                </button>
              </div>
            </div>
          )}

          {/* Nested replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-3">
              {comment.replies.map(reply => (
                <CommentItem key={reply.id} comment={reply} campaignId={campaignId} depth={depth + 1} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CommentsSection({ campaignId }: { campaignId: string }) {
  const [page, setPage] = useState(1);
  const [newComment, setNewComment] = useState('');
  const { isAuthenticated, user } = useAuthStore();
  const { data, isLoading } = useComments(campaignId, page);
  const createComment = useCreateComment(campaignId);

  const comments = (data?.data ?? []) as CommentData[];
  const meta = data?.meta;

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    try {
      await createComment.mutateAsync({ content: newComment });
      setNewComment('');
      toast.success('Comment posted!');
    } catch { toast.error('Failed to post comment'); }
  };

  return (
    <div className="space-y-5">
      {/* Post comment */}
      {isAuthenticated ? (
        <div className="flex gap-3">
          <Avatar name={`${user?.firstName} ${user?.lastName}`} />
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Share your thoughts or ask a question…"
              rows={3}
              className="w-full px-4 py-3 text-sm border rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder:text-slate-500"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleSubmit}
                disabled={createComment.isPending || !newComment.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-colors"
              >
                {createComment.isPending ? 'Posting…' : 'Post comment'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 rounded-2xl border">
          <MessageCircle size={24} className="text-slate-300 mx-auto mb-2" />
          <p className="text-sm mb-3">Sign in to leave a comment</p>
          <a href="/login" className="text-sm text-indigo-600 font-medium hover:text-indigo-700">Sign in →</a>
        </div>
      )}

      {/* Comments list */}
      {isLoading ? <PageLoader /> : comments.length === 0 ? (
        <EmptyState icon={<MessageCircle size={36} />} title="No comments yet" description="Be the first to start the conversation" />
      ) : (
        <div className="space-y-4">
          {comments.map(c => <CommentItem key={c.id} comment={c} campaignId={campaignId} />)}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={!meta.hasPrev} onClick={() => setPage(p => p - 1)}
            className="px-3 py-1.5 text-xs border rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors">
            Prev
          </button>
          <span className="text-xs">{page} / {meta.totalPages}</span>
          <button disabled={!meta.hasNext} onClick={() => setPage(p => p + 1)}
            className="px-3 py-1.5 text-xs border rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors">
            Next
          </button>
        </div>
      )}
    </div>
  );
}
