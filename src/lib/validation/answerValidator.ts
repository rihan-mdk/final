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
  let formatError: string | null = null;

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
      const words = normalizedInput.split(' ').filter(Boolean);
      if (words.length !== 2) {
        formatError = 'INCORRECT ANSWER (Format note: Please provide a two-word phrase)';
      }
      break;
    }

    case 'three-word': {
      const expanded = normalizedInput.replace(/-/g, ' ');
      const words = expanded.split(' ').filter(Boolean);
      if (words.length !== 3 && normalizedInput.split(' ').length !== 3) {
        formatError = 'INCORRECT ANSWER (Format note: Please provide a three-word phrase)';
      }
      break;
    }
  }

  // 3. Separate close-answer detection (runs only after normal validator determines answer is not exact match)
  if (isCloseAnswer(question, trimmed)) {
    return {
      isValid: false,
      isClose: true,
      normalizedInput,
      feedbackMessage: "YOU'RE CLOSE! Try once again."
    };
  }

  // 4. Return format-specific error if present, otherwise standard incorrect
  if (formatError) {
    return {
      isValid: false,
      isClose: false,
      normalizedInput,
      feedbackMessage: formatError
    };
  }

  return {
    isValid: false,
    isClose: false,
    normalizedInput,
    feedbackMessage: 'INCORRECT ANSWER'
  };
}

/**
 * Standard Levenshtein distance algorithm for calculating edit operations (insertions, deletions, substitutions).
 */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const row = Array.from({ length: n + 1 }, (_, i) => i);

  for (let i = 1; i <= m; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = row[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(
        row[j] + 1,      // deletion
        row[j - 1] + 1,  // insertion
        prev + cost      // substitution
      );
      prev = temp;
    }
  }

  return row[n];
}

function stripArticles(s: string): string {
  return s.replace(/^(?:a|an|the)\s+/i, '').trim();
}

/**
 * Evaluates whether text input is meaningfully close to an accepted text answer.
 * Conservative similarity rules:
 * - Suffix / plural / singular variations (e.g. "books" vs "book", "echoes" vs "echo")
 * - Missing/extra leading articles ("the book" vs "book")
 * - Minor typos: 1 edit for words of 4-6 chars (with same starting letter), <= 2 edits for words >= 7 chars
 * - Multi-word phrase partial overlap: swapped words, or 1-word/2-word partial matches for compound phrases
 */
export function isCloseText(input: string, accepted: string): boolean {
  const normInput = normalizeText(input);
  const normAccepted = normalizeText(accepted);

  if (!normInput || !normAccepted) return false;
  if (normInput === normAccepted) return false; // Handled by exact validator

  // Check with leading articles stripped
  const strippedInput = stripArticles(normInput);
  const strippedAccepted = stripArticles(normAccepted);
  if (strippedInput && strippedAccepted && strippedInput === strippedAccepted) {
    return true;
  }

  // Plural/singular differences (e.g. book vs books, echo vs echoes)
  if (
    normInput + 's' === normAccepted ||
    normAccepted + 's' === normInput ||
    normInput + 'es' === normAccepted ||
    normAccepted + 'es' === normInput
  ) {
    return true;
  }

  // Levenshtein distance on stripped strings
  const dist = levenshteinDistance(strippedInput, strippedAccepted);
  const targetLen = strippedAccepted.length;

  // Single-word conservative typo thresholds:
  // - Length 4: single insertion/deletion or typo with same starting letter (e.g. "bok" or "cude" vs "cube", but not "cook" vs "book")
  if (targetLen === 4 && dist === 1) {
    if (Math.abs(strippedInput.length - targetLen) === 1 || strippedInput[0] === strippedAccepted[0]) {
      return true;
    }
  }
  // - Length 5-6: distance 1 is close
  if (targetLen >= 5 && targetLen <= 6 && dist === 1) {
    return true;
  }
  // - Length >= 7: distance <= 2 is close (e.g. "footprnt" vs "footprint", "stethscope" vs "stethoscope")
  if (targetLen >= 7 && dist <= 2) {
    return true;
  }

  // Multi-word phrase matching
  const inputWords = strippedInput.split(/\s+/).filter(Boolean);
  const acceptedWords = strippedAccepted.split(/\s+/).filter(Boolean);

  if (acceptedWords.length >= 2) {
    // Reordered/swapped words (e.g. "search binary" vs "binary search")
    if (inputWords.length === acceptedWords.length) {
      const sortedInput = [...inputWords].sort().join(' ');
      const sortedAccepted = [...acceptedWords].sort().join(' ');
      if (sortedInput === sortedAccepted) {
        return true;
      }

      // All but 1 word match exactly, remaining word has 1-char typo
      let exactMatches = 0;
      let typoMatches = 0;
      for (let i = 0; i < acceptedWords.length; i++) {
        if (inputWords[i] === acceptedWords[i]) {
          exactMatches++;
        } else if (
          acceptedWords[i].length >= 4 &&
          levenshteinDistance(inputWords[i], acceptedWords[i]) === 1
        ) {
          typoMatches++;
        }
      }
      if (exactMatches >= acceptedWords.length - 1 && exactMatches + typoMatches === acceptedWords.length) {
        return true;
      }
    }

    // Two-word phrase: user provided 1 of the non-trivial words (e.g. "binary" for "binary search")
    if (acceptedWords.length === 2 && inputWords.length === 1) {
      if (acceptedWords.some(w => w.length >= 4 && w === inputWords[0])) {
        return true;
      }
    }

    // Three-word phrase: user provided 2 of the 3 matching words (e.g. "quick response" for "quick response code")
    if (acceptedWords.length === 3 && (inputWords.length === 2 || inputWords.length === 3)) {
      const matchCount = inputWords.filter(w => acceptedWords.includes(w)).length;
      if (matchCount >= 2) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Numeric closeness check:
 * - Within 7.5% relative error
 * - Off-by-one integer error for targets >= 8
 */
export function isCloseNumeric(userNum: number, acceptedNum: number): boolean {
  const diff = Math.abs(userNum - acceptedNum);
  if (diff < 0.001) return false;

  if (acceptedNum !== 0) {
    const relDiff = diff / Math.abs(acceptedNum);
    if (relDiff <= 0.075) {
      return true;
    }
  }

  if (Math.abs(acceptedNum) >= 8 && diff <= 1) {
    return true;
  }

  return false;
}

/**
 * Coordinate closeness check:
 * - Swapped x/y axes: e.g. (1,6) vs (6,1)
 * - Inverted sign on one axis: e.g. (6,-1) vs (6,1)
 * - One axis exact and other off by <= 1 unit: e.g. (6,2) vs (6,1)
 */
export function isCloseCoordinate(input: string, accepted: string): boolean {
  const userCoordStr = normalizeCoordinate(input);
  const acceptedCoordStr = normalizeCoordinate(accepted);
  if (!userCoordStr || !acceptedCoordStr) return false;
  if (userCoordStr === acceptedCoordStr) return false;

  const parseCoord = (s: string): [number, number] | null => {
    const m = s.match(/^\((-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)\)$/);
    if (!m) return null;
    return [parseFloat(m[1]), parseFloat(m[2])];
  };

  const u = parseCoord(userCoordStr);
  const a = parseCoord(acceptedCoordStr);
  if (!u || !a) return false;

  const [ux, uy] = u;
  const [ax, ay] = a;

  if (ux === ay && uy === ax && (ux !== ax || uy !== ay)) {
    return true;
  }

  if ((ux === -ax && uy === ay && ax !== 0) || (ux === ax && uy === -ay && ay !== 0)) {
    return true;
  }

  if (ux === ax && Math.abs(uy - ay) <= 1 && Math.abs(uy - ay) > 0) {
    return true;
  }
  if (uy === ay && Math.abs(ux - ax) <= 1 && Math.abs(ux - ax) > 0) {
    return true;
  }

  return false;
}

/**
 * Sequence closeness check:
 * - Reversed sequence: e.g. "8,1,5,3" vs "3,5,1,8"
 * - Exactly one element mismatch with same length (e.g. 3 of 4 correct)
 * - Missing only the final element
 */
export function isCloseSequence(input: string, accepted: string): boolean {
  const userSeqStr = normalizeSequence(input);
  const acceptedSeqStr = normalizeSequence(accepted);
  if (!userSeqStr || !acceptedSeqStr) return false;
  if (userSeqStr === acceptedSeqStr) return false;

  const uParts = userSeqStr.split(',');
  const aParts = acceptedSeqStr.split(',');

  if (uParts.length === aParts.length && uParts.length >= 3) {
    const reversed = [...uParts].reverse().join(',');
    if (reversed === acceptedSeqStr) {
      return true;
    }

    let matches = 0;
    for (let i = 0; i < aParts.length; i++) {
      if (uParts[i] === aParts[i]) matches++;
    }
    if (matches === aParts.length - 1) {
      return true;
    }
  }

  if (uParts.length === aParts.length - 1 && aParts.length >= 4) {
    const prefixMatches = uParts.every((val, idx) => val === aParts[idx]);
    if (prefixMatches) {
      return true;
    }
  }

  return false;
}

/**
 * Probability closeness check:
 * - Complement probability P(A') = 1 - P(A) (e.g. 0.75 vs 0.25)
 * - Small deviation within +/- 0.05
 */
export function isCloseProbability(input: string, accepted: string): boolean {
  const userProb = parseProbability(input);
  const acceptedProb = parseProbability(accepted);
  if (userProb === null || acceptedProb === null) return false;
  if (Math.abs(userProb - acceptedProb) < 0.001) return false;

  if (Math.abs(userProb - (1 - acceptedProb)) < 0.005) {
    return true;
  }

  if (Math.abs(userProb - acceptedProb) <= 0.05) {
    return true;
  }

  return false;
}

/**
 * Binary closeness check:
 * - Exact same length with Hamming distance of 1 (1 bit flip)
 * - Reversed bit string
 */
export function isCloseBinary(input: string, accepted: string): boolean {
  const userBin = normalizeBinary(input);
  const acceptedBin = normalizeBinary(accepted);
  if (!userBin || !acceptedBin) return false;
  if (userBin === acceptedBin) return false;

  if (userBin.length === acceptedBin.length && acceptedBin.length >= 3) {
    let bitDiffs = 0;
    for (let i = 0; i < acceptedBin.length; i++) {
      if (userBin[i] !== acceptedBin[i]) {
        bitDiffs++;
      }
    }
    if (bitDiffs === 1) {
      return true;
    }

    const reversed = userBin.split('').reverse().join('');
    if (reversed === acceptedBin) {
      return true;
    }
  }

  return false;
}

/**
 * Master close-answer detection function.
 * Evaluates whether an unaccepted answer is meaningfully close to any accepted answer.
 */
export function isCloseAnswer(question: Question, rawInput: string): boolean {
  const trimmed = rawInput.trim();
  if (!trimmed) return false;

  switch (question.answerFormat) {
    case 'numeric': {
      const userNum = parseNumberWithUnits(trimmed);
      if (userNum !== null) {
        for (const accepted of question.acceptedAnswers) {
          const acceptedNum = parseNumberWithUnits(accepted);
          if (acceptedNum !== null && isCloseNumeric(userNum, acceptedNum)) {
            return true;
          }
        }
      }
      break;
    }

    case 'coordinate': {
      for (const accepted of question.acceptedAnswers) {
        if (isCloseCoordinate(trimmed, accepted)) {
          return true;
        }
      }
      break;
    }

    case 'sequence': {
      for (const accepted of question.acceptedAnswers) {
        if (isCloseSequence(trimmed, accepted)) {
          return true;
        }
      }
      break;
    }

    case 'probability': {
      for (const accepted of question.acceptedAnswers) {
        if (isCloseProbability(trimmed, accepted)) {
          return true;
        }
      }
      break;
    }

    case 'binary': {
      for (const accepted of question.acceptedAnswers) {
        if (isCloseBinary(trimmed, accepted)) {
          return true;
        }
      }
      break;
    }
  }

  // Also check textual closeness across accepted answers
  for (const accepted of question.acceptedAnswers) {
    if (isCloseText(trimmed, accepted)) {
      return true;
    }
  }

  return false;
}
