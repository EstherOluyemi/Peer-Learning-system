# Tutor Backend Specification

This document defines the API requirements, data models, and endpoints exclusively for the tutor section of the Peer Learning System.

---

## 1. Tutor Data Models

### 1.1 Tutor Profile Model
Extends the base User model with professional details.
```javascript
{
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  bio: { type: String, required: true },
  subjects: [{ type: String }],
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  earnings: { type: Number, default: 0 },
  availability: [{ 
    day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
    slots: [{ startTime: String, endTime: String }]
  }],
  hourlyRate: { type: Number, required: true },
  verified: { type: Boolean, default: false }
}
```

### 1.2 Course Model
Representing structured learning paths created by tutors.
```javascript
{
  title: { type: String, required: true },
  description: { type: String },
  tutorId: { type: Schema.Types.ObjectId, ref: 'Tutor', required: true },
  price: { type: Number, required: true },
  tags: [String],
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'] },
  published: { type: Boolean, default: false }
}
```

### 1.3 Session Model (Tutor View)
Represents a scheduled learning event.
```javascript
{
  courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
  tutorId: { type: Schema.Types.ObjectId, ref: 'Tutor', required: true },
  studentIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: { type: String, enum: ['scheduled', 'ongoing', 'completed', 'cancelled'] },
  meetingLink: { type: String },
  maxParticipants: { type: Number, default: 1 }
}
```

### 1.4 Payment & Earnings Model
Tracks transactions and tutor income.
```javascript
{
  tutorId: { type: Schema.Types.ObjectId, ref: 'Tutor', required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['credit', 'payout'] },
  status: { type: String, enum: ['pending', 'completed', 'failed'] },
  referenceId: { type: String }, // SessionId or TransactionId
  createdAt: { type: Date, default: Date.now }
}
```

---

## 2. Tutor API Endpoints

### 2.1 Authentication & Registration
- **POST /api/v1/tutor/auth/register**
  - **Description**: Specialized registration for tutor accounts.
  - **Body**: `{ name, email, password, bio, subjects, hourlyRate }`
  - **Response**: `201 Created` with `{ status: "success", data: { tutor, token } }`

### 2.2 Profile Management
- **GET /api/v1/tutor/me**
  - **Description**: Fetch the logged-in tutor's full profile and stats.
- **PATCH /api/v1/tutor/me**
  - **Description**: Update profile details, availability, and rates.
  - **Body**: `{ bio, subjects, hourlyRate, availability }`

### 2.3 Session Scheduling
- **POST /api/v1/tutor/sessions**
  - **Description**: Create a new session (1-on-1 or Group).
  - **Body**: `{ title, startTime, duration, maxParticipants, price }`
- **GET /api/v1/tutor/sessions**
  - **Description**: List all sessions managed by the tutor.
  - **Query**: `?status=scheduled&startDate=...&endDate=...`
- **PATCH /api/v1/tutor/sessions/:id**
  - **Description**: Update session details or cancel.
- **DELETE /api/v1/tutor/sessions/:id**
  - **Description**: Remove a session (if no students enrolled).

### 2.4 Student Management
- **GET /api/v1/tutor/students**
  - **Description**: List all students who have enrolled in this tutor's sessions.
- **GET /api/v1/tutor/students/:studentId/progress**
  - **Description**: View progress and history for a specific student.

### 2.5 Performance Analytics
- **GET /api/v1/tutor/analytics/overview**
  - **Description**: High-level stats for the dashboard.
  - **Response**: `{ totalEarnings, activeSessions, totalStudents, avgRating }`
- **GET /api/v1/tutor/analytics/earnings**
  - **Description**: Detailed earnings breakdown by month/week.
- **GET /api/v1/tutor/analytics/reviews**
  - **Description**: List of all reviews with sentiment analysis.

### 2.6 Reviews & Feedback
- **GET /api/v1/tutor/reviews**
  - **Description**: Get all reviews received.
- **POST /api/v1/tutor/reviews/:id/respond**
  - **Description**: Publicly respond to a student's review.
  - **Body**: `{ responseText }`

---

## 3. Data Validation & Response Standards

### 3.1 Error Handling
All tutor-related endpoints return a standardized error object:
```json
{
  "status": "error",
  "code": "TUTOR_AUTH_FAILED",
  "message": "Detailed error message",
  "timestamp": "2024-06-01T10:00:00Z"
}
```

### 3.2 Success Response Format
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
