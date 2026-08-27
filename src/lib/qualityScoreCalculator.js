/**
 * Interview round configurations
 * Each round adds 30 points when logged
 */
const INTERVIEW_ROUNDS = {
  screening: {
    key: 'screening',
    label: 'Screening Call',
    points: 30,
  },
  technical: {
    key: 'technical',
    label: 'Technical Interview',
    points: 30,
  },
  'system design': {
    key: 'system design',
    label: 'System Design',
    points: 30,
  },
  final: {
    key: 'final',
    label: 'Final Round',
    points: 30,
  },
};

/**
 * Calculate application quality score based on interview rounds only
 *
 * Score Breakdown:
 * - Screening: 30 points
 * - Technical: 30 points
 * - System Design: 30 points
 * - Final: 30 points
 * - Offer Status: Auto 100%
 *
 * @param {Object} application - The application object
 * @returns {number} Quality score 0-100
 */
export const calculateQualityScore = (application) => {
  if (!application) return 0;

  // 🎉 If application status is OFFER, automatically return 100%
  if (application.status && application.status.toLowerCase() === 'offer') {
    return 100;
  }

  // 🎉 If offer round is logged, automatically return 100%
  if (application.interviews && application.interviews.length > 0) {
    const hasOfferRound = application.interviews.some(
      (interview) => interview.round?.toLowerCase().trim() === 'offer'
    );
    if (hasOfferRound) {
      return 100;
    }
  }

  let score = 0;

  // ===== INTERVIEW ROUNDS (30 points each) =====
  // Check which interview rounds have been logged
  if (application.interviews && application.interviews.length > 0) {
    const completedRounds = new Set();

    // Track each unique round type
    application.interviews.forEach((interview) => {
      const roundKey = interview.round?.toLowerCase().trim();
      if (roundKey && INTERVIEW_ROUNDS[roundKey] && !completedRounds.has(roundKey)) {
        completedRounds.add(roundKey);
        score += INTERVIEW_ROUNDS[roundKey].points;
      }
    });
  }

  // Cap score at 100
  return Math.min(score, 100);
};

/**
 * Get quality status based on score
 *
 * @param {number} score - Quality score 0-100
 * @returns {Object} Status object with status, color, icon
 */
export const getQualityStatus = (score) => {
  if (score === 100) {
    return {
      status: 'Offer Received! 🎉',
      color: 'green',
      icon: '🎉',
    };
  }

  if (score >= 90) {
    return {
      status: 'Excellent',
      color: 'green',
      icon: '⭐',
    };
  }

  if (score >= 70) {
    return {
      status: 'Good',
      color: 'blue',
      icon: '✓',
    };
  }

  if (score >= 30) {
    return {
      status: 'Fair',
      color: 'yellow',
      icon: '⚠️',
    };
  }

  return {
    status: 'Getting Started',
    color: 'gray',
    icon: '→',
  };
};

/**
 * Get detailed quality breakdown by interview round
 * Shows which rounds are completed and their points
 *
 * @param {Object} application - The application object
 * @returns {Object} Breakdown of interview rounds
 */
export const getQualityBreakdown = (application) => {
  if (!application) return {};

  const roundsBreakdown = {};
  const completedRounds = new Set();

  // Track which rounds are completed
  if (application.interviews && application.interviews.length > 0) {
    application.interviews.forEach((interview) => {
      const roundKey = interview.round?.toLowerCase().trim();
      if (roundKey && INTERVIEW_ROUNDS[roundKey]) {
        completedRounds.add(roundKey);
      }
    });
  }

  // Build breakdown for each round
  Object.keys(INTERVIEW_ROUNDS).forEach((roundKey) => {
    const isCompleted = completedRounds.has(roundKey);
    roundsBreakdown[roundKey] = {
      label: INTERVIEW_ROUNDS[roundKey].label,
      completed: isCompleted,
      points: isCompleted ? INTERVIEW_ROUNDS[roundKey].points : 0,
    };
  });

  return {
    interviewRounds: roundsBreakdown,
    totalInterviewsLogged: application.interviews?.length ?? 0,
    isOfferStatus: application.status?.toLowerCase() === 'offer',
  };
};

/**
 * Check if a specific interview round has been logged
 *
 * @param {Object} application - The application object
 * @param {string} roundKey - The round to check ('screening', 'technical', 'system design', 'final')
 * @returns {boolean} True if round has been logged
 */
export const hasInterviewRound = (application, roundKey) => {
  if (!application?.interviews || application.interviews.length === 0) return false;

  return application.interviews.some(
    (interview) => interview.round?.toLowerCase().trim() === roundKey.toLowerCase().trim()
  );
};

/**
 * Get information about a specific round
 *
 * @param {string} roundKey - The round key
 * @returns {Object} Round information with label and points
 */
export const getRoundInfo = (roundKey) => {
  return INTERVIEW_ROUNDS[roundKey?.toLowerCase()] || null;
};

/**
 * Get all available interview rounds
 *
 * @returns {Object} All interview round configurations
 */
export const getAllRounds = () => {
  return INTERVIEW_ROUNDS;
};