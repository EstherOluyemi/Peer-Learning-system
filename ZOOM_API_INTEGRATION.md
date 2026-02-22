# Zoom API Integration Guide

## Overview
This document explains how to integrate Zoom API for automatic meeting link generation when tutors create sessions.

## Backend Implementation Required

### 1. Zoom API Setup

First, you need to create a Zoom OAuth App:
1. Go to [Zoom App Marketplace](https://marketplace.zoom.us/)
2. Create a Server-to-Server OAuth app
3. Get your credentials:
   - **Account ID**
   - **Client ID**
   - **Client Secret**

Add to your `.env`:
```env
ZOOM_ACCOUNT_ID=your_account_id
ZOOM_CLIENT_ID=your_client_id
ZOOM_CLIENT_SECRET=your_client_secret
```

### 2. Backend Endpoint: Create Meeting

**Route:** `POST /api/v1/tutor/zoom/create-meeting`

**Request Body:**
```json
{
  "topic": "Session Title",
  "duration": 60,
  "startTime": "2026-02-25T14:00:00Z",
  "settings": {
    "auto_recording": "cloud",  // if recordSession is enabled
    "enable_live_captions": true,  // if captions enabled
    "enable_transcript": true  // if transcript enabled
  }
}
```

**Response:**
```json
{
  "meetingId": "84298745632",
  "meetingLink": "https://zoom.us/j/84298745632",
  "passcode": "xY3mK",
  "startUrl": "https://zoom.us/s/84298745632?zak=...",  // For tutor
  "joinUrl": "https://zoom.us/j/84298745632"  // For students
}
```

### 3. Sample Backend Code (Node.js/Express)

```javascript
// routes/zoom.routes.js
const express = require('express');
const { createZoomMeeting } = require('../controllers/zoom.controller');
const { authenticateTutor } = require('../middleware/auth');

const router = express.Router();

router.post('/create-meeting', authenticateTutor, createZoomMeeting);

module.exports = router;
```

```javascript
// controllers/zoom.controller.js
const axios = require('axios');

// Get Zoom Access Token
async function getZoomAccessToken() {
  const credentials = Buffer.from(
    `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
  ).toString('base64');

  const response = await axios.post(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,
    {},
    {
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    }
  );

  return response.data.access_token;
}

// Create Zoom Meeting
exports.createZoomMeeting = async (req, res) => {
  try {
    const { topic, duration, startTime, settings } = req.body;
    const tutorZoomUserId = req.user.zoomUserId; // Store in user profile

    const accessToken = await getZoomAccessToken();

    const meetingData = {
      topic: topic,
      type: 2, // Scheduled meeting
      start_time: startTime,
      duration: duration,
      timezone: 'UTC',
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false,
        mute_upon_entry: true,
        waiting_room: true,
        auto_recording: settings.auto_recording || 'none',
        approval_type: 0, // Automatically approve
        audio: 'both',
        enable_live_captions: settings.enable_live_captions || false,
        enable_transcript: settings.enable_transcript || false,
      },
    };

    const response = await axios.post(
      `https://api.zoom.us/v2/users/${tutorZoomUserId}/meetings`,
      meetingData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({
      meetingId: response.data.id,
      meetingLink: response.data.join_url,
      passcode: response.data.password,
      startUrl: response.data.start_url,
      joinUrl: response.data.join_url,
    });
  } catch (error) {
    console.error('Zoom API Error:', error.response?.data || error.message);
    res.status(500).json({
      message: 'Failed to create Zoom meeting',
      error: error.response?.data || error.message,
    });
  }
};
```

### 4. Update Session Creation Endpoint

```javascript
// controllers/session.controller.js
exports.createSession = async (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      date,
      time,
      duration,
      maxParticipants,
      difficulty,
      accessibilityFeatures,
    } = req.body;

    // 1. Create Zoom meeting
    const zoomMeeting = await createZoomMeeting({
      topic: title,
      duration: duration,
      startTime: new Date(`${date}T${time}`).toISOString(),
      settings: {
        auto_recording: accessibilityFeatures.recordSession ? 'cloud' : 'none',
        enable_live_captions: accessibilityFeatures.captions,
        enable_transcript: accessibilityFeatures.transcript,
      },
    });

    // 2. Save session to database
    const session = await Session.create({
      tutorId: req.user.id,
      title,
      description,
      subject,
      startTime: new Date(`${date}T${time}`),
      duration,
      maxParticipants,
      difficulty,
      meetingLink: zoomMeeting.joinUrl,
      meetingId: zoomMeeting.meetingId,
      meetingPasscode: zoomMeeting.passcode,
      hostStartUrl: zoomMeeting.startUrl,
      accessibilityFeatures,
      status: 'scheduled',
    });

    res.status(201).json({
      message: 'Session created successfully',
      session,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create session',
      error: error.message,
    });
  }
};
```

## Frontend Integration

The frontend (`CreateSession.jsx`) is already set up to:

1. **Auto-generate meeting links** when a session title is entered
2. **Display the meeting link** in a read-only field
3. **Pass accessibility settings** (captions, transcript, recording) to backend

### API Call from Frontend

```javascript
// In CreateSession.jsx - Update the generateZoomLink function:

const generateZoomLink = async () => {
  if (!formData.title || !formData.date || !formData.time) return;
  
  setGeneratingLink(true);
  try {
    const response = await api.post('/v1/tutor/zoom/create-meeting', {
      topic: formData.title,
      duration: formData.duration,
      startTime: new Date(`${formData.date}T${formData.time}`).toISOString(),
      settings: {
        auto_recording: formData.accessibilityFeatures.recordSession ? 'cloud' : 'none',
        enable_live_captions: formData.accessibilityFeatures.captions,
        enable_transcript: formData.accessibilityFeatures.transcript,
      },
    });
    
    setFormData(prev => ({ 
      ...prev, 
      meetingLink: response.joinUrl,
      meetingId: response.meetingId 
    }));
  } catch (error) {
    console.error('Failed to generate Zoom link:', error);
    alert('Failed to generate meeting link. Please try again.');
  } finally {
    setGeneratingLink(false);
  }
};
```

## Student Access Flow

### When Student Enrolls in Session:

1. Student browses sessions and clicks "Enroll"
2. Backend adds student to session's `studentIds` array
3. Student can now see the meeting link in their dashboard

### Session Detail Page for Students:

```jsx
// In SessionDetail.jsx
{session.meetingLink && (
  <a
    href={session.meetingLink}
    target="_blank"
    rel="noreferrer"
    className="btn btn-primary"
  >
    <Video className="w-5 h-5 mr-2" />
    Join Zoom Meeting
  </a>
)}
```

## Zoom API Features Used

### Required Scopes:
- `meeting:write:admin` - Create meetings
- `meeting:read:admin` - Read meeting details
- `recording:read:admin` - Access recordings (if enabled)

### Key Features:
1. **Live Captions**: Zoom's native closed captioning
2. **Auto Transcript**: Post-meeting transcription
3. **Cloud Recording**: Saves to Zoom Cloud (100GB free)
4. **Waiting Room**: Security feature
5. **Join Before Host**: Disabled for tutor control

## Testing

### Development Mode:
Use mock data (current implementation):
```javascript
const mockMeetingId = Math.random().toString(36).substring(2, 12);
const mockLink = `https://zoom.us/j/${mockMeetingId}`;
```

### Production Mode:
Switch to actual Zoom API calls once backend is implemented.

## Cost Considerations

- **Free Plan**: 40-minute limit for 3+ participants
- **Pro Plan**: $149.90/year - Unlimited meeting duration
- **Business Plan**: $199.90/year - More features
- **Education Plan**: Often free for educational institutions

## Security Notes

1. **Never expose Zoom credentials** in frontend code
2. **Validate tutor authentication** before creating meetings
3. **Store meeting passwords** securely in database
4. **Use HTTPS** for all API calls
5. **Rate limit** meeting creation to prevent abuse

## Next Steps

1. Set up Zoom OAuth app
2. Implement backend endpoints
3. Test with Zoom API sandbox
4. Update frontend to use real API
5. Handle session updates/deletions (also delete Zoom meeting)
6. Add webhook for recording ready notifications

## Resources

- [Zoom API Documentation](https://marketplace.zoom.us/docs/api-reference/introduction)
- [Zoom Node.js SDK](https://github.com/zoom/videosdk-nodejs)
- [Server-to-Server OAuth](https://marketplace.zoom.us/docs/guides/build/server-to-server-oauth-app)
