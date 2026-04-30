import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  FeedItem,
  FeedComment,
  FeedReaction,
  ReactionType,
  fetchFeeds,
  createPost,
  addComment,
  toggleReaction,
} from "../actions/feedActions";

interface FeedState {
  feeds: FeedItem[];
  loading: boolean;
  loadingMore: boolean;
  posting: boolean;
  commenting: boolean;
  reacting: boolean;
  nextCursor: string | null;
  hasMore: boolean;
  error: string | null;
}

const initialState: FeedState = {
  feeds: [],
  loading: false,
  loadingMore: false,
  posting: false,
  commenting: false,
  reacting: false,
  nextCursor: null,
  hasMore: true,
  error: null,
};

const feedSlice = createSlice({
  name: "feed",
  initialState,
  reducers: {
    clearFeedError: (state) => { state.error = null; },
    resetFeed: (state) => {
      state.feeds = [];
      state.nextCursor = null;
      state.hasMore = true;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchFeeds — initial load
    builder.addCase(fetchFeeds.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchFeeds.fulfilled, (state, action) => {
      state.loading = false;
      state.feeds = action.payload.feeds;
      state.nextCursor = action.payload.nextCursor;
      state.hasMore = action.payload.hasMore;
    });
    builder.addCase(fetchFeeds.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // createPost
    builder.addCase(createPost.pending, (state) => {
      state.posting = true;
      state.error = null;
    });
    builder.addCase(createPost.fulfilled, (state, action: PayloadAction<FeedItem>) => {
      state.posting = false;
      // Inject mock _count since backend may not return it on create
      const post = { ...action.payload, _count: { comments: 0, reactions: 0 }, comments: [], reactions: [] };
      state.feeds.unshift(post);
    });
    builder.addCase(createPost.rejected, (state, action) => {
      state.posting = false;
      state.error = action.payload as string;
    });

    // addComment
    builder.addCase(addComment.pending, (state) => { state.commenting = true; });
    builder.addCase(addComment.fulfilled, (state, action: PayloadAction<FeedComment>) => {
      state.commenting = false;
      const comment = action.payload;
      const feed = state.feeds.find((f) => f.id === comment.feedId);
      if (feed) {
        feed.comments = [comment, ...feed.comments];
        feed._count.comments += 1;
      }
    });
    builder.addCase(addComment.rejected, (state, action) => {
      state.commenting = false;
      state.error = action.payload as string;
    });

    // toggleReaction
    builder.addCase(toggleReaction.pending, (state) => { state.reacting = true; });
    builder.addCase(toggleReaction.fulfilled, (state, action) => {
      state.reacting = false;
      const { feedId, action: reactionAction, reaction } = action.payload;
      const feed = state.feeds.find((f) => f.id === feedId);
      if (!feed) return;

      if (reactionAction === "ADDED" || reactionAction === "UPDATED") {
        if (reaction) {
          const existingIdx = feed.reactions.findIndex(
            (r) => r.userId === reaction.userId
          );
          if (existingIdx >= 0) {
            feed.reactions[existingIdx] = reaction;
          } else {
            feed.reactions.push(reaction);
          }
        }
        feed._count.reactions += 1;
      } else if (reactionAction === "REMOVED") {
        feed.reactions = feed.reactions.filter((r) => r.userId !== reaction?.userId);
        feed._count.reactions = Math.max(0, feed._count.reactions - 1);
      }
    });
    builder.addCase(toggleReaction.rejected, (state, action) => {
      state.reacting = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearFeedError, resetFeed } = feedSlice.actions;
export default feedSlice.reducer;