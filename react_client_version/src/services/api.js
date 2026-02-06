/**
 * API Service for Calamus Education
 * Handles all API calls to the PHP backend
 */

const API_BASE_URL = 'http://localhost/calamus/api';

/**
 * Generic fetch wrapper with error handling
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
};

export default {
  course: courseAPI,
  instructor: instructorAPI,
  videoChannel: videoChannelAPI,
};
