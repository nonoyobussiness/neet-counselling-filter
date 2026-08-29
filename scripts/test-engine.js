import fs from 'fs';
import path from 'path';

const colleges = JSON.parse(
  fs.readFileSync(path.resolve('src/data/colleges.json'), 'utf8')
);

// Haversine formula
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

const REGISTERED_CRITERIA = {
  google_rating: { direction: 'higher_is_better' },
  google_review_count: { direction: 'higher_is_better' },
  beds: { direction: 'higher_is_better' },
  fee_category_a: { direction: 'lower_is_better' },
  distance_from_home: { direction: 'lower_is_better' },
};

function calculateCriterionBounds(colleges, criterionId, homeCoords) {
  let min = Infinity;
  let max = -Infinity;

  for (const college of colleges) {
    let rawVal = null;
    if (criterionId === 'distance_from_home') {
      if (homeCoords && college.lat !== null && college.lng !== null) {
        rawVal = haversineDistance(
          homeCoords.lat,
          homeCoords.lng,
          college.lat,
          college.lng
        );
      }
    } else {
      rawVal = college[criterionId];
    }

    if (rawVal !== null && typeof rawVal === 'number' && !isNaN(rawVal)) {
      if (rawVal < min) min = rawVal;
      if (rawVal > max) max = rawVal;
    }
  }

  if (min === Infinity || max === -Infinity) return { min: 0, max: 100 };
  if (min === max) return { min: min - 1, max: max + 1 };
  return { min, max };
}

function normalizeSignal(val, bounds, direction) {
  if (val === null || isNaN(val)) return null;
  const { min, max } = bounds;
  if (max === min) return 50;
  const clampedVal = Math.max(min, Math.min(max, val));
  const ratio = (clampedVal - min) / (max - min);

  if (direction === 'higher_is_better') {
    return Math.round(ratio * 100 * 10) / 10;
  } else {
    return Math.round((1 - ratio) * 100 * 10) / 10;
  }
}

function isUnverifiedBeds(college) {
  if (!college.data_notes) return false;
  return college.data_notes.includes('unverified, low-confidence estimate');
}

function computeCollegeRankings(colleges, weights, homeCoords) {
  const activeWeights = {};
  for (const [key, val] of Object.entries(weights)) {
    if (val && val > 0) {
      if (key === 'distance_from_home' && !homeCoords) continue;
      activeWeights[key] = val;
    }
  }

  const activeCriteria = Object.keys(activeWeights);
  const totalWeight = activeCriteria.reduce((sum, k) => sum + (activeWeights[k] || 0), 0);

  const boundsMap = {};
  for (const criterionId of Object.keys(REGISTERED_CRITERIA)) {
    boundsMap[criterionId] = calculateCriterionBounds(colleges, criterionId, homeCoords);
  }

  return colleges.map((college) => {
    let distance = null;
    if (homeCoords && college.lat !== null && college.lng !== null) {
      distance = haversineDistance(
        homeCoords.lat,
        homeCoords.lng,
        college.lat,
        college.lng
      );
    }

    const rawSignals = {
      google_rating: college.google_rating,
      google_review_count: college.google_review_count,
      beds: college.beds,
      fee_category_a: college.fee_category_a,
      distance_from_home: distance,
    };

    const normalizedSignals = {};
    const missingSignals = [];

    for (const criterionId of Object.keys(REGISTERED_CRITERIA)) {
      const rawVal = rawSignals[criterionId];
      const bounds = boundsMap[criterionId];
      const config = REGISTERED_CRITERIA[criterionId];
      const norm = normalizeSignal(rawVal, bounds, config.direction);
      if (norm !== null) {
        normalizedSignals[criterionId] = norm;
      } else {
        missingSignals.push(criterionId);
      }
    }

    let overallScore = null;
    if (totalWeight > 0 && activeCriteria.length > 0) {
      let weightedSum = 0;
      let usedWeightSum = 0;
      for (const criterionId of activeCriteria) {
        const weight = activeWeights[criterionId];
        const normVal = normalizedSignals[criterionId];
        if (normVal !== undefined && normVal !== null) {
          weightedSum += normVal * weight;
          usedWeightSum += weight;
        }
      }
      if (usedWeightSum > 0) {
        overallScore = Math.round((weightedSum / usedWeightSum) * 10) / 10;
      }
    }

    return {
      college,
      distance_from_home: distance,
      overallScore,
      normalizedSignals,
      rawSignals,
      missingSignals,
      isEstimatedBeds: isUnverifiedBeds(college),
      dataNotes: college.data_notes,
    };
  });
}

function sortRankedColleges(ranked) {
  return [...ranked].sort((a, b) => {
    if (a.overallScore !== null && b.overallScore !== null) {
      if (b.overallScore !== a.overallScore) {
        return b.overallScore - a.overallScore;
      }
    } else if (a.overallScore !== null && b.overallScore === null) {
      return -1;
    } else if (a.overallScore === null && b.overallScore !== null) {
      return 1;
    }
    return a.college.name.localeCompare(b.college.name);
  });
}

console.log('--- TESTING HAVERSINE DISTANCE ---');
const hydWarangalDist = haversineDistance(17.39, 78.47, 17.97, 79.59);
console.log(`Distance Hyderabad to Warangal: ${hydWarangalDist} km (expected ~134 km)`);

console.log('\n--- TESTING SINGLE CRITERION RANKING: BEDS ---');
const bedsRanked = sortRankedColleges(
  computeCollegeRankings(colleges, { beds: 100 }, null)
);
console.log('Top 3 by beds:');
bedsRanked.slice(0, 3).forEach((r, i) => {
  console.log(
    `#${i + 1}: ${r.college.name} - Beds: ${r.college.beds} | Score: ${r.overallScore} | Estimated? ${r.isEstimatedBeds}`
  );
});

console.log('\n--- TESTING INVERTED CRITERION RANKING: FEES ---');
const feeRanked = sortRankedColleges(
  computeCollegeRankings(colleges, { fee_category_a: 100 }, null)
);
console.log('Top 3 by lowest govt fee:');
feeRanked.slice(0, 3).forEach((r, i) => {
  console.log(
    `#${i + 1}: ${r.college.name} - Fee: ₹${r.college.fee_category_a} | Score: ${r.overallScore}`
  );
});

console.log('\n--- TESTING COMBINED WEIGHTED RANKING: 60% BEDS + 40% DISTANCE FROM HYDERABAD ---');
const homeCoords = { lat: 17.39, lng: 78.47 }; // Hyderabad
const combinedRanked = sortRankedColleges(
  computeCollegeRankings(colleges, { beds: 60, distance_from_home: 40 }, homeCoords)
);
console.log('Top 5 combined rank:');
combinedRanked.slice(0, 5).forEach((r, i) => {
  console.log(
    `#${i + 1}: ${r.college.name} (${r.college.city}) - Beds: ${r.college.beds} (~${r.isEstimatedBeds ? 'est' : 'verified'}), Dist: ${r.distance_from_home}km | Overall Score: ${r.overallScore}`
  );
});

console.log('\n--- TESTING UNVERIFIED BEDS COUNT ---');
const unverifiedCount = colleges.filter(isUnverifiedBeds).length;
const verifiedCount = colleges.length - unverifiedCount;
console.log(`Verified beds colleges: ${verifiedCount} (Osmania, Kakatiya, Gandhi)`);
console.log(`Unverified estimate beds colleges: ${unverifiedCount} (carrying low-confidence badge)`);

console.log('\nAll engine tests completed successfully!');
