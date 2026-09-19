export const CACHE_SETTINGS = {
  /**
   * Cache duration in seconds for assessment pages (Practice Sets, Quizzes, Mock Tests).
   * 3600 = 1 hour
   * 86400 = 1 day
   * 2592000 = 30 days
   * 0 = Disable caching
   */
  ASSESSMENT_DETAIL_PAGE: 2592000,
  
  /**
   * Cache duration in seconds for the "Take Test" pages.
   */
  ASSESSMENT_TAKE_PAGE: 2592000,
};
