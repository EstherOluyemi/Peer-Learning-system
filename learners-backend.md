# Learner Backend Documentation

This document provides a comprehensive, production-ready guide for the backend implementation of the Peer Learning System's learner section.

---

## 1. Backend Architecture & Patterns

### 1.1 Architecture Overview
The learner-side backend utilizes a **Micro-services ready Layered Architecture** to handle high concurrent session bookings and real-time peer interactions.

- **Controller Layer**: Manages learner requests (e.g., booking a session, submitting an assessment).
- **Service Layer**: Implements core learner logic (e.g., checking enrollment eligibility, calculating progress).
- **Event Layer**: Emits events for real-time notifications (WebSockets/Socket.io) when peer interactions occur.

### 1.2 Design Principles
- **Scalability**: Stateless JWT authentication for horizontal scaling.
- **Consistency**: Distributed locks for session booking to prevent over-enrollment.
- **Security**: Strict Role-Based Access Control (RBAC) to ensure learners only access their own data.

---

## 2. Learner Database Schema

### 2.1 Learner Profile Model
```javascript
{
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  enrolledCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
  interests: [String],
  learningGoals: [String],
  totalStudyHours: { type: Number, default: 0 },
  points: { type: Number, default: 0 } // Gamification
}
```

### 2.2 Enrollment Model
```javascript
{
  learnerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  status: { type: String, enum: ['active', 'completed', 'dropped'], default: 'active' },
  enrolledAt: { type: Date, default: Date.now }
}
```

### 2.3 Progress Tracking Model
```javascript
{
  learnerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  completedModules: [String],
  lastAccessed: { type: Date },
  completionPercentage: { type: Number, default: 0 }
}
```

### 2.4 Assessment & Submission Model
```javascript
{
  assessmentId: { type: Schema.Types.ObjectId, ref: 'Assessment', required: true },
  learnerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  submissionUrl: String,
  grade: Number,
  feedback: String,
  submittedAt: { type: Date, default: Date.now }
}
```

### 2.5 Peer Interaction (Messages)
```javascript
{
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}
```

---

## 3. REST API Endpoints

### 3.1 Authentication & Registration
- **POST /api/v1/learner/auth/register**
  - **Body**: `{ name, email, password, interests }`
- **POST /api/v1/learner/auth/login**
  - **Response**: `{ status: "success", token, user }`

### 3.2 Course Enrollment & Discovery
- **GET /api/v1/courses**
  - **Description**: Browse all available courses/sessions.
  - **Query**: `?subject=...&level=...&tutor=...`
- **POST /api/v1/courses/:id/enroll**
  - **Description**: Enroll in a course or book a session.

### 3.3 Progress & Learning
- **GET /api/v1/learner/me/progress**
  - **Description**: Fetch overall progress for all enrolled courses.
- **PATCH /api/v1/learner/me/progress/:courseId**
  - **Description**: Update progress (e.g., mark module as complete).
  - **Body**: `{ moduleId: "..." }`

### 3.4 Assessment Submissions
- **GET /api/v1/assessments/:id**
  - **Description**: Get details of a specific assessment.
- **POST /api/v1/assessments/:id/submit**
  - **Description**: Submit learner's work.
  - **Body**: `{ submissionUrl: "..." }`

### 3.5 Peer Interaction
- **GET /api/v1/learner/peers**
  - **Description**: Find peers enrolled in the same courses.
- **POST /api/v1/learner/messages**
  - **Description**: Send a message to a peer or tutor.
  - **Body**: `{ receiverId, message }`

---

## 4. Authentication & Data Validation

### 4.1 Authentication Requirements
- **JWT**: Tokens must be sent in the `Authorization: Bearer <token>` header.
- **Expiration**: Access tokens expire in 1 hour; Refresh tokens in 7 days.

### 4.2 Data Validation Rules (using Zod/Joi)
- **Email**: Must be a valid format and unique.
- **Password**: Minimum 8 characters, 1 uppercase, 1 special character.
- **Submissions**: URLs must be valid (S3, Google Drive, or GitHub).

---

## 5. Error Handling & Response Formats

### 5.1 Standard Error Response
All learner-related endpoints return a standardized error object:
```json
{
  "status": "error",
  "code": "LEARNER_ENROLLMENT_DENIED",
  "message": "Learner is already enrolled in this session",
  "timestamp": "2024-06-01T10:00:00Z"
}
```

### 5.2 Success Response Standards
```json
{
  "status": "success",
  "data": { ... },
  "metadata": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```
**HTTP Status Codes:**
- **GET**: `200 OK`
- **POST**: `201 Created`
- **PATCH/PUT**: `200 OK`
- **DELETE**: `204 No Content`
