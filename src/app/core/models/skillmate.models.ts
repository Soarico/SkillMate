export type SkillLevel = 'beginner' | 'middle' | 'advanced';

export interface Skill {
  id: string;
  name: string;
  category: string;
  level: SkillLevel;
  description: string;
}

export interface LearningProgress {
  skill: string;
  completedLessons: number;
  totalLessons: number;
  nextMilestone: string;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  city: string;
  avatarUrl: string;
  about: string;
  teachSkills: Skill[];
  learnSkills: Skill[];
  interests: string[];
  progress: LearningProgress[];
  rating: number;
  reviewCount: number;
}

export interface UserRecord extends UserProfile {
  password: string;
}

export interface AuthSession {
  token: string;
  user: UserProfile;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export type ExchangeOfferStatus = 'pending' | 'accepted' | 'declined';

export interface ExchangeOffer {
  id?: number;
  fromUserId: number;
  toUserId: number;
  teachSkill: string;
  learnSkill: string;
  message: string;
  status: ExchangeOfferStatus;
  createdAt: string;
}

export type LearningSessionStatus = 'planned' | 'done' | 'cancelled';

export interface LearningSession {
  id?: number;
  hostId: number;
  partnerId: number;
  topic: string;
  startsAt: string;
  durationMinutes: number;
  status: LearningSessionStatus;
  notes: string;
}

export interface Review {
  id?: number;
  authorId: number;
  partnerId: number;
  rating: number;
  text: string;
  createdAt: string;
}

export interface StudyMaterial {
  id?: number;
  title: string;
  url: string;
  type: 'article' | 'video' | 'exercise';
  authorId: number;
  createdAt: string;
}

export interface SkillGroup {
  id?: number;
  title: string;
  description: string;
  interest: string;
  ownerId: number;
  memberIds: number[];
  materials: StudyMaterial[];
}

export interface PartnerMatch extends UserProfile {
  compatibility: number;
  matchedTeachSkills: string[];
  matchedLearnSkills: string[];
}

export interface ProfileUpdateForm {
  name: string;
  city: string;
  about: string;
  teachSkills: string;
  learnSkills: string;
  interests: string;
}
