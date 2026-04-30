import { createAsyncThunk } from "@reduxjs/toolkit";

// ── Types ────────────────────────────────────────────────────────────────────

export type FeedType = "POST" | "EVENT";

export type FeedEventType = "NEW_JOINING" | "BIRTHDAY" | "WORK_ANNIVERSARY";

export type ReactionType = "LIKE" | "LOVE" | "CLAP" | "CELEBRATE";

export interface FeedEmployeeProfile {
  photoUrl?: string | null;
  dateOfBirth?: string | null;
  joiningDate?: string | null;
}

export interface FeedUser {
  id: string;
  name: string;
  email?: string;
  employeeProfile?: FeedEmployeeProfile | null;
  department?: { id: string; name: string } | null;
  designation?: { id: string; name: string } | null;
}

export interface FeedComment {
  id: string;
  feedId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user?: FeedUser;
}

export interface FeedReaction {
  id: string;
  feedId: string;
  userId: string;
  type: ReactionType;
  createdAt: string;
  updatedAt: string;
}

export interface FeedItem {
  id: string;
  tenantId: string;
  actorId?: string | null;
  subjectUserId?: string | null;
  departmentId?: string | null;
  type: FeedType;
  content?: string | null;
  metadata?: {
    eventType?: FeedEventType;
    years?: number;
    [key: string]: any;
  };
  actor?: FeedUser | null;
  subjectedUser?: FeedUser | null;
  department?: { id: string; name: string } | null;
  comments: FeedComment[];
  reactions: FeedReaction[];
  _count: {
    comments: number;
    reactions: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface FeedResponse {
  limit: number;
  nextCursor: string | null;
  hasMore: boolean;
  feeds: FeedItem[];
}

export interface CreatePostPayload {
  content: string;
  departmentId?: string | null;
}

export interface ReactionToggleResponse {
  action: "ADDED" | "UPDATED" | "REMOVED";
  reaction: FeedReaction | null;
}

// ── Auth helpers ─────────────────────────────────────────────────────────────

const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("token") : null);

const authHeaders = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

// ── Thunks ────────────────────────────────────────────────────────────────────

// GET /feed-wall/feeds?limit=&cursor=&departmentId=
export const fetchFeeds = createAsyncThunk<
  { feeds: FeedItem[]; nextCursor: string | null; hasMore: boolean },
  { limit?: number; cursor?: string | null; departmentId?: string | null },
  { rejectValue: string }
>(
  "feed/fetchFeeds",
  async ({ limit = 20, cursor, departmentId }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.set("limit", String(limit));
      if (cursor) params.set("cursor", cursor);
      if (departmentId) params.set("departmentId", departmentId);

      const res = await fetch(`${BASE}/org/feed-wall/feeds?${params}`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch feeds");

      return {
        feeds: data.data?.feeds || [],
        nextCursor: data.data?.nextCursor ?? null,
        hasMore: data.data?.hasMore ?? false,
      };
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// POST /feed-wall/create-post
export const createPost = createAsyncThunk<FeedItem, CreatePostPayload, { rejectValue: string }>(
  "feed/createPost",
  async ({ content, departmentId }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/org/feed-wall/create-post`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ content, departmentId }),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to create post");
      return data.data;
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// POST /feed-wall/{feedId}/comments
export const addComment = createAsyncThunk<
  FeedComment,
  { feedId: string; content: string },
  { rejectValue: string }
>(
  "feed/addComment",
  async ({ feedId, content }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/org/feed-wall/${feedId}/comments`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to add comment");
      return data.data;
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// POST /feed-wall/{feedId}/reactions
export const toggleReaction = createAsyncThunk<
  { feedId: string; action: "ADDED" | "UPDATED" | "REMOVED"; reaction: FeedReaction | null },
  { feedId: string; type: ReactionType },
  { rejectValue: string }
>(
  "feed/toggleReaction",
  async ({ feedId, type }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/org/feed-wall/${feedId}/reactions/toggle`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to toggle reaction");
      return {
        feedId,
        action: data.data?.action || "ADDED",
        reaction: data.data?.reaction || null,
      };
    } catch {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);