import { Topic, TopicDetailResponse } from '@/app/store/slices/learningSlice';

// Base API URL
const API_BASE_URL = 'https://finlearn.onrender.com';

// API service object
const ApiService = {
  /**
   * Fetch topics with optional filtering
   * @param userId User ID for personalization
   * @param category Optional category filter
   * @param level Optional expertise level filter
   * @returns Promise with topics data
   */
  async fetchTopics(
    userId: string = 'bhavya', 
    category: string = 'crypto', 
    level: string = 'beginner'
  ): Promise<Topic> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/dailytopics?user_id=${userId}&category=${category}&level=${level}`
      );
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching topics:', error);
      throw error;
    }
  },
  
  /**
   * Fetch detailed information about a specific topic
   * @param topicId Topic ID to fetch details for
   * @returns Promise with topic detail data
   */
  async fetchTopicDetail(topicId: string): Promise<TopicDetailResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/topic/${topicId}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching topic detail:', error);
      throw error;
    }
  },
  
  /**
   * Bookmark a topic for a user
   * @param userId User ID
   * @param topicId Topic ID to bookmark
   * @returns Promise with success status
   */
  async bookmarkTopic(userId: string, topicId: string): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${API_BASE_URL}/bookmark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId, topic_id: topicId }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error bookmarking topic:', error);
      throw error;
    }
  },
  
  /**
   * Mark a topic as read for a user
   * @param userId User ID
   * @param topicId Topic ID to mark as read
   * @returns Promise with success status
   */
  async markTopicAsRead(userId: string, topicId: string): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${API_BASE_URL}/mark-read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId, topic_id: topicId }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error marking topic as read:', error);
      throw error;
    }
  },
  
  /**
   * Get user's bookmarked topics
   * @param userId User ID
   * @returns Promise with array of bookmarked topic IDs
   */
  async getBookmarkedTopics(userId: string): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/bookmarks?user_id=${userId}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.bookmarked_topics || [];
    } catch (error) {
      console.error('Error fetching bookmarked topics:', error);
      throw error;
    }
  },
  
  /**
   * Get user's read topics
   * @param userId User ID
   * @returns Promise with array of read topic IDs
   */
  async getReadTopics(userId: string): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/read-topics?user_id=${userId}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.read_topics || [];
    } catch (error) {
      console.error('Error fetching read topics:', error);
      throw error;
    }
  }
};

export default ApiService;