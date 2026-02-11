<?php
// CORS headers are set by .htaccess - don't duplicate them here
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include('../../classes/connect.php');

$db = new Database();
$method = $_SERVER['REQUEST_METHOD'];

// Helper function to send JSON response
function sendResponse($success, $data = null, $error = null) {
    $response = ['success' => $success];
    if ($data !== null) {
        $response['data'] = $data;
    }
    if ($error !== null) {
        $response['error'] = $error;
    }
    echo json_encode($response);
    exit;
}

// Helper function to sanitize input
function sanitize($value) {
    return htmlspecialchars(strip_tags(trim($value)));
}

// Helper function to convert MySQL datetime to Unix timestamp (milliseconds)
function datetimeToTimestamp($datetime) {
    if (empty($datetime) || $datetime === null) {
        return null;
    }
    // Convert MySQL datetime to Unix timestamp (seconds) then to milliseconds
    $timestamp = strtotime($datetime);
    return $timestamp !== false ? $timestamp * 1000 : null;
}

// Helper function to convert timestamp fields in array
function convertTimestamps($data, $fields = ['created_at']) {
    if (is_array($data)) {
        foreach ($fields as $field) {
            if (isset($data[$field])) {
                $data[$field] = datetimeToTimestamp($data[$field]);
            }
        }
    }
    return $data;
}

// Parse input for PUT/DELETE methods
function parseInput() {
    $input = file_get_contents('php://input');
    $contentType = isset($_SERVER['CONTENT_TYPE']) ? $_SERVER['CONTENT_TYPE'] : '';
    
    // Handle JSON input
    if (strpos($contentType, 'application/json') !== false) {
        $parsed = json_decode($input, true);
        return $parsed ? array_merge($_POST, $parsed) : $_POST;
    }
    
    // Handle form-urlencoded input
    parse_str($input, $parsed);
    return array_merge($_POST, $parsed);
}

if ($method === 'GET') {
    // Get single message by ID or list messages for a conversation
    $messageId = isset($_GET['id']) ? (int) $_GET['id'] : 0;
    $conversationId = isset($_GET['conversation_id']) ? (int) $_GET['conversation_id'] : 0;
    // Make major optional - default to 'english' for backward compatibility with mobile apps
    $major = isset($_GET['major']) && !empty($_GET['major']) ? sanitize($_GET['major']) : 'english';
    $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 50;
    $oldestMessageId = isset($_GET['oldest_message_id']) ? (int) $_GET['oldest_message_id'] : 0;
    
    if ($messageId > 0) {
        // Get single message by ID
        $conn = $db->connect();
        $majorEscaped = "'" . mysqli_real_escape_string($conn, $major) . "'";
        
        $query = "SELECT * FROM messages WHERE id = $messageId AND major = $majorEscaped LIMIT 1";
        $message = $db->read($query);
        
        if ($message === false) {
            sendResponse(false, null, 'Failed to fetch message');
        }
        
        if (!$message || empty($message)) {
            sendResponse(false, null, 'Message not found');
        }
        
        $msg = convertTimestamps($message[0]);
        sendResponse(true, $msg);
        
    } elseif ($conversationId > 0) {
        // Get messages for a conversation
        // Validate limit
        if ($limit > 100) $limit = 100;
        if ($limit < 1) $limit = 50;
        
        $conn = $db->connect();
        $majorEscaped = "'" . mysqli_real_escape_string($conn, $major) . "'";
        
        // Simple cursor-based pagination
        // before_id: Load older messages (messages with id < before_id)
        // after_id: Load newer messages (messages with id > after_id)
        // No cursor: Initial load - get latest messages
        $beforeId = isset($_GET['before_id']) ? (int) $_GET['before_id'] : 0;
        $afterId = isset($_GET['after_id']) ? (int) $_GET['after_id'] : 0;
        
        // Build base query
        $query = "SELECT * FROM messages 
                  WHERE conversation_id = $conversationId AND major = $majorEscaped";
        
        $needReverse = false;
        if ($beforeId > 0) {
            // Load older messages: messages before the specified ID
            // Order DESC to get most recent older messages first, then reverse for chronological display
            $query .= " AND id < $beforeId";
            $query .= " ORDER BY id DESC LIMIT $limit";
       
        } elseif ($afterId > 0) {
            // Load newer messages: messages after the specified ID
            // Order ASC for chronological order
            $query .= " AND id > $afterId";
            $query .= " ORDER BY id ASC LIMIT $limit";
          
        } else {
            // Initial load: get latest messages (most recent first)
            // Order DESC to get newest messages, then reverse for chronological display
            $query .= " ORDER BY id DESC LIMIT $limit";
            $needReverse = true;
        }
        
        $messages = $db->read($query);
        if($needReverse && $messages){
            $messages = array_reverse($messages);
        }
        if ($messages === false) {
            sendResponse(false, null, 'Failed to fetch messages');
        }
        
        // Reverse to return messages in chronological order (oldest first)
        // This is standard for chat apps - display oldest at top, newest at bottom
        
        // Convert timestamps for all messages
        if ($messages) {
            foreach ($messages as &$msg) {
                $msg = convertTimestamps($msg);
            }
            unset($msg); // Break reference
        }
        
        sendResponse(true, $messages ? $messages : []);
        
    } else {
        sendResponse(false, null, 'Either id or conversation_id is required');
    }
    
} elseif ($method === 'POST') {
    // Send a message
    $conversationId = isset($_POST['conversation_id']) ? (int) $_POST['conversation_id'] : 0;
    $senderId = isset($_POST['sender_id']) ? (int) $_POST['sender_id'] : 0;
    // Make major optional - default to 'english' for backward compatibility with mobile apps
    $major = isset($_POST['major']) && !empty($_POST['major']) ? sanitize($_POST['major']) : 'english';
    $messageType = isset($_POST['message_type']) ? sanitize($_POST['message_type']) : 'text';
    $messageText = isset($_POST['message_text']) ? sanitize($_POST['message_text']) : null;
    $filePath = isset($_POST['file_path']) ? sanitize($_POST['file_path']) : null;
    $fileSize = isset($_POST['file_size']) ? (int) $_POST['file_size'] : null;
    
    // Validate message type
    if (!in_array($messageType, ['text', 'voice', 'image'])) {
        sendResponse(false, null, 'Invalid message_type. Must be: text, voice, or image');
    }
    
    if ($conversationId <= 0 || $senderId <= 0) {
        sendResponse(false, null, 'conversation_id and sender_id are required');
    }
    
    // Validate message content based on type
    if ($messageType === 'text') {
        if (empty($messageText)) {
            sendResponse(false, null, 'message_text is required for text messages');
        }
    } else {
        if (empty($filePath)) {
            sendResponse(false, null, 'file_path is required for voice and image messages');
        }
    }
    
    $conn = $db->connect();
    $majorEscaped = "'" . mysqli_real_escape_string($conn, $major) . "'";
    
    // Verify conversation exists (with matching major)
    $convQuery = "SELECT * FROM conversations WHERE id = $conversationId AND major = $majorEscaped LIMIT 1";
    $conversation = $db->read($convQuery);
    
    if (!$conversation || empty($conversation)) {
        sendResponse(false, null, 'Conversation not found');
    }
    
    // Verify sender is part of the conversation
    $conv = $conversation[0];
    if ($conv['user1_id'] != $senderId && $conv['user2_id'] != $senderId) {
        sendResponse(false, null, 'Sender is not part of this conversation');
    }
    
    // Escape strings for SQL
    $messageTextEscaped = $messageText ? "'" . mysqli_real_escape_string($conn, $messageText) . "'" : "NULL";
    $filePathEscaped = $filePath ? "'" . mysqli_real_escape_string($conn, $filePath) . "'" : "NULL";
    $fileSizeEscaped = $fileSize ? $fileSize : "NULL";
    $messageTypeEscaped = "'" . mysqli_real_escape_string($conn, $messageType) . "'";
    
    // Insert message
    $insertQuery = "INSERT INTO messages (conversation_id, sender_id, major, message_type, message_text, file_path, file_size) 
                    VALUES ($conversationId, $senderId, $majorEscaped, $messageTypeEscaped, $messageTextEscaped, $filePathEscaped, $fileSizeEscaped)";
    
    $result = $db->save($insertQuery);
    
    if (!$result) {
        sendResponse(false, null, 'Failed to send message');
    }
    
    // Update conversation's last_message_at
    $updateQuery = "UPDATE conversations SET last_message_at = NOW() WHERE id = $conversationId AND major = $majorEscaped";
    $db->save($updateQuery);
    
    // Get the created message
    $messageQuery = "SELECT * FROM messages WHERE conversation_id = $conversationId AND major = $majorEscaped ORDER BY id DESC LIMIT 1";
    $newMessage = $db->read($messageQuery);
    
    if ($newMessage && !empty($newMessage)) {
        $msg = convertTimestamps($newMessage[0]);
        sendResponse(true, $msg);
    } else {
        sendResponse(false, null, 'Message sent but failed to retrieve');
    }
    
} elseif ($method === 'PUT' || $method === 'PATCH') {
    // Update message
    $input = parseInput();
    $messageId = isset($input['id']) ? (int) $input['id'] : 0;
    // Make major optional - default to 'english' for backward compatibility with mobile apps
    $major = isset($input['major']) && !empty($input['major']) ? sanitize($input['major']) : 'english';
    
    if ($messageId <= 0) {
        sendResponse(false, null, 'id is required');
    }
    
    $conn = $db->connect();
    $majorEscaped = "'" . mysqli_real_escape_string($conn, $major) . "'";
    
    // Check if message exists (with matching major)
    $checkQuery = "SELECT * FROM messages WHERE id = $messageId AND major = $majorEscaped LIMIT 1";
    $existing = $db->read($checkQuery);
    
    if (!$existing || empty($existing)) {
        sendResponse(false, null, 'Message not found');
    }
    
    $message = $existing[0];
    $conn = $db->connect();
    $updates = [];
    
    // Update message_text (only for text messages)
    if (isset($input['message_text']) && $message['message_type'] === 'text') {
        $messageText = sanitize($input['message_text']);
        if (!empty($messageText)) {
            $messageTextEscaped = "'" . mysqli_real_escape_string($conn, $messageText) . "'";
            $updates[] = "message_text = $messageTextEscaped";
        }
    }
    
    // Update file_path (for voice/image messages)
    if (isset($input['file_path']) && in_array($message['message_type'], ['voice', 'image'])) {
        $filePath = sanitize($input['file_path']);
        $filePathEscaped = "'" . mysqli_real_escape_string($conn, $filePath) . "'";
        $updates[] = "file_path = $filePathEscaped";
    }
    
    // Update file_size
    if (isset($input['file_size'])) {
        $fileSize = (int) $input['file_size'];
        $updates[] = "file_size = $fileSize";
    }
    
    // Update is_read status
    if (isset($input['is_read'])) {
        $isRead = (int) $input['is_read'];
        $updates[] = "is_read = $isRead";
    }
    
    if (empty($updates)) {
        sendResponse(false, null, 'No valid fields to update');
    }
    
    $updateQuery = "UPDATE messages SET " . implode(', ', $updates) . " WHERE id = $messageId AND major = $majorEscaped";
    $result = $db->save($updateQuery);
    
    if (!$result) {
        sendResponse(false, null, 'Failed to update message');
    }
    
    // Get updated message
    $updated = $db->read($checkQuery);
    if ($updated && !empty($updated)) {
        $msg = convertTimestamps($updated[0]);
        sendResponse(true, $msg);
    } else {
        sendResponse(false, null, 'Message updated but failed to retrieve');
    }
    
} elseif ($method === 'DELETE') {
    // Delete message
    $input = parseInput();
    $messageId = isset($input['id']) ? (int) $input['id'] : (isset($_GET['id']) ? (int) $_GET['id'] : 0);
    // Make major optional - default to 'english' for backward compatibility with mobile apps
    $major = isset($input['major']) && !empty($input['major']) ? sanitize($input['major']) : (isset($_GET['major']) && !empty($_GET['major']) ? sanitize($_GET['major']) : 'english');
    
    if ($messageId <= 0) {
        sendResponse(false, null, 'id is required');
    }
    
    $conn = $db->connect();
    $majorEscaped = "'" . mysqli_real_escape_string($conn, $major) . "'";
    
    // Check if message exists (with matching major)
    $checkQuery = "SELECT * FROM messages WHERE id = $messageId AND major = $majorEscaped LIMIT 1";
    $existing = $db->read($checkQuery);
    
    if (!$existing || empty($existing)) {
        sendResponse(false, null, 'Message not found');
    }
    
    $message = $existing[0];
    
    // Delete associated file if it exists
    if (!empty($message['file_path']) && in_array($message['message_type'], ['voice', 'image'])) {
        $filePath = '../../' . $message['file_path'];
        if (file_exists($filePath)) {
            @unlink($filePath);
        }
    }
    
    // Delete message
    $deleteQuery = "DELETE FROM messages WHERE id = $messageId AND major = $majorEscaped";
    $result = $db->save($deleteQuery);
    
    if (!$result) {
        sendResponse(false, null, 'Failed to delete message');
    }
    
    sendResponse(true, ['id' => $messageId, 'deleted' => true]);
    
} else {
    sendResponse(false, null, 'Method not allowed');
}

?>

