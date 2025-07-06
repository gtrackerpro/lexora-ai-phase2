// Analytics utility for tracking user interactions and learning progress

interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  userId?: string;
  properties?: Record<string, any>;
}

class Analytics {
  private isEnabled: boolean;
  private userId: string | null = null;

  constructor() {
    this.isEnabled = process.env.NODE_ENV === 'production';
  }

  // Initialize analytics with user ID
  init(userId: string) {
    this.userId = userId;
    
    if (this.isEnabled) {
      // Initialize your analytics service here
      // Example: Google Analytics, Mixpanel, Amplitude, etc.
      console.log('Analytics initialized for user:', userId);
    }
  }

  // Track generic events
  track(event: AnalyticsEvent) {
    if (!this.isEnabled) {
      console.log('Analytics Event:', event);
      return;
    }

    // Send to your analytics service
    // Example implementations:
    
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
      gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        user_id: this.userId,
        ...event.properties
      });
    }

    // Custom analytics endpoint
    this.sendToCustomEndpoint(event);
  }

  // Learning-specific tracking methods
  trackLessonStarted(lessonId: string, lessonTitle: string, topicId: string) {
    this.track({
      event: 'lesson_started',
      category: 'Learning',
      action: 'start_lesson',
      label: lessonTitle,
      properties: {
        lesson_id: lessonId,
        topic_id: topicId,
        timestamp: new Date().toISOString()
      }
    });
  }

  trackLessonCompleted(lessonId: string, lessonTitle: string, watchTime: number, completionRate: number) {
    this.track({
      event: 'lesson_completed',
      category: 'Learning',
      action: 'complete_lesson',
      label: lessonTitle,
      value: Math.round(completionRate),
      properties: {
        lesson_id: lessonId,
        watch_time_seconds: watchTime,
        completion_rate: completionRate,
        timestamp: new Date().toISOString()
      }
    });
  }

  trackVideoProgress(lessonId: string, progress: number, duration: number) {
    // Only track at 25%, 50%, 75%, 100% to avoid spam
    const milestones = [25, 50, 75, 100];
    const currentMilestone = milestones.find(m => 
      progress >= m && progress < m + 5 // 5% tolerance
    );

    if (currentMilestone) {
      this.track({
        event: 'video_progress',
        category: 'Learning',
        action: `video_${currentMilestone}%`,
        label: lessonId,
        value: currentMilestone,
        properties: {
          lesson_id: lessonId,
          progress_percent: progress,
          duration_seconds: duration,
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  trackTopicCreated(topicId: string, topicTitle: string, difficulty: string, weeks: number) {
    this.track({
      event: 'topic_created',
      category: 'Content',
      action: 'create_topic',
      label: topicTitle,
      properties: {
        topic_id: topicId,
        difficulty,
        weeks,
        timestamp: new Date().toISOString()
      }
    });
  }

  trackLearningPathStarted(pathId: string, pathTitle: string, topicId: string) {
    this.track({
      event: 'learning_path_started',
      category: 'Learning',
      action: 'start_path',
      label: pathTitle,
      properties: {
        path_id: pathId,
        topic_id: topicId,
        timestamp: new Date().toISOString()
      }
    });
  }

  trackStreakAchievement(streakDays: number) {
    this.track({
      event: 'streak_achievement',
      category: 'Engagement',
      action: 'streak_milestone',
      label: `${streakDays}_days`,
      value: streakDays,
      properties: {
        streak_days: streakDays,
        timestamp: new Date().toISOString()
      }
    });
  }

  trackSearchQuery(query: string, resultsCount: number) {
    this.track({
      event: 'search',
      category: 'Discovery',
      action: 'search_query',
      label: query,
      value: resultsCount,
      properties: {
        query,
        results_count: resultsCount,
        timestamp: new Date().toISOString()
      }
    });
  }

  trackFeatureUsage(feature: string, action: string, context?: string) {
    this.track({
      event: 'feature_usage',
      category: 'Product',
      action: `${feature}_${action}`,
      label: context,
      properties: {
        feature,
        action,
        context,
        timestamp: new Date().toISOString()
      }
    });
  }

  trackError(error: string, context: string, severity: 'low' | 'medium' | 'high' = 'medium') {
    this.track({
      event: 'error',
      category: 'Technical',
      action: 'error_occurred',
      label: error,
      properties: {
        error_message: error,
        context,
        severity,
        user_agent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString()
      }
    });
  }

  trackPerformance(metric: string, value: number, context?: string) {
    this.track({
      event: 'performance',
      category: 'Technical',
      action: `performance_${metric}`,
      label: context,
      value: Math.round(value),
      properties: {
        metric,
        value,
        context,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Send events to custom analytics endpoint
  private async sendToCustomEndpoint(event: AnalyticsEvent) {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('lexora_token')}`
        },
        body: JSON.stringify({
          ...event,
          userId: this.userId,
          timestamp: new Date().toISOString(),
          session_id: this.getSessionId(),
          page_url: window.location.href,
          referrer: document.referrer,
          user_agent: navigator.userAgent
        })
      });
    } catch (error) {
      console.error('Failed to send analytics event:', error);
    }
  }

  // Get or create session ID
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  // Page view tracking
  trackPageView(path: string, title?: string) {
    this.track({
      event: 'page_view',
      category: 'Navigation',
      action: 'page_view',
      label: path,
      properties: {
        page_path: path,
        page_title: title || document.title,
        timestamp: new Date().toISOString()
      }
    });
  }

  // User engagement tracking
  trackEngagement(action: string, element: string, value?: number) {
    this.track({
      event: 'engagement',
      category: 'User Interaction',
      action,
      label: element,
      value,
      properties: {
        element,
        timestamp: new Date().toISOString()
      }
    });
  }
}

// Export singleton instance
export const analytics = new Analytics();

// React hook for analytics
export function useAnalytics() {
  return {
    track: analytics.track.bind(analytics),
    trackLessonStarted: analytics.trackLessonStarted.bind(analytics),
    trackLessonCompleted: analytics.trackLessonCompleted.bind(analytics),
    trackVideoProgress: analytics.trackVideoProgress.bind(analytics),
    trackTopicCreated: analytics.trackTopicCreated.bind(analytics),
    trackLearningPathStarted: analytics.trackLearningPathStarted.bind(analytics),
    trackStreakAchievement: analytics.trackStreakAchievement.bind(analytics),
    trackSearchQuery: analytics.trackSearchQuery.bind(analytics),
    trackFeatureUsage: analytics.trackFeatureUsage.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    trackPerformance: analytics.trackPerformance.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackEngagement: analytics.trackEngagement.bind(analytics)
  };
}

export default analytics;