# Chat API Documentation

Complete CRUD operations for chat conversations and messages.

## Overview

The Chat API supports multi-language users via the `major` parameter. Conversations and messages are scoped by `major` (e.g., `english`, `korea`, `chinese`, `japanese`, `russian`). All timestamps in responses are Unix timestamps in **milliseconds**.

## Database setup

If you see **"Failed to fetch conversations"**, the `conversations` and `messages` tables may be missing the `major` column. Run the migration once:

- **phpMyAdmin:** Open your database → SQL tab → paste and run the contents of `api/chat/migrations/add_major_columns.sql`.
- **CLI:** `mysql -u root -p your_database_name < api/chat/migrations/add_major_columns.sql`

Then reload the Chat page.

## Base URL

`/api/chat/`

## Endpoints Summary

| Endpoint          | Methods | Description |
|-------------------|---------|-------------|
| `conversations.php` | GET, POST, PUT, PATCH, DELETE | CRUD for conversations |
| `messages.php`      | GET, POST, PUT, PATCH, DELETE | CRUD for messages |
| `mark-read.php`     | POST | Mark message(s) as read |
| `upload-voice.php`  | POST | Upload voice message file |
| `upload-image.php`  | POST | Upload image message file |

## Common Parameters

| Parameter | Type   | Required | Default   | Description |
|-----------|--------|----------|-----------|-------------|
| `major`   | string | No       | `english` | Language/major. Values: `english`, `korea`, `korean`, `chinese`, `japanese`, `russian`, `russia` |

## Response Format

All endpoints return JSON with:

- `success` (boolean): Whether the request succeeded
- `data` (object/array): Response payload (omitted on error)
- `error` (string): Error message when `success` is `false`

---

## Conversations API

### 1. GET - List Conversations

**Endpoint:** `conversations.php`

**Method:** GET

**Parameters:**

| Parameter  | Type   | Required | Description |
|------------|--------|----------|-------------|
| `user_id`  | int    | Yes      | User ID (phone) |
| `major`    | string | No       | Major (default: `english`) |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user1_id": 1,
      "user2_id": 2,
      "other_user_id": 2,
      "unread_count": 3,
      "last_message_text": "Hello!",
      "last_message_type": "text",
      "last_message_at": 1705312200000,
      "created_at": 1704974400000,
      "friend": {
        "phone": 2,
        "name": "John Doe",
        "image": "https://www.calamuseducation.com/uploads/profile.jpg",
        "fcm_token": "device-fcm-token-or-null",
        "blocked": false,
        "blocked_by_me": false,
        "blocked_by_other": false
      }
    }
  ]
}
```

> **Note:** `created_at` and `last_message_at` are Unix timestamps in **milliseconds**.

### 2. GET - Get Single Conversation

**Endpoint:** `conversations.php`

**Method:** GET

**Parameters:**

| Parameter  | Type   | Required | Description |
|------------|--------|----------|-------------|
| `id`       | int    | Yes      | Conversation ID |
| `user_id`  | int    | Yes      | User ID to determine the "friend" (other participant) |
| `major`    | string | No       | Major (default: `english`) |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "user1_id": 1,
    "user2_id": 2,
    "other_user_id": 2,
    "last_message_at": 1705312200000,
    "created_at": 1704974400000,
    "friend": {
      "phone": 2,
      "name": "John Doe",
      "image": "https://www.calamuseducation.com/uploads/profile.jpg",
      "fcm_token": "device-fcm-token-or-null",
      "blocked": false,
      "blocked_by_me": false,
      "blocked_by_other": false
    }
  }
}
```

### 3. POST - Create Conversation

**Endpoint:** `conversations.php`

**Method:** POST

Create a new conversation or return an existing one. User IDs are normalized so `user1_id < user2_id` for consistency.

**Body (form-data, x-www-form-urlencoded, or JSON):**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user1_id` | int | Yes | First user ID (phone) |
| `user2_id` | int | Yes | Second user ID (phone) |
| `major`    | string | No | Major (default: `english`) |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "user1_id": 1,
    "user2_id": 2,
    "created_at": "2024-01-10 08:00:00"
  }
}
```

### 4. PUT/PATCH - Update Conversation

**Endpoint:** `conversations.php`

**Method:** PUT or PATCH

**Body (JSON, x-www-form-urlencoded, or form-data):**

| Parameter         | Type   | Required | Description |
|-------------------|--------|----------|-------------|
| `id`              | int    | Yes      | Conversation ID |
| `last_message_at` | string | No       | Timestamp (MySQL DATETIME format) |
| `major`           | string | No       | Major (default: `english`) |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "user1_id": 1,
    "user2_id": 2,
    "last_message_at": 1705312200000,
    "updated_at": 1705312200000
  }
}
```

### 5. DELETE - Delete Conversation

**Endpoint:** `conversations.php`

**Method:** DELETE

Delete a conversation and all its messages (CASCADE). Deletes associated message files (voice/image) if any.

**Body (JSON/x-www-form-urlencoded) or Query parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id`      | int  | Yes      | Conversation ID |
| `major`   | string | No     | Major (default: `english`) |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "deleted": true
  }
}
```

---

## Messages API

### 1. GET - List Messages

**Endpoint:** `messages.php`

**Method:** GET

Get messages from a conversation using cursor-based pagination. Messages are always returned in chronological order (oldest first).

**Parameters:**

| Parameter        | Type | Required | Default | Description |
|------------------|------|----------|---------|-------------|
| `conversation_id` | int  | Yes      | -       | Conversation ID |
| `major`          | string | No     | `english` | Major |
| `limit`          | int  | No       | 50      | Messages per page (max: 100) |
| `before_id`      | int  | No       | -       | Load older messages (id < before_id) |
| `after_id`       | int  | No       | -       | Load newer messages (id > after_id) |

**Pagination Usage:**

1. **Initial Load**: No cursor parameters

   ```
   GET messages.php?conversation_id=1&major=ee&limit=50
   ```

   Returns the latest 50 messages (ordered chronologically, oldest first)

2. **Load Older Messages** (scroll up): Use `before_id` with the oldest message ID you currently have

   ```
   GET messages.php?conversation_id=1&major=ee&limit=50&before_id=100
   ```

   Returns up to 50 messages older than message ID 100

3. **Load Newer Messages** (poll for updates): Use `after_id` with the newest message ID you currently have
   ```
   GET messages.php?conversation_id=1&major=ee&limit=50&after_id=200
   ```
   Returns up to 50 messages newer than message ID 200

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "conversation_id": 1,
      "sender_id": 1,
      "message_type": "text",
      "message_text": "Hello!",
      "file_path": null,
      "file_size": null,
      "is_read": 0,
      "created_at": 1705312200000
    }
  ]
}
```

**Note:** Messages are always returned in chronological order (oldest first). The `created_at` field is returned as a Unix timestamp in milliseconds.

### 2. GET - Get Single Message

**Endpoint:** `messages.php`

**Method:** GET

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id`      | int  | Yes      | Message ID |
| `major`   | string | No     | Major (default: `english`) |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "conversation_id": 1,
    "sender_id": 1,
    "message_type": "text",
    "message_text": "Hello!",
    "file_path": null,
    "file_size": null,
    "is_read": 0,
    "created_at": 1705312200000
  }
}
```

### 3. POST - Create Message

**Endpoint:** `messages.php`

**Method:** POST

Send a new message. Sender must be a participant in the conversation.

**Body (form-data, x-www-form-urlencoded, or JSON):**

| Parameter        | Type   | Required | Description |
|------------------|--------|----------|-------------|
| `conversation_id` | int   | Yes      | Conversation ID |
| `sender_id`      | int   | Yes      | Sender user ID (phone) |
| `message_type`   | string | Yes    | `text`, `voice`, or `image` |
| `message_text`   | string | For text | Required when `message_type` is `text` |
| `file_path`      | string | For voice/image | Required when `message_type` is `voice` or `image` (use path from upload API) |
| `file_size`      | int    | No      | File size in bytes |
| `major`          | string | No      | Major (default: `english`) |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "conversation_id": 1,
    "sender_id": 1,
    "message_type": "text",
    "message_text": "Hello!",
    "file_path": null,
    "file_size": null,
    "is_read": 0,
    "created_at": 1705312200000
  }
}
```

### 4. PUT/PATCH - Update Message

**Endpoint:** `messages.php`

**Method:** PUT or PATCH

Update a message (edit text, update file, or mark as read).

**Body (JSON, x-www-form-urlencoded, or form-data):**

| Parameter     | Type   | Required | Description |
|---------------|--------|----------|-------------|
| `id`          | int    | Yes      | Message ID |
| `message_text`| string | No       | Updated text (text messages only) |
| `file_path`   | string | No       | Updated file path (voice/image only) |
| `file_size`   | int    | No       | File size in bytes |
| `is_read`     | int    | No       | Read status (0 or 1) |
| `major`       | string | No       | Major (default: `english`) |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "conversation_id": 1,
    "sender_id": 1,
    "message_type": "text",
    "message_text": "Updated message!",
    "file_path": null,
    "file_size": null,
    "is_read": 1,
    "created_at": 1705312200000
  }
}
```

### 5. DELETE - Delete Message

**Endpoint:** `messages.php`

**Method:** DELETE

Delete a message and its associated file (if voice/image).

**Body (JSON/x-www-form-urlencoded) or Query parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id`      | int  | Yes      | Message ID |
| `major`   | string | No     | Major (default: `english`) |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "deleted": true
  }
}
```

---

## File Upload API

### Upload Voice Message

**Endpoint:** `upload-voice.php`

**Method:** POST

**Body (multipart/form-data):**

- `voice` (file): Voice file (MP3, WAV, OGG, WebM, AAC, M4A)
- Max size: 10MB

**Response:**

```json
{
  "success": true,
  "data": {
    "file_path": "uploads/chat/voice/abc123xyz.mp3",
    "file_url": "https://www.calamuseducation.com/calamus/uploads/chat/voice/abc123xyz.mp3",
    "file_size": 1024000,
    "file_name": "abc123xyz.mp3"
  }
}
```

### Upload Image Message

**Endpoint:** `upload-image.php`

**Method:** POST

**Body (multipart/form-data):**

- `image` (file): Image file (JPEG, PNG, GIF, WebP)
- Max size: 5MB

**Response:**

```json
{
  "success": true,
  "data": {
    "file_path": "uploads/chat/images/xyz789abc.jpg",
    "file_url": "https://www.calamuseducation.com/calamus/uploads/chat/images/xyz789abc.jpg",
    "file_size": 512000,
    "file_name": "xyz789abc.jpg"
  }
}
```

---

## Mark Read API

### Mark Messages as Read

**Endpoint:** `mark-read.php`

**Method:** POST

**Body (form-data, x-www-form-urlencoded, or JSON):**

**Option 1 - Single message:**

| Parameter   | Type | Required | Description |
|-------------|------|----------|-------------|
| `message_id` | int | Yes | Message ID |
| `major`      | string | No | Major (default: `english`) |

**Option 2 - All messages in conversation:**

| Parameter        | Type | Required | Description |
|------------------|------|----------|-------------|
| `conversation_id` | int  | Yes      | Conversation ID |
| `user_id`        | int  | Yes      | Current user ID (marks all messages from the other user as read) |
| `major`          | string | No     | Major (default: `english`) |

**Response:**

```json
{
  "success": true,
  "data": {
    "message_id": 1,
    "is_read": true
  }
}
```

or

```json
{
  "success": true,
  "data": {
    "conversation_id": 1,
    "marked_count": 5
  }
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

---

## Notes

- No authentication required
- All response timestamps use Unix **milliseconds** (e.g., `1705312200000`)
- `major` scopes data per language; supported values: `english`, `korea`, `korean`, `chinese`, `japanese`, `russian`, `russia`
- File uploads are validated (type and size) and given unique filenames
- Deleting a conversation CASCADE deletes all messages and their files
- Deleting a voice/image message also removes the file from disk
- Message types: `text`, `voice`, `image`
- PUT/DELETE accept `application/json` for the request body
