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
    
    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`);
      error.status = response.status;
      throw error;
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'API request failed');
    }
    
    return data;
  } catch (error) {
    // Don't log 404 errors as they're expected for missing resources
    // Also check if error.message contains 404 in case status isn't set
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
   */
  get: (category = 'english', page = 1) => fetchAPI(`/songs/get.php?category=${category}&page=${page}`),
  
  /**
   * Get lyrics for a song
   * @param {string} url - Song URL identifier
   */
  getLyrics: (url) => fetchAPI(`/songs/lyrics.php?url=${url}`),
  
  /**
   * Get songs by artist
   * @param {string} category - Category (english/korea)
   * @param {string} artist - Artist name
   */
  getByArtist: (category, artist) => fetchAPI(`/songs/by-artist.php?category=${category}&artist=${encodeURIComponent(artist)}`),
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
   * Get friend list for a user (public)
   * @param {string} userId - learner_phone
   * @param {string} major
   */
  getFriends: (userId, major = 'english') =>
    fetchAPI(`/friends/get-friends.php?userId=${encodeURIComponent(userId)}&major=${major}`),

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
