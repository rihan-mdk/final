import { describe, it, expect } from 'vitest';
import questions from '../data/questions.json';

describe('Question Bank Integrity (Authoritative Specification)', () => {
  it('contains exactly 40 questions', () => {
    expect(questions).toHaveLength(40);
  });

  it('contains exactly 10 questions per level across 4 levels', () => {
    const level1 = questions.filter(q => q.level === 1);
    const level2 = questions.filter(q => q.level === 2);
    const level3 = questions.filter(q => q.level === 3);
    const level4 = questions.filter(q => q.level === 4);
    const level5 = questions.filter(q => q.level === 5);

    expect(level1).toHaveLength(10);
    expect(level2).toHaveLength(10);
    expect(level3).toHaveLength(10);
    expect(level4).toHaveLength(10);
    expect(level5).toHaveLength(0); // Level 5 must NEVER be included
  });

  it('has strictly unique question IDs from 1 to 40', () => {
    const ids = questions.map(q => q.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(40);

    for (let i = 1; i <= 40; i++) {
      expect(uniqueIds.has(i)).toBe(true);
    }
  });

  it('verifies Q31 and Q38 are designated as physical checkpoints', () => {
    const q31 = questions.find(q => q.id === 31);
    const q38 = questions.find(q => q.id === 38);

    expect(q31).toBeDefined();
    expect(q31?.isPhysicalCheckpoint).toBe(true);
    expect(q31?.type).toBe('checkpoint');

    expect(q38).toBeDefined();
    expect(q38?.isPhysicalCheckpoint).toBe(true);
    expect(q38?.type).toBe('checkpoint');
  });

  it('has non-empty title, question prompt, and accepted answers for every question', () => {
    questions.forEach(q => {
      expect(q.title.trim().length).toBeGreaterThan(0);
      expect(q.question.trim().length).toBeGreaterThan(0);
      expect(q.acceptedAnswers.length).toBeGreaterThan(0);
      q.acceptedAnswers.forEach(ans => {
        expect(ans.trim().length).toBeGreaterThan(0);
      });
    });
  });
});
