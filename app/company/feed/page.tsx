'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Rss,
  Plus,
  X,
  Send,
  MessageSquare,
  Cake,
  Trophy,
  Rocket,
  Users,
  ChevronDown,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchFeeds, createPost, addComment, toggleReaction, ReactionType, FeedItem } from '@/store/actions/feedActions';
import { clearFeedError, resetFeed } from '@/store/slices/feedSlice';
import { fetchDepartments } from '@/store/actions/departmentActions';

// ── Reaction config ──────────────────────────────────────────────────────────
const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: 'LIKE', emoji: '👍', label: 'Like' },
  { type: 'LOVE', emoji: '❤️', label: 'Love' },
  { type: 'CLAP', emoji: '👏', label: 'Clap' },
  { type: 'CELEBRATE', emoji: '🎉', label: 'Celebrate' },
];

// ── Feed text helpers ────────────────────────────────────────────────────────
function getEventLabel(feed: FeedItem): string {
  if (feed.type !== 'EVENT') return '';
  const et = feed.metadata?.eventType;
  const name = feed.subjectedUser?.name || 'Employee';
  if (et === 'BIRTHDAY') return `Wish ${name} a happy birthday! 🎂`;
  if (et === 'WORK_ANNIVERSARY') {
    const years = feed.metadata?.years ?? 1;
    return `🏆 ${name} completed ${years} year${years > 1 ? 's' : ''} with us!`;
  }
  if (et === 'NEW_JOINING') {
    const dept = feed.subjectedUser?.department?.name;
    const desig = feed.subjectedUser?.designation?.name;
    return `🚀 ${name} joined ${dept || 'the team'}${desig ? ` as ${desig}` : ''}.`;
  }
  return '';
}

function getActorDisplay(feed: FeedItem): string {
  if (feed.type === 'POST' && feed.actor) return feed.actor.name;
  if (feed.type === 'EVENT' && feed.subjectedUser) return feed.subjectedUser.name;
  return 'Unknown';
}

function getAvatarInitial(name?: string): string {
  return (name?.[0] || 'U').toUpperCase();
}

// ── Feed Card Component ─────────────────────────────────────────────────────
function FeedCard({
  feed,
  currentUserId,
  onReact,
  onAddComment,
}: {
  feed: FeedItem;
  currentUserId?: string;
  onReact: (feedId: string, type: ReactionType) => void;
  onAddComment: (feedId: string, content: string) => void;
}) {
  const [showAllComments, setShowAllComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const actorName = getActorDisplay(feed);
  const isEvent = feed.type === 'EVENT';
  const eventLabel = getEventLabel(feed);

  // Group reactions by type
  const reactionGroups: Record<ReactionType, number> = {
    LIKE: 0, LOVE: 0, CLAP: 0, CELEBRATE: 0,
  };
  feed.reactions.forEach((r) => { reactionGroups[r.type]++; });

  const userReacted = currentUserId
    ? feed.reactions.find((r) => r.userId === currentUserId)?.type
    : undefined;

  const visibleComments = showAllComments ? feed.comments : feed.comments.slice(0, 2);
  const hasMoreComments = feed.comments.length > 2;

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm hover:border-gray-200 transition-all overflow-hidden">
      {/* Card Header */}
      <div className="p-5 pb-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-11 h-11 rounded-full bg-[#0445AD] flex items-center justify-center text-white font-bold text-sm shrink-0">
            {getAvatarInitial(actorName)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 leading-tight">{actorName}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {isEvent ? 'System' : feed.actor?.email || ''}
              {feed.department && ` · ${feed.department.name}`}
              {feed.createdAt && ` · ${formatTimeAgo(feed.createdAt)}`}
            </p>
          </div>
          {/* Event badge */}
          {isEvent && (
            <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
              {feed.metadata?.eventType === 'BIRTHDAY' ? '🎂 Birthday' :
               feed.metadata?.eventType === 'WORK_ANNIVERSARY' ? '🏆 Anniversary' :
               feed.metadata?.eventType === 'NEW_JOINING' ? '🚀 New Join' : 'Event'}
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="px-5 pb-4">
        {isEvent ? (
          <p className="text-base text-gray-700 font-medium leading-relaxed">{eventLabel}</p>
        ) : (
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{feed.content}</p>
        )}
      </div>

      {/* Reaction summary bar */}
      {(feed._count.reactions > 0 || feed._count.comments > 0) && (
        <div className="px-5 py-2.5 flex items-center gap-3 text-sm text-gray-500 border-t border-gray-50">
          {feed._count.reactions > 0 && (
            <span className="flex items-center gap-1">
              {REACTIONS.filter((r) => reactionGroups[r.type] > 0)
                .map((r) => `${r.emoji}`)
                .join(' ')}
              <span className="ml-1">{feed._count.reactions}</span>
            </span>
          )}
          {feed._count.comments > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              {feed._count.comments}
            </span>
          )}
        </div>
      )}

      {/* Reaction Buttons */}
      <div className="px-5 py-2 flex items-center gap-2 border-t border-gray-100">
        {REACTIONS.map(({ type, emoji, label }) => (
          <button
            key={type}
            onClick={() => onReact(feed.id, type)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border transition-all hover:scale-105 ${
              userReacted === type
                ? 'border-[#0445AD] bg-blue-50 text-[#0445AD] font-medium'
                : 'border-gray-200 text-gray-500 hover:border-gray-400'
            }`}
            title={label}
          >
            <span>{emoji}</span>
            {reactionGroups[type] > 0 && <span>{reactionGroups[type]}</span>}
          </button>
        ))}
      </div>

      {/* Comments Section */}
      <div className="px-5 py-3 border-t border-gray-100">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Wishes & Comments
        </p>

        {feed.comments.length === 0 ? (
          <p className="text-sm text-gray-300 italic">No wishes yet. Be the first!</p>
        ) : (
          <div className="space-y-3">
            {visibleComments.map((comment) => (
              <div key={comment.id} className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-500 shrink-0">
                  {getAvatarInitial(comment.user?.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-semibold text-gray-800">{comment.user?.name || 'You'}</span>
                    {' — '}
                    <span className="text-gray-600">{comment.content}</span>
                  </p>
                  <p className="text-xs text-gray-300 mt-0.5">{formatTimeAgo(comment.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {hasMoreComments && !showAllComments && (
          <button
            onClick={() => setShowAllComments(true)}
            className="mt-2 text-xs text-blue-500 hover:text-blue-700 font-medium"
          >
            View all {feed.comments.length} wishes
          </button>
        )}

        {/* Add Comment Input */}
        <div className="mt-3 flex items-center gap-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && commentText.trim()) {
                onAddComment(feed.id, commentText.trim());
                setCommentText('');
              }
            }}
            placeholder="Add a wish or comment..."
            className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:border-[#0445AD]"
          />
          <button
            onClick={() => {
              if (commentText.trim()) {
                onAddComment(feed.id, commentText.trim());
                setCommentText('');
              }
            }}
            disabled={!commentText.trim()}
            className="text-[#0445AD] hover:text-blue-700 disabled:opacity-30"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Time formatting ─────────────────────────────────────────────────────────
function formatTimeAgo(dateStr?: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── Company Feed Page ────────────────────────────────────────────────────────
export default function CompanyFeedPage() {
  const dispatch = useAppDispatch();
  const { feeds, loading, loadingMore, posting, nextCursor, hasMore, error } = useAppSelector(
    (state) => state.feed
  );
  const { departments } = useAppSelector((state) => state.departments);

  const [showComposer, setShowComposer] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string>('');

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Current user
  useEffect(() => {
    try {
      const u = localStorage.getItem('user');
      if (u) setCurrentUserId(JSON.parse(u)?.id || '');
    } catch {}
  }, []);

  // Initial load
  useEffect(() => {
    dispatch(fetchDepartments());
    dispatch(fetchFeeds({ limit: 20 }));
  }, [dispatch]);

  // Infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current) return;
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && nextCursor) {
          dispatch(fetchFeeds({ limit: 20, cursor: nextCursor }));
        }
      },
      { threshold: 0.1 }
    );
    observerRef.current.observe(loadMoreRef.current);
    return () => observerRef.current?.disconnect();
  }, [dispatch, hasMore, loadingMore, nextCursor]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;
    await dispatch(createPost({ content: postContent, departmentId: selectedDept || null }));
    setPostContent('');
    setSelectedDept('');
    setShowComposer(false);
  };

  const handleReact = (feedId: string, type: ReactionType) => {
    dispatch(toggleReaction({ feedId, type }));
  };

  const handleAddComment = (feedId: string, content: string) => {
    dispatch(addComment({ feedId, content }));
  };

  return (
    <div className="w-full p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-['Montserrat']">Company Feed</h1>
          <p className="text-gray-500 mt-1 text-sm">Announcements, celebrations & updates</p>
        </div>
        <button
          onClick={() => setShowComposer(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0445AD] text-white rounded-xl font-semibold hover:bg-[#033591] transition-all shadow-sm"
        >
          <Plus className="w-4.5 h-4.5" />
          Create Post
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="max-w-3xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex justify-between items-center text-sm">
          <span>{error}</span>
          <button onClick={() => dispatch(clearFeedError())} className="hover:text-red-800">✕</button>
        </div>
      )}

      {/* Post Composer */}
      {showComposer && (
        <div className="max-w-3xl mx-auto mb-8 p-6 bg-white rounded-2xl border-2 border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">New Post</h2>
            <button onClick={() => setShowComposer(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Content</label>
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                rows={4}
                placeholder="Share an announcement or update..."
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#0445AD] resize-none text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Department</label>
              <div className="relative">
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#0445AD] text-sm appearance-none"
                >
                  <option value="">All Company (Company-Wide)</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={posting || !postContent.trim()}
                className="px-6 py-2.5 bg-[#0445AD] text-white rounded-xl font-semibold hover:bg-[#033591] disabled:opacity-50 transition-all text-sm"
              >
                {posting ? 'Posting...' : 'Post'}
              </button>
              <button
                type="button"
                onClick={() => { setShowComposer(false); setPostContent(''); setSelectedDept(''); }}
                className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-all text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Feed List */}
      <div className="">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-3 border-[#0445AD] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : feeds.length === 0 ? (
          <div className="text-center py-16">
            <Rss className="w-12 h-12 mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400 font-medium">No feed items yet. Create the first post!</p>
          </div>
        ) : (
          <>
            {feeds.map((feed) => (
              <FeedCard
                key={feed.id}
                feed={feed}
                currentUserId={currentUserId}
                onReact={handleReact}
                onAddComment={handleAddComment}
              />
            ))}

            {/* Infinite scroll trigger */}
            <div ref={loadMoreRef} className="py-4 flex items-center justify-center">
              {loadingMore && (
                <div className="w-6 h-6 border-2 border-[#0445AD] border-t-transparent rounded-full animate-spin" />
              )}
              {!hasMore && feeds.length > 0 && (
                <p className="text-xs text-gray-300">You're all caught up!</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}