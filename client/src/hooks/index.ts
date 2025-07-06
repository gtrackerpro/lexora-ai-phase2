// Export all custom hooks from a central location
export { useTopics } from './useTopics';
export { useProgressAnalytics, useUserProgress } from './useProgress';
// Temporarily comment out hooks that depend on endpoints not yet implemented
// export { useUserActivity, useUserStreak, useUserSummary } from './useActivity';
export { default as useDebounce } from './useDebounce';
export { default as useIntersectionObserver } from './useIntersectionObserver';
export { default as useLocalStorage } from './useLocalStorage';