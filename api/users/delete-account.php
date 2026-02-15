<?php
/**
 * API: Delete User Account
 * POST: Deletes authenticated user's account and related data
 * Requires authentication (Bearer token)
 * Maintains vipusers table record but marks it as deleted
 */

require_once __DIR__ . '/../bootstrap.php';

error_reporting(0);
ini_set('display_errors', 0);
require_once '../../classes/connect.php';
require_once '../auth_helper.php';

try {
    // Get authenticated user
    $token = getBearerToken();
    if (empty($token)) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Not authenticated']);
        exit();
    }

    $DB = new Database();
    $conn = $DB->connect();
    $token_escaped = mysqli_real_escape_string($conn, $token);

    // Find user by token
    $userQuery = "SELECT id, learner_phone, password FROM learners WHERE auth_token = '$token_escaped' LIMIT 1";
    $userResult = $DB->read($userQuery);

    if (!$userResult || !isset($userResult[0])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Invalid token']);
        exit();
    }

    $user = $userResult[0];
    $userId = (int)$user['id'];
    $userPhone = $user['learner_phone'];
    $hashedPassword = $user['password'];
    $userPhone_escaped = mysqli_real_escape_string($conn, $userPhone);

    // Get input data
    $input = json_decode(file_get_contents('php://input'), true);
    $password = $input['password'] ?? '';

    if (empty($password)) {
        echo json_encode(['success' => false, 'error' => 'Password is required to delete account']);
        exit();
    }

    // Verify password
    if (!password_verify($password, $hashedPassword)) {
        echo json_encode(['success' => false, 'error' => 'Incorrect password']);
        exit();
    }

    // Start transaction for data integrity
    mysqli_begin_transaction($conn);

    try {
        // 1. Update vipusers table - Maintain record but mark as deleted
        $updateVipQuery = "UPDATE vipusers SET deleted_account = 1 WHERE phone = '$userPhone_escaped'";
        $DB->save($updateVipQuery);

        // 2. Delete from learners table
        $deleteLearnerQuery = "DELETE FROM learners WHERE id = $userId";
        $DB->save($deleteLearnerQuery);

        // 3. Delete related data from other tables
        
        // Posts and their related data (comments, likes on those posts)
        // First get all post IDs of the user
        $userPostsQuery = "SELECT post_id FROM posts WHERE learner_id = '$userPhone_escaped'";
        $userPosts = $DB->read($userPostsQuery);
        if ($userPosts) {
            foreach ($userPosts as $post) {
                $postId = $post['post_id'];
                $DB->save("DELETE FROM comment WHERE post_id = $postId");
                $DB->save("DELETE FROM mylikes WHERE content_id = $postId");
                $DB->save("DELETE FROM report WHERE post_id = $postId");
            }
        }
        $DB->save("DELETE FROM posts WHERE learner_id = '$userPhone_escaped'");

        // Comments written by the user
        $DB->save("DELETE FROM comment WHERE writer_id = '$userPhone_escaped'");
        $DB->save("DELETE FROM comment_likes WHERE user_id = '$userPhone_escaped'");

        // Social / Interaction
        $DB->save("DELETE FROM blocks WHERE user_id = '$userPhone_escaped' OR blocked_user_id = '$userPhone_escaped'");
        $DB->save("DELETE FROM friends WHERE user_id = '$userPhone_escaped'");
        $DB->save("DELETE FROM friend_requests WHERE user_id = '$userPhone_escaped'");
        $DB->save("DELETE FROM hidden_posts WHERE user_id = '$userPhone_escaped'");
        $DB->save("DELETE FROM notification WHERE owner_id = '$userPhone_escaped' OR writer_id = '$userPhone_escaped'");
        $DB->save("DELETE FROM ratings WHERE user_id = '$userPhone_escaped'");

        // Chat
        // Get all conversations of the user
        $convsQuery = "SELECT id FROM conversations WHERE user1_id = '$userPhone_escaped' OR user2_id = '$userPhone_escaped'";
        $convs = $DB->read($convsQuery);
        if ($convs) {
            foreach ($convs as $conv) {
                $convId = $conv['id'];
                $DB->save("DELETE FROM messages WHERE conversation_id = $convId");
            }
        }
        $DB->save("DELETE FROM conversations WHERE user1_id = '$userPhone_escaped' OR user2_id = '$userPhone_escaped'");

        // Learning Progress
        $DB->save("DELETE FROM course_enroll WHERE user_id = '$userPhone_escaped'");
        $DB->save("DELETE FROM studies WHERE learner_id = '$userPhone_escaped'");
        $DB->save("DELETE FROM user_card_states WHERE user_id = '$userPhone_escaped'");
        $DB->save("DELETE FROM user_learning_progress WHERE user_id = '$userPhone_escaped'");
        $DB->save("DELETE FROM user_roadmaps WHERE user_id = '$userPhone_escaped'");
        $DB->save("DELETE FROM user_word_skips WHERE user_id = '$userPhone_escaped'");
        $DB->save("DELETE FROM certificates WHERE user_id = '$userPhone_escaped'");
        $DB->save("DELETE FROM library_downloads WHERE user_id = $userId");

        // Payments
        $DB->save("DELETE FROM payments WHERE user_id = '$userPhone_escaped'");

        // Commit transaction
        mysqli_commit($conn);

        echo json_encode([
            'success' => true,
            'message' => 'Account and related data deleted successfully. VIP record maintained.'
        ]);

    } catch (Exception $e) {
        mysqli_rollback($conn);
        throw $e;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to delete account: ' . $e->getMessage()]);
}
?>
