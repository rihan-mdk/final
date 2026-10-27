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

  describe('Close-Answer Detection & "You\'re Close" Feedback Engine', () => {
    it('1. Returns "YOU\'RE CLOSE! Try once again." for clearly close text answers', () => {
      const q1 = getQ(1); // Answer: "Book"
      // Typo with length difference of 1
      const close1 = validateAnswer(q1, 'bok');
      expect(close1.isValid).toBe(false);
      expect(close1.isClose).toBe(true);
      expect(close1.feedbackMessage).toBe("YOU'RE CLOSE! Try once again.");

      // Plural variation
      const close2 = validateAnswer(q1, 'books');
      expect(close2.isValid).toBe(false);
      expect(close2.isClose).toBe(true);
      expect(close2.feedbackMessage).toBe("YOU'RE CLOSE! Try once again.");

      const q2 = getQ(2); // Answer: "Footprints"
      const close3 = validateAnswer(q2, 'footprnt');
      expect(close3.isValid).toBe(false);
      expect(close3.isClose).toBe(true);
      expect(close3.feedbackMessage).toBe("YOU'RE CLOSE! Try once again.");
    });

    it('2. Distinguishes completely unrelated incorrect answers as standard INCORRECT ANSWER', () => {
      const q1 = getQ(1); // Answer: "Book"
      const wrong1 = validateAnswer(q1, 'automobile');
      expect(wrong1.isValid).toBe(false);
      expect(wrong1.isClose).toBe(false);
      expect(wrong1.feedbackMessage).toBe('INCORRECT ANSWER');

      const wrong2 = validateAnswer(q1, 'notebook');
      expect(wrong2.isValid).toBe(false);
      expect(wrong2.isClose).toBe(false);
      expect(wrong2.feedbackMessage).toBe('INCORRECT ANSWER');

      const q2 = getQ(2);
      const wrong3 = validateAnswer(q2, 'bicycle');
      expect(wrong3.isValid).toBe(false);
      expect(wrong3.isClose).toBe(false);
      expect(wrong3.feedbackMessage).toBe('INCORRECT ANSWER');
    });

    it('3. Handles numeric answers that are close vs completely outside tolerance', () => {
      const q3 = getQ(3); // Answer: 7.5 degrees
      // Within narrow margin (7.0 is ~6.67% diff)
      const closeNum1 = validateAnswer(q3, '7.0');
      expect(closeNum1.isValid).toBe(false);
      expect(closeNum1.isClose).toBe(true);
      expect(closeNum1.feedbackMessage).toBe("YOU'RE CLOSE! Try once again.");

      const closeNum2 = validateAnswer(q3, '8.0');
      expect(closeNum2.isValid).toBe(false);
      expect(closeNum2.isClose).toBe(true);
      expect(closeNum2.feedbackMessage).toBe("YOU'RE CLOSE! Try once again.");

      // Completely outside tolerance
      const farNum1 = validateAnswer(q3, '0');
      expect(farNum1.isValid).toBe(false);
      expect(farNum1.isClose).toBe(false);
      expect(farNum1.feedbackMessage).toBe('INCORRECT ANSWER');

      const farNum2 = validateAnswer(q3, '15');
      expect(farNum2.isValid).toBe(false);
      expect(farNum2.isClose).toBe(false);
      expect(farNum2.feedbackMessage).toBe('INCORRECT ANSWER');

      const q8 = getQ(8); // Answer: 8
      // Off-by-one on integer >= 8 is close
      const close8 = validateAnswer(q8, '9');
      expect(close8.isValid).toBe(false);
      expect(close8.isClose).toBe(true);
      expect(close8.feedbackMessage).toBe("YOU'RE CLOSE! Try once again.");

      // Arbitrary number is not close
      const far8 = validateAnswer(q8, '24');
      expect(far8.isValid).toBe(false);
      expect(far8.isClose).toBe(false);
      expect(far8.feedbackMessage).toBe('INCORRECT ANSWER');
    });

    it('4. Handles coordinate closeness (swapped axes, off-by-one coordinate)', () => {
      const q22 = getQ(22); // Answer: (6,1)
      // Swapped axes (1,6) is a classic close mistake
      const closeCoord1 = validateAnswer(q22, '(1,6)');
      expect(closeCoord1.isValid).toBe(false);
      expect(closeCoord1.isClose).toBe(true);
      expect(closeCoord1.feedbackMessage).toBe("YOU'RE CLOSE! Try once again.");

      // One axis off by 1: (6,2)
      const closeCoord2 = validateAnswer(q22, '(6,2)');
      expect(closeCoord2.isValid).toBe(false);
      expect(closeCoord2.isClose).toBe(true);
      expect(closeCoord2.feedbackMessage).toBe("YOU'RE CLOSE! Try once again.");

      // Far away coordinates
      const farCoord = validateAnswer(q22, '(10,20)');
      expect(farCoord.isValid).toBe(false);
      expect(farCoord.isClose).toBe(false);
      expect(farCoord.feedbackMessage).toBe('INCORRECT ANSWER');
    });

    it('5. Handles sequence closeness (minor element mismatch, reversal)', () => {
      const q25 = getQ(25); // Answer: 3,5,1,8
      // Single element mismatch
      const closeSeq1 = validateAnswer(q25, '3,5,1,9');
      expect(closeSeq1.isValid).toBe(false);
      expect(closeSeq1.isClose).toBe(true);
      expect(closeSeq1.feedbackMessage).toBe("YOU'RE CLOSE! Try once again.");

      // Reversal
      const closeSeq2 = validateAnswer(q25, '8,1,5,3');
      expect(closeSeq2.isValid).toBe(false);
      expect(closeSeq2.isClose).toBe(true);
      expect(closeSeq2.feedbackMessage).toBe("YOU'RE CLOSE! Try once again.");

      // Unrelated sequence
      const farSeq = validateAnswer(q25, '9,9,9,9');
      expect(farSeq.isValid).toBe(false);
      expect(farSeq.isClose).toBe(false);
      expect(farSeq.feedbackMessage).toBe('INCORRECT ANSWER');
    });

    it('6. Handles probability closeness (complement probability, close fraction)', () => {
      const q27 = getQ(27); // Answer: 1/4 (0.25)
      // Complement probability (3/4 = 0.75)
      const closeProb1 = validateAnswer(q27, '3/4');
      expect(closeProb1.isValid).toBe(false);
      expect(closeProb1.isClose).toBe(true);
      expect(closeProb1.feedbackMessage).toBe("YOU'RE CLOSE! Try once again.");

      // Close fraction / decimal (0.22 is within 0.05)
      const closeProb2 = validateAnswer(q27, '0.22');
      expect(closeProb2.isValid).toBe(false);
      expect(closeProb2.isClose).toBe(true);
      expect(closeProb2.feedbackMessage).toBe("YOU'RE CLOSE! Try once again.");

      // Arbitrary probability
      const farProb = validateAnswer(q27, '0.9');
      expect(farProb.isValid).toBe(false);
      expect(farProb.isClose).toBe(false);
      expect(farProb.feedbackMessage).toBe('INCORRECT ANSWER');
    });

    it('7. Handles binary closeness (1-bit flip vs arbitrary binary)', () => {
      const q37 = getQ(37); // Answer: 1000
      // 1 bit flip (Hamming distance 1)
      const closeBin1 = validateAnswer(q37, '1001');
      expect(closeBin1.isValid).toBe(false);
      expect(closeBin1.isClose).toBe(true);
      expect(closeBin1.feedbackMessage).toBe("YOU'RE CLOSE! Try once again.");

      // Arbitrary binary (Hamming distance 3 or different length)
      const farBin1 = validateAnswer(q37, '1111');
      expect(farBin1.isValid).toBe(false);
      expect(farBin1.isClose).toBe(false);
      expect(farBin1.feedbackMessage).toBe('INCORRECT ANSWER');

      const farBin2 = validateAnswer(q37, '10');
      expect(farBin2.isValid).toBe(false);
      expect(farBin2.isClose).toBe(false);
      expect(farBin2.feedbackMessage).toBe('INCORRECT ANSWER');
    });

    it('8. Ensures feedback never leaks or reveals accepted answers', () => {
      const testCases = [
        { q: getQ(1), input: 'bok', accepted: 'Book' },
        { q: getQ(3), input: '7.0', accepted: '7.5' },
        { q: getQ(22), input: '(1,6)', accepted: '(6,1)' },
        { q: getQ(27), input: '3/4', accepted: '1/4' },
        { q: getQ(37), input: '1001', accepted: '1000' }
      ];

      testCases.forEach(({ q, input, accepted }) => {
        const res = validateAnswer(q, input);
        expect(res.feedbackMessage).toBe("YOU'RE CLOSE! Try once again.");
        // Must never disclose the accepted answer or difference
        expect(res.feedbackMessage.toLowerCase()).not.toContain(accepted.toLowerCase());
        expect(res.matchedAnswer).toBeUndefined();
      });
    });
  });
});
