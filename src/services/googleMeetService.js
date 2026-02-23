// src/services/googleMeetService.js
import api from './api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const OAUTH_START_PATH = import.meta.env.VITE_GOOGLE_MEET_OAUTH_START_PATH || '/v1/tutor/google-meet/oauth/start';
const OAUTH_STATUS_PATH = import.meta.env.VITE_GOOGLE_MEET_OAUTH_STATUS_PATH || '/v1/tutor/google-meet/oauth/status';
const OAUTH_REFRESH_PATH = import.meta.env.VITE_GOOGLE_MEET_OAUTH_REFRESH_PATH || '/v1/tutor/google-meet/oauth/refresh';
const OAUTH_REVOKE_PATH = import.meta.env.VITE_GOOGLE_MEET_OAUTH_REVOKE_PATH || '/v1/tutor/google-meet/oauth/revoke';
const CREATE_MEETING_PATH = import.meta.env.VITE_GOOGLE_MEET_CREATE_PATH || '/v1/tutor/google-meet/create-meeting';
const PERMANENT_LINK_PATH = import.meta.env.VITE_GOOGLE_MEET_PERMANENT_LINK_PATH || '/v1/tutor/google-meet/permanent-link';

const normalizeBaseUrl = (value) => (value.endsWith('/') ? value.slice(0, -1) : value);
const normalizePath = (value) => (value.startsWith('/') ? value : `/${value}`);
const buildApiUrl = (path) => `${normalizeBaseUrl(API_BASE_URL)}${normalizePath(path)}`;

// FIX 5: Extract backend error code from axios error response
const extractErrorCode = (error) => {
  return (
    error?.response?.data?.error?.code ||
    error?.response?.data?.code ||
    error?.code ||
    null
  );
};

const extractErrorMessage = (error) => {
  return (
    error?.response?.data?.error?.message ||
    error?.response?.data?.message ||
    error?.message ||
    'An unexpected error occurred'
  );
};

const parseMeetingResponse = (payload) => {
  const root = payload?.data || payload;
  const data = root?.data || root;
  return {
    meetingId: data?.meetingId || data?.spaceId || null,
    joinUrl: data?.joinUrl || data?.meetingLink || data?.meetUrl || data?.meetingUri || null,
    startTime: data?.startTime || null,
    endTime: data?.endTime || null,
    usageCount: data?.usageCount ?? null,
    lastUsedAt: data?.lastUsedAt ?? null,
    calendarEventId: data?.calendarEventId ?? null,
    raw: data,
  };
};

// FIX 3: OAuth start URL must go through backend so tutorId is encoded in state.
// Do NOT build the Google auth URL client-side — redirect through the backend endpoint.
export const getGoogleMeetOAuthStartUrl = (redirectUrl) => {
  const url = new URL(buildApiUrl(OAUTH_START_PATH));
  if (redirectUrl) {
    url.searchParams.set('redirect', redirectUrl);
  }
  // The backend's startOAuth handler reads tutorId from req.tutor (auth middleware)
  // and encodes it in the state param — so this MUST go through the API.
  return url.toString();
};

// Kept for backwards compatibility but now clearly documented
export const getGoogleMeetOAuthUrl = getGoogleMeetOAuthStartUrl;

export const getGoogleMeetAuthStatus = async () => {
  try {
    const response = await api.get(OAUTH_STATUS_PATH);
    const payload = response?.data || response;
    const data = payload?.data || payload;
    return {
      connected: Boolean(data?.connected),
      expiresAt: data?.expiresAt || null,
      scopes: data?.scopes || [],
      status: data?.status || null,
    };
  } catch (error) {
    return {
      connected: false,
      expiresAt: null,
      scopes: [],
      status: 'error',
      error,
    };
  }
};

export const refreshGoogleMeetAuth = async () => {
  const response = await api.post(OAUTH_REFRESH_PATH);
  const payload = response?.data || response;
  return payload?.data || payload;
};

export const revokeGoogleMeetAuth = async () => {
  const response = await api.post(OAUTH_REVOKE_PATH);
  const payload = response?.data || response;
  return payload?.data || payload;
};

export const createGoogleMeetMeeting = async (request) => {
  try {
    const response = await api.post(CREATE_MEETING_PATH, request);
    return parseMeetingResponse(response);
  } catch (error) {
    // FIX 5: Use proper error code extraction
    const code = extractErrorCode(error);
    if (code === 'AUTH_FAILED') {
      await refreshGoogleMeetAuth();
      const retryResponse = await api.post(CREATE_MEETING_PATH, request);
      return parseMeetingResponse(retryResponse);
    }
    // Re-throw with enriched error for upstream handling
    const enriched = new Error(extractErrorMessage(error));
    enriched.code = code;
    enriched.status = error?.response?.status;
    throw enriched;
  }
};

// FIX 4: Do NOT send tutorId from the frontend — backend derives it from req.tutor._id
// Only send the fields the backend actually accepts and uses.
export const getOrCreatePermanentGoogleMeetLink = async (request, options = {}) => {
  const { tutorId: _ignored, studentId: _ignoredStudent, ...rest } = request;

  const payload = {
    meetingTitle: rest.meetingTitle,
    scheduledTime: rest.scheduledTime,
    durationMinutes: rest.durationMinutes,
    forceNew: Boolean(options.forceNew),
  };

  const execute = async (body) => {
    const response = await api.post(PERMANENT_LINK_PATH, body);
    return parseMeetingResponse(response);
  };

  try {
    return await execute(payload);
  } catch (error) {
    const code = extractErrorCode(error);

    if (code === 'AUTH_FAILED') {
      await refreshGoogleMeetAuth();
      return execute(payload);
    }

    const invalidCodes = ['MEETING_LINK_INVALID', 'MEETING_LINK_EXPIRED', 'MEETING_LINK_FAILED'];
    if (!options.forceNew && invalidCodes.includes(code)) {
      return execute({ ...payload, forceNew: true });
    }

    const enriched = new Error(extractErrorMessage(error));
    enriched.code = code;
    enriched.status = error?.response?.status;
    throw enriched;
  }
};