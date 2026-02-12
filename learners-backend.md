# Learner Backend API Reference

This document outlines the backend APIs required for the learner section of the Peer Learning System frontend to sync completely. The APIs are grouped by feature and cover CRUD operations, authentication, and data fetching for all learner-related pages.

---

## 1. Authentication & Profile

### Learner Login
- **POST /api/auth/login**
  - Request: `{ email, password }`
  - Response: `{ token, user }`

### Learner Profile
- **GET /api/learners/{learnerId}**
  - Response: Learner profile data
- **PUT /api/learners/{learnerId}**
  - Request: Updated profile fields
  - Response: Updated learner profile

---

## 2. Dashboard

### Fetch Dashboard Stats
- **GET /api/learners/{learnerId}/dashboard**
  - Response: `{ sessions, progress, notifications, ... }`

---

## 3. Sessions Management

### List Sessions
- **GET /api/learners/{learnerId}/sessions**
  - Response: List of sessions

### Create Session
- **POST /api/learners/{learnerId}/sessions**
  - Request: Session details
  - Response: Created session

### Update Session
- **PUT /api/learners/{learnerId}/sessions/{sessionId}**
  - Request: Updated session fields
  - Response: Updated session

### Delete Session
- **DELETE /api/learners/{learnerId}/sessions/{sessionId}**
  - Response: Success/failure

---

## 4. Profile Management

### Get Profile
- **GET /api/learners/{learnerId}/profile**
  - Response: Profile data

### Update Profile
- **PUT /api/learners/{learnerId}/profile**
  - Request: Updated profile fields
  - Response: Updated profile

---

## 5. Settings

### Get Settings
- **GET /api/learners/{learnerId}/settings**
  - Response: Settings data

### Update Settings
- **PUT /api/learners/{learnerId}/settings**
  - Request: Updated settings
  - Response: Updated settings

---

## 6. Notifications

### List Notifications
- **GET /api/learners/{learnerId}/notifications**
  - Response: List of notifications

### Mark Notification as Read
- **PUT /api/learners/{learnerId}/notifications/{notificationId}**
  - Response: Success/failure

---

## 7. Tutors & Sessions

### Browse Sessions
- **GET /api/sessions**
  - Query: `{ subject, tutor, date, ... }`
  - Response: List of available sessions

### Book Session
- **POST /api/learners/{learnerId}/sessions/{sessionId}/book**
  - Request: `{ learnerId }`
  - Response: Success/failure

### Cancel Booking
- **DELETE /api/learners/{learnerId}/sessions/{sessionId}/book**
  - Response: Success/failure

---

## Notes
- All endpoints require authentication (token in headers).
- Replace `{learnerId}` and other IDs with actual values.
- Pagination, filtering, and sorting parameters should be supported where relevant.

---

This API reference covers all learner features: dashboard, sessions, profile, settings, notifications, and session booking. Adjust endpoint paths and request/response formats as needed for your backend implementation.
