import { Question, ValidationResult } from '../../types';

/**
 * Normalizes generic text:
 * - trims leading & trailing whitespace
 * - collapses multiple internal spaces into a single space
 * - converts to lowercase for case-insensitive matching
 */
export function normalizeText(input: string): string {
  if (!input) return '';
  return input
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

/**
 * Normalizes coordinate strings:
 * e.g., "( 6 , 1 )", "6,1", "(6,1)" -> "(6,1)"
 */
export function normalizeCoordinate(input: string): string | null {
  const cleaned = input.replace(/\s+/g, '');
  const match = cleaned.match(/^\(?(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)\)?$/);
  if (!match) return null;
  const x = parseFloat(match[1]);
  const y = parseFloat(match[2]);
  return `(${x},${y})`;
}

/**
 * Normalizes comma-separated sequence:
 * e.g., "[3, 5, 1, 8]" or "3, 5, 1, 8" or "3,5,1,8" -> "3,5,1,8"
 */
export function normalizeSequence(input: string): string | null {
  const cleaned = input.trim().replace(/^\[|\]$/g, '').trim();
  const parts = cleaned.split(/[\s,]+/).filter(Boolean);
  if (parts.length === 0) return null;
  return parts.join(',');
}

/**
 * Evaluates probability in fraction ("1/4", "1 / 4"), decimal ("0.25", ".25"), or percentage ("25%") format.
 */
export function parseProbability(input: string): number | null {
  const trimmed = input.trim().toLowerCase();
  
  // Percentage e.g. "25%"
  if (trimmed.endsWith('%')) {
    const val = parseFloat(trimmed.slice(0, -1).trim());
    return isNaN(val) ? null : val / 100;
  }
  
  // Fraction e.g. "1/4" or "1 / 4"
  if (trimmed.includes('/')) {
    const parts = trimmed.split('/');
    if (parts.length === 2) {
      const num = parseFloat(parts[0].trim());
      const den = parseFloat(parts[1].trim());
      if (!isNaN(num) && !isNaN(den) && den !== 0) {
        return num / den;
      }
    }
    return null;
  }

  // Decimal / float
  const parsed = parseFloat(trimmed);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Normalizes binary string:
 * strips optional "0b" prefix and trims whitespace
 */
export function normalizeBinary(input: string): string | null {
  const cleaned = input.trim().toLowerCase().replace(/^0b/, '').replace(/\s+/g, '');
  if (!/^[01]+$/.test(cleaned)) return null;
  return cleaned;
}

/**
 * Extracts a numeric value from input, tolerating minor unit text like "degrees", "deg", "hours", "rupees", etc.
 */
export function parseNumberWithUnits(input: string): number | null {
  const cleaned = input
    .trim()
    .replace(/[₹$€£°]/g, '')
    .replace(/(?:degrees|deg|hours|hrs|hr|people|ms|milliseconds|meters|m|minutes|min|mins|rupees|rs\.?)/gi, '')
    .trim();

  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

/**
 * Master validation function for any question.
 */
export function validateAnswer(question: Question, rawInput: string): ValidationResult {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return {
      isValid: false,
      normalizedInput: '',
      feedbackMessage: 'Please enter an answer before submitting.'
    };
  }

  const normalizedInput = normalizeText(trimmed);

  // 1. Direct normalized match against any acceptedAnswer
  for (const accepted of question.acceptedAnswers) {
    if (normalizeText(accepted) === normalizedInput) {
      return {
        isValid: true,
        normalizedInput,
        feedbackMessage: 'CORRECT ANSWER',
        matchedAnswer: accepted
      };
    }
  }

  // 2. Format-specific validation
  switch (question.answerFormat) {
    case 'coordinate': {
      const inputCoord = normalizeCoordinate(trimmed);
      if (inputCoord) {
        for (const accepted of question.acceptedAnswers) {
          const acceptedCoord = normalizeCoordinate(accepted);
          if (acceptedCoord && acceptedCoord === inputCoord) {
            return {
              isValid: true,
              normalizedInput: inputCoord,
              feedbackMessage: 'CORRECT ANSWER',
              matchedAnswer: accepted
            };
          }
        }
      }
      break;
    }

    case 'sequence': {
      const inputSeq = normalizeSequence(trimmed);
      if (inputSeq) {
        for (const accepted of question.acceptedAnswers) {
          const acceptedSeq = normalizeSequence(accepted);
          if (acceptedSeq && acceptedSeq === inputSeq) {
            return {
              isValid: true,
              normalizedInput: inputSeq,
              feedbackMessage: 'CORRECT ANSWER',
              matchedAnswer: accepted
            };
          }
        }
      }
      break;
    }

    case 'probability': {
      const inputProb = parseProbability(trimmed);
      if (inputProb !== null) {
        for (const accepted of question.acceptedAnswers) {
          const acceptedProb = parseProbability(accepted);
          if (acceptedProb !== null && Math.abs(inputProb - acceptedProb) < 0.001) {
            return {
              isValid: true,
              normalizedInput: inputProb.toString(),
              feedbackMessage: 'CORRECT ANSWER',
              matchedAnswer: accepted
            };
          }
        }
      }
      break;
    }

    case 'binary': {
      const inputBin = normalizeBinary(trimmed);
      if (inputBin) {
        for (const accepted of question.acceptedAnswers) {
          const acceptedBin = normalizeBinary(accepted);
          if (acceptedBin && acceptedBin === inputBin) {
            return {
              isValid: true,
              normalizedInput: inputBin,
              feedbackMessage: 'CORRECT ANSWER',
              matchedAnswer: accepted
            };
          }
        }
      }
      break;
    }

    case 'numeric': {
      const inputNum = parseNumberWithUnits(trimmed);
      if (inputNum !== null) {
        for (const accepted of question.acceptedAnswers) {
          const acceptedNum = parseNumberWithUnits(accepted);
          if (acceptedNum !== null && Math.abs(inputNum - acceptedNum) < 0.001) {
            return {
              isValid: true,
              normalizedInput: inputNum.toString(),
              feedbackMessage: 'CORRECT ANSWER',
              matchedAnswer: accepted
            };
          }
        }
      }
      break;
    }

    case 'two-word': {
      // Must be two words
      const words = normalizedInput.split(' ').filter(Boolean);
      if (words.length !== 2) {
        return {
          isValid: false,
          normalizedInput,
          feedbackMessage: 'INCORRECT ANSWER (Format note: Please provide a two-word phrase)'
        };
      }
      break;
    }

    case 'three-word': {
      // Must be three words
      // Handle hyphenated words (e.g. "two-dimensional code" -> treated as 3 words if expanded or counted)
      const expanded = normalizedInput.replace(/-/g, ' ');
      const words = expanded.split(' ').filter(Boolean);
      if (words.length !== 3 && normalizedInput.split(' ').length !== 3) {
        return {
          isValid: false,
          normalizedInput,
          feedbackMessage: 'INCORRECT ANSWER (Format note: Please provide a three-word phrase)'
        };
      }
      break;
    }
  }

  // If no match succeeded
  return {
    isValid: false,
    normalizedInput,
    feedbackMessage: 'INCORRECT ANSWER'
  };
}
