import {
  calculateCompatibility,
  calculateProgressPercent,
  splitList,
  toSkill,
} from './compatibility.util';
import { UserProfile } from '../../core/models/skillmate.models';

const currentUser: UserProfile = {
  id: 1,
  name: 'Current',
  email: 'current@test.dev',
  city: 'Moscow',
  avatarUrl: '',
  about: 'Student',
  teachSkills: [toSkill('TypeScript', 0, 'Frontend')],
  learnSkills: [toSkill('Figma', 0, 'Design')],
  interests: ['frontend', 'design'],
  progress: [],
  rating: 4.8,
  reviewCount: 5,
};

const candidate: UserProfile = {
  id: 2,
  name: 'Candidate',
  email: 'candidate@test.dev',
  city: 'Kazan',
  avatarUrl: '',
  about: 'Designer',
  teachSkills: [toSkill('Figma', 0, 'Design')],
  learnSkills: [toSkill('TypeScript', 0, 'Frontend')],
  interests: ['design'],
  progress: [],
  rating: 5,
  reviewCount: 10,
};

describe('compatibility utils', () => {
  it('splits comma separated values and removes empty items', () => {
    expect(splitList('Figma, TypeScript, , English')).toEqual(['Figma', 'TypeScript', 'English']);
  });

  it('creates a normalized skill id', () => {
    expect(toSkill('Public Speaking', 2, 'Soft skills')).toEqual({
      id: 'public-speaking-2',
      name: 'Public Speaking',
      category: 'Soft skills',
      level: 'beginner',
      description: 'Хочу развивать навык: Public Speaking',
    });
  });

  it('calculates progress percent', () => {
    expect(calculateProgressPercent(3, 6)).toBe(50);
  });

  it('returns zero progress for invalid totals', () => {
    expect(calculateProgressPercent(3, 0)).toBe(0);
  });

  it('calculates compatibility from mutual skills and interests', () => {
    const match = calculateCompatibility(currentUser, candidate);

    expect(match.compatibility).toBeGreaterThanOrEqual(80);
    expect(match.matchedTeachSkills).toContain('Figma');
    expect(match.matchedLearnSkills).toContain('TypeScript');
  });

  it('does not match current user with themself', () => {
    expect(calculateCompatibility(currentUser, currentUser).compatibility).toBe(0);
  });
});
