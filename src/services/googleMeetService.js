import api from './api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const OAUTH_START_PATH = import.meta.env.VITE_GOOGLE_MEET_OAUTH_START_PATH || '/v1/tutor/google-meet/oauth/start';
const OAUTH_STATUS_PATH = import.meta.env.VITE_GOOGLE_MEET_OAUTH_STATUS_PATH || '/v1/tutor/google-meet/oauth/status';
const OAUTH_REFRESH_PATH = import.meta.env.VITE_GOOGLE_MEET_OAUTH_REFRESH_PATH || '/v1/tutor/google-meet/oauth/refresh';
const OAUTH_REVOKE_PATH = import.meta.env.VITE_GOOGLE_MEET_OAUTH_REVOKE_PATH || '/v1/tutor/google-meet/oauth/revoke';
const CREATE_MEETING_PATH = import.meta.env.VITE_GOOGLE_MEET_CREATE_PATH || '/v1/tutor/google-meet/create-meeting';

const normalizeBaseUrl = (value) => (value.endsWith('/') ? value.slice(0, -1) : value);
const normalizePath = (value) => (value.startsWith('/') ? value : `/${value}`);
const buildApiUrl = (path) => `${normalizeBaseUrl(API_BASE_URL)}${normalizePath(path)}`;

const parseMeetingResponse = (payload) => {
  const root = payload?.data || payload;
  const data = root?.data || root;
  return {
    meetingId: data?.meetingId || data?.spaceId || null,
    joinUrl: data?.joinUrl || data?.meetingLink || data?.meetUrl || data?.meetingUri || null,
    startTime: data?.startTime || null,
    endTime: data?.endTime || null,
    raw: data,
  };
};

export const getGoogleMeetOAuthUrl = (redirectUrl) => {
  const url = new URL(buildApiUrl(OAUTH_START_PATH));
  if (redirectUrl) {
    url.searchParams.set('redirect', redirectUrl);
  }
  return url.toString();
};

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
    const isAuthFailed = error?.code === 'AUTH_FAILED';
    if (!isAuthFailed) {
      throw error;
    }
    await refreshGoogleMeetAuth();
    const retryResponse = await api.post(CREATE_MEETING_PATH, request);
    return parseMeetingResponse(retryResponse);
  }
};
