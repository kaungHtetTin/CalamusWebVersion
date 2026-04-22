# API Documentation


## Course API (`courseAPI`)

| Method | Endpoint                       | Description                          | Parameters / Body                           |
| :----- | :----------------------------- | :----------------------------------- | :------------------------------------------ |
| `GET`  | `/courses/featured.php`        | Get featured courses (top rated)     | -                                           |
| `GET`  | `/courses/new.php`             | Get new courses (latest)             | -                                           |
| `GET`  | `/courses/all.php`             | Get all courses with optional filter | Query: `major` (optional)                   |
| `GET`  | `/courses/detail.php`          | Get course detail by ID              | Query: `id` (required), `userId` (optional) |
| `GET`  | `/courses/get-certificate.php` | Get certificate info                 | Query: `course_id`, `userId`                |

## Lesson API (`lessonAPI`)

| Method | Endpoint                    | Description                           | Parameters / Body                             |
| :----- | :-------------------------- | :------------------------------------ | :-------------------------------------------- |
| `GET`  | `/lessons/detail.php`       | Get lesson detail with course context | Query: `id`, `course_id`, `userId` (optional) |
| `POST` | `/lessons/mark-learned.php` | Mark lesson as learned                | Body: `{ lessonId }`                          |

## Instructor API (`instructorAPI`)

| Method | Endpoint                  | Description                    | Parameters / Body |
| :----- | :------------------------ | :----------------------------- | :---------------- |
| `GET`  | `/instructors/all.php`    | Get all instructors with stats | -                 |
| `GET`  | `/instructors/detail.php` | Get instructor detail by ID    | Query: `id`       |

## Video Channel API (`videoChannelAPI`)

| Method | Endpoint                   | Description                                  | Parameters / Body               |
| :----- | :------------------------- | :------------------------------------------- | :------------------------------ |
| `GET`  | `/video-channel/get.php`   | Get video channel data                       | Query: `channel`, `app` (appId) |
| `GET`  | `/video-channel/video.php` | Get single video details with related videos | Query: `id`                     |

## Song API (`songAPI`)

| Method | Endpoint               | Description                       | Parameters / Body                                |
| :----- | :--------------------- | :-------------------------------- | :----------------------------------------------- |
| `GET`  | `/songs/get.php`       | Get songs (popular, all, artists) | Query: `category`, `page`, `userId` (optional)   |
| `GET`  | `/songs/lyrics.php`    | Get lyrics for a song             | Query: `url`                                     |
| `GET`  | `/songs/by-artist.php` | Get songs by artist               | Query: `category`, `artist`, `userId` (optional) |
| `POST` | `/songs/like.php`      | Toggle like for a song (Auth)     | Body: `{ songId }`                               |
| `POST` | `/songs/download.php`  | Increment download count          | Body: `{ songId }`                               |

## Mini Library API (`miniLibraryAPI`)

| Method | Endpoint                       | Description                    | Parameters / Body          |
| :----- | :----------------------------- | :----------------------------- | :------------------------- |
| `GET`  | `/mini-library/categories.php` | Get categories with book count | Query: `major`             |
| `GET`  | `/mini-library/books.php`      | Get books in a category        | Query: `major`, `category` |

## Languages API (`languagesAPI`)

| Method | Endpoint             | Description                 | Parameters / Body |
| :----- | :------------------- | :-------------------------- | :---------------- |
| `GET`  | `/languages/get.php` | Get all supported languages | -                 |

## Vocab Learning API (`vocabLearningAPI`)

| Method | Endpoint                        | Description                             | Parameters / Body                                                            |
| :----- | :------------------------------ | :-------------------------------------- | :--------------------------------------------------------------------------- |
| `GET`  | `/vocab-learning/get-decks.php` | Get decks filtered by major or language | Query: `major` OR `language_id`, `user_id` (optional)                        |
| `GET`  | `/vocab-learning/get-cards.php` | Get learning cards for a session        | Query: `user_id`, `language_id`, `deck_id`                                   |
| `POST` | `/vocab-learning/rate-word.php` | Rate a word (SM2 algorithm)             | Body: `{ user_id, card_id, quality }`                                        |
| `POST` | `/vocab-learning/skip-word.php` | Skip a word                             | Body: `{ user_id, card_id, language_id, deck_id, reason, session_card_ids }` |

## Discussion/Posts API (`discussionAPI`)

| Method | Endpoint                          | Description                    | Parameters / Body                              |
| :----- | :-------------------------------- | :----------------------------- | :--------------------------------------------- |
| `GET`  | `/discussions/get.php`            | Get discussion posts           | Query: `category`, `page`, `userId` (optional) |
| `GET`  | `/discussions/comments.php`       | Get comments for a post        | Query: `postId`, `userId` (optional)           |
| `GET`  | `/discussions/detail.php`         | Get single post detail         | Query: `postId`, `userId` (optional)           |
| `GET`  | `/discussions/lesson-detail.php`  | Get lesson post detail         | Query: `postId`, `userId` (optional)           |
| `POST` | `/discussions/create.php`         | Create a new discussion post   | Body: `{ body, category, image }`              |
| `POST` | `/discussions/delete.php`         | Delete a post (owner only)     | Body: `{ postId }`                             |
| `POST` | `/discussions/report.php`         | Report a post                  | Body: `{ postId }`                             |
| `POST` | `/discussions/hide.php`           | Hide a post (for current user) | Body: `{ postId }`                             |
| `POST` | `/discussions/like.php`           | Like/Unlike a post             | Body: `{ postId }`                             |
| `POST` | `/discussions/comment-like.php`   | Like/Unlike a comment          | Body: `{ postId, commentId }`                  |
| `POST` | `/discussions/comment-delete.php` | Delete a comment               | Body: `{ postId, commentId }`                  |
| `POST` | `/discussions/comment-update.php` | Update a comment               | Body: `{ postId, commentId, body }`            |
| `POST` | `/discussions/comment-create.php` | Create a comment or reply      | Body: `{ postId, body, parent }`               |
| `POST` | `/discussions/share.php`          | Share a post                   | Body: `{ postId }`                             |

## Additional Lessons API (`additionalLessonsAPI`)

| Method | Endpoint                          | Description                        | Parameters / Body   |
| :----- | :-------------------------------- | :--------------------------------- | :------------------ |
| `GET`  | `/additional-lessons/courses.php` | Get courses for a language channel | Query: `channel`    |
| `GET`  | `/additional-lessons/lessons.php` | Get lessons for a category         | Query: `categoryId` |

## Stats API (`statsAPI`)

| Method | Endpoint           | Description          | Parameters / Body |
| :----- | :----------------- | :------------------- | :---------------- |
| `GET`  | `/stats/home.php`  | Get home page stats  | -                 |
| `GET`  | `/about/stats.php` | Get About page stats | -                 |

## Pinned Posts API (`pinnedPostsAPI`)

| Method | Endpoint            | Description      | Parameters / Body |
| :----- | :------------------ | :--------------- | :---------------- |
| `GET`  | `/posts/pinned.php` | Get pinned posts | -                 |

## VIP Plan API (`vipPlanAPI`)

| Method | Endpoint            | Description       | Parameters / Body |
| :----- | :------------------ | :---------------- | :---------------- |
| `GET`  | `/vip-plan/get.php` | Get VIP plan data | -                 |

## Rating API (`ratingAPI`)

| Method | Endpoint              | Description            | Parameters / Body                  |
| :----- | :-------------------- | :--------------------- | :--------------------------------- |
| `POST` | `/ratings/create.php` | Create a rating/review | Body: `{ courseId, star, review }` |
| `POST` | `/ratings/update.php` | Update a rating/review | Body: `{ id, star, review }`       |
| `POST` | `/ratings/delete.php` | Delete a rating/review | Body: `{ id }`                     |
| `GET`  | `/ratings/latest.php` | Get latest reviews     | Query: `limit`                     |

## Apps API (`appsAPI`)

| Method | Endpoint        | Description     | Parameters / Body |
| :----- | :-------------- | :-------------- | :---------------- |
| `GET`  | `/apps/get.php` | Get active apps | -                 |

## Friends API (`friendsAPI`)

| Method | Endpoint                      | Description                      | Parameters / Body                         |
| :----- | :---------------------------- | :------------------------------- | :---------------------------------------- |
| `POST` | `/friends/add.php`            | Send friend request              | Body: `{ otherId, major }`                |
| `POST` | `/friends/remove-request.php` | Remove friend request            | Body: `{ otherId, major }`                |
| `POST` | `/friends/confirm.php`        | Accept friend request            | Body: `{ otherId, major }`                |
| `POST` | `/friends/unfriend.php`       | Unfriend a user                  | Body: `{ otherId, major }`                |
| `GET`  | `/friends/get-friends.php`    | Get friend list                  | Query: `userId`, `major`, `page`, `limit` |
| `GET`  | `/friends/get-requests.php`   | Get incoming requests (Auth)     | Query: `major`                            |
| `GET`  | `/friends/get-status.php`     | Get friend status (Auth)         | Query: `otherId`, `major`                 |
| `POST` | `/friends/block.php`          | Block a user (Auth)              | Body: `{ otherId }`                       |
| `GET`  | `/friends/check-block.php`    | Check if user is blocked (Auth)  | Query: `otherId`                          |
| `POST` | `/friends/unblock.php`        | Unblock a user (Auth)            | Body: `{ otherId }`                       |
| `GET`  | `/friends/get-blocked.php`    | Get list of blocked users (Auth) | -                                         |

## Chat API (`chatAPI`)

| Method   | Endpoint                  | Description                              | Parameters / Body                                                                                              |
| :------- | :------------------------ | :--------------------------------------- | :------------------------------------------------------------------------------------------------------------- |
| `GET`    | `/chat/conversations.php` | Get conversations or single conversation | Query: `user_id`, `major`, `id` (optional)                                                                     |
| `POST`   | `/chat/conversations.php` | Create conversation                      | Body (Form): `user1_id`, `user2_id`, `major`                                                                   |
| `GET`    | `/chat/messages.php`      | Get messages                             | Query: `conversation_id`, `major`, `limit`, `before_id`, `after_id`                                            |
| `POST`   | `/chat/messages.php`      | Send message                             | Body (Form): `conversation_id`, `sender_id`, `major`, `message_type`, `message_text`, `file_path`, `file_size` |
| `DELETE` | `/chat/conversations.php` | Delete conversation                      | Query: `id`, `major`                                                                                           |
| `POST`   | `/chat/mark-read.php`     | Mark conversation as read                | Body (Form): `conversation_id`, `user_id`, `major`                                                             |
| `POST`   | `/chat/upload-image.php`  | Upload chat image                        | Body (FormData): `image`                                                                                       |

## User API (`userAPI`)

| Method | Endpoint                     | Description                                 | Parameters / Body                                                                           |
| :----- | :--------------------------- | :------------------------------------------ | :------------------------------------------------------------------------------------------ |
| `GET`  | `/users/profile.php`         | Get public profile                          | Query: `id` (userId), `page`, `tab`, `viewerId`                                             |
| `GET`  | `/users/my-learning.php`     | Get current user's learning progress (Auth) | -                                                                                           |
| `POST` | `/users/update.php`          | Update user profile                         | Body (FormData): `name`, `bio`, `work`, `education`, `region`, `profileImage`, `coverImage` |
| `POST` | `/users/change-password.php` | Change password                             | Body: `{ currentPassword, newPassword }`                                                    |
| `POST` | `/users/delete-account.php`  | Delete account                              | Body: `{ password }`                                                                        |

## Notification API (`notificationAPI`)

| Method | Endpoint                           | Description                        | Parameters / Body          |
| :----- | :--------------------------------- | :--------------------------------- | :------------------------- |
| `GET`  | `/notifications/get.php`           | Get notifications (Auth)           | Query: `major`, `limit`    |
| `POST` | `/notifications/mark-read.php`     | Mark all notifications as read     | -                          |
| `POST` | `/notifications/mark-one-read.php` | Mark a single notification as seen | Body: `{ notificationId }` |

## Auth API (`authAPI`)

| Method | Endpoint             | Description                           | Parameters / Body           |
| :----- | :------------------- | :------------------------------------ | :-------------------------- |
| `POST` | `/auth/login.php`    | Login                                 | Body: `{ phone, password }` |
| `POST` | `/auth/register.php` | Register                              | Body: `{ ...data }`         |
| `GET`  | `/auth/me.php`       | Get current authenticated user (Auth) | -                           |
| `POST` | `/auth/logout.php`   | Logout                                | -                           |
