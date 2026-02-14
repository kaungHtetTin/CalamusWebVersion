/**
 * API Service for Calamus Education
 * Handles all API calls to the PHP backend
 */

const API_BASE_URL = 'http://localhost/calamus/api';

/**
 * Document lesson HTML URL (same as Lesson Play / api/lessons/detail.php).
 * Files are stored at origin/uploads/lessons/html/{lessonId}.html
 */
export const getLessonDocumentUrl = (lessonId) => {
  try {
    const origin = new URL(API_BASE_URL).origin;
    return `${origin}/uploads/lessons/html/${Number(lessonId)}.html`;
  } catch {
    return `${API_BASE_URL.replace(/\/api\/?$/, '')}/uploads/lessons/html/${Number(lessonId)}.html`;
  }
};

/**
 * Get stored auth token from localStorage
 */
const getToken = () => localStorage.getItem('calamus_token');

/**
 * Generic GET fetch wrapper with error handling
 */
const fetchAPI = async (endpoint) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.error || `HTTP error! status: ${response.status}`);
      error.status = response.status;
      error.response = { data };
      throw error;
    }

    if (!data.success) {
      const error = new Error(data.error || 'API request failed');
      error.response = { data };
      throw error;
    }

    return data;
  } catch (error) {
    // Don't log 404 errors as they're expected for missing resources
    if (error.status !== 404 && !error.message?.includes('404')) {
      console.error(`API Error (${endpoint}):`, error);
    }
    throw error;
  }
};

/**
 * POST fetch wrapper with JSON body
 */
const postAPI = async (endpoint, body = {}) => {
  try {
    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    if (error.message !== 'Not authenticated') {
      console.error(`API Error (${endpoint}):`, error);
    }
    throw error;
  }
};

/**
 * POST with form-urlencoded body (for APIs that read $_POST, e.g. chat)
 */
const postFormAPI = async (endpoint, body = {}) => {
  const params = new URLSearchParams();
  Object.keys(body).forEach((key) => {
    if (body[key] != null && body[key] !== '') {
      params.append(key, body[key]);
    }
  });
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'API request failed');
  return data;
};

/**
 * DELETE fetch wrapper
 */
const deleteAPI = async (endpoint) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'API request failed');
    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

/**
 * Authenticated GET fetch wrapper (includes Bearer token)
 */
const authFetchAPI = async (endpoint) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    if (error.message !== 'Not authenticated') {
      console.error(`API Error (${endpoint}):`, error);
    }
    throw error;
  }
};

/**
 * Course API endpoints
 */
export const courseAPI = {
  /**
   * Get featured courses (top rated)
   */
  getFeatured: () => fetchAPI('/courses/featured.php'),
  
  /**
   * Get new courses (latest)
   */
  getNew: () => fetchAPI('/courses/new.php'),
  
  /**
   * Get all courses with optional filter
   * @param {string} major - Optional filter by major (english/korea)
   */
  getAll: (major = null) => {
    const params = major ? `?major=${major}` : '';
    return fetchAPI(`/courses/all.php${params}`);
  },
  
  /**
   * Get course detail by ID
   * @param {number} id - Course ID
   * @param {string} userId - Optional user ID for learned status
   */
  getDetail: (id, userId = null) => {
    let params = `id=${id}`;
    if (userId) params += `&userId=${userId}`;
    return fetchAPI(`/courses/detail.php?${params}`);
  },
  getCertificate: (courseId, userId) =>
    fetchAPI(`/courses/get-certificate.php?course_id=${courseId}&userId=${userId}`),
};

/**
 * Lesson API endpoints
 */
export const lessonAPI = {
  /**
   * Get lesson detail with course context
   * @param {number} lessonId
   * @param {number} courseId
   * @param {string} userId - Optional user ID for learned status
   */
  getDetail: (lessonId, courseId, userId = null) => {
    let params = `id=${lessonId}&course_id=${courseId}`;
    if (userId) params += `&userId=${userId}`;
    return fetchAPI(`/lessons/detail.php?${params}`).then((r) => r.data);
  },
  
  /**
   * Mark lesson as learned
   * @param {number} lessonId
   */
  markLearned: (lessonId) => postAPI('/lessons/mark-learned.php', { lessonId }),
};

/**
 * Instructor API endpoints
 */
export const instructorAPI = {
  /**
   * Get all instructors with stats
   */
  getAll: () => fetchAPI('/instructors/all.php'),
  
  /**
   * Get instructor detail by ID
   * @param {number} id - Instructor ID
   */
  getDetail: (id) => fetchAPI(`/instructors/detail.php?id=${id}`),
};

/**
 * Video Channel API endpoints
 */
export const videoChannelAPI = {
  /**
   * Get video channel data
   * @param {string} channel - Channel name
   * @param {number} appId - App ID
   */
  get: (channel, appId) => fetchAPI(`/video-channel/get.php?channel=${channel}&app=${appId}`),
  
  /**
   * Get single video details with related videos
   * @param {number} id - Lesson/Video ID
   */
  getVideo: (id) => fetchAPI(`/video-channel/video.php?id=${id}`),
};

/**
 * Song API endpoints
 */
export const songAPI = {
  /**
   * Get songs with popular songs, all songs, and artists
   * @param {string} category - Category (english/korea)
   * @param {number} page - Page number for pagination
   * @param {string} userId - Optional user ID for liked state
   */
  get: (category = 'english', page = 1, userId = null) => {
    let url = `/songs/get.php?category=${category}&page=${page}`;
    if (userId) url += `&userId=${encodeURIComponent(userId)}`;
    return fetchAPI(url);
  },

  /**
   * Get lyrics for a song
   * @param {string} url - Song URL identifier
   */
  getLyrics: (url) => fetchAPI(`/songs/lyrics.php?url=${url}`),

  /**
   * Get songs by artist
   * @param {string} category - Category (english/korea)
   * @param {string} artist - Artist name
   * @param {string} userId - Optional user ID for liked state
   */
  getByArtist: (category, artist, userId = null) => {
    let url = `/songs/by-artist.php?category=${category}&artist=${encodeURIComponent(artist)}`;
    if (userId) url += `&userId=${encodeURIComponent(userId)}`;
    return fetchAPI(url);
  },

  /**
   * Toggle like for a song (requires auth). Returns { liked, likeCount }.
   * @param {number} songId - Song id (songs.id)
   */
  like: (songId) => postAPI('/songs/like.php', { songId }),

  /**
   * Increment download count for a song. Returns { downloadCount }.
   * @param {number} songId - Song id (songs.id)
   */
  download: (songId) => postAPI('/songs/download.php', { songId }),
};

/**
 * Base URL for uploads (same origin as API, without /api)
 */
const getUploadsBaseUrl = () => {
  try {
    const base = API_BASE_URL.replace(/\/api\/?$/, '');
    return base || new URL(API_BASE_URL).origin;
  } catch {
    return '';
  }
};

/**
 * Full URL for a Mini Library asset (cover image or PDF). Path is relative, e.g. "uploads/books/..."
 */
export const getBookAssetUrl = (path) => {
  if (!path) return '';
  const base = getUploadsBaseUrl();
  const normalized = path.startsWith('/') ? path.slice(1) : path;
  return base ? `${base}/${normalized}` : path;
};

/**
 * Mini Library API endpoints
 */
export const miniLibraryAPI = {
  /**
   * Get categories with book count for a major
   * @param {string} major - english, korea, etc. Default: english
   */
  getCategories: (major = 'english') =>
    fetchAPI(`/mini-library/categories.php?major=${encodeURIComponent(major)}`),

  /**
   * Get books in a category
   * @param {string} major - english, korea, etc.
   * @param {string} category - Category name
   */
  getBooks: (major, category) =>
    fetchAPI(`/mini-library/books.php?major=${encodeURIComponent(major)}&category=${encodeURIComponent(category)}`),
};

/**
 * Languages API endpoints
 */
export const languagesAPI = {
  /**
   * Get all supported languages
   */
  getAll: () => fetchAPI('/languages/get.php'),
};

/**
 * Vocab Learning API endpoints
 */
export const vocabLearningAPI = {
  /**
   * Get decks filtered by major or language
   * @param {string} major - Optional major filter (english, korea, etc.)
   * @param {number} languageId - Optional language ID (for backward compatibility)
   * @param {number} userId - Optional user ID for progress data
   */
  getDecks: (major = null, languageId = null, userId = null) => {
    const params = new URLSearchParams();
    if (major) {
      params.append('major', major);
    } else if (languageId) {
      params.append('language_id', languageId);
    }
    if (userId) params.append('user_id', userId);
    return fetchAPI(`/vocab-learning/get-decks.php?${params}`);
  },
  
  /**
   * Get learning cards for a session
   * @param {number} userId - User ID
   * @param {number} languageId - Language ID
   * @param {number} deckId - Deck ID
   * @param {number} wordCount - Number of words (default: 10)
   */
  getCards: (userId, languageId, deckId, wordCount = 10) => {
    const params = new URLSearchParams({
      user_id: userId,
      language_id: languageId,
      deck_id: deckId,
    });
    // Note: wordCount is handled server-side, but we can pass it if needed
    return fetchAPI(`/vocab-learning/get-cards.php?${params}`);
  },
  
  /**
   * Rate a word (SM2 algorithm)
   * @param {number} userId - User ID
   * @param {number} cardId - Card ID
   * @param {number} quality - Quality rating (0-5)
   */
  rateWord: (userId, cardId, quality) => {
    return postAPI('/vocab-learning/rate-word.php', {
      user_id: userId,
      card_id: cardId,
      quality: quality,
    });
  },
  
  /**
   * Skip a word
   * @param {number} userId - User ID
   * @param {number} cardId - Card ID
   * @param {number} languageId - Language ID
   * @param {number} deckId - Deck ID
   * @param {string} reason - Reason for skipping (default: 'already_know')
   * @param {array} sessionCardIds - Array of card IDs in current session
   */
  skipWord: (userId, cardId, languageId, deckId, reason = 'already_know', sessionCardIds = []) => {
    return postAPI('/vocab-learning/skip-word.php', {
      user_id: userId,
      card_id: cardId,
      language_id: languageId,
      deck_id: deckId,
      reason: reason,
      session_card_ids: JSON.stringify(sessionCardIds),
    });
  },
};

/**
 * Discussion/Posts API endpoints
 */
export const discussionAPI = {
  /**
   * Get discussion posts
   * @param {string} category - Category (english/korea)
   * @param {number} page - Page number for pagination
   * @param {string} userId - Optional user ID for like status
   */
  get: (category = 'english', page = 1, userId = null) => {
    let params = `category=${category}&page=${page}`;
    if (userId) params += `&userId=${userId}`;
    return fetchAPI(`/discussions/get.php?${params}`);
  },
  
  /**
   * Get comments for a post
   * @param {number} postId - Post ID
   * @param {string} userId - Optional user ID for like status
   */
  getComments: (postId, userId = null) => {
    let params = `postId=${postId}`;
    if (userId) params += `&userId=${userId}`;
    return fetchAPI(`/discussions/comments.php?${params}`);
  },
  
  /**
   * Get single post detail with comments
   * @param {number} postId - Post ID
   * @param {string} userId - Optional user ID for like status
   */
  getPostDetail: (postId, userId = null) => {
    let params = `postId=${postId}`;
    if (userId) params += `&userId=${userId}`;
    return fetchAPI(`/discussions/detail.php?${params}`);
  },
  
  /**
   * Get lesson post detail (allows hide = 1 posts)
   * @param {number} postId - Post ID
   * @param {string} userId - Optional user ID for like status
   */
  getLessonPostDetail: (postId, userId = null) => {
    let params = `postId=${postId}`;
    if (userId) params += `&userId=${userId}`;
    return fetchAPI(`/discussions/lesson-detail.php?${params}`);
  },

  /**
   * Create a new discussion post
   * @param {object} data - { body, category, image (base64) }
   */
  createPost: (data) => postAPI('/discussions/create.php', data),

  /**
   * Delete a post (owner only)
   * @param {number} postId
   */
  deletePost: (postId) => postAPI('/discussions/delete.php', { postId }),

  /**
   * Report a post
   * @param {number} postId
   */
  reportPost: (postId) => postAPI('/discussions/report.php', { postId }),

  /**
   * Hide a post (for current user only)
   * @param {number} postId
   */
  hidePost: (postId) => postAPI('/discussions/hide.php', { postId }),

  /**
   * Like/Unlike a post (toggle)
   * @param {number} postId
   * @returns {Promise<{success, count, isLiked}>}
   */
  likePost: (postId) => postAPI('/discussions/like.php', { postId }),

  /**
   * Like/Unlike a comment (toggle)
   * @param {number} postId
   * @param {number} commentId - comment.time
   */
  likeComment: (postId, commentId) => postAPI('/discussions/comment-like.php', { postId, commentId }),

  /**
   * Delete a comment (owner only)
   * @param {number} postId
   * @param {number} commentId - comment.time
   */
  deleteComment: (postId, commentId) => postAPI('/discussions/comment-delete.php', { postId, commentId }),

  /**
   * Update a comment (owner only)
   * @param {number} postId
   * @param {number} commentId - comment.time
   * @param {string} body - Updated comment text
   */
  updateComment: (postId, commentId, body) => postAPI('/discussions/comment-update.php', { postId, commentId, body }),

  /**
   * Create a comment or reply
   * @param {object} data - { postId, body, parent? }
   */
  createComment: (data) => postAPI('/discussions/comment-create.php', data),

  /**
   * Share a post
   * @param {number} postId - Original post ID to share
   */
  sharePost: (postId) => postAPI('/discussions/share.php', { postId }),
};

/**
 * Additional Lessons API endpoints
 */
export const additionalLessonsAPI = {
  /**
   * Get courses with categories for a language channel
   * @param {string} channel - Language channel (english/korea)
   */
  getCourses: (channel = 'english') => fetchAPI(`/additional-lessons/courses.php?channel=${channel}`),
  
  /**
   * Get lessons for a specific category
   * @param {number} categoryId - Category ID
   */
  getLessons: (categoryId) => fetchAPI(`/additional-lessons/lessons.php?categoryId=${categoryId}`),
};

/**
 * Stats API endpoints
 */
export const statsAPI = {
  /**
   * Get home page stats for hero section
   * Returns: totalCourses, totalLessons, totalInstructors, totalStudents, avgRating, topInstructors
   */
  getHome: () => fetchAPI('/stats/home.php'),
};

/**
 * Pinned Posts API endpoints
 */
export const pinnedPostsAPI = {
  /**
   * Get pinned posts for home page (all categories)
   */
  get: () => fetchAPI('/posts/pinned.php'),
};

/**
 * VIP Plan API endpoints
 */
export const vipPlanAPI = {
  /**
   * Get VIP plan data (pricing, payment methods, etc.)
   */
  get: () => fetchAPI('/vip-plan/get.php'),
};

/**
 * Rating API endpoints
 */
export const ratingAPI = {
  /**
   * Create a rating/review for a course
   * @param {number} courseId - Course ID
   * @param {number} star - Rating (1-5)
   * @param {string} review - Review text
   */
  create: (courseId, star, review) => postAPI('/ratings/create.php', { courseId, star, review }),
  
  /**
   * Update a rating/review
   * @param {number} id - Rating ID
   * @param {number} star - Rating (1-5, optional)
   * @param {string} review - Review text (optional)
   */
  update: (id, star, review) => postAPI('/ratings/update.php', { id, star, review }),
  
  /**
   * Delete a rating/review
   * @param {number} id - Rating ID
   */
  delete: (id) => postAPI('/ratings/delete.php', { id }),
  
  /**
   * Get latest reviews
   * @param {number} limit - Number of reviews to fetch (default: 6)
   */
  getLatest: (limit = 6) => fetchAPI(`/ratings/latest.php?limit=${limit}`),
};

/**
 * Apps API endpoints
 */
export const appsAPI = {
  /**
   * Get active apps (with active_course > 0)
   */
  get: () => fetchAPI('/apps/get.php'),
};

/**
 * Friends API endpoints (add friend, requests, confirm, unfriend, status)
 */
export const friendsAPI = {
  /**
   * Send friend request (or unsend if already sent)
   * @param {string} otherId - learner_phone of the user to add
   * @param {string} major - english | korea | chinese | japanese | russian
   */
  addRequest: (otherId, major = 'english') =>
    postAPI('/friends/add.php', { otherId, major }),

  /**
   * Remove an incoming friend request (decline)
   * @param {string} otherId - learner_phone of the person who sent the request
   * @param {string} major
   */
  removeRequest: (otherId, major = 'english') =>
    postAPI('/friends/remove-request.php', { otherId, major }),

  /**
   * Accept friend request
   * @param {string} otherId - learner_phone of the person who sent the request
   * @param {string} major
   */
  confirm: (otherId, major = 'english') =>
    postAPI('/friends/confirm.php', { otherId, major }),

  /**
   * Unfriend a user
   * @param {string} otherId - learner_phone
   * @param {string} major
   */
  unfriend: (otherId, major = 'english') =>
    postAPI('/friends/unfriend.php', { otherId, major }),

  /**
   * Get friend list for a user (public). Supports pagination.
   * @param {string} userId - learner_phone
   * @param {string} major
   * @param {{ page?: number, limit?: number }} [params] - optional pagination
   */
  getFriends: (userId, major = 'english', params = {}) => {
    const search = new URLSearchParams({ userId, major });
    if (params.page != null) search.set('page', String(params.page));
    if (params.limit != null) search.set('limit', String(params.limit));
    return fetchAPI(`/friends/get-friends.php?${search.toString()}`);
  },

  /**
   * Get my incoming requests + people you may know (authenticated)
   * @param {string} major
   */
  getRequests: (major = 'english') =>
    authFetchAPI(`/friends/get-requests.php?major=${major}`),

  /**
   * Get friend status between me and another user (authenticated)
   * @param {string} otherId - learner_phone
   * @param {string} major
   * @returns {Promise<{ success, status: 'friend'|'pending_sent'|'pending_received'|'none' }>}
   */
  getStatus: (otherId, major = 'english') =>
    authFetchAPI(`/friends/get-status.php?otherId=${encodeURIComponent(otherId)}&major=${major}`),

  /**
   * Block a user (authenticated)
   * @param {string} otherId - learner_phone of user to block
   * @returns {Promise<{ success, action: 'blocked'|'already_blocked' }>}
   */
  block: (otherId) =>
    postAPI('/friends/block.php', { otherId }),

  /**
   * Check if a user is blocked (either direction)
   * @param {string} otherId - learner_phone
   * @returns {Promise<{ success, blocked: boolean, blocked_by_me: boolean, blocked_by_other: boolean }>}
   */
  checkBlock: (otherId) =>
    authFetchAPI(`/friends/check-block.php?otherId=${encodeURIComponent(otherId)}`),

  /**
   * Unblock a user (authenticated)
   * @param {string} otherId - learner_phone of user to unblock
   * @returns {Promise<{ success, action: 'unblocked'|'not_blocked' }>}
   */
  unblock: (otherId) =>
    postAPI('/friends/unblock.php', { otherId }),
  /**
   * Get list of blocked users (authenticated)
   * @returns {Promise<{ success, data: Array }>}
   */
  getBlocked: () =>
    authFetchAPI('/friends/get-blocked.php'),
};

/**
 * Chat API (conversations + messages). Uses learner_phone as user id (numeric).
 */
const CHAT_MAJOR = 'english';
export const chatAPI = {
  getConversations: (userId, major = CHAT_MAJOR) =>
    fetchAPI(`/chat/conversations.php?user_id=${encodeURIComponent(userId)}&major=${major}`),

  getConversation: (conversationId, userId, major = CHAT_MAJOR) =>
    fetchAPI(`/chat/conversations.php?id=${conversationId}&user_id=${encodeURIComponent(userId)}&major=${major}`),

  createConversation: (user1Id, user2Id, major = CHAT_MAJOR) =>
    postFormAPI('/chat/conversations.php', { user1_id: Number(user1Id), user2_id: Number(user2Id), major }),

  getMessages: (conversationId, major = CHAT_MAJOR, params = {}) => {
    const search = new URLSearchParams({ conversation_id: conversationId, major });
    if (params.limit != null) search.set('limit', String(params.limit));
    if (params.before_id != null) search.set('before_id', String(params.before_id));
    if (params.after_id != null) search.set('after_id', String(params.after_id));
    return fetchAPI(`/chat/messages.php?${search.toString()}`);
  },

  sendMessage: (conversationId, senderId, major = CHAT_MAJOR, payload = {}) =>
    postFormAPI('/chat/messages.php', {
      conversation_id: Number(conversationId),
      sender_id: Number(senderId),
      major,
      message_type: payload.message_type || 'text',
      message_text: payload.message_text || '',
      file_path: payload.file_path || '',
      file_size: payload.file_size || '',
    }),

  deleteConversation: (conversationId, major = CHAT_MAJOR) =>
    deleteAPI(`/chat/conversations.php?id=${conversationId}&major=${major}`),

  markRead: (conversationId, userId, major = CHAT_MAJOR) =>
    postFormAPI('/chat/mark-read.php', { conversation_id: Number(conversationId), user_id: Number(userId), major }),

  uploadImage: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    return postFormDataAPI('/chat/upload-image.php', formData);
  },
};

/**
 * User Profile API endpoints
 */
/**
 * POST fetch wrapper with FormData (for file uploads)
 */
const postFormDataAPI = async (endpoint, formData) => {
  try {
    const token = getToken();
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    if (error.message !== 'Not authenticated') {
      console.error(`API Error (${endpoint}):`, error);
    }
    throw error;
  }
};

export const userAPI = {
  /**
   * Get public profile + posts for any user
   * @param {string} userId - User phone (learner_phone)
   * @param {number} page - Page number for posts pagination
   */
  getProfile: (userId, page = 1, viewerId = null, tab = 'posts') => {
    let params = `id=${userId}&page=${page}&tab=${tab}`;
    if (viewerId) params += `&viewerId=${viewerId}`;
    return fetchAPI(`/users/profile.php?${params}`);
  },
  /**
   * Get current authenticated user's enrolled courses and progress
   */
  getMyLearning: () => authFetchAPI('/users/my-learning.php'),
  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @param {File} profileData.profileImage - Profile image file (optional)
   * @param {File} profileData.coverImage - Cover image file (optional)
   * @param {string} profileData.name - User name (required)
   * @param {string} profileData.bio - Bio text (optional)
   * @param {string} profileData.work - Work (optional)
   * @param {string} profileData.education - Education (optional)
   * @param {string} profileData.region - Region (optional)
   */
  updateProfile: (profileData) => {
    const formData = new FormData();
    
    if (profileData.name) formData.append('name', profileData.name);
    if (profileData.bio !== undefined) formData.append('bio', profileData.bio || '');
    if (profileData.work !== undefined) formData.append('work', profileData.work || '');
    if (profileData.education !== undefined) formData.append('education', profileData.education || '');
    if (profileData.region !== undefined) formData.append('region', profileData.region || '');
    
    if (profileData.profileImage) {
      formData.append('profileImage', profileData.profileImage);
    }
    if (profileData.coverImage) {
      formData.append('coverImage', profileData.coverImage);
    }

    return postFormDataAPI('/users/update.php', formData);
  },
  /**
   * Change user password
   * @param {Object} data - { currentPassword, newPassword }
   */
  changePassword: (data) => postAPI('/users/change-password.php', data),
  /**
   * Delete user account
   * @param {string} password - User password for confirmation
   */
  deleteAccount: (password) => postAPI('/users/delete-account.php', { password }),
};

/**
 * Notification API endpoints
 */
export const notificationAPI = {
  /**
   * Get notifications for authenticated user
   * @param {Object} [params] - optional: { major, limit } (e.g. { major: 'english', limit: 150 })
   */
  get: (params) => {
    const qs = params && Object.keys(params).length ? '?' + new URLSearchParams(params).toString() : '';
    return authFetchAPI('/notifications/get.php' + qs);
  },

  /**
   * Mark all notifications as read
   */
  markRead: () => postAPI('/notifications/mark-read.php'),

  /**
   * Mark a single notification as seen (on click)
   * @param {number} notificationId - notification id from get()
   */
  markOneRead: (notificationId) =>
    postAPI('/notifications/mark-one-read.php', { notificationId }),
};

/**
 * Auth API endpoints
 */
export const authAPI = {
  /**
   * Login with phone or email + password
   */
  login: (phone, password) => postAPI('/auth/login.php', { phone, password }),

  /**
   * Register a new account
   */
  register: (data) => postAPI('/auth/register.php', data),

  /**
   * Get current authenticated user (validates token)
   */
  me: () => authFetchAPI('/auth/me.php'),

  /**
   * Logout (invalidate token)
   */
  logout: () => postAPI('/auth/logout.php'),
};

export default {
  course: courseAPI,
  instructor: instructorAPI,
  videoChannel: videoChannelAPI,
  song: songAPI,
  discussion: discussionAPI,
  additionalLessons: additionalLessonsAPI,
  stats: statsAPI,
  pinnedPosts: pinnedPostsAPI,
  vipPlan: vipPlanAPI,
  apps: appsAPI,
  user: userAPI,
  friends: friendsAPI,
  notification: notificationAPI,
  auth: authAPI,
  languages: languagesAPI,
  vocabLearning: vocabLearningAPI,
};
