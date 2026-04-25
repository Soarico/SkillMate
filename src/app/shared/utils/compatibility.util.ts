import { PartnerMatch, Skill, UserProfile } from '../../core/models/skillmate.models';

const normalize = (value: string): string => value.trim().toLowerCase();

const skillNames = (skills: Skill[]): string[] => skills.map((skill) => normalize(skill.name));

export const splitList = (value: string): string[] =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

export const toSkill = (name: string, index: number, category = 'General'): Skill => ({
  id: `${normalize(name).replace(/\s+/g, '-')}-${index}`,
  name,
  category,
  level: 'beginner',
  description: `Хочу развивать навык: ${name}`,
});

export const calculateProgressPercent = (completedLessons: number, totalLessons: number): number => {
  if (totalLessons <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((completedLessons / totalLessons) * 100));
};

export const calculateCompatibility = (
  currentUser: UserProfile | null,
  candidate: UserProfile,
): PartnerMatch => {
  if (!currentUser || currentUser.id === candidate.id) {
    return {
      ...candidate,
      compatibility: 0,
      matchedTeachSkills: [],
      matchedLearnSkills: [],
    };
  }

  const wantedByCurrent = skillNames(currentUser.learnSkills);
  const offeredByCurrent = skillNames(currentUser.teachSkills);
  const candidateTeaches = candidate.teachSkills.filter((skill) =>
    wantedByCurrent.includes(normalize(skill.name)),
  );
  const candidateWants = candidate.learnSkills.filter((skill) =>
    offeredByCurrent.includes(normalize(skill.name)),
  );
  const sharedInterests = candidate.interests.filter((interest) =>
    currentUser.interests.map(normalize).includes(normalize(interest)),
  );
  const ratingBonus = Math.round(candidate.rating * 2);
  const compatibility = Math.min(
    100,
    candidateTeaches.length * 35 + candidateWants.length * 30 + sharedInterests.length * 8 + ratingBonus,
  );

  return {
    ...candidate,
    compatibility,
    matchedTeachSkills: candidateTeaches.map((skill) => skill.name),
    matchedLearnSkills: candidateWants.map((skill) => skill.name),
  };
};
