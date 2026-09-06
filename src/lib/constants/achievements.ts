export type AchievementType = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
export type AchievementMetric = 'xp' | 'streak_days' | 'exams_taken' | 'perfect_exams' | 'subjects_completed' | 'fast_reading' | 'referrals' | 'leaderboard_rank' | 'night_owl' | 'early_bird' | 'mistakes_corrected' | 'study_hours' | 'proficiency';

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  target: number;
  metric: AchievementMetric;
  icon: string;
  type: AchievementType;
  rewardXP: number; // Bonus XP rewarded when unlocked
}

export const ACHIEVEMENTS: Achievement[] = [
  // XP Milestones
  { id: 'NOVICE_EXPLORER', title: 'Novice Explorer', desc: 'Earn your first 100 XP points.', target: 100, metric: 'xp', icon: '🐣', type: 'COMMON', rewardXP: 50 },
  { id: 'CURIOUS_LEARNER', title: 'Curious Learner', desc: 'Reach 500 XP points.', target: 500, metric: 'xp', icon: '🎒', type: 'COMMON', rewardXP: 100 },
  { id: 'RISING_STAR', title: 'Rising Star', desc: 'Achieve the 1,000 XP milestone.', target: 1000, metric: 'xp', icon: '🌟', type: 'RARE', rewardXP: 200 },
  { id: 'ULTIMATE_CHAMPION', title: 'Ultimate Champion', desc: 'Earn a total of 100,000 XP points.', target: 100000, metric: 'xp', icon: '💎', type: 'LEGENDARY', rewardXP: 5000 },
  
  // Streaks & Consistency
  { id: 'KNOWLEDGE_SEEKER', title: 'Knowledge Seeker', desc: 'Maintain a 7-day study streak.', target: 7, metric: 'streak_days', icon: '🔥', type: 'COMMON', rewardXP: 100 },
  { id: 'CONSISTENT_STUDENT', title: 'Consistent Student', desc: 'Maintain a 30-day study streak.', target: 30, metric: 'streak_days', icon: '📅', type: 'RARE', rewardXP: 500 },
  { id: 'DAILY_GRIND', title: 'Daily Grind', desc: 'Study for 365 consecutive days.', target: 365, metric: 'streak_days', icon: '🗓️', type: 'LEGENDARY', rewardXP: 5000 },
  
  // Exams
  { id: 'EXAM_MASTER', title: 'Exam Master', desc: 'Participate in 50 exams.', target: 50, metric: 'exams_taken', icon: '📝', type: 'EPIC', rewardXP: 800 },
  { id: 'FLAWLESS_VICTORY', title: 'Flawless Victory', desc: 'Score 100% on a mock exam.', target: 1, metric: 'perfect_exams', icon: '🏆', type: 'EPIC', rewardXP: 500 },
  
  // Subject & Content
  { id: 'SUBJECT_SPECIALIST', title: 'Subject Specialist', desc: 'Complete all content for any 1 subject.', target: 1, metric: 'subjects_completed', icon: '📚', type: 'RARE', rewardXP: 300 },
  { id: 'SUBJECT_MATTER_EXPERT', title: 'Subject Matter Expert', desc: 'Achieve 100% proficiency in 5 subjects.', target: 5, metric: 'proficiency', icon: '🧠', type: 'LEGENDARY', rewardXP: 2000 },
  { id: 'SPEED_READER', title: 'Speed Reader', desc: 'Finish reading 1 content module under 1 minute.', target: 1, metric: 'fast_reading', icon: '⏱️', type: 'COMMON', rewardXP: 50 },
  
  // Social & Community
  { id: 'SOCIAL_BUTTERFLY', title: 'Social Butterfly', desc: 'Successfully refer 10 friends to the platform.', target: 10, metric: 'referrals', icon: '👥', type: 'EPIC', rewardXP: 1000 },
  { id: 'TOP_OF_THE_CLASS', title: 'Top of the Class', desc: 'Rank 1st in the weekly leaderboard.', target: 1, metric: 'leaderboard_rank', icon: '👑', type: 'LEGENDARY', rewardXP: 3000 },
  
  // Timing & Effort
  { id: 'NIGHT_OWL', title: 'Night Owl', desc: 'Take a mock exam after 12:00 AM.', target: 1, metric: 'night_owl', icon: '🦉', type: 'COMMON', rewardXP: 50 },
  { id: 'EARLY_BIRD', title: 'Early Bird', desc: 'Take a mock exam at 5:00 AM.', target: 1, metric: 'early_bird', icon: '🌅', type: 'RARE', rewardXP: 100 },
  { id: 'MARATHON_RUNNER', title: 'Marathon Runner', desc: 'Study for 3 continuous hours in one session.', target: 180, metric: 'study_hours', icon: '🏃', type: 'EPIC', rewardXP: 500 },
  
  // Practice
  { id: 'MISTAKE_CORRECTOR', title: 'Mistake Corrector', desc: 'Correctly answer 10 questions from your Mistake Vault.', target: 10, metric: 'mistakes_corrected', icon: '🔧', type: 'COMMON', rewardXP: 150 },
];
