import { describe, it, expect } from 'vitest';
import questions from '../data/questions.json';
import { validateAnswer } from '../lib/validation/answerValidator';
import { Question } from '../types';

describe('Answer Verification Engine', () => {
  const getQ = (id: number): Question => questions.find(q => q.id === id) as Question;

  describe('Text Normalization & Basic Answers', () => {
    it('handles Q1 (Book) with varying case and whitespace', () => {
      const q1 = getQ(1);
      expect(validateAnswer(q1, 'book').isValid).toBe(true);
      expect(validateAnswer(q1, '  BOOK   ').isValid).toBe(true);
      expect(validateAnswer(q1, 'A  Book').isValid).toBe(true);
      expect(validateAnswer(q1, 'notebook').isValid).toBe(false); // Substring should not match
    });

    it('rejects blank or whitespace-only submissions', () => {
      const q1 = getQ(1);
      const res = validateAnswer(q1, '   ');
      expect(res.isValid).toBe(false);
      expect(res.feedbackMessage).toContain('enter an answer');
    });

    it('handles Q14 (SILENT) and Q20 (LEVEL)', () => {
      const q14 = getQ(14);
      expect(validateAnswer(q14, 'silent').isValid).toBe(true);
      expect(validateAnswer(q14, 'SILENT').isValid).toBe(true);
      expect(validateAnswer(q14, 'silence').isValid).toBe(false);

      const q20 = getQ(20);
      expect(validateAnswer(q20, 'level').isValid).toBe(true);
      expect(validateAnswer(q20, 'LEVEL').isValid).toBe(true);
    });
  });

  describe('Numeric & Floating Point Answers', () => {
    it('handles Q3 (7.5 degrees) correctly', () => {
      const q3 = getQ(3);
      expect(validateAnswer(q3, '7.5').isValid).toBe(true);
      expect(validateAnswer(q3, '7.5 degrees').isValid).toBe(true);
      expect(validateAnswer(q3, '7.5 deg').isValid).toBe(true);
      expect(validateAnswer(q3, '7.5°').isValid).toBe(true);
      expect(validateAnswer(q3, '7.0').isValid).toBe(false);
      expect(validateAnswer(q3, '0').isValid).toBe(false);
    });

    it('handles Q8 (8 hours)', () => {
      const q8 = getQ(8);
      expect(validateAnswer(q8, '8').isValid).toBe(true);
      expect(validateAnswer(q8, '8 hours').isValid).toBe(true);
      expect(validateAnswer(q8, '9').isValid).toBe(false);
    });

    it('handles Q12 (10), Q13 (42), Q17 (27), Q23 (47), Q26 (14), Q30 (13)', () => {
      expect(validateAnswer(getQ(12), '10').isValid).toBe(true);
      expect(validateAnswer(getQ(13), '42').isValid).toBe(true);
      expect(validateAnswer(getQ(17), '27').isValid).toBe(true);
      expect(validateAnswer(getQ(23), '47').isValid).toBe(true);
      expect(validateAnswer(getQ(26), '14').isValid).toBe(true);
      expect(validateAnswer(getQ(30), '13').isValid).toBe(true);
    });

    it('handles Q32 (₹90), Q33 (26m), Q35 (12m), Q39 (14)', () => {
      expect(validateAnswer(getQ(32), '90').isValid).toBe(true);
      expect(validateAnswer(getQ(32), '90 rupees').isValid).toBe(true);
      expect(validateAnswer(getQ(33), '26').isValid).toBe(true);
      expect(validateAnswer(getQ(35), '12').isValid).toBe(true);
      expect(validateAnswer(getQ(39), '14').isValid).toBe(true);
    });
  });

  describe('Coordinate Formats (Q22)', () => {
    it('validates coordinate pair (6,1) with formatting tolerance', () => {
      const q22 = getQ(22);
      expect(validateAnswer(q22, '(6,1)').isValid).toBe(true);
      expect(validateAnswer(q22, '(6, 1)').isValid).toBe(true);
      expect(validateAnswer(q22, ' ( 6 , 1 ) ').isValid).toBe(true);
      expect(validateAnswer(q22, '6,1').isValid).toBe(true);
      expect(validateAnswer(q22, '(1,6)').isValid).toBe(false);
      expect(validateAnswer(q22, '(6,2)').isValid).toBe(false);
    });
  });

  describe('Sequence Formats (Q25)', () => {
    it('validates comma-separated sequence 3,5,1,8', () => {
      const q25 = getQ(25);
      expect(validateAnswer(q25, '3,5,1,8').isValid).toBe(true);
      expect(validateAnswer(q25, '3, 5, 1, 8').isValid).toBe(true);
      expect(validateAnswer(q25, '[3, 5, 1, 8]').isValid).toBe(true);
      expect(validateAnswer(q25, '1,3,5,8').isValid).toBe(false); // Fully sorted array is incorrect for one pass!
    });
  });

  describe('Probability Formats (Q27)', () => {
    it('validates fraction and decimal representations of 1/4', () => {
      const q27 = getQ(27);
      expect(validateAnswer(q27, '1/4').isValid).toBe(true);
      expect(validateAnswer(q27, '1 / 4').isValid).toBe(true);
      expect(validateAnswer(q27, '0.25').isValid).toBe(true);
      expect(validateAnswer(q27, '25%').isValid).toBe(true);
      expect(validateAnswer(q27, '1/2').isValid).toBe(false);
      expect(validateAnswer(q27, '0.5').isValid).toBe(false);
    });
  });

  describe('Binary Formats (Q37 & Q38)', () => {
    it('validates Q37 (1000)', () => {
      const q37 = getQ(37);
      expect(validateAnswer(q37, '1000').isValid).toBe(true);
      expect(validateAnswer(q37, '0b1000').isValid).toBe(true);
      expect(validateAnswer(q37, '1001').isValid).toBe(false);
    });

    it('validates Q38 (10110)', () => {
      const q38 = getQ(38);
      expect(validateAnswer(q38, '10110').isValid).toBe(true);
      expect(validateAnswer(q38, '10111').isValid).toBe(false);
    });
  });

  describe('Physical Checkpoint Q31 (TREASURE)', () => {
    it('validates digital answer TREASURE', () => {
      const q31 = getQ(31);
      expect(validateAnswer(q31, 'TREASURE').isValid).toBe(true);
      expect(validateAnswer(q31, 'treasure').isValid).toBe(true);
      expect(validateAnswer(q31, 'GOLD').isValid).toBe(false);
    });
  });
});
