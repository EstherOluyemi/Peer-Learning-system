# Chat API Contract

Backend APIs required to support the persistent, real-time chat feature.

---

## Authentication

All REST endpoints require `Authorization: Bearer <token>` (or the session cookie). WebSocket connection is authenticated via `?token=<token>` query parameter on connect.

---

## Data Models

### Conversation
```json
{
  "_id": "string",
  "participants": [
    {
      "_id": "string",
      "name": "string",
      "email": "string",
      "role": "tutor | learner",
      "avatar": "string (URL, optional)"
    }
  ],
  "lastMessage": "string",
  "lastMessageAt": "ISO 8601 datetime",
  "unread": 0,
  "createdAt": "ISO 8601 datetime"
}
```

### Message
```json
{
  "_id": "string",
  "conversationId": "string",
  "sender": {
    "_id": "string",
    "name": "string",
    "avatar": "string (URL, optional)"
  },
  "text": "string",
  "read": false,
  "createdAt": "ISO 8601 datetime"
}
```

---

## REST Endpoints

### 1. Get all conversations for current user
**GET** `/v1/chat/conversations`

**Response 200**
```json
{
  "data": [ /* Conversation[] */ ]
}
```

---

### 2. Get message history for a conversation (paginated)
**GET** `/v1/chat/conversations/:conversationId/messages`

**Query params**
| Param  | Type   | Default | Description          |
|--------|--------|---------|----------------------|
| `page` | number | `1`     | 1-based page         |
| `limit`| number | `50`    | Messages per page    |

**Response 200**
```json
{
  "data": {
    "messages": [ /* Message[] — ordered oldest → newest */ ],
    "hasMore": true,
    "total": 142
  }
}
```

**Notes**
- Return messages in ascending `createdAt` order.
- Caller uses `page > 1` to load older history (scroll-up infinite load).

---

### 3. Create or retrieve a 1-to-1 conversation
**POST** `/v1/chat/conversations`

**Request body**
```json
{ "recipientId": "string" }
```

**Response 200 / 201**
```json
{
  "data": { /* Conversation object */ }
}
```

**Notes**
- Idempotent: if a conversation already exists between the two users, return it (status 200).
- Creates a new one otherwise (status 201).
- Both participants must exist (return 404 if `recipientId` not found).

---

### 4. Send a message (HTTP fallback)
**POST** `/v1/chat/conversations/:conversationId/messages`

**Request body**
```json
{ "text": "string" }
```

**Response 201**
```json
{
  "data": { /* Message object */ }
}
```

**Notes**
- Also push a `message:new` WebSocket event to the recipient's room.

---

### 5. Mark conversation as read
**PATCH** `/v1/chat/conversations/:conversationId/read`

**Request body** — empty `{}`

**Response 200**
```json
{ "data": { "ok": true } }
```

**Notes**
- Sets `read = true` on all messages in the conversation where the sender is NOT the current user.
- Emit `message:read` WebSocket event to the other participant.

---

### 6. Get contacts (people this user can start a chat with)
**GET** `/v1/chat/contacts`

**Response 200**
```json
{
  "data": [
    {
      "_id": "string",
      "name": "string",
      "email": "string",
      "role": "tutor | learner",
      "avatar": "string (URL, optional)"
    }
  ]
}
```

**Notes**
- **Tutors** see: all their enrolled students + all other tutors.
- **Learners** see: tutors of sessions they're enrolled in + all other learners.
- Exclude the current user from the list.

---

## WebSocket Protocol

**Connection URL**
```
ws://<host>/ws?token=<JWT>
```

All frames are JSON: `{ "event": "string", "data": { ... } }`

---

### Client → Server events

| Event | Payload | Description |
|-------|---------|-------------|
| `message:send` | `{ "conversationId": "string", "text": "string" }` | Send a real-time message |
| `message:read` | `{ "conversationId": "string" }` | Notify other party their messages were read |
| `user:typing` | `{ "conversationId": "string" }` | Signal that the user is typing |

---

### Server → Client events

| Event | Payload | Description |
|-------|---------|-------------|
| `message:new` | `{ "conversationId": "string", "message": Message }` | Incoming message from another user |
| `message:sent` | `{ "conversationId": "string", "message": Message, "tempId": "string" }` | Server confirms your WS send; `tempId` matches optimistic entry |
| `message:read` | `{ "conversationId": "string" }` | Other participant read your messages |
| `conversation:new` | `Conversation` | Someone started a conversation with you |
| `user:online` | `{ "userId": "string" }` | A contact came online |
| `user:offline` | `{ "userId": "string" }` | A contact went offline |
| `user:typing` | `{ "conversationId": "string", "userId": "string" }` | A participant is typing |

---

## Error Shape

```json
{
  "message": "Human-readable description",
  "code": "MACHINE_READABLE_CODE"
}
```

Common codes: `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONVERSATION_NOT_FOUND`, `RECIPIENT_NOT_FOUND`.

---

## Persistence Notes

- Messages must be stored in a DB collection (e.g., MongoDB `messages` collection).
- `conversations` collection holds participant references and `lastMessage` / `lastMessageAt` denormed fields (update on each new message).
- `unread` count is per-participant — use a sub-document or separate `unreadCounts: { [userId]: number }` map on the conversation.
- On `GET /v1/chat/conversations`, return the `unread` field specific to the requesting user.
