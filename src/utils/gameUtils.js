import { DISTANCE_THRESHOLD, TIME_MULTIPLIER_THRESHOLDS } from './constants';

/**
 * Fisher-Yates shuffle algorithm
 * Mélange un tableau de manière aléatoire et équitable
 */
export function shuffleArray(array) {
  const shuffled = [...array]; // Copie pour éviter de muter l'original
  let currentIndex = shuffled.length, randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [shuffled[currentIndex], shuffled[randomIndex]] = [
      shuffled[randomIndex], shuffled[currentIndex]];
  }
  return shuffled;
}

export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

export function calculateScore(distance) {
  // Max score 1000.
  // < 50km: high score.
  // > 500km: 0 score.
  if (distance < 5) return 1000;
  if (distance > 500) return 0;

  // Linear decay for now, can be exponential for more difficulty
  // 5km -> 1000
  // 500km -> 0
  const score = 1000 - ((distance - 5) * (1000 / 495));
  return Math.round(Math.max(0, score));
}

export function calculateTimeMultiplier(points, timeLeft, maxTime = 15) {
  if (points === 0) return 0;

  // Tiered Multiplier Logic
  // Tier 1: First 1/3 of time used (Time Left >= 66%) -> x3
  if (timeLeft >= maxTime * 0.66) {
    return points * 3;
  }

  // Tier 2: Second 1/3 of time used (Time Left >= 33%) -> x2
  if (timeLeft >= maxTime * 0.33) {
    return points * 2;
  }

  // Tier 3: Last 1/3 of time used -> x1 (No bonus)
  return points;
}
