# Chat API Documentation

Complete CRUD operations for chat conversations and messages.

## Database setup

If you see **"Failed to fetch conversations"**, the `conversations` and `messages` tables may be missing the `major` column. Run the migration once:

- **phpMyAdmin:** Open your database → SQL tab → paste and run the contents of `api/chat/migrations/add_major_columns.sql`.
- **CLI:** `mysql -u root -p your_database_name < api/chat/migrations/add_major_columns.sql`

Then reload the Chat page.

## Base URL

`/api/chat/`

---

## Conversations API

### 1. GET - List Conversations

**Endpoint:** `conversations.php?user_id={user_id}`

Get all conversations for a user.

**Parameters:**

- `user_id` (required): User ID

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
      "last_message_at": "2024-01-15 10:30:00",
      "created_at": "2024-01-10 08:00:00",
      "friend": {
        "phone": 2,
        "name": "John Doe",
        "image": "https://www.calamuseducation.com/uploads/profile.jpg"
      }
    }
  ]
}
```

### 2. GET - Get Single Conversation

**Endpoint:** `conversations.php?id={conversation_id}&user_id={user_id}`

Get a single conversation by ID with friend profile.

**Parameters:**

- `id` (required): Conversation ID
- `user_id` (required): User ID to determine which user is the "friend"

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "user1_id": 1,
    "user2_id": 2,
    "other_user_id": 2,
    "last_message_at": "2024-01-15 10:30:00",
    "created_at": "2024-01-10 08:00:00",
    "friend": {
      "phone": 2,
      "name": "John Doe",
      "image": "https://www.calamuseducation.com/uploads/profile.jpg"
    }
  }
}
```

### 3. POST - Create Conversation

**Endpoint:** `conversations.php`

Create a new conversation or get existing one.

**Body (form-data or x-www-form-urlencoded):**

- `user1_id` (required): First user ID
- `user2_id` (required): Second user ID

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

Update conversation details.

**Body (raw/x-www-form-urlencoded):**

- `id` (required): Conversation ID
- `last_message_at` (optional): Timestamp

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "user1_id": 1,
    "user2_id": 2,
    "last_message_at": "2024-01-15 10:30:00",
    "updated_at": "2024-01-15 10:30:00"
  }
}
```

### 5. DELETE - Delete Conversation

**Endpoint:** `conversations.php`

Delete a conversation and all its messages (CASCADE).

**Body (raw/x-www-form-urlencoded) or Query:**

- `id` (required): Conversation ID

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

**Endpoint:** `messages.php?conversation_id={conversation_id}&major={major}&limit={limit}&before_id={before_id}&after_id={after_id}`

Get messages from a conversation using cursor-based pagination.

**Parameters:**

- `conversation_id` (required): Conversation ID
- `major` (required): Major field (e.g., 'ee', 'ek')
- `limit` (optional): Number of messages per page (default: 50, max: 100)
- `before_id` (optional): Message ID to load older messages (messages with id < before_id)
- `after_id` (optional): Message ID to load newer messages (messages with id > after_id)

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

**Endpoint:** `messages.php?id={message_id}`

Get a single message by ID.

**Parameters:**

- `id` (required): Message ID

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
    "is_read": 0,
    "created_at": "2024-01-15 10:30:00"
  }
}
```

### 3. POST - Create Message

**Endpoint:** `messages.php`

Send a new message.

**Body (form-data or x-www-form-urlencoded):**

- `conversation_id` (required): Conversation ID
- `sender_id` (required): Sender user ID
- `message_type` (required): 'text', 'voice', or 'image'
- `message_text` (required for text): Message text
- `file_path` (required for voice/image): File path
- `file_size` (optional): File size in bytes

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
    "is_read": 0,
    "created_at": "2024-01-15 10:30:00"
  }
}
```

### 4. PUT/PATCH - Update Message

**Endpoint:** `messages.php`

Update a message (edit text, update file, mark as read).

**Body (raw/x-www-form-urlencoded):**

- `id` (required): Message ID
- `message_text` (optional): Updated text (text messages only)
- `file_path` (optional): Updated file path (voice/image messages only)
- `file_size` (optional): Updated file size
- `is_read` (optional): Read status (0 or 1)

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
    "is_read": 1,
    "created_at": "2024-01-15 10:30:00"
  }
}
```

### 5. DELETE - Delete Message

**Endpoint:** `messages.php`

Delete a message and its associated file (if any).

**Body (raw/x-www-form-urlencoded) or Query:**

- `id` (required): Message ID

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

**Body (form-data or x-www-form-urlencoded):**

**Option 1 - Single Message:**

- `message_id` (required): Message ID

**Option 2 - All Messages in Conversation:**

- `conversation_id` (required): Conversation ID
- `user_id` (required): User ID (marks all messages from other user)

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
- All timestamps are in MySQL DATETIME format
- File uploads are automatically validated and given unique filenames
- Deleting a conversation will cascade delete all messages
- Deleting a message will also delete its associated file (if any)
- Message types: 'text', 'voice', 'image'
