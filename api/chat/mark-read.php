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

if ($method === 'POST') {
    // Mark message(s) as read
    $messageId = isset($_POST['message_id']) ? (int) $_POST['message_id'] : 0;
    $conversationId = isset($_POST['conversation_id']) ? (int) $_POST['conversation_id'] : 0;
    $userId = isset($_POST['user_id']) ? (int) $_POST['user_id'] : 0;
    
    if ($messageId > 0) {
        // Mark single message as read
        $query = "UPDATE messages SET is_read = 1 WHERE id = $messageId";
        $result = $db->save($query);
        
        if (!$result) {
            sendResponse(false, null, 'Failed to mark message as read');
        }
        
        sendResponse(true, ['message_id' => $messageId, 'is_read' => true]);
        
    } elseif ($conversationId > 0 && $userId > 0) {
        // Mark all messages in conversation as read (except sender's own messages)
        $query = "UPDATE messages SET is_read = 1 
                  WHERE conversation_id = $conversationId 
                  AND sender_id != $userId 
                  AND is_read = 0";
        $result = $db->save($query);
        
        if ($result === false) {
            sendResponse(false, null, 'Failed to mark messages as read');
        }
        
        // Get count of marked messages
        $countQuery = "SELECT COUNT(*) as count FROM messages 
                       WHERE conversation_id = $conversationId 
                       AND sender_id != $userId 
                       AND is_read = 1";
        $countResult = $db->read($countQuery);
        $count = $countResult && !empty($countResult) ? $countResult[0]['count'] : 0;
        
        sendResponse(true, [
            'conversation_id' => $conversationId,
            'marked_count' => $count
        ]);
        
    } else {
        sendResponse(false, null, 'Either message_id or (conversation_id and user_id) is required');
    }
    
} else {
    sendResponse(false, null, 'Method not allowed');
}

?>

