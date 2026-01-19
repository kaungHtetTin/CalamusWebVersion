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

// Helper function to get user table name from major
function getUserTableName($major) {
    $major = strtolower($major);
    $tableMap = [
        'english' => 'ee_user_datas',
        'korea' => 'ko_user_datas',
        'korean' => 'ko_user_datas',
        'chinese' => 'cn_user_datas',
        'japanese' => 'jp_user_datas',
        'russian' => 'ru_user_datas',
        'russia' => 'ru_user_datas'
    ];
    return isset($tableMap[$major]) ? $tableMap[$major] : null;
}

// Helper function to get fcm_token from user phone and major
function getFcmTokenFromPhone($db, $phone, $major) {
    $tableName = getUserTableName($major);
    if (!$tableName) {
        return null;
    }
    
    $conn = $db->connect();
    $phoneEscaped = (int) $phone;
    
    // Query the appropriate user data table
    $query = "SELECT token FROM $tableName WHERE phone = $phoneEscaped LIMIT 1";
    $result = $db->read($query);
    
    if ($result && !empty($result)) {
        return $result[0]['token']; // Return fcm_token
    }
    
    return null;
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
        if ($userId <= 0) {
            sendResponse(false, null, 'user_id is required when fetching conversation by id');
        }
        
        if (empty($major)) {
            sendResponse(false, null, 'major is required');
        }
        
        $conn = $db->connect();
        $majorEscaped = "'" . mysqli_real_escape_string($conn, $major) . "'";
        // Get single conversation by ID with friend profile
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
            // Get friend's fcm_token
            $friendFcmToken = getFcmTokenFromPhone($db, $conv['friend_phone'], $major);
            
            $friendProfile = [
                'phone' => $conv['friend_phone'],
                'name' => $conv['friend_name'],
                'image' => $conv['friend_image'],
                'fcm_token' => $friendFcmToken
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
        
        // Strategy: Fetch conversations first, then batch-fetch all related data
        // This avoids complex JOINs with OR conditions that can't use indexes
        
        // Step 1: Fetch all conversations (simple query with OR, but it's the only one)
        $query = "SELECT c.*,
                  CASE 
                      WHEN c.user1_id = $userId THEN c.user2_id 
                      ELSE c.user1_id 
                  END as other_user_id
                  FROM conversations c 
                  WHERE (c.user1_id = $userId OR c.user2_id = $userId) AND c.major = $majorEscaped
                  ORDER BY c.last_message_at DESC, c.created_at DESC";
        
        $conversations = $db->read($query);
        
        if ($conversations === false) {
            sendResponse(false, null, 'Failed to fetch conversations');
        }
        
        if (!$conversations || empty($conversations)) {
            sendResponse(true, []);
        }
        
        // Step 2: Collect all conversation IDs and friend phone numbers
        $conversationIds = [];
        $friendPhones = [];
        
        foreach ($conversations as $conv) {
            $convId = (int) $conv['id'];
            $conversationIds[] = $convId;
            
            $otherUserId = (int) $conv['other_user_id'];
            if ($otherUserId > 0) {
                $friendPhones[] = $otherUserId;
            }
        }
        
        // Step 3: Batch fetch all unread counts in one query
        $unreadCounts = [];
        if (!empty($conversationIds)) {
            $idList = implode(',', $conversationIds);
            $unreadQuery = "SELECT conversation_id, COUNT(*) as unread_count
                           FROM messages
                           WHERE conversation_id IN ($idList) 
                             AND sender_id != $userId 
                             AND is_read = 0 
                             AND major = $majorEscaped
                           GROUP BY conversation_id";
            $unreadResults = $db->read($unreadQuery);
            if ($unreadResults) {
                foreach ($unreadResults as $row) {
                    $unreadCounts[(int) $row['conversation_id']] = (int) $row['unread_count'];
                }
            }
        }
        
        // Step 4: Batch fetch all last messages in one query (more efficient than subquery per row)
        $lastMessages = [];
        if (!empty($conversationIds)) {
            $idList = implode(',', $conversationIds);
            // Use window function if MySQL 8.0+, otherwise use optimized subquery
            $lastMessageQuery = "SELECT m1.conversation_id, m1.message_text, m1.message_type
                                FROM messages m1
                                INNER JOIN (
                                    SELECT conversation_id, MAX(id) as max_id
                                    FROM messages
                                    WHERE conversation_id IN ($idList) AND major = $majorEscaped
                                    GROUP BY conversation_id
                                ) m2 ON m1.conversation_id = m2.conversation_id AND m1.id = m2.max_id
                                WHERE m1.major = $majorEscaped";
            $lastMessageResults = $db->read($lastMessageQuery);
            if ($lastMessageResults) {
                foreach ($lastMessageResults as $row) {
                    $lastMessages[(int) $row['conversation_id']] = [
                        'text' => $row['message_text'],
                        'type' => $row['message_type']
                    ];
                }
            }
        }
        
        // Step 5: Batch fetch all learner profiles in one query
        $learnerProfiles = [];
        if (!empty($friendPhones)) {
            $phoneList = implode(',', array_map('intval', array_unique($friendPhones)));
            $learnerQuery = "SELECT learner_phone, learner_name, learner_image 
                            FROM learners 
                            WHERE learner_phone IN ($phoneList)";
            $learnerResults = $db->read($learnerQuery);
            if ($learnerResults) {
                foreach ($learnerResults as $row) {
                    $learnerProfiles[(int) $row['learner_phone']] = [
                        'phone' => $row['learner_phone'],
                        'name' => $row['learner_name'],
                        'image' => $row['learner_image']
                    ];
                }
            }
        }
        
        // Step 6: Batch fetch all FCM tokens in one query
        $fcmTokens = [];
        if (!empty($friendPhones)) {
            $tableName = getUserTableName($major);
            if ($tableName) {
                $phoneList = implode(',', array_map('intval', array_unique($friendPhones)));
                $fcmQuery = "SELECT phone, token FROM $tableName WHERE phone IN ($phoneList)";
                $fcmResults = $db->read($fcmQuery);
                if ($fcmResults) {
                    foreach ($fcmResults as $row) {
                        $fcmTokens[(int) $row['phone']] = $row['token'];
                    }
                }
            }
        }
        
        // Step 7: Combine all data in memory (using RAM as requested)
        foreach ($conversations as &$conv) {
            $convId = (int) $conv['id'];
            $otherUserId = (int) $conv['other_user_id'];
            
            // Add unread count
            $conv['unread_count'] = isset($unreadCounts[$convId]) ? $unreadCounts[$convId] : 0;
            
            // Add last message
            if (isset($lastMessages[$convId])) {
                $conv['last_message_text'] = $lastMessages[$convId]['text'];
                $conv['last_message_type'] = $lastMessages[$convId]['type'];
            } else {
                $conv['last_message_text'] = null;
                $conv['last_message_type'] = null;
            }
            
            // Add friend profile
            $friendProfile = null;
            if ($otherUserId > 0 && isset($learnerProfiles[$otherUserId])) {
                $friendData = $learnerProfiles[$otherUserId];
                $friendProfile = [
                    'phone' => $friendData['phone'],
                    'name' => $friendData['name'],
                    'image' => $friendData['image'],
                    'fcm_token' => isset($fcmTokens[$otherUserId]) ? $fcmTokens[$otherUserId] : null
                ];
            }
            $conv['friend'] = $friendProfile;
            
            // Convert timestamps to Unix milliseconds
            $conv = convertTimestamps($conv);
        }
        unset($conv); // Break reference
        
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
        sendResponse(false, null, 'Failed to create conversation ' .$insertQuery );
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

