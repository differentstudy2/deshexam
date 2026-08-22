import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

/**
 * Valid event types for question analytics
 */
export type QuestionEventType = 
  | 'question_view'
  | 'answer_reveal'
  | 'like'
  | 'save'
  | 'share'
  | 'premium_click'
  | 'filter_usage'
  | 'search_query';

/**
 * Metadata associated with an event
 */
export interface AnalyticsMetadata {
  subject?: string;
  board?: string;
  exam?: string;
  query?: string;
  filterType?: string;
  filterValue?: string;
  [key: string]: any;
}

/**
 * Track business events in Firestore
 * @param eventType Type of the event being tracked
 * @param questionId Optional question ID (if applicable)
 * @param userId Optional user ID (if authenticated)
 * @param metadata Additional contextual metadata
 */
export async function trackQuestionEvent(
  eventType: QuestionEventType,
  questionId?: string,
  userId?: string,
  metadata?: AnalyticsMetadata
) {
  try {
    const cleanMetadata = metadata ? Object.fromEntries(
      Object.entries(metadata).filter(([_, v]) => v !== undefined)
    ) : {};

    const eventPayload = {
      eventType,
      questionId: questionId || null,
      userId: userId || null,
      metadata: cleanMetadata,
      timestamp: serverTimestamp(),
      url: typeof window !== 'undefined' ? window.location.href : null,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : null,
    };

    // Log to Firestore analytics_events collection
    await addDoc(collection(db, 'analytics_events'), eventPayload);
    
    // In a real app with Firebase Analytics configured, we would also:
    // import { getAnalytics, logEvent } from 'firebase/analytics';
    // const analytics = getAnalytics();
    // logEvent(analytics, eventType, eventPayload);
  } catch (error) {
    console.error('Failed to track question event:', error);
  }
}
