const toBoolean = (value, defaultValue = true) => {
  if (value === undefined || value === null || value === '') return defaultValue;
  return String(value).toLowerCase() !== 'false';
};

export const featureFlags = {
  googleMeet: toBoolean(import.meta.env.VITE_FEATURE_GOOGLE_MEET, true),
  googleMeetEmbed: toBoolean(import.meta.env.VITE_FEATURE_GOOGLE_MEET_EMBED, true),
};
