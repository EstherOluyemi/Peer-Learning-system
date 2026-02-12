# Tutor Backend API Reference

This document outlines the comprehensive set of backend APIs required for the tutor section of the Peer Learning System frontend to sync completely. The APIs are grouped by feature and cover CRUD operations, authentication, and data fetching for all tutor-related pages.

---

## 1. Authentication & Profile

### Tutor Login
- **POST /api/auth/login**
  - Request: `{ email, password }`
  - Response: `{ token, user }`

### Tutor Profile
- **GET /api/tutors/{tutorId}**
  - Response: Tutor profile data
- **PUT /api/tutors/{tutorId}**
  - Request: Updated profile fields
  - Response: Updated tutor profile

---

## 2. Dashboard

### Fetch Dashboard Stats
- **GET /api/tutors/{tutorId}/dashboard**
  - Response: `{ earnings, sessions, students, reviews, ... }`

---

## 3. Sessions Management

### List Sessions
- **GET /api/tutors/{tutorId}/sessions**
  - Response: List of sessions

### Create Session
- **POST /api/tutors/{tutorId}/sessions**
  - Request: Session details
  - Response: Created session

### Update Session
- **PUT /api/tutors/{tutorId}/sessions/{sessionId}**
  - Request: Updated session fields
  - Response: Updated session

### Delete Session
- **DELETE /api/tutors/{tutorId}/sessions/{sessionId}**
  - Response: Success/failure

---

## 4. Students Management

### List Students
- **GET /api/tutors/{tutorId}/students**
  - Response: List of students

### Add Student
- **POST /api/tutors/{tutorId}/students**
  - Request: Student details
  - Response: Created student

### View Student
- **GET /api/tutors/{tutorId}/students/{studentId}**
  - Response: Student profile & progress

### Bulk Message Students
- **POST /api/tutors/{tutorId}/students/bulk-message**
  - Request: `{ studentIds, message }`
  - Response: Success/failure

---

## 5. Messages

### List Conversations
- **GET /api/tutors/{tutorId}/conversations**
  - Response: List of conversations

### Fetch Messages
- **GET /api/tutors/{tutorId}/conversations/{conversationId}/messages**
  - Response: List of messages

### Send Message
- **POST /api/tutors/{tutorId}/conversations/{conversationId}/messages**
  - Request: `{ text }`
  - Response: Sent message

---

## 6. Reviews

### List Reviews
- **GET /api/tutors/{tutorId}/reviews**
  - Response: List of reviews

### Respond to Review
- **POST /api/tutors/{tutorId}/reviews/{reviewId}/response**
  - Request: `{ response }`
  - Response: Success/failure

---

## 7. Earnings & Payments

### Fetch Earnings
- **GET /api/tutors/{tutorId}/earnings**
  - Response: Earnings summary

### List Transactions
- **GET /api/tutors/{tutorId}/transactions**
  - Response: List of payment transactions

### Request Payout
- **POST /api/tutors/{tutorId}/payout**
  - Request: `{ amount, method }`
  - Response: Success/failure

---

## 8. Settings

### Get Settings
- **GET /api/tutors/{tutorId}/settings**
  - Response: Settings data

### Update Settings
- **PUT /api/tutors/{tutorId}/settings**
  - Request: Updated settings
  - Response: Updated settings

---

## 9. Notifications

### List Notifications
- **GET /api/tutors/{tutorId}/notifications**
  - Response: List of notifications

### Mark Notification as Read
- **PUT /api/tutors/{tutorId}/notifications/{notificationId}**
  - Response: Success/failure

---

## Notes
- All endpoints require authentication (token in headers).
- Replace `{tutorId}` and other IDs with actual values.
- Pagination, filtering, and sorting parameters should be supported where relevant.

---

This API reference covers all tutor features: dashboard, sessions, students, messages, reviews, earnings, settings, and notifications. Adjust endpoint paths and request/response formats as needed for your backend implementation.
