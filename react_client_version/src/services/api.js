/**
 * API Service for Calamus Education
 * Handles all API calls to the PHP backend
 */

const API_BASE_URL = 'http://localhost/calamus/api';

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
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
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
   */
  getDetail: (id) => fetchAPI(`/courses/detail.php?id=${id}`),
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
   * Create a comment or reply
   * @param {object} data - { postId, body, parent? }
   */
  createComment: (data) => postAPI('/discussions/comment-create.php', data),
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
 * Apps API endpoints
 */
export const appsAPI = {
  /**
   * Get active apps (with active_course > 0)
   */
  get: () => fetchAPI('/apps/get.php'),
};

/**
 * User Profile API endpoints
 */
export const userAPI = {
  /**
   * Get public profile + posts for any user
   * @param {string} userId - User phone (learner_phone)
   * @param {number} page - Page number for posts pagination
   */
  getProfile: (userId, page = 1, viewerId = null) => {
    let params = `id=${userId}&page=${page}`;
    if (viewerId) params += `&viewerId=${viewerId}`;
    return fetchAPI(`/users/profile.php?${params}`);
  },
};

/**
 * Notification API endpoints
 */
export const notificationAPI = {
  /**
   * Get notifications for authenticated user
   */
  get: () => authFetchAPI('/notifications/get.php'),

  /**
   * Mark all notifications as read
   */
  markRead: () => postAPI('/notifications/mark-read.php'),
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
  notification: notificationAPI,
  auth: authAPI,
};
