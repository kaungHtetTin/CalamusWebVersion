<?php
header('Content-Type: application/json');
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
function convertTimestamps($data, $fields = ['created_at', 'updated_at', 'last_message_at']) {
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
    // Get single conversation by ID or list conversations for a user
    $conversationId = isset($_GET['id']) ? (int) $_GET['id'] : 0;
    $userId = isset($_GET['user_id']) ? (int) $_GET['user_id'] : 0;
    $major = isset($_GET['major']) ? sanitize($_GET['major']) : '';
    
    if ($conversationId > 0) {
        // Get single conversation by ID with friend profile
        // user_id is required to determine which user is the "friend"
        if ($userId <= 0) {
            sendResponse(false, null, 'user_id is required when fetching conversation by id');
        }
        
        if (empty($major)) {
            sendResponse(false, null, 'major is required');
        }
        
        $conn = $db->connect();
        $majorEscaped = "'" . mysqli_real_escape_string($conn, $major) . "'";
        
        $query = "SELECT c.*,
                  CASE 
                      WHEN c.user1_id = $userId THEN c.user2_id 
                      ELSE c.user1_id 
                  END as other_user_id,
                  l.learner_phone as friend_phone,
                  l.learner_name as friend_name,
                  l.learner_image as friend_image
                  FROM conversations c
                  LEFT JOIN learners l ON (
                      (c.user1_id = $userId AND l.learner_phone = c.user2_id) OR
                      (c.user2_id = $userId AND l.learner_phone = c.user1_id)
                  )
                  WHERE c.id = $conversationId AND c.major = $majorEscaped LIMIT 1";
        
        $conversation = $db->read($query);
        
        if ($conversation === false) {
            sendResponse(false, null, 'Failed to fetch conversation');
        }
        
        if (!$conversation || empty($conversation)) {
            sendResponse(false, null, 'Conversation not found');
        }
        
        // Format friend profile data
        $conv = $conversation[0];
        $friendProfile = null;
        if (!empty($conv['friend_phone'])) {
            $friendProfile = [
                'phone' => $conv['friend_phone'],
                'name' => $conv['friend_name'],
                'image' => $conv['friend_image']
            ];
            // Remove individual friend fields from main object
            unset($conv['friend_phone'], $conv['friend_name'], $conv['friend_image']);
        }
        $conv['friend'] = $friendProfile;
        
        // Convert timestamps to Unix milliseconds
        $conv = convertTimestamps($conv);
        
        sendResponse(true, $conv);
        
    } elseif ($userId > 0) {
        // Get all conversations where user is either user1 or user2 with friend profiles
        if (empty($major)) {
            sendResponse(false, null, 'major is required');
        }
        
        $conn = $db->connect();
        $majorEscaped = "'" . mysqli_real_escape_string($conn, $major) . "'";
        
        $query = "SELECT c.*, 
                  CASE 
                      WHEN c.user1_id = $userId THEN c.user2_id 
                      ELSE c.user1_id 
                  END as other_user_id,
                  l.learner_phone as friend_phone,
                  l.learner_name as friend_name,
                  l.learner_image as friend_image,
                  (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.sender_id != $userId AND m.is_read = 0) as unread_count,
                  (SELECT message_text FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) as last_message_text,
                  (SELECT message_type FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) as last_message_type
                  FROM conversations c 
                  LEFT JOIN learners l ON (
                      (c.user1_id = $userId AND l.learner_phone = c.user2_id) OR
                      (c.user2_id = $userId AND l.learner_phone = c.user1_id)
                  )
                  WHERE (c.user1_id = $userId OR c.user2_id = $userId) AND c.major = $majorEscaped
                  ORDER BY c.last_message_at DESC, c.created_at DESC";
        
        $conversations = $db->read($query);
        
        if ($conversations === false) {
            sendResponse(false, null, 'Failed to fetch conversations');
        }
        
        // Format friend profile data for each conversation
        if ($conversations) {
            foreach ($conversations as &$conv) {
                $friendProfile = null;
                if (!empty($conv['friend_phone'])) {
                    $friendProfile = [
                        'phone' => $conv['friend_phone'],
                        'name' => $conv['friend_name'],
                        'image' => $conv['friend_image']
                    ];
                    // Remove individual friend fields from main object
                    unset($conv['friend_phone'], $conv['friend_name'], $conv['friend_image']);
                }
                $conv['friend'] = $friendProfile;
                
                // Convert timestamps to Unix milliseconds
                $conv = convertTimestamps($conv);
            }
            unset($conv); // Break reference
        }
        
        sendResponse(true, $conversations ? $conversations : []);
        
    } else {
        sendResponse(false, null, 'Either id or user_id is required');
    }
    
} elseif ($method === 'POST') {
    // Create or get existing conversation between two users
    $user1Id = isset($_POST['user1_id']) ? (int) $_POST['user1_id'] : 0;
    $user2Id = isset($_POST['user2_id']) ? (int) $_POST['user2_id'] : 0;
    $major = isset($_POST['major']) ? sanitize($_POST['major']) : '';
    
    if ($user1Id <= 0 || $user2Id <= 0) {
        sendResponse(false, null, 'user1_id and user2_id are required');
    }
    
    if (empty($major)) {
        sendResponse(false, null, 'major is required');
    }
    
    if ($user1Id === $user2Id) {
        sendResponse(false, null, 'Cannot create conversation with yourself');
    }
    
    // Ensure user1_id < user2_id for consistency
    if ($user1Id > $user2Id) {
        $temp = $user1Id;
        $user1Id = $user2Id;
        $user2Id = $temp;
    }
    
    $conn = $db->connect();
    $majorEscaped = "'" . mysqli_real_escape_string($conn, $major) . "'";
    
    // Check if conversation already exists (with same major)
    $checkQuery = "SELECT * FROM conversations WHERE user1_id = $user1Id AND user2_id = $user2Id AND major = $majorEscaped LIMIT 1";
    $existing = $db->read($checkQuery);
    
    if ($existing && !empty($existing)) {
        $conv = convertTimestamps($existing[0]);
        sendResponse(true, $conv);
    }
    
    // Create new conversation
    $insertQuery = "INSERT INTO conversations (user1_id, user2_id, major) VALUES ($user1Id, $user2Id, $majorEscaped)";
    $result = $db->save($insertQuery);
    
    if (!$result) {
        sendResponse(false, null, 'Failed to create conversation');
    }
    
    // Get the created conversation
    $newConversation = $db->read($checkQuery);
    if ($newConversation && !empty($newConversation)) {
        $conv = convertTimestamps($newConversation[0]);
        sendResponse(true, $conv);
    } else {
        sendResponse(false, null, 'Conversation created but failed to retrieve');
    }
    
} elseif ($method === 'PUT' || $method === 'PATCH') {
    // Update conversation
    $input = parseInput();
    $conversationId = isset($input['id']) ? (int) $input['id'] : 0;
    $major = isset($input['major']) ? sanitize($input['major']) : '';
    
    if ($conversationId <= 0) {
        sendResponse(false, null, 'id is required');
    }
    
    if (empty($major)) {
        sendResponse(false, null, 'major is required');
    }
    
    $conn = $db->connect();
    $majorEscaped = "'" . mysqli_real_escape_string($conn, $major) . "'";
    
    // Check if conversation exists (with matching major)
    $checkQuery = "SELECT * FROM conversations WHERE id = $conversationId AND major = $majorEscaped LIMIT 1";
    $existing = $db->read($checkQuery);
    
    if (!$existing || empty($existing)) {
        sendResponse(false, null, 'Conversation not found');
    }
    
    // Build update query (only update last_message_at for now, as other fields shouldn't change)
    $updates = [];
    
    if (isset($input['last_message_at'])) {
        $lastMessageAt = sanitize($input['last_message_at']);
        $conn = $db->connect();
        $lastMessageAtEscaped = "'" . mysqli_real_escape_string($conn, $lastMessageAt) . "'";
        $updates[] = "last_message_at = $lastMessageAtEscaped";
    }
    
    if (empty($updates)) {
        sendResponse(false, null, 'No valid fields to update');
    }
    
    $updateQuery = "UPDATE conversations SET " . implode(', ', $updates) . " WHERE id = $conversationId";
    $result = $db->save($updateQuery);
    
    if (!$result) {
        sendResponse(false, null, 'Failed to update conversation');
    }
    
    // Get updated conversation
    $updated = $db->read($checkQuery);
    if ($updated && !empty($updated)) {
        $conv = convertTimestamps($updated[0]);
        sendResponse(true, $conv);
    } else {
        sendResponse(false, null, 'Conversation updated but failed to retrieve');
    }
    
} elseif ($method === 'DELETE') {
    // Delete conversation
    $input = parseInput();
    $conversationId = isset($input['id']) ? (int) $input['id'] : (isset($_GET['id']) ? (int) $_GET['id'] : 0);
    $major = isset($input['major']) ? sanitize($input['major']) : (isset($_GET['major']) ? sanitize($_GET['major']) : '');
    
    if ($conversationId <= 0) {
        sendResponse(false, null, 'id is required');
    }
    
    if (empty($major)) {
        sendResponse(false, null, 'major is required');
    }
    
    $conn = $db->connect();
    $majorEscaped = "'" . mysqli_real_escape_string($conn, $major) . "'";
    
    // Check if conversation exists (with matching major)
    $checkQuery = "SELECT * FROM conversations WHERE id = $conversationId AND major = $majorEscaped LIMIT 1";
    $existing = $db->read($checkQuery);
    
    if (!$existing || empty($existing)) {
        sendResponse(false, null, 'Conversation not found');
    }
    
    // Delete conversation (messages will be deleted via CASCADE)
    $deleteQuery = "DELETE FROM conversations WHERE id = $conversationId AND major = $majorEscaped";
    $result = $db->save($deleteQuery);
    
    if (!$result) {
        sendResponse(false, null, 'Failed to delete conversation');
    }
    
    sendResponse(true, ['id' => $conversationId, 'deleted' => true]);
    
} else {
    sendResponse(false, null, 'Method not allowed');
}

?>

